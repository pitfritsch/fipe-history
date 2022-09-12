import { useEffect, useMemo, useState } from "react"
import { Chart as ChartJs, ChartItem, registerables } from "chart.js"
import { IVehicleTable } from "../App";
ChartJs.register(...registerables);

interface ChartProps {
  name: string,
  data: ChartData[],
  vehicles: IVehicleTable[]
}

export interface ChartData {
  value: number,
  description: string
}

export default function Chart({ name, data, vehicles }: ChartProps) {
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
    setChart(newChart)
  }, [name])

  useEffect(() => {
    if (!chart) return
    const newData = {
      labels: vehicles[0]?.data.map(d => d.description).reverse(),
      datasets: vehicles.map(v => ({
        label: `${v.brand} ${v.model}`,
        borderColor: `#${v.color}`,
        backgroundColor: `#${v.color}80`,
        data: v.data.map(d => d.value).reverse()
      }))
      // [{
      //   label: 'Valor em Reais',
      //   borderColor: '#30bce6',
      //   backgroundColor: '#30bce680',
      //   data: data.map(d => d.value).reverse(),
      // }]
    }
    chart.data = newData
    chart.update()
  }, [chart, vehicles])

  return (
    <canvas id={name} height={`${height > 500 ? height : 500}px`}></canvas>
  )
}