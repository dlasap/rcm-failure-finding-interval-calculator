"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { calculateFailureProbability } from "@/lib/formulaProcessor";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatNumber } from "@/lib/utils";

const failureProbabilitySchema = z.object({
  failureRate: z.number().positive(),
  inspectionInterval: z.number().positive(),
  inspectionCost: z.number().nonnegative(),
  failureCost: z.number().positive(),
});

type FailureProbabilityInputs = z.infer<typeof failureProbabilitySchema>;
type ResultType = FailureProbabilityInputs & { probability: number };

export default function FailureProbabilityCalculator() {
  const [result, setResult] = useState<ResultType | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FailureProbabilityInputs>({
    resolver: zodResolver(failureProbabilitySchema),
    defaultValues: {
      failureRate: 0.1,
      inspectionInterval: 100,
      inspectionCost: 500,
      failureCost: 10000,
    },
  });

  const onSubmit: SubmitHandler<FailureProbabilityInputs> = (data) => {
    const probability = calculateFailureProbability(data.failureRate, data.inspectionInterval);
    setResult({ ...data, probability });

    // Generate chart data
    const newChartData = [];
    const maxTime = data.inspectionInterval * 10;
    let cumulativeCost = 0;
    for (let i = 0; i <= maxTime; i += maxTime / 20) {
      const inspectionCost = data.inspectionCost * (i / data.inspectionInterval);
      const failureCost = data.failureCost * calculateFailureProbability(data.failureRate, i);
      cumulativeCost += inspectionCost + failureCost;
      newChartData.push({
        time: i,
        probability: calculateFailureProbability(data.failureRate, i),
        cumulativeCost: cumulativeCost,
      });
    }
    setChartData(newChartData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Failure Probability Calculator</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
          <CardDescription>
            Enter the failure rate, inspection interval, and costs to calculate the probability of failure and cumulative costs over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="failureRate">Failure Rate (λ) (failures/hour)</Label>
              <Input id="failureRate" type="number" step="0.0001" {...register("failureRate", { valueAsNumber: true })} />
              {errors.failureRate && <span className="text-red-500">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="inspectionInterval">Inspection Interval (t) (hours)</Label>
              <Input id="inspectionInterval" type="number" step="1" {...register("inspectionInterval", { valueAsNumber: true })} />
              {errors.inspectionInterval && <span className="text-red-500">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="inspectionCost">Inspection Cost (Ci) (EUR)</Label>
              <Input id="inspectionCost" type="number" step="1" {...register("inspectionCost", { valueAsNumber: true })} />
              {errors.inspectionCost && <span className="text-red-500">This field is required and must be non-negative</span>}
            </div>
            <div>
              <Label htmlFor="failureCost">Failure Cost (Cf) (EUR)</Label>
              <Input id="failureCost" type="number" step="1" {...register("failureCost", { valueAsNumber: true })} />
              {errors.failureCost && <span className="text-red-500">This field is required and must be positive</span>}
            </div>
            <Button type="submit">Calculate</Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Probability of failure: {formatNumber(Number(result.probability.toFixed(4)))}</p>
            <h3 className="text-lg font-semibold mb-2">Cost and Probability Over Time:</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    label={{
                      value: result.inspectionInterval >= 8760 ? "Time (Years)" : result.inspectionInterval >= 730 ? "Time (Months)" : "Time (Weeks)",
                      position: "insideBottom",
                      offset: -5,
                    }}
                    tickFormatter={(value) => {
                      if (result.inspectionInterval >= 8760) return (value / 8760).toFixed(1);
                      if (result.inspectionInterval >= 730) return (value / 730).toFixed(1);
                      return (value / 168).toFixed(1);
                    }}
                  />
                  <YAxis yAxisId="left" label={{ value: "Probability of Failure", angle: -90, position: "insideLeft" }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: "Cumulative Cost (EUR)", angle: 90, position: "insideRight" }} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "probability"
                        ? formatNumber(Number(Number(value).toFixed(4)))
                        : `${formatNumber(Number(Number(value).toFixed(2)))} EUR`,
                      name === "probability" ? "Probability of Failure" : "Cumulative Cost",
                    ]}
                    labelFormatter={(label) => {
                      if (result.inspectionInterval >= 8760) return `${formatNumber(Number((label / 8760).toFixed(1)))} Years`;
                      if (result.inspectionInterval >= 730) return `${formatNumber(Number((label / 730).toFixed(1)))} Months`;
                      return `${formatNumber(Number((label / 168).toFixed(1)))} Weeks`;
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="probability" stroke="#8884d8" name="Probability of Failure" />
                  <Line yAxisId="right" type="monotone" dataKey="cumulativeCost" stroke="#82ca9d" name="Cumulative Cost" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <h3 className="text-lg font-semibold mt-4 mb-2">Explanation:</h3>
            <p className="mb-4">
              The graph shows both the probability of failure and the cumulative cost over time. The probability of failure increases over time, while
              the cumulative cost includes both inspection costs and expected failure costs. The x-axis is scaled to show time in{" "}
              {result.inspectionInterval >= 8760 ? "years" : result.inspectionInterval >= 730 ? "months" : "weeks"}, providing a clear view of how
              both probability and costs evolve over a relevant timeframe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
