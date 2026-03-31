'use client'

import { useEffect, useRef } from 'react'
import {
  createChart,
  AreaSeries,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type AreaSeriesPartialOptions,
  type UTCTimestamp,
} from 'lightweight-charts'

// 한국 주식 컬러: 상승=빨강, 하락=파랑
const KR_UP = '#dc2626'
const KR_DOWN = '#2563eb'

// 투자자 색상
const FOREIGN_COLOR = '#000000'  // 외국인 = 검정 (진하게)
const INST_COLOR = '#ca8a04'     // 기관 = 진한 노랑
const INDIV_COLOR = '#059669'    // 개인 = 진한 초록

export interface InvestorFlowPoint {
  date: string
  foreign_net: number
  inst_net: number
  indiv_net: number
}

interface HeroChartProps {
  data: { time: number; value: number }[]
  currentPrice: number
  change: number
  changePercent: number
  marketOpen?: boolean
  mode?: 'intraday' | 'daily' | 'empty'
  lastDate?: string
  investorFlow?: InvestorFlowPoint[]
  indexLabel?: string
}

export function HeroChart({ data, currentPrice, change, changePercent, marketOpen = false, mode = 'empty', lastDate, investorFlow, indexLabel = 'KOSPI' }: HeroChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const foreignRef = useRef<ISeriesApi<'Line'> | null>(null)
  const instRef = useRef<ISeriesApi<'Line'> | null>(null)
  const indivRef = useRef<ISeriesApi<'Line'> | null>(null)

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
      leftPriceScale: {
        visible: true,
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
      height: 260,
    })

    const series = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerBorderColor: '#ffffff',
      crosshairMarkerRadius: 4,
    })

    // 투자자 라인 시리즈 (왼쪽 축)
    const foreignLine = chart.addSeries(LineSeries, {
      color: FOREIGN_COLOR,
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      priceScaleId: 'left',
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    const instLine = chart.addSeries(LineSeries, {
      color: INST_COLOR,
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      priceScaleId: 'left',
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    const indivLine = chart.addSeries(LineSeries, {
      color: INDIV_COLOR,
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      priceScaleId: 'left',
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    chartRef.current = chart
    seriesRef.current = series
    foreignRef.current = foreignLine
    instRef.current = instLine
    indivRef.current = indivLine

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
      foreignRef.current = null
      instRef.current = null
      indivRef.current = null
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

  // 투자자 흐름 데이터 업데이트
  useEffect(() => {
    const foreignLine = foreignRef.current
    const instLine = instRef.current
    const indivLine = indivRef.current
    if (!foreignLine || !instLine || !indivLine || !investorFlow?.length) return

    const toTime = (d: string) => Math.floor(new Date(`${d}T09:00:00+09:00`).getTime() / 1000) as UTCTimestamp

    // 백만원 → 억원 변환
    const toEok = (v: number) => Math.round(v / 100)

    foreignLine.setData(investorFlow.map(p => ({ time: toTime(p.date), value: toEok(p.foreign_net) })))
    instLine.setData(investorFlow.map(p => ({ time: toTime(p.date), value: toEok(p.inst_net) })))
    indivLine.setData(investorFlow.map(p => ({ time: toTime(p.date), value: toEok(p.indiv_net) })))
  }, [investorFlow])

  const label = mode === 'daily' ? `${indexLabel} 30일 추이` : `${indexLabel} 종합지수`
  const priceColor = changePercent >= 0 ? KR_UP : KR_DOWN
  const hasFlow = investorFlow && investorFlow.length > 0

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

      {/* 우측 상단 — 장 상태 + 투자자 범례 */}
      <div className="absolute top-4 right-5 z-10 flex items-center gap-2">
        {hasFlow && (
          <div className="flex items-center gap-3 mr-4">
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 border-t-2" style={{ borderColor: FOREIGN_COLOR }} />
              <span className="text-[10px] font-mono text-[var(--text-muted)]">외국인</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 border-t-2" style={{ borderColor: INST_COLOR }} />
              <span className="text-[10px] font-mono text-[var(--text-muted)]">기관</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 border-t-2" style={{ borderColor: INDIV_COLOR }} />
              <span className="text-[10px] font-mono text-[var(--text-muted)]">개인</span>
            </span>
          </div>
        )}
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
        <div className="flex items-center justify-center h-[260px] text-sm font-mono text-[var(--text-muted)]">
          데이터 로딩 중...
        </div>
      )}
    </div>
  )
}
