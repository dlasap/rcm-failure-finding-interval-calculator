import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Report() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Report</h1>
      <Card>
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No calculations have been performed yet. Use the Calculator to generate results.</p>
        </CardContent>
      </Card>
    </div>
  )
}

