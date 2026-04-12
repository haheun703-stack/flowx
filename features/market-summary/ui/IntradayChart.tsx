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
        background: { color: '#ffffff' },
        textColor: '#6b7280',
        fontFamily: 'var(--font-jetbrains), monospace',
      },
      grid: {
        vertLines: { color: '#f3f4f6' },
        horzLines: { color: '#f3f4f6' },
      },
      crosshair: {
        vertLine: { color: '#d1d5db', labelBackgroundColor: '#f9fafb' },
        horzLine: { color: '#d1d5db', labelBackgroundColor: '#f9fafb' },
      },
      rightPriceScale: { borderColor: '#e2e5ea' },
      timeScale: {
        borderColor: '#e2e5ea',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartRef.current.clientWidth,
      height: 280,
    })

    const isPositive = changePercent >= 0
    const lineColor = isPositive ? '#dc2626' : '#2563eb'

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
    <div className="flex flex-col bg-white">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[var(--border)]" style={{ fontFamily: 'var(--font-terminal)' }}>
        <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
          <span className="text-xs font-bold tracking-widest text-[var(--text-dim)]">KOSPI</span>
          <span className="text-2xl md:text-4xl font-bold text-[var(--text-primary)]">
            {currentPrice ? currentPrice.toLocaleString() : '—'}
          </span>
          {currentPrice > 0 && (
            <span className="text-xl font-bold" style={{
              color: changePercent >= 0 ? 'var(--up)' : 'var(--down)',
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
        <div className="flex items-center justify-center h-[280px] text-sm text-[var(--text-dim)]"
          style={{ fontFamily: 'var(--font-terminal)' }}>
          장 시작 전 — 인트라데이 데이터 대기 중
        </div>
      )}
    </div>
  )
}
