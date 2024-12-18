'use client'

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, InfoIcon } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useSettings } from '@/lib/settings-context'
import { formatNumber } from '@/lib/utils'

const schema = z.object({
  mtbfProtective: z.number().positive(),
  meanPeriodBetweenDemands: z.number().positive(),
  mtbmf: z.number().positive(),
  parallelDevices: z.number().int().positive(),
})

type Inputs = z.infer<typeof schema>

function calculateRiskBasedFFI(data: Inputs): number {
  const { mtbfProtective, meanPeriodBetweenDemands, mtbmf, parallelDevices } = data
  return mtbfProtective * Math.pow(
    ((parallelDevices + 1) * meanPeriodBetweenDemands) / mtbmf,
    1 / parallelDevices
  )
}

function checkWarnings(data: Inputs, ffi: number): string[] {
  const warnings: string[] = []

  // Check for low availability
  const availability = 1 - Math.pow(data.meanPeriodBetweenDemands / data.mtbmf, 1 / data.parallelDevices)
  if (availability < 0.9) {
    warnings.push(`Warning: Low availability - The calculated availability is below 90%. The formula uses a linear approximation to an exponential decay and is not mathematically valid for availability less than 90%. Please adjust your inputs. The availability for the figures used is ${(availability * 100).toFixed(2)}%`)
  }

  // Check for high demand rate
  if (ffi * 2 > data.meanPeriodBetweenDemands) {
    warnings.push("Warning: High demand rate - The demand rate is high in relation to the Failure Finding Interval. Failure Finding is not technically feasible in such circumstances because a high proportion of tests of the protective device will be demands on it.")
  }

  return warnings
}

function formatInterval(years: number, decimalSeparator: '.' | ','): string {
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
    let result = `${formatNumber(wholeYears, decimalSeparator)} year${wholeYears > 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      result += ` and ${formatNumber(remainingDays, decimalSeparator)} day${remainingDays > 1 ? 's' : ''}`;
    }
    return result;
  }
}

export default function RiskBasedFFICalculator() {
  const [result, setResult] = useState<number | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const { settings } = useSettings()

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      mtbfProtective: 10,
      meanPeriodBetweenDemands: 5,
      mtbmf: 100,
      parallelDevices: 1,
    }
  })

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const ffi = calculateRiskBasedFFI(data)
    setResult(ffi)
    setWarnings(checkWarnings(data, ffi))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-primary">Risk Based FFI Calculator</h1>
      </div>
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          This formula can be used to calculate the failure finding interval in any situation. It is the most rigorous equation and should be used for situations where the multiple failure has extremely high consequences, including safety or the environment.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Input Parameters</CardTitle>
          <CardDescription>Enter the system parameters to calculate the Risk Based Failure Finding Interval (FFI).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="mtbfProtective">MTBF of the Protective Device (years)</Label>
              <Input id="mtbfProtective" type="number" step="0.1" {...register('mtbfProtective', { valueAsNumber: true })} />
              {errors.mtbfProtective && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="meanPeriodBetweenDemands">Mean Period Between Demands on the Protective Device (years)</Label>
              <Input id="meanPeriodBetweenDemands" type="number" step="0.1" {...register('meanPeriodBetweenDemands', { valueAsNumber: true })} />
              {errors.meanPeriodBetweenDemands && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="mtbmf">Mean Time Between Multiple Failures (years)</Label>
              <Input id="mtbmf" type="number" step="0.1" {...register('mtbmf', { valueAsNumber: true })} />
              {errors.mtbmf && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="parallelDevices">Number of Parallel Protective Devices</Label>
              <Input id="parallelDevices" type="number" step="1" {...register('parallelDevices', { valueAsNumber: true })} />
              {errors.parallelDevices && <span className="text-destructive">This field is required and must be a positive integer</span>}
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Calculate Risk Based FFI</Button>
          </form>
        </CardContent>
      </Card>
      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">Calculated Risk Based Failure Finding Interval: <span className="font-semibold">{result !== null ? formatInterval(result, settings.decimalSeparator) : ''}</span></p>

            {warnings.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">Warnings:</h3>
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
  )
}

