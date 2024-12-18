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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatNumber } from "@/lib/utils";

const schema = z.object({
  totalVoters: z.number().positive(),
  votingPeriod: z.number().positive(),
  failureRate: z.number().positive(),
  detectionTime: z.number().positive(),
});

type Inputs = z.infer<typeof schema>;

function calculateFFI(data: Inputs): number {
  const { totalVoters, votingPeriod, failureRate, detectionTime } = data;
  const lambda = failureRate * totalVoters;
  return Math.sqrt((2 * detectionTime) / (lambda * votingPeriod));
}

export default function VotingSystemsFFICalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      totalVoters: 10000,
      votingPeriod: 12,
      failureRate: 0.001,
      detectionTime: 1,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const ffi = calculateFFI(data);
    setResult(ffi);

    // Generate chart data
    const newChartData = [];
    const maxTime = ffi * 3;
    for (let i = 0; i <= maxTime; i += maxTime / 20) {
      newChartData.push({
        time: i,
        reliability: Math.exp(-data.failureRate * data.totalVoters * i),
        detectionProbability: 1 - Math.exp(-i / data.detectionTime),
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
        <h1 className="text-3xl font-bold text-primary">Failure Finding Interval for Voting Systems</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Input Parameters</CardTitle>
          <CardDescription>Enter the voting system parameters to calculate the Failure Finding Interval (FFI).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="totalVoters">Total Number of Voters</Label>
              <Input id="totalVoters" type="number" step="1" {...register("totalVoters", { valueAsNumber: true })} />
              {errors.totalVoters && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="votingPeriod">Voting Period (hours)</Label>
              <Input id="votingPeriod" type="number" step="0.1" {...register("votingPeriod", { valueAsNumber: true })} />
              {errors.votingPeriod && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="failureRate">Failure Rate (failures per voter per hour)</Label>
              <Input id="failureRate" type="number" step="0.0001" {...register("failureRate", { valueAsNumber: true })} />
              {errors.failureRate && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="detectionTime">Average Detection Time (hours)</Label>
              <Input id="detectionTime" type="number" step="0.1" {...register("detectionTime", { valueAsNumber: true })} />
              {errors.detectionTime && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Calculate FFI
            </Button>
          </form>
        </CardContent>
      </Card>
      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-lg">
              Optimal Failure Finding Interval: <span className="font-semibold">{formatNumber(Number(result.toFixed(2)))} hours</span>
            </p>
            <h3 className="text-xl font-semibold mb-2 text-primary">Explanation:</h3>
            <p className="mb-4">
              The Failure Finding Interval (FFI) is the optimal time between inspections for the voting system. This interval balances the need for
              frequent checks against the cost and disruption of inspections. The calculated FFI of {result.toFixed(2)} hours suggests that the voting
              system should be inspected approximately every {(result / 24).toFixed(2)} days to maintain optimal reliability and detect potential
              failures.
            </p>
            <h3 className="text-xl font-semibold mb-2 text-primary">Visualization:</h3>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" label={{ value: "Time (hours)", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Probability", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reliability" stroke="#064e9a" name="System Reliability" />
                  <Line type="monotone" dataKey="detectionProbability" stroke="#ed840f" name="Detection Probability" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <h3 className="text-xl font-semibold mt-4 mb-2 text-primary">Interpretation:</h3>
            <p className="mb-4">
              The graph shows how the system reliability decreases over time (blue line) and how the probability of detecting a failure increases
              (orange line). The optimal FFI strikes a balance between these two factors, ensuring that inspections are frequent enough to catch
              failures before they significantly impact the voting system&apos;s reliability, but not so frequent as to be unnecessarily disruptive or
              costly.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
