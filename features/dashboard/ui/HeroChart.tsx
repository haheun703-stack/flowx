'use client'

import { useEffect, useRef } from 'react'
import { createChart, AreaSeries, type IChartApi, type ISeriesApi, type AreaSeriesPartialOptions, type UTCTimestamp } from 'lightweight-charts'

// 한국 주식 컬러: 상승=빨강, 하락=파랑
const KR_UP = '#ff3b5c'
const KR_DOWN = '#0ea5e9'

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
        textColor: '#94a3b8',
        fontFamily: 'var(--font-terminal), monospace',
      },
      grid: {
        vertLines: { color: '#1a2535' },
        horzLines: { color: '#1a2535' },
      },
      crosshair: {
        vertLine: { color: '#2a2e39', labelBackgroundColor: '#1c2030' },
        horzLine: { color: '#2a2e39', labelBackgroundColor: '#1c2030' },
      },
      rightPriceScale: {
        borderColor: '#1a2535',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#1a2535',
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
      crosshairMarkerBorderColor: '#131722',
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
      topColor: isPositive ? 'rgba(255,59,92,0.15)' : 'rgba(14,165,233,0.15)',
      bottomColor: isPositive ? 'rgba(255,59,92,0.0)' : 'rgba(14,165,233,0.0)',
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
    <div className="relative border-b" style={{ background: '#0d1117', borderColor: '#1a2535' }}>
      {/* 왼쪽 상단 오버레이 — KOSPI 현재가 */}
      <div className="absolute top-4 left-5 z-10 flex items-baseline gap-3">
        <span className="text-sm font-mono font-bold" style={{ color: '#94a3b8' }}>
          {label}
        </span>
        <span className="text-4xl font-bold font-mono" style={{ color: '#d1d4dc' }}>
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
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00ff88' }} />
            <span className="text-xs font-mono" style={{ color: '#00ff88' }}>LIVE</span>
          </>
        ) : (
          <>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
            <span className="text-xs font-mono" style={{ color: '#f59e0b' }}>CLOSED</span>
          </>
        )}
        <span className="text-sm font-mono font-bold ml-2" style={{ color: '#94a3b8' }}>
          {mode === 'daily' && lastDate ? `${lastDate} 종가 기준` : '09:00 — 15:30 KST'}
        </span>
      </div>

      {/* 데이터 없을 때 */}
      {data.length === 0 && (
        <div className="flex items-center justify-center h-[220px] text-sm font-mono" style={{ color: '#434651' }}>
          데이터 로딩 중...
        </div>
      )}
    </div>
  )
}
