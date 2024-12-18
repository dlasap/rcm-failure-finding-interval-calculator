"use client";

import { useState } from "react";
import InputForm from "@/components/InputForm";
import FailureProbabilityCard from "@/components/FailureProbabilityCard";
import OptimalIntervalCard from "@/components/OptimalIntervalCard";
import ReliabilityCard from "@/components/ReliabilityCard";

export default function Calculator() {
  const [results, setResults] = useState<any>(null);

  const handleCalculate = (data: any) => {
    setResults(data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Failure Finding Interval Calculator</h1>
      <InputForm onCalculate={handleCalculate} />
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FailureProbabilityCard results={results} />
          <OptimalIntervalCard results={results} />
          <ReliabilityCard results={results} />
        </div>
      )}
    </div>
  );
}
