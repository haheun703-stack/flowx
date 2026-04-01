'use client'

import { useEffect, useRef } from 'react'
import {
  createChart,
  AreaSeries,
  LineSeries,
  BaselineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'

// 투자자 색상
const INST_COLOR = '#ca8a04'
const INDIV_COLOR = '#059669'

// FlowX 차트 라인 색상 (녹색 아이덴티티)
const CHART_LINE = '#00CC6A'
const CHART_AREA_TOP = 'rgba(0, 255, 136, 0.06)'
const CHART_AREA_BOTTOM = 'rgba(0, 255, 136, 0.0)'

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

export function HeroChart({ data, changePercent, mode = 'empty', investorFlow }: HeroChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const foreignRef = useRef<ISeriesApi<'Baseline'> | null>(null)
  const instRef = useRef<ISeriesApi<'Line'> | null>(null)
  const indivRef = useRef<ISeriesApi<'Line'> | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#9CA3AF',
        fontFamily: "'Pretendard', -apple-system, system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: '#F0EDE8' },
        horzLines: { color: '#F0EDE8' },
      },
      crosshair: {
        vertLine: { color: '#E8E6E0', labelBackgroundColor: '#FAFAF8' },
        horzLine: { color: '#E8E6E0', labelBackgroundColor: '#FAFAF8' },
      },
      rightPriceScale: {
        borderColor: '#E8E6E0',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      leftPriceScale: {
        visible: true,
        borderColor: '#E8E6E0',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#E8E6E0',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      width: el.clientWidth,
      height: 240,
    })

    const series = chart.addSeries(AreaSeries, {
      lineColor: CHART_LINE,
      topColor: CHART_AREA_TOP,
      bottomColor: CHART_AREA_BOTTOM,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerBorderColor: '#ffffff',
      crosshairMarkerBackgroundColor: CHART_LINE,
      crosshairMarkerRadius: 4,
    })

    // 외국인: BaselineSeries (상승=파랑, 하락=빨강)
    const foreignLine = chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: 0 },
      topLineColor: 'rgba(37,99,235,0.8)',
      topFillColor1: 'rgba(37,99,235,0.15)',
      topFillColor2: 'rgba(37,99,235,0.02)',
      bottomLineColor: 'rgba(239,68,68,0.8)',
      bottomFillColor1: 'rgba(239,68,68,0.02)',
      bottomFillColor2: 'rgba(239,68,68,0.15)',
      lineWidth: 2,
      priceScaleId: 'left',
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    const instLine = chart.addSeries(LineSeries, {
      color: INST_COLOR,
      lineWidth: 1,
      lineStyle: LineStyle.Solid,
      priceScaleId: 'left',
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    const indivLine = chart.addSeries(LineSeries, {
      color: INDIV_COLOR,
      lineWidth: 1,
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

  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (!chart || !series || !data.length) return

    chart.applyOptions({
      timeScale: { timeVisible: mode === 'intraday' },
    })

    series.setData(data.map(p => ({ time: p.time as UTCTimestamp, value: p.value })))
    chart.timeScale().fitContent()
  }, [data, changePercent, mode])

  useEffect(() => {
    const foreignLine = foreignRef.current
    const instLine = instRef.current
    const indivLine = indivRef.current
    if (!foreignLine || !instLine || !indivLine || !investorFlow?.length) return

    const toTime = (d: string) => Math.floor(new Date(`${d}T09:00:00+09:00`).getTime() / 1000) as UTCTimestamp
    const toEok = (v: number) => Math.round(v / 100)

    function smooth(arr: number[], window = 3): number[] {
      return arr.map((_, i) => {
        const start = Math.max(0, i - window + 1)
        const slice = arr.slice(start, i + 1)
        return Math.round(slice.reduce((s, v) => s + v, 0) / slice.length)
      })
    }

    const foreignVals = smooth(investorFlow.map(p => toEok(p.foreign_net)))
    const instVals = smooth(investorFlow.map(p => toEok(p.inst_net)))
    const indivVals = smooth(investorFlow.map(p => toEok(p.indiv_net)))

    foreignLine.setData(investorFlow.map((p, i) => ({ time: toTime(p.date), value: foreignVals[i] })))
    instLine.setData(investorFlow.map((p, i) => ({ time: toTime(p.date), value: instVals[i] })))
    indivLine.setData(investorFlow.map((p, i) => ({ time: toTime(p.date), value: indivVals[i] })))
  }, [investorFlow])

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full" />

      {/* 투자자 범례 */}
      <div className="flex items-center gap-3 mt-1">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-2.5 rounded-sm" style={{ background: 'linear-gradient(to bottom, rgba(37,99,235,0.3), rgba(239,68,68,0.3))' }} />
          <span className="text-[9px] text-[#B0ADA6]">외국인</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 border-t-2" style={{ borderColor: INST_COLOR }} />
          <span className="text-[9px] text-[#B0ADA6]">기관</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 border-t-2" style={{ borderColor: INDIV_COLOR }} />
          <span className="text-[9px] text-[#B0ADA6]">개인</span>
        </span>
      </div>

      {data.length === 0 && (
        <div className="flex items-center justify-center h-[240px] text-[10px] text-[#C4C1BA] absolute inset-0">
          데이터 로딩 중...
        </div>
      )}
    </div>
  )
}
