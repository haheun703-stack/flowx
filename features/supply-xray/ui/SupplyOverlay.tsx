'use client'
import { useEffect, useRef } from 'react'
import { createChart, ColorType, HistogramSeries } from 'lightweight-charts'
import { SupplyData } from '@/entities/stock/types'

const makeChartOptions = (height: number = 170) => ({
  layout: { background: { type: ColorType.Solid, color: '#0f1117' }, textColor: '#6b7280' },
  grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
  height,
  rightPriceScale: { borderColor: '#374151' },
  timeScale: { visible: false },
})

export function SupplyOverlay({ data }: { data: SupplyData[] }) {
  const foreignRef = useRef<HTMLDivElement>(null)
  const institutionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!foreignRef.current || !data.length) return
    const chart = createChart(foreignRef.current, makeChartOptions(170))
    const s = chart.addSeries(HistogramSeries, { base: 0 })
    s.setData(data.map(d => ({ time: d.date, value: d.foreign, color: d.foreign >= 0 ? '#ef444460' : '#3b82f660' })))
    chart.timeScale().fitContent()
    return () => chart.remove()
  }, [data])

  useEffect(() => {
    if (!institutionRef.current || !data.length) return
    const chart = createChart(institutionRef.current, makeChartOptions(170))
    const s = chart.addSeries(HistogramSeries, { base: 0 })
    s.setData(data.map(d => ({ time: d.date, value: d.institution, color: d.institution >= 0 ? '#22c55e60' : '#f9731660' })))
    chart.timeScale().fitContent()
    return () => chart.remove()
  }, [data])

  return (
    <div className="grid grid-cols-2 gap-px bg-gray-800">
      <div className="bg-[#0f1117]">
        <div className="text-xs text-blue-400 px-3 pt-2 pb-1">외국인 순매수</div>
        <div ref={foreignRef} />
      </div>
      <div className="bg-[#0f1117]">
        <div className="text-xs text-green-400 px-3 pt-2 pb-1">기관 순매수</div>
        <div ref={institutionRef} />
      </div>
    </div>
  )
}
