import { RCMState } from "../types/rcm";
import { questions, answers } from "./rcmData";

export function generateJsonData(state: RCMState) {
  const jsonData = {
    asset: state.asset,
    failureMode: state.failureMode,
    failureType: state.failureType,
    failureLeg: state.failureLeg,
    recommendedAction: {
      id: state.currentStep,
      recommendation: answers[state.currentStep as string]?.recommendation,
      explanation: answers[state.currentStep as string]?.explanation,
    },
    decisionPath: (state.history ?? []).map((step) => ({
      step,
      question: questions[step]?.mainText,
      answer:
        step === state.currentStep
          ? "Final"
          : questions[step]?.yesNextStep === (state.history ?? [])[(state?.history ?? [])?.indexOf(step) + 1]
          ? "Yes"
          : "No",
    })),
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(jsonData, null, 2);
}
