'use client'

import { useEffect, useRef } from 'react'
import { createChart, LineSeries } from 'lightweight-charts'
import { IntradayPoint } from '../types'

interface Props {
  data: IntradayPoint[]
  currentPrice: number
  changePercent: number
}

export function IntradayChart({ data, currentPrice, changePercent }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    const chart = createChart(chartRef.current, {
      layout: {
        background: { color: '#131722' },
        textColor: '#787b86',
        fontFamily: 'var(--font-jetbrains), monospace',
      },
      grid: {
        vertLines: { color: '#1e2538' },
        horzLines: { color: '#1e2538' },
      },
      crosshair: {
        vertLine: { color: '#2a2e39', labelBackgroundColor: '#1c2030' },
        horzLine: { color: '#2a2e39', labelBackgroundColor: '#1c2030' },
      },
      rightPriceScale: { borderColor: '#2a2e39' },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartRef.current.clientWidth,
      height: 280,
    })

    const isPositive = changePercent >= 0
    const lineColor = isPositive ? '#26a69a' : '#ef5350'

    const series = chart.addSeries(LineSeries, {
      color: lineColor,
      lineWidth: 2,
      priceLineColor: lineColor,
      priceLineWidth: 1,
      crosshairMarkerBackgroundColor: lineColor,
    })

    const today = new Date().toISOString().split('T')[0]
    series.setData(
      data.map(p => ({
        time: (new Date(`${today}T${p.time}:00+09:00`).getTime() / 1000) as any,
        value: p.value,
      }))
    )

    chart.timeScale().fitContent()

    const ro = new ResizeObserver(() => {
      if (chartRef.current) {
        chart.applyOptions({ width: chartRef.current.clientWidth })
      }
    })
    ro.observe(chartRef.current)

    return () => { chart.remove(); ro.disconnect() }
  }, [data, changePercent])

  return (
    <div className="flex flex-col" style={{ background: '#131722' }}>
      {/* 헤더 */}
      <div className="px-5 py-4 border-b" style={{ borderColor: '#2a2e39' }}>
        <div className="flex items-baseline gap-3">
          <span className="text-xs" style={{ fontFamily: 'var(--font-terminal)', color: '#787b86' }}>KOSPI</span>
          <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-terminal)', color: '#d1d4dc' }}>
            {currentPrice ? currentPrice.toLocaleString() : '—'}
          </span>
          {currentPrice > 0 && (
            <span className="text-lg font-bold" style={{
              fontFamily: 'var(--font-terminal)',
              color: changePercent >= 0 ? '#26a69a' : '#ef5350',
            }}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* 차트 */}
      <div ref={chartRef} className="w-full" />

      {/* 차트 없을 때 */}
      {data.length === 0 && (
        <div className="flex items-center justify-center h-[280px] text-sm" style={{ color: '#434651' }}>
          장 시작 전 — 인트라데이 데이터 대기 중
        </div>
      )}
    </div>
  )
}
