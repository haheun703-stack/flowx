'use client'
import { useEffect, useRef } from 'react'
import {
  createChart, ColorType,
  CandlestickSeries, LineSeries,
} from 'lightweight-charts'
import { CandleData } from '@/entities/stock/types'
import { ChartOptions } from './ChartToolbar'

interface Props {
  data: CandleData[]
  options: ChartOptions
  onCrosshairMove?: (time: string | null) => void
}

// MA 계산 순수 함수
function calcMA(data: CandleData[], period: number) {
  return data.map((d, i) => {
    if (i < period - 1) return null
    const slice = data.slice(i - period + 1, i + 1)
    const avg = slice.reduce((s, x) => s + x.close, 0) / period
    return { time: d.time, value: avg }
  }).filter(Boolean) as { time: string; value: number }[]
}

// 볼린저밴드 계산 (20일, 2σ)
function calcBollinger(data: CandleData[], period = 20, mult = 2) {
  return data.map((d, i) => {
    if (i < period - 1) return null
    const slice = data.slice(i - period + 1, i + 1)
    const mean = slice.reduce((s, x) => s + x.close, 0) / period
    const variance = slice.reduce((s, x) => s + Math.pow(x.close - mean, 2), 0) / period
    const std = Math.sqrt(variance)
    return {
      time: d.time,
      upper: mean + mult * std,
      lower: mean - mult * std,
    }
  }).filter(Boolean) as { time: string; upper: number; lower: number }[]
}

export function CandleChart({ data, options, onCrosshairMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f1117' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: containerRef.current.clientWidth,
      height: 420,
      rightPriceScale: { borderColor: '#374151' },
      timeScale: { borderColor: '#374151', timeVisible: true },
      crosshair: { mode: 1 },
    })

    // 캔들 시리즈
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    })
    candleSeries.setData(data)

    // MA5
    if (options.ma5) {
      const ma5Series = chart.addSeries(LineSeries, {
        color: '#facc15',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
      ma5Series.setData(calcMA(data, 5))
    }

    // MA20
    if (options.ma20) {
      const ma20Series = chart.addSeries(LineSeries, {
        color: '#60a5fa',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
      ma20Series.setData(calcMA(data, 20))
    }

    // MA60
    if (options.ma60) {
      const ma60Series = chart.addSeries(LineSeries, {
        color: '#a78bfa',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
      ma60Series.setData(calcMA(data, 60))
    }

    // 볼린저밴드
    if (options.bollinger) {
      const bbData = calcBollinger(data)

      // 상단 밴드
      const upperSeries = chart.addSeries(LineSeries, {
        color: '#6b7280',
        lineWidth: 1,
        lineStyle: 2, // 점선
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
      upperSeries.setData(bbData.map(d => ({ time: d.time, value: d.upper })))

      // 하단 밴드
      const lowerSeries = chart.addSeries(LineSeries, {
        color: '#6b7280',
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })
      lowerSeries.setData(bbData.map(d => ({ time: d.time, value: d.lower })))
    }

    chart.timeScale().fitContent()

    chart.subscribeCrosshairMove(p => {
      onCrosshairMove?.((p.time as string) ?? null)
    })

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, options]) // options 변경 시 차트 재생성

  return <div ref={containerRef} className="w-full" />
}
