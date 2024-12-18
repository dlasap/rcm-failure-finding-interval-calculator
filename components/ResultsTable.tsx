import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ResultsTableProps {
  results: {
    failureRate: number
    inspectionInterval: number
    inspectionCost: number
    failureCost: number
    targetReliability: number
    probabilityOfFailure: number
    reliability: number
    optimalInterval: number
  }
}

export default function ResultsTable({ results }: ResultsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metric</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Failure Rate (λ)</TableCell>
          <TableCell>{results.failureRate.toFixed(4)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Inspection Interval (t)</TableCell>
          <TableCell>{results.inspectionInterval.toFixed(2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Inspection Cost (Ci)</TableCell>
          <TableCell>{results.inspectionCost.toFixed(2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Failure Cost (Cf)</TableCell>
          <TableCell>{results.failureCost.toFixed(2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Target Reliability</TableCell>
          <TableCell>{results.targetReliability.toFixed(4)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Probability of Failure</TableCell>
          <TableCell>{results.probabilityOfFailure.toFixed(4)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Reliability</TableCell>
          <TableCell>{results.reliability.toFixed(4)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Optimal Inspection Interval</TableCell>
          <TableCell>{results.optimalInterval.toFixed(2)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

