'use client'

import { useEffect, useRef } from 'react'
import { Chart, ChartConfiguration } from 'chart.js/auto'

interface VisualizationChartProps {
  results: {
    failureRate: number
    inspectionInterval: number
    probabilityOfFailure: number
    reliability: number
  }
}

export default function VisualizationChart({ results }: VisualizationChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: Array.from({ length: 100 }, (_, i) => i * results.inspectionInterval / 100),
            datasets: [
              {
                label: 'Probability of Failure',
                data: Array.from({ length: 100 }, (_, i) => 1 - Math.exp(-results.failureRate * i * results.inspectionInterval / 100)),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              },
              {
                label: 'Reliability',
                data: Array.from({ length: 100 }, (_, i) => Math.exp(-results.failureRate * i * results.inspectionInterval / 100)),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Probability of Failure vs. Reliability over Time',
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Time',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Probability',
                },
                min: 0,
                max: 1,
              },
            },
          },
        } as ChartConfiguration)

        return () => {
          chart.destroy()
        }
      }
    }
  }, [results])

  return <canvas ref={chartRef} />
}

