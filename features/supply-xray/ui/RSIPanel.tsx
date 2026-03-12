'use client'
import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineSeries } from 'lightweight-charts'
import { CandleData } from '@/entities/stock/types'

// RSI(14) 계산
function calcRSI(data: CandleData[], period = 14): { time: string; value: number }[] {
  if (data.length < period + 1) return []

  const result: { time: string; value: number }[] = []
  let avgGain = 0
  let avgLoss = 0

  // 초기 평균 계산
  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close
    if (diff > 0) avgGain += diff
    else avgLoss += Math.abs(diff)
  }
  avgGain /= period
  avgLoss /= period

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss
  result.push({ time: data[period].time, value: 100 - 100 / (1 + firstRS) })

  // Wilder 평활법으로 이후 RSI 계산
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? Math.abs(diff) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    result.push({ time: data[i].time, value: 100 - 100 / (1 + rs) })
  }

  return result
}

export function RSIPanel({ data }: { data: CandleData[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f1117' },
        textColor: '#6b7280',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: containerRef.current.clientWidth,
      height: 140,
      rightPriceScale: {
        borderColor: '#374151',
        // RSI는 0~100 고정 스케일
        autoScale: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: { borderColor: '#374151', visible: false },
    })

    const rsiData = calcRSI(data, 14)

    // RSI 라인
    const rsiSeries = chart.addSeries(LineSeries, {
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
      color: '#a78bfa',
    })
    rsiSeries.setData(rsiData)

    // 과매수 기준선 (70)
    rsiSeries.createPriceLine({
      price: 70,
      color: '#ef444440',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: '70',
    })

    // 과매도 기준선 (30)
    rsiSeries.createPriceLine({
      price: 30,
      color: '#3b82f640',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: '30',
    })

    // 중간선 (50)
    rsiSeries.createPriceLine({
      price: 50,
      color: '#37415150',
      lineWidth: 1,
      lineStyle: 0,
      axisLabelVisible: false,
      title: '',
    })

    chart.timeScale().fitContent()

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize); chart.remove() }
  }, [data])

  // 현재 RSI 값 표시
  const rsiData = calcRSI(data, 14)
  const currentRSI = rsiData[rsiData.length - 1]?.value ?? null
  const rsiColor = currentRSI === null ? 'text-gray-500'
    : currentRSI >= 70 ? 'text-red-400'
    : currentRSI <= 30 ? 'text-blue-400'
    : 'text-purple-400'

  return (
    <div>
      <div className="flex items-center gap-2 px-3 pt-2 pb-1 bg-[#0f1117]">
        <span className="text-xs text-purple-400/70">RSI(14)</span>
        {currentRSI !== null && (
          <>
            <span className={`text-xs font-mono font-bold ${rsiColor}`}>
              {currentRSI.toFixed(1)}
            </span>
            {currentRSI >= 70 && (
              <span className="text-xs text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">과매수</span>
            )}
            {currentRSI <= 30 && (
              <span className="text-xs text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">과매도</span>
            )}
          </>
        )}
      </div>
      <div ref={containerRef} className="bg-[#0f1117]" />
    </div>
  )
}
