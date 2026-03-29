'use client'

import { useEffect, useRef } from 'react'
import { createChart, AreaSeries, type IChartApi, type ISeriesApi, type AreaSeriesPartialOptions, type UTCTimestamp } from 'lightweight-charts'

// 한국 주식 컬러: 상승=빨강, 하락=파랑
const KR_UP = '#dc2626'
const KR_DOWN = '#2563eb'

interface HeroChartProps {
  data: { time: number; value: number }[]
  currentPrice: number
  change: number
  changePercent: number
  marketOpen?: boolean
  mode?: 'intraday' | 'daily' | 'empty'
  lastDate?: string
}

export function HeroChart({ data, currentPrice, change, changePercent, marketOpen = false, mode = 'empty', lastDate }: HeroChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)

  // 차트 생성 (mount 1회)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#6b7280',
        fontFamily: 'var(--font-terminal), monospace',
      },
      grid: {
        vertLines: { color: '#f3f4f6' },
        horzLines: { color: '#f3f4f6' },
      },
      crosshair: {
        vertLine: { color: '#d1d5db', labelBackgroundColor: '#f9fafb' },
        horzLine: { color: '#d1d5db', labelBackgroundColor: '#f9fafb' },
      },
      rightPriceScale: {
        borderColor: '#e5e7eb',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      width: el.clientWidth,
      height: 220,
    })

    const series = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerBorderColor: '#ffffff',
      crosshairMarkerRadius: 4,
    })

    chartRef.current = chart
    seriesRef.current = series

    let disposed = false
    const ro = new ResizeObserver(() => {
      if (!disposed && el) {
        chart.applyOptions({ width: el.clientWidth })
      }
    })
    ro.observe(el)

    return () => {
      disposed = true
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  // 데이터 + 스타일 업데이트 (data/changePercent/mode 변경 시)
  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (!chart || !series || !data.length) return

    const isPositive = changePercent >= 0
    const lineColor = isPositive ? KR_UP : KR_DOWN

    const styleOpts: AreaSeriesPartialOptions = {
      lineColor,
      topColor: isPositive ? 'rgba(220,38,38,0.12)' : 'rgba(37,99,235,0.12)',
      bottomColor: isPositive ? 'rgba(220,38,38,0.0)' : 'rgba(37,99,235,0.0)',
      crosshairMarkerBackgroundColor: lineColor,
    }
    series.applyOptions(styleOpts)

    chart.applyOptions({
      timeScale: { timeVisible: mode === 'intraday' },
    })

    series.setData(data.map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
    chart.timeScale().fitContent()
  }, [data, changePercent, mode])

  const label = mode === 'daily' ? 'KOSPI 30일 추이' : 'KOSPI 종합지수'
  const priceColor = changePercent >= 0 ? KR_UP : KR_DOWN

  return (
    <div className="relative border-b border-[var(--border)] bg-white">
      {/* 왼쪽 상단 오버레이 — KOSPI 현재가 */}
      <div className="absolute top-4 left-5 z-10 flex items-baseline gap-3">
        <span className="text-sm font-mono font-bold text-[var(--text-dim)]">
          {label}
        </span>
        <span className="text-4xl font-bold font-mono text-[var(--text-primary)]">
          {currentPrice ? currentPrice.toLocaleString() : '---'}
        </span>
        {currentPrice > 0 && (
          <>
            <span className="text-lg font-bold font-mono" style={{ color: priceColor }}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
            <span className="text-xs font-mono" style={{ color: priceColor, opacity: 0.7 }}>
              ({change >= 0 ? '+' : ''}{change.toFixed(2)})
            </span>
          </>
        )}
      </div>

      {/* 차트 */}
      <div ref={containerRef} className="w-full pt-12" />

      {/* 우측 상단 — 장 상태 */}
      <div className="absolute top-4 right-5 z-10 flex items-center gap-2">
        {marketOpen ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--green)]" />
            <span className="text-xs font-mono text-[var(--green)]">LIVE</span>
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--yellow)]" />
            <span className="text-xs font-mono text-[var(--yellow)]">CLOSED</span>
          </>
        )}
        <span className="text-sm font-mono font-bold ml-2 text-[var(--text-dim)]">
          {mode === 'daily' && lastDate ? `${lastDate} 종가 기준` : '09:00 — 15:30 KST'}
        </span>
      </div>

      {/* 데이터 없을 때 */}
      {data.length === 0 && (
        <div className="flex items-center justify-center h-[220px] text-sm font-mono text-[var(--text-muted)]">
          데이터 로딩 중...
        </div>
      )}
    </div>
  )
}
