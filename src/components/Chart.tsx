import { useEffect, useMemo, useState } from "react"
import { Chart as ChartJs, ChartItem, registerables } from "chart.js"
ChartJs.register(...registerables);

interface ChartProps {
  name: string,
  data: ChartData[]
}

export interface ChartData {
  value: number,
  description: string
}

export default function Chart({ name, data }: ChartProps) {
  
  const [ ctx, setCtx ] = useState<ChartItem>()
  const [ chart, setChart ] = useState<ChartJs>()

  const height = useMemo(() => {
    return window.innerHeight / 2
  }, [window])

  useEffect(() => {
    const context = document.getElementById(name) as ChartItem
    const newChart = new ChartJs(context, {
      type: 'line',
      options: {
        responsive: true,
        animation: false,
        elements: {
          line: {
            tension: 0.3
          }
        },
        interaction: {
          intersect: false
        }
      },
      data: {
        datasets: []
      }
    })
    setCtx(context)
    setChart(newChart)
  }, [name])

  useEffect(() => {
    if (!chart) return
    const newData = {
      labels: data.map(d => d.description).reverse(),
      datasets: [{
        label: 'Valor em Reais',
        borderColor: '#0382a8',
        backgroundColor: '#30bce6',
        data: data.map(d => d.value).reverse(),
      }]
    }
    chart.data = newData
    chart.update()
  }, [chart, data])

  return (
    <canvas id={name} height={`${height}px`}></canvas>
  )
}