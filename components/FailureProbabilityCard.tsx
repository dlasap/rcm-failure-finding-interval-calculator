import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface FailureProbabilityCardProps {
  results: {
    failureRate: number
    inspectionInterval: number
    probabilityOfFailure: number
  }
}

export default function FailureProbabilityCard({ results }: FailureProbabilityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Probability of Failure</CardTitle>
        <CardDescription>
          Calculates the likelihood of a failure occurring within the inspection interval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Failure Rate (λ): {results.failureRate.toFixed(4)} failures/hour</p>
        <p>Inspection Interval (t): {results.inspectionInterval.toFixed(2)} hours</p>
        <p>Probability of Failure: {results.probabilityOfFailure.toFixed(4)}</p>
      </CardContent>
    </Card>
  )
}

