'use client'

import React, { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { calculateReliability, calculateFailureRateFromMTBF, calculateMTBFFromFailureRate } from '@/lib/formulaProcessor'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatNumber } from '@/lib/utils'

const schema = z.object({
  inputType: z.enum(['failureRate', 'mtbf']),
  failureRate: z.number().positive().optional(),
  mtbf: z.number().positive().optional(),
  inspectionInterval: z.number().positive(),
  targetReliability: z.number().min(0).max(1),
}).refine((data) => {
  if (data.inputType === 'failureRate') {
    return data.failureRate !== undefined;
  } else {
    return data.mtbf !== undefined;
  }
}, {
  message: "Either Failure Rate or MTBF must be provided",
  path: ['failureRate', 'mtbf'],
});

type Inputs = z.infer<typeof schema>

export default function ReliabilityCalculator() {
  const [result, setResult] = useState<{ reliability: number, meetingTarget: boolean } | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      inputType: 'failureRate',
      failureRate: 0.001,
      inspectionInterval: 1000,
      targetReliability: 0.95,
    }
  })

  const inputType = watch('inputType')
  const watchFailureRate = watch('failureRate')
  const watchMTBF = watch('mtbf')

  useEffect(() => {
    if (inputType === 'failureRate' && watchFailureRate) {
      setValue('mtbf', calculateMTBFFromFailureRate(watchFailureRate))
    } else if (inputType === 'mtbf' && watchMTBF) {
      setValue('failureRate', calculateFailureRateFromMTBF(watchMTBF))
    }
  }, [inputType, watchFailureRate, watchMTBF, setValue])

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const failureRate = data.inputType === 'failureRate' ? data.failureRate! : calculateFailureRateFromMTBF(data.mtbf!)
    const reliability = calculateReliability(failureRate, data.inspectionInterval)
    setResult({
      reliability,
      meetingTarget: reliability >= data.targetReliability
    })

    // Generate chart data
    const newChartData = []
    const maxTime = data.inspectionInterval * 2
    for (let i = 0; i <= maxTime; i += maxTime / 20) {
      newChartData.push({
        time: i,
        reliability: calculateReliability(failureRate, i),
        targetReliability: data.targetReliability
      })
    }
    setChartData(newChartData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Reliability Calculator</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Input Parameters</CardTitle>
          <CardDescription>Enter either the failure rate or MTBF, along with the inspection interval and target reliability to calculate and compare the reliability.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <RadioGroup defaultValue="failureRate" className="mb-4" {...register('inputType')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="failureRate" id="failureRate" />
                <Label htmlFor="failureRate">Failure Rate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mtbf" id="mtbf" />
                <Label htmlFor="mtbf">MTBF</Label>
              </div>
            </RadioGroup>
            {inputType === 'failureRate' ? (
              <div>
                <Label htmlFor="failureRate">Failure Rate (λ) (failures/hour)</Label>
                <Input id="failureRate" type="number" step="0.0001" {...register('failureRate', { valueAsNumber: true })} />
                {errors.failureRate && <span className="text-red-500">This field is required and must be positive</span>}
              </div>
            ) : (
              <div>
                <Label htmlFor="mtbf">Mean Time Between Failures (MTBF) (hours)</Label>
                <Input id="mtbf" type="number" step="0.1" {...register('mtbf', { valueAsNumber: true })} />
                {errors.mtbf && <span className="text-red-500">This field is required and must be positive</span>}
              </div>
            )}
            <div>
              <Label htmlFor="inspectionInterval">Inspection Interval (t) (hours)</Label>
              <Input id="inspectionInterval" type="number" step="1" {...register('inspectionInterval', { valueAsNumber: true })} />
              {errors.inspectionInterval && <span className="text-red-500">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="targetReliability">Target Reliability</Label>
              <Input id="targetReliability" type="number" step="0.01" min="0" max="1" {...register('targetReliability', { valueAsNumber: true })} />
              {errors.targetReliability && <span className="text-red-500">This field is required and must be between 0 and 1</span>}
            </div>
            <Button type="submit">Calculate</Button>
          </form>
        </CardContent>
      </Card>
      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Calculated Reliability: {result.reliability < 0.01 ? 
              `${formatNumber((result.reliability * 100).toFixed(2))}%` : 
              `${formatNumber(result.reliability.toFixed(4))} (${formatNumber((result.reliability * 100).toFixed(2))}%)`
            }</p>
            <p className="mb-4">
              Status: {result.meetingTarget ? (
                <span className="text-green-500">Meeting target</span>
              ) : (
                <span className="text-red-500">Below target</span>
              )}
            </p>
            <h3 className="text-lg font-semibold mb-2">Explanation:</h3>
            <p className="mb-4">
              Reliability is the probability that the system or component will perform its intended function for a 
              specified period of time under stated conditions. Higher reliability indicates better performance and 
              lower chance of failure.
            </p>
            <h3 className="text-lg font-semibold mb-2">Decision-making Criteria:</h3>
            <ul className="list-disc list-inside mb-4">
              <li>If reliability &gt; target: Current maintenance strategy is effective</li>
              <li>If reliability ≈ target: Maintain current strategy but monitor closely</li>
              <li>If reliability &lt; target: Improvement in maintenance strategy is needed</li>
            </ul>
            <h3 className="text-lg font-semibold mb-2">Recommendations:</h3>
            <p>
              {result.meetingTarget 
                ? "The current reliability meets or exceeds the target. Continue with the current maintenance strategy and periodically reassess to ensure ongoing compliance."
                : "The current reliability is below the target. Consider the following actions to improve reliability:"
              }
            </p>
            {!result.meetingTarget && (
              <ul className="list-disc list-inside mt-2">
                <li>Decrease the inspection interval to catch potential failures earlier</li>
                <li>Implement more rigorous preventive maintenance procedures</li>
                <li>Investigate root causes of failures and address them</li>
                <li>Consider equipment upgrades or replacements if improvements are insufficient</li>
              </ul>
            )}
            <h3 className="text-lg font-semibold mb-2">Visualization:</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Reliability', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reliability" stroke="#8884d8" name="Calculated Reliability" />
                  <Line type="monotone" dataKey="targetReliability" stroke="#82ca9d" name="Target Reliability" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

