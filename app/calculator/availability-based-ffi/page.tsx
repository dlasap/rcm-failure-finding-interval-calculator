'use client'

import React, { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSettings } from '@/lib/settings-context'

const schema = z.object({
  targetAvailability: z.number().min(0).max(100),
  mtbf: z.number().positive(),
  parallelDevices: z.number().int().positive(),
})

type Inputs = z.infer<typeof schema>

function calculateFFI(data: Inputs): number {
  const { targetAvailability, mtbf, parallelDevices } = data
  const targetUnavailability = 1 - (targetAvailability / 100)
  return mtbf * Math.pow((parallelDevices + 1) * targetUnavailability, 1 / parallelDevices)
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

export default function AvailabilityBasedFFICalculator() {
  const { settings } = useSettings()
  const [result, setResult] = useState<number | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const validateTargetAvailability = (value: number) => {
    if (value < 90) {
      setWarningMessage("The calculation uses a linear approximation to an exponential decay. The formula is only valid for availabilities above 90%. Please select a figure greater than 90%");
    } else {
      setWarningMessage(null);
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetAvailability: 95,
      mtbf: 10,
      parallelDevices: 1,
    }
  })

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (data.targetAvailability < 90) {
      setWarningMessage("The calculation uses a linear approximation to an exponential decay. The formula is only valid for availabilities above 90%. Please select a figure greater than 90%");
      return;
    }
    const ffi = calculateFFI(data);
    setResult(ffi);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-primary">Availability-based FFI Calculator</h1>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is the simplest formula based on the reliability of the protective device and the desired availability, which depends on the consequences of the multiple failure. It should not be used for situations where the multiple failure has extremely high consequences.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Input Parameters</CardTitle>
          <CardDescription>Enter the system parameters to calculate the Failure Finding Interval (FFI) based on availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="targetAvailability">Target Availability (%)</Label>
              <Input id="targetAvailability" type="number" step="0.1" {...register('targetAvailability', { valueAsNumber: true, onChange: (e) => validateTargetAvailability(parseFloat(e.target.value)) })} />
              {errors.targetAvailability && <span className="text-destructive">This field is required and must be between 0 and 100</span>}
            </div>
            <div>
              <Label htmlFor="mtbf">MTBF of Protective Device (years)</Label>
              <Input id="mtbf" type="number" step="0.1" {...register('mtbf', { valueAsNumber: true })} />
              {errors.mtbf && <span className="text-destructive">This field is required and must be positive</span>}
            </div>
            <div>
              <Label htmlFor="parallelDevices">Number of Parallel Protective Devices</Label>
              <Input id="parallelDevices" type="number" step="1" {...register('parallelDevices', { valueAsNumber: true })} />
              {errors.parallelDevices && <span className="text-destructive">This field is required and must be a positive integer</span>}
            </div>
            {warningMessage && (
              <p className="text-destructive">{warningMessage}</p>
            )}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Calculate Availability-based FFI</Button>
          </form>
        </CardContent>
      </Card>
      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-lg">Calculated Failure Finding Interval: <span className="font-semibold">{result !== null ? formatInterval(result, settings.decimalSeparator) : ''}</span></p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

