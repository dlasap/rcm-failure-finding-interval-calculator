"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, RotateCcw, Info, Download } from "lucide-react";
import { questions, answers, assets } from "../utils/rcmData";
import { RCMState, FailureType, FailureLeg } from "../types/rcm";
import { InfoDialog } from "./InfoDialog";

const generateJsonData = (state: RCMState) => {
  return JSON.stringify(state, null, 2);
};

export default function RCMDecisionTool() {
  const [state, setState] = useState<RCMState>({
    currentStep: "Start",
    failureType: null,
    failureLeg: null,
    asset: "",
    failureMode: "",
    progress: 0,
    history: [],
    totalSteps: 7,
  });
  const [newAsset, setNewAsset] = useState("");
  const [isNewAsset, setIsNewAsset] = useState(false);

  useEffect(() => {
    if (state.currentStep === "Start" && state.progress > 0) {
      setState((prev) => ({ ...prev, currentStep: questions["Start"].id }));
    }
  }, [state.currentStep, state.progress]);

  useEffect(() => {
    if (state.failureType) {
      setState((prev) => ({ ...prev, totalSteps: 7 }));
    }
  }, [state.failureType]);

  const handleAnswer = useCallback((answer: "yes" | "no") => {
    setState((prevState) => {
      const currentQuestion = questions[prevState.currentStep];
      if (!currentQuestion) {
        console.error(`No question found for step: ${prevState.currentStep}`);
        return prevState;
      }

      const nextStep = answer === "yes" ? currentQuestion.yesNextStep : currentQuestion.noNextStep;
      let newFailureType = prevState.failureType;
      let newFailureLeg = prevState.failureLeg;
      let newProgress = nextStep in answers ? 100 : Math.min(((prevState.history.length + 1) / prevState.totalSteps) * 100, 100);

      if (prevState.currentStep === "Start") {
        newFailureType = answer === "yes" ? "Evident" : "Hidden";
      } else if (prevState.currentStep === "Evident" || prevState.currentStep === "Hidden") {
        newFailureLeg = answer === "yes" ? "Safety" : "Financial";
      }

      return {
        ...prevState,
        currentStep: nextStep,
        failureType: newFailureType,
        failureLeg: newFailureLeg,
        progress: newProgress,
        history: [...prevState.history, prevState.currentStep],
      };
    });
  }, []);

  const handleBack = useCallback(() => {
    setState((prevState) => {
      if (prevState.history.length === 0) {
        return prevState;
      }
      const newHistory = [...prevState.history];
      const previousStep = newHistory.pop();
      const newProgress = previousStep in answers ? 100 : Math.max((newHistory.length / prevState.totalSteps) * 100, 0);
      return {
        ...prevState,
        currentStep: previousStep || "Start",
        history: newHistory,
        progress: newProgress,
      };
    });
  }, []);

  const handleStartOver = useCallback(() => {
    setState({
      currentStep: "Start",
      failureType: null,
      failureLeg: null,
      asset: "",
      failureMode: "",
      progress: 0,
      history: [],
      totalSteps: 7,
    });
    setNewAsset("");
    setIsNewAsset(false);
  }, []);

  const handleExportJson = useCallback(() => {
    const jsonData = generateJsonData(state);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rcm_decision_${state.asset.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [state]);

  const currentStepNumber = useMemo(() => {
    return state.history.length + 1;
  }, [state.history]);

  const renderProgressBar = () => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${state.progress}%` }}
          role="progressbar"
          aria-valuenow={state.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    );
  };

  const renderQuestion = () => {
    const question = questions[state.currentStep];
    if (!question) {
      return <p>Error: Question not found</p>;
    }
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {question.header}
            <InfoDialog info={question.info}>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
                <span className="sr-only">Additional information</span>
              </Button>
            </InfoDialog>
          </CardTitle>
          <CardDescription>{`Step ${currentStepNumber} of ${state.totalSteps}`}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{question.mainText}</p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Button onClick={() => handleAnswer("yes")} className="flex-1 w-full h-16 text-lg font-semibold">
              Yes
            </Button>
            <Button onClick={() => handleAnswer("no")} className="flex-1 w-full h-16 text-lg font-semibold">
              No
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAnswer = () => {
    const answer = answers[state.currentStep];
    if (!answer) {
      return <p>Error: Answer not found</p>;
    }
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Recommended Action</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-bold mb-2">{answer.recommendation}</h3>
          <p className="text-muted-foreground">{answer.explanation}</p>
          {state.asset && (
            <p className="mt-4">
              <strong>Asset:</strong> {state.asset}
            </p>
          )}
          {state.failureMode && (
            <p>
              <strong>Failure Mode:</strong> {state.failureMode}
            </p>
          )}
          <Button onClick={handleExportJson} className="mt-6 w-full h-16 text-lg font-semibold" aria-label="Export decision data as JSON">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export Decision Data
          </Button>
        </CardContent>
        <CardFooter className="bg-blue-600 text-white flex items-center justify-center min-h-[60px]">
          <p className="text-sm">
            For further support or training, please visit{" "}
            <a href="https://reliabilitymanagement.co.uk" className="underline font-medium" target="_blank" rel="noopener noreferrer">
              reliabilitymanagement.co.uk
            </a>
          </p>
        </CardFooter>
      </Card>
    );
  };

  const renderInputForm = () => {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Asset and Failure Mode Selection</CardTitle>
          <CardDescription>Select or enter the asset and failure mode to begin the analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setState((prev) => ({
                ...prev,
                currentStep: "Start",
                progress: (1 / prev.totalSteps) * 100,
                asset: isNewAsset ? newAsset : prev.asset,
              }));
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset">Asset</Label>
                {isNewAsset ? (
                  <Input
                    id="newAsset"
                    placeholder="Enter new asset"
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <Select
                    onValueChange={(value) => {
                      if (value === "new") {
                        setIsNewAsset(true);
                      } else {
                        setState((prev) => ({ ...prev, asset: value, failureMode: "" }));
                      }
                    }}
                  >
                    <SelectTrigger id="asset" className="w-full">
                      <SelectValue placeholder="Select an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.name} value={asset.name}>
                          {asset.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">Enter new asset</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {isNewAsset && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsNewAsset(false);
                      setNewAsset("");
                    }}
                    className="mt-2"
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="failureMode">Failure Mode (Optional)</Label>
                {state.asset && !isNewAsset ? (
                  <Select onValueChange={(value) => setState((prev) => ({ ...prev, failureMode: value }))}>
                    <SelectTrigger id="failureMode" className="w-full">
                      <SelectValue placeholder="Select a failure mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets
                        .find((a) => a.name === state.asset)
                        ?.failureModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="failureMode"
                    placeholder="Enter failure mode"
                    onChange={(e) => setState((prev) => ({ ...prev, failureMode: e.target.value }))}
                    className="w-full"
                  />
                )}
              </div>
              <Button type="submit" className="w-full h-16 text-lg font-semibold">
                Start Analysis
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">RCM Decision Tool</h1>
      {state.currentStep === "Start" && state.progress === 0 && state.history.length === 0 ? (
        <>
          {renderInputForm()}
          <div className="mt-6 text-sm text-muted-foreground max-w-2xl text-center">
            <p className="mb-4">
              The RCM Decision Diagram is a decision-making algorithm that is used to determine the most appropriate failure management task for
              managing each reasonably likely failure mode of an asset.
            </p>
            <p>
              Brought to you by{" "}
              <a href="https://reliabilitymanagement.co.uk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Reliability Management Ltd
              </a>
            </p>
          </div>
        </>
      ) : (
        <>
          {renderProgressBar()}
          {state.currentStep in questions ? renderQuestion() : renderAnswer()}
          <div className="mt-6 flex flex-col sm:flex-row justify-between w-full max-w-2xl space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={state.history.length === 0}
              className="w-full sm:w-auto h-16 text-lg font-semibold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto h-16 text-lg font-semibold">
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
