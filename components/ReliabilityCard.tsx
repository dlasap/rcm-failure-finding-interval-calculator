import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ReliabilityCardProps {
  results: {
    reliability: number
    targetReliability: number
  }
}

export default function ReliabilityCard({ results }: ReliabilityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reliability</CardTitle>
        <CardDescription>
          Compares the calculated reliability with the target reliability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Calculated Reliability: {results.reliability.toFixed(4)}</p>
        <p>Target Reliability: {results.targetReliability.toFixed(4)}</p>
        <p>
          Status: {results.reliability >= results.targetReliability ? (
            <span className="text-green-500">Meeting target</span>
          ) : (
            <span className="text-red-500">Below target</span>
          )}
        </p>
      </CardContent>
    </Card>
  )
}

