import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface OptimalIntervalCardProps {
  results: {
    inspectionCost: number
    failureCost: number
    failureRate: number
    optimalInterval: number
  }
}

export default function OptimalIntervalCard({ results }: OptimalIntervalCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimal Inspection Interval</CardTitle>
        <CardDescription>
          Determines the most cost-effective interval for inspections based on costs and failure rate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Inspection Cost (Ci): {results.inspectionCost.toFixed(2)} EUR</p>
        <p>Failure Cost (Cf): {results.failureCost.toFixed(2)} EUR</p>
        <p>Failure Rate (λ): {results.failureRate.toFixed(4)} failures/hour</p>
        <p>Optimal Interval: {results.optimalInterval.toFixed(2)} hours</p>
      </CardContent>
    </Card>
  )
}

