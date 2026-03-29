'use client'
import { useEffect, useRef } from 'react'
import { createChart, ColorType, HistogramSeries, LineSeries } from 'lightweight-charts'
import { CandleData } from '@/entities/stock/types'

// 거래량 20일 이동평균 계산
function calcVolumeMA(data: CandleData[], period = 20) {
  return data.map((d, i) => {
    if (i < period - 1) return null
    const slice = data.slice(i - period + 1, i + 1)
    const avg = slice.reduce((s, x) => s + x.volume, 0) / period
    return { time: d.time, value: avg }
  }).filter(Boolean) as { time: string; value: number }[]
}

export function VolumePanel({ data }: { data: CandleData[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#6b7280',
      },
      grid: {
        vertLines: { color: '#f3f4f6' },
        horzLines: { color: '#f3f4f6' },
      },
      width: containerRef.current.clientWidth,
      height: 140,
      rightPriceScale: { borderColor: '#e5e7eb' },
      timeScale: { borderColor: '#e5e7eb', visible: false },
    })

    // 거래량 히스토그램
    // 평균의 2배 이상 = 폭발 (강조색), 이하 = 일반
    const volMA = calcVolumeMA(data, 20)
    const maMap = new Map(volMA.map(d => [d.time, d.value]))

    const volSeries = chart.addSeries(HistogramSeries, { base: 0 })
    volSeries.setData(data.map((d, i) => {
      const avg = maMap.get(d.time) ?? 0
      const isExplosion = avg > 0 && d.volume >= avg * 2
      // 상승/하락 판단: 전일 종가 대비
      const prevClose = i > 0 ? data[i - 1].close : d.open
      const isUp = d.close >= prevClose

      let color: string
      if (isExplosion) {
        color = isUp ? 'rgba(220,38,38,1)' : 'rgba(37,99,235,1)'
      } else if (isUp) {
        color = 'rgba(220,38,38,0.35)'
      } else {
        color = 'rgba(37,99,235,0.35)'
      }

      return { time: d.time, value: d.volume, color }
    }))

    // 거래량 20일 이동평균선
    const maLineSeries = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })
    maLineSeries.setData(volMA)

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize); chart.remove() }
  }, [data])

  return (
    <div>
      <div className="text-xs text-amber-400/70 px-3 pt-2 pb-1 bg-white">
        거래량 <span className="text-[#dc2626] ml-1">빨강=상승</span> <span className="text-[#2563eb]">파랑=하락</span> <span className="text-[var(--text-muted)] ml-1">찐한색 = 평균 2배 이상 폭발</span>
      </div>
      <div ref={containerRef} className="bg-white" />
    </div>
  )
}
