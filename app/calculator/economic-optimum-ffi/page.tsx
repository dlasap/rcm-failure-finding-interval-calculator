"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, InfoIcon } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSettings } from "@/lib/settings-context";
import { formatNumber } from "@/lib/utils";

const schema = z.object({
  mtbfProtective: z.number().positive(),
  mtbdProtective: z.number().positive(),
  costFailureFinding: z.number().nonnegative(),
  costMultipleFailure: z.number().positive(),
  parallelDevices: z.number().int().positive(),
});

type Inputs = z.infer<typeof schema>;

function calculateEconomicOptimumFFI(data: Inputs): number {
  const { mtbfProtective, mtbdProtective, costFailureFinding, costMultipleFailure, parallelDevices } = data;
  return Math.pow(
    (Math.pow(mtbfProtective, parallelDevices) * (parallelDevices + 1) * mtbdProtective * costFailureFinding) /
      (parallelDevices * costMultipleFailure),
    1 / (parallelDevices + 1)
  );
}

function checkWarningConditions(ffi: number, data: Inputs): string[] {
  const warnings: string[] = [];

  if (ffi * 2 > data.mtbdProtective) {
    warnings.push(
      "Warning 1 - Demand rate high in relation to failure finding interval: The demand rate is high in relation to the Failure Finding Interval. Failure Finding is not technically feasible in such circumstances because a high proportion of tests of the protective device will be demands on it."
    );
  }

  const availability = 1 - Math.pow(Math.pow(ffi / data.mtbfProtective, data.parallelDevices) / (data.parallelDevices + 1), 1 / data.parallelDevices);
  if (availability < 0.9) {
    warnings.push(
      `Warning: Low availability - The calculated availability is below 90%. The formula uses a linear approximation to an exponential decay and is not mathematically valid for availability less than 90%. Please adjust your inputs. The availability for the figures used is ${(
        availability * 100
      ).toFixed(2)}%`
    );
  }

  return warnings;
}

function formatInterval(years: number, decimalSeparator: "." | ","): string {
  const totalDays = years * 365;
  const wholeYears = Math.floor(years);
  const remainingDays = Math.floor(totalDays % 365);
  const totalHours = years * 365 * 24;

  if (totalDays < 1) {
    // Less than 1 day, format in hours
    return `${formatNumber(Math.round(totalHours), decimalSeparator)} hours`;
  } else if (wholeYears === 0) {
    // Less than 1 year, format in days
    return `${formatNumber(Math.round(totalDays), decimalSeparator)} days`;
  } else {
    // Format in years and days
    let result = `${formatNumber(wholeYears, decimalSeparator)} year${wholeYears > 1 ? "s" : ""}`;
    if (remainingDays > 0) {
      result += ` and ${formatNumber(remainingDays, decimalSeparator)} day${remainingDays > 1 ? "s" : ""}`;
    }
    return result;
  }
}

export default function EconomicOptimumFFICalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const { settings } = useSettings();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      mtbfProtective: 10,
      mtbdProtective: 1,
      costFailureFinding: 1000,
      costMultipleFailure: 100000,
      parallelDevices: 1,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const ffi = calculateEconomicOptimumFFI(data);
    setResult(ffi);
    setWarnings(checkWarningConditions(ffi, data));
  };

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result !== null && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-primary">Economic Optimum Failure Finding Interval Calculator</h1>
      </div>
      <Alert variant="default" className="mt-4 mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          This formula can only be used where the consequences of the multiple failure are economic (it cannot be used where they affect safety or the
          environment).
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Input Parameters</CardTitle>
          <CardDescription>Enter the system parameters to calculate the Economic Optimum Failure Finding Interval.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="mtbfProtective">MTBF of the Protective Device (years)</Label>
              <Input id="mtbfProtective" type="number" step="0.1" {...register("mtbfProtective", { valueAsNumber: true })} />
              {errors.mtbfProtective && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="mtbdProtective">Mean Time Between Demands on the Protective Device (years)</Label>
              <Input id="mtbdProtective" type="number" step="0.1" {...register("mtbdProtective", { valueAsNumber: true })} />
              {errors.mtbdProtective && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="costFailureFinding">Cost of Failure Finding Task ({settings.currency})</Label>
              <Input id="costFailureFinding" type="number" step="1" {...register("costFailureFinding", { valueAsNumber: true })} />
              {errors.costFailureFinding && <span className="text-destructive">This field is required and must be non-negative</span>}
            </div>
            <div>
              <Label htmlFor="costMultipleFailure">Cost of the Multiple Failure ({settings.currency})</Label>
              <Input id="costMultipleFailure" type="number" step="1" {...register("costMultipleFailure", { valueAsNumber: true })} />
              {errors.costMultipleFailure && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="parallelDevices">Number of Parallel Protective Devices Installed</Label>
              <Input id="parallelDevices" type="number" step="1" {...register("parallelDevices", { valueAsNumber: true })} />
              {errors.parallelDevices && <span className="text-destructive">This field is required and must be a positive integer</span>}
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Calculate Economic Optimum FFI
            </Button>
          </form>
        </CardContent>
      </Card>
      {result !== null && (
        <Card ref={resultRef}>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-lg">
              Calculated Economic Optimum Failure Finding Interval:{" "}
              <span className="font-semibold">{result !== null ? formatInterval(result, settings.decimalSeparator) : ""}</span>
            </p>
            {warnings.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-2 text-primary">Warnings:</h3>
                {warnings.map((warning, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
