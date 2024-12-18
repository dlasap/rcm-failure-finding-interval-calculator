"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { calculateOptimalInterval, calculateFailureRateFromMTBF, convertMTBF } from "@/lib/formulaProcessor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatNumber } from "@/lib/utils";

const mtbfSchema = z.object({
  mtbf: z.number().positive(),
  mtbfUnit: z.enum(["hours", "days", "weeks", "months", "years"]),
});

const optimalIntervalSchema = z.object({
  failureRate: z.number().positive(),
  inspectionCost: z.number().nonnegative(),
  failureCost: z.number().positive(),
});

type MTBFInputs = z.infer<typeof mtbfSchema>;
type OptimalIntervalInputs = z.infer<typeof optimalIntervalSchema>;

interface FormattedInterval {
  value: number;
  unit: string;
}

function formatOptimalInterval(intervalHours: number): FormattedInterval {
  const units = [
    { unit: "years", hours: 8760 },
    { unit: "months", hours: 730 },
    { unit: "weeks", hours: 168 },
    { unit: "days", hours: 24 },
    { unit: "hours", hours: 1 },
  ];

  for (const { unit, hours } of units) {
    if (intervalHours >= hours || unit === "hours") {
      const value = intervalHours / hours;
      if (value >= 1 && value <= 100) {
        return { value, unit };
      }
    }
  }

  return { value: intervalHours, unit: "hours" };
}

export default function OptimalIntervalCalculator() {
  const [step, setStep] = useState(1);
  const [calculatedFailureRate, setCalculatedFailureRate] = useState<number | null>(null);
  const [result, setResult] = useState<FormattedInterval | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const mtbfForm = useForm<MTBFInputs>({
    resolver: zodResolver(mtbfSchema),
    defaultValues: {
      mtbf: 7,
      mtbfUnit: "years",
    },
  });

  const optimalIntervalForm = useForm<OptimalIntervalInputs>({
    resolver: zodResolver(optimalIntervalSchema),
    defaultValues: {
      failureRate: 0.001,
      inspectionCost: 500,
      failureCost: 10000,
    },
  });

  const onMTBFSubmit: SubmitHandler<MTBFInputs> = (data) => {
    const mtbfInHours = convertMTBF(data.mtbf, data.mtbfUnit, "hours");
    const failureRate = calculateFailureRateFromMTBF(mtbfInHours);
    setCalculatedFailureRate(failureRate);
    optimalIntervalForm.setValue("failureRate", failureRate);
    setStep(2);
  };

  const onOptimalIntervalSubmit: SubmitHandler<OptimalIntervalInputs> = (data) => {
    const optimalIntervalHours = calculateOptimalInterval(data.inspectionCost, data.failureCost, data.failureRate);
    const formattedInterval = formatOptimalInterval(optimalIntervalHours);
    setResult(formattedInterval);

    const maxInterval = Math.ceil(optimalIntervalHours * 4); // Increased to 4x the optimal interval
    const dataPoints = 200; // Increased number of data points for smoother curves
    const newChartData = [];
    for (let i = 0; i <= maxInterval; i += maxInterval / dataPoints) {
      const inspectionCost = isFinite(data.inspectionCost * (i / optimalIntervalHours)) ? data.inspectionCost * (i / optimalIntervalHours) : 0;
      const failureCost = isFinite((data.failureCost * data.failureRate * i) / 2) ? (data.failureCost * data.failureRate * i) / 2 : 0;
      const cumulativeCost = inspectionCost + failureCost;
      const probabilityOfUnidentifiedFailure = 1 - Math.exp(-data.failureRate * i);
      if (isFinite(i) && isFinite(cumulativeCost) && isFinite(probabilityOfUnidentifiedFailure)) {
        newChartData.push({
          interval: i,
          cumulativeCost: cumulativeCost,
          inspectionCost: inspectionCost,
          failureCost: failureCost,
          probabilityOfUnidentifiedFailure: probabilityOfUnidentifiedFailure,
        });
      }
    }
    setChartData(newChartData);
  };

  const generateXAxisTicks = (maxValue: number, optimalInterval: number) => {
    const ticks = [0, optimalInterval, maxValue];
    return ticks;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-primary">Optimal Interval Calculator</h1>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Step 1: Enter MTBF</CardTitle>
            <CardDescription>Enter the Mean Time Between Failures (MTBF) to calculate the Failure Rate.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={mtbfForm.handleSubmit(onMTBFSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mtbf">Mean Time Between Failures (MTBF)</Label>
                <div className="flex space-x-2">
                  <Input id="mtbf" type="number" step="0.1" {...mtbfForm.register("mtbf", { valueAsNumber: true })} />
                  <Select onValueChange={(value) => mtbfForm.setValue("mtbfUnit", value as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="years">Years</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {mtbfForm.formState.errors.mtbf && <span className="text-destructive">This field is required and must be positive</span>}
              </div>
              <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Calculate Failure Rate
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Step 2: Optimal Interval Calculation</CardTitle>
            <CardDescription>Enter the inspection and failure costs to calculate the optimal inspection interval.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={optimalIntervalForm.handleSubmit(onOptimalIntervalSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="failureRate">Calculated Failure Rate (λ) (failures/hour)</Label>
                <Input
                  id="failureRate"
                  type="number"
                  step="0.0001"
                  {...optimalIntervalForm.register("failureRate", { valueAsNumber: true })}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="inspectionCost">Inspection Cost (Ci) (EUR)</Label>
                <Input id="inspectionCost" type="number" step="1" {...optimalIntervalForm.register("inspectionCost", { valueAsNumber: true })} />
                {optimalIntervalForm.formState.errors.inspectionCost && (
                  <span className="text-destructive">This field is required and must be non-negative</span>
                )}
              </div>
              <div>
                <Label htmlFor="failureCost">Failure Cost (Cf) (EUR)</Label>
                <Input id="failureCost" type="number" step="1" {...optimalIntervalForm.register("failureCost", { valueAsNumber: true })} />
                {optimalIntervalForm.formState.errors.failureCost && (
                  <span className="text-destructive">This field is required and must be positive</span>
                )}
              </div>
              <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Calculate Optimal Interval
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setStep(1)} className="w-full">
              Back to Step 1
            </Button>
          </CardFooter>
        </Card>
      )}

      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-lg">
              Optimal Inspection Interval:{" "}
              <span className="font-semibold">
                {formatNumber(Number(result.value.toFixed(2)))} {result.unit}
              </span>
            </p>
            <p className="mb-4 text-lg">
              Used Failure Rate: <span className="font-semibold">{formatNumber(Number(calculatedFailureRate?.toFixed(6)))} failures/hour</span>
            </p>
            <h3 className="text-xl font-semibold mb-2 text-primary">Explanation:</h3>
            <p className="mb-4">
              The optimal inspection interval has been calculated and converted to a more readable format. This interval of {result.value.toFixed(2)}{" "}
              {result.unit} represents the most cost-effective time between inspections, balancing the cost of inspections against the potential cost
              of failures. The graph below shows the cumulative cost over time, including both inspection costs and expected failure costs, as well as
              the probability of unidentified failure.
            </p>
            <h3 className="text-xl font-semibold mb-2 text-primary">Decision-making Criteria:</h3>
            <ul className="list-disc list-inside mb-4">
              <li>If current interval &gt; optimal: Consider increasing inspection frequency</li>
              <li>If current interval &lt; optimal: Consider decreasing inspection frequency</li>
              <li>If current interval ≈ optimal: Maintain current inspection schedule</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2 text-primary">Recommendations:</h3>
            <p className="mb-4">
              Adjust your inspection interval to match the calculated optimal interval as closely as possible. However, also consider practical
              constraints such as resource availability and regulatory requirements. Regularly reassess this interval as costs or failure rates
              change.
            </p>
            <h3 className="text-xl font-semibold mb-2 text-primary">Visualization:</h3>
            <div className="w-full h-[500px]">
              <ChartContainer
                config={{
                  cumulativeCost: {
                    label: "Cumulative Cost",
                    color: "#064e9a",
                  },
                  inspectionCost: {
                    label: "Inspection Cost",
                    color: "#ed840f",
                  },
                  failureCost: {
                    label: "Failure Cost",
                    color: "#064e9a80", // 50% opacity version of #064e9a
                  },
                  probabilityOfUnidentifiedFailure: {
                    label: "Probability of Unidentified Failure",
                    color: "#ed840f80", // 50% opacity version of #ed840f
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="interval"
                      label={{
                        value: `Time (${result.unit})`,
                        position: "insideBottom",
                        offset: -5,
                      }}
                      tickFormatter={(value) => {
                        const formattedValue = (value / result.value).toFixed(2);
                        return parseFloat(formattedValue) % 1 === 0
                          ? formatNumber(parseInt(formattedValue))
                          : formatNumber(parseFloat(formattedValue));
                      }}
                      domain={[0, "dataMax"]}
                      ticks={generateXAxisTicks(chartData[chartData.length - 1].interval, result.value)}
                      type="number"
                    />
                    <YAxis
                      yAxisId="left"
                      label={{
                        value: "Cost (EUR)",
                        angle: -90,
                        position: "insideLeft",
                        offset: 0,
                      }}
                      tickFormatter={(value) => `${formatNumber(value.toFixed(0))}`}
                      width={80}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{
                        value: "Probability",
                        angle: 90,
                        position: "insideRight",
                        offset: 0,
                      }}
                      domain={[0, 1]}
                      tickFormatter={(value) => value.toFixed(2)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="cumulativeCost" stroke="var(--color-cumulativeCost)" name="Cumulative Cost" />
                    <Line yAxisId="left" type="monotone" dataKey="inspectionCost" stroke="var(--color-inspectionCost)" name="Inspection Cost" />
                    <Line yAxisId="left" type="monotone" dataKey="failureCost" stroke="var(--color-failureCost)" name="Failure Cost" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="probabilityOfUnidentifiedFailure"
                      stroke="var(--color-probabilityOfUnidentifiedFailure)"
                      name="Probability of Unidentified Failure"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <h3 className="text-xl font-semibold mt-4 mb-2 text-primary">Interpretation:</h3>
            <p className="mb-4">
              The graph shows how costs and the probability of unidentified failure change over time. The optimal interval is where the cumulative
              cost is at its minimum. The probability of unidentified failure increases over time, which is why regular inspections are crucial.
              Balance this probability against the costs to determine the best inspection strategy for your specific situation.
            </p>
            <p className="mb-4">
              The x-axis now displays three key points: 0 (the starting point), the optimal interval, and the maximum interval (4 times the optimal).
              This allows you to easily compare different time scales and their effects on costs and failure probability.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
