import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Calculations Performed: 0</p>
            <p>Average Inspection Interval: N/A</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/calculator">Go to Calculator</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/report">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

