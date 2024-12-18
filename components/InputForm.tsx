'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { calculateFailureProbability, calculateOptimalInterval } from '@/lib/formulaProcessor'

const schema = z.object({
  failureRate: z.number().positive(),
  inspectionInterval: z.number().positive(),
  inspectionCost: z.number().nonnegative(),
  failureCost: z.number().positive(),
  targetReliability: z.number().min(0).max(1),
})

type Inputs = z.infer<typeof schema>

interface InputFormProps {
  onCalculate: (results: any) => void
}

export default function InputForm({ onCalculate }: InputFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      failureRate: 0.001,
      inspectionInterval: 1000,
      inspectionCost: 500,
      failureCost: 10000,
      targetReliability: 0.95,
    }
  })

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const probabilityOfFailure = calculateFailureProbability(data.failureRate, data.inspectionInterval)
    const optimalInterval = calculateOptimalInterval(data.inspectionCost, data.failureCost, data.failureRate)
    const reliability = 1 - probabilityOfFailure

    onCalculate({
      ...data,
      probabilityOfFailure,
      reliability,
      optimalInterval,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="failureRate">Failure Rate (λ) (failures/hour)</Label>
            <Input id="failureRate" type="number" step="0.0001" {...register('failureRate', { valueAsNumber: true })} />
            {errors.failureRate && <span className="text-red-500">This field is required and must be positive</span>}
          </div>
          <div>
            <Label htmlFor="inspectionInterval">Inspection Interval (t) (hours)</Label>
            <Input id="inspectionInterval" type="number" step="1" {...register('inspectionInterval', { valueAsNumber: true })} />
            {errors.inspectionInterval && <span className="text-red-500">This field is required and must be positive</span>}
          </div>
          <div>
            <Label htmlFor="inspectionCost">Inspection Cost (Ci) (EUR)</Label>
            <Input id="inspectionCost" type="number" step="1" {...register('inspectionCost', { valueAsNumber: true })} />
            {errors.inspectionCost && <span className="text-red-500">This field is required and must be non-negative</span>}
          </div>
          <div>
            <Label htmlFor="failureCost">Failure Cost (Cf) (EUR)</Label>
            <Input id="failureCost" type="number" step="1" {...register('failureCost', { valueAsNumber: true })} />
            {errors.failureCost && <span className="text-red-500">This field is required and must be positive</span>}
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
  )
}

