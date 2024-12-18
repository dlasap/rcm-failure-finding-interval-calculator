"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Inputs = {
  failureRate: number;
  inspectionInterval: number;
  consequenceOfFailure: number;
  inspectionCost: number;
  failureCost: number;
  mttr: number;
  targetReliability: number;
};

export default function Calculator() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const [results, setResults] = useState<{ [key: string]: number } | null>(null);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const { failureRate, inspectionInterval } = data;
    const probabilityOfFailure = 1 - Math.exp(-failureRate * inspectionInterval);
    const reliability = Math.exp(-failureRate * inspectionInterval);
    const optimalInterval = Math.sqrt((2 * data.inspectionCost) / (data.failureCost * failureRate * failureRate));

    setResults({
      probabilityOfFailure,
      reliability,
      optimalInterval,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Failure Finding Interval Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="failureRate">Failure Rate (λ)</Label>
            <Input id="failureRate" type="number" step="0.0001" {...register("failureRate", { required: true, min: 0 })} />
            {errors.failureRate && <span className="text-red-500">This field is required and must be non-negative</span>}
          </div>
          <div>
            <Label htmlFor="inspectionInterval">Inspection Interval (t)</Label>
            <Input id="inspectionInterval" type="number" step="0.01" {...register("inspectionInterval", { required: true, min: 0 })} />
            {errors.inspectionInterval && <span className="text-red-500">This field is required and must be non-negative</span>}
          </div>
          <div>
            <Label htmlFor="consequenceOfFailure">Consequence of Failure (C)</Label>
            <Input id="consequenceOfFailure" type="number" step="0.01" {...register("consequenceOfFailure", { required: true, min: 0 })} />
            {errors.consequenceOfFailure && <span className="text-red-500">This field is required and must be non-negative</span>}
          </div>
          <div>
            <Label htmlFor="inspectionCost">Inspection Cost (Ci)</Label>
            <Input id="inspectionCost" type="number" step="0.01" {...register("inspectionCost", { required: true, min: 0 })} />
            {errors.inspectionCost && <span className="text-red-500">This field is required and must be non-negative</span>}
          </div>
          <div>
            <Label htmlFor="failureCost">Failure Cost (Cf)</Label>
            <Input id="failureCost" type="number" step="0.01" {...register("failureCost", { required: true, min: 0 })} />
            {errors.failureCost && <span className="text-red-500">This field is required and must be non-negative</span>}
          </div>
          <div>
            <Label htmlFor="mttr">Mean Time to Repair (MTTR)</Label>
            <Input id="mttr" type="number" step="0.01" {...register("mttr", { required: true, min: 0 })} />
            {errors.mttr && <span className="text-red-500">This field is required and must be non-negative</span>}
          </div>
          <div>
            <Label htmlFor="targetReliability">Target Reliability</Label>
            <Input
              id="targetReliability"
              type="number"
              step="0.01"
              min="0"
              max="1"
              {...register("targetReliability", { required: true, min: 0, max: 1 })}
            />
            {errors.targetReliability && <span className="text-red-500">This field is required and must be between 0 and 1</span>}
          </div>
          <Button type="submit">Calculate</Button>
        </form>

        {results && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Results:</h3>
            <p>Probability of Failure: {results.probabilityOfFailure.toFixed(4)}</p>
            <p>Reliability: {results.reliability.toFixed(4)}</p>
            <p>Optimal Inspection Interval: {results.optimalInterval.toFixed(2)} units</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
