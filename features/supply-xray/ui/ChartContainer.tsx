'use client'
import { useState } from 'react'
import { useSupplyXray } from '../model/useSupplyXray'
import { CandleChart } from './CandleChart'
import { VolumePanel } from './VolumePanel'
import { RSIPanel } from './RSIPanel'
import { SupplyOverlay } from './SupplyOverlay'
import { SupplyBadge } from './SupplyBadge'
import { SupplyInsight } from './SupplyInsight'
import { ChartToolbar, ChartOptions } from './ChartToolbar'

export function ChartContainer({ ticker, companyName }: { ticker: string; companyName: string }) {
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [chartOptions, setChartOptions] = useState<ChartOptions>({
    ma5: true,
    ma20: true,
    ma60: false,
    bollinger: false,
  })

  const { ohlcv, supply, isLoading, isError } = useSupplyXray(ticker)

  const toggleOption = (key: keyof ChartOptions) => {
    setChartOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const activeSupply = supply
    ? (activeDate ? supply.find(s => s.date === activeDate) : supply[supply.length - 1])
    : null

  if (isLoading) return (
    <div className="flex items-center justify-center h-[640px] bg-[#0f1117] rounded-xl border border-gray-800">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-gray-500 text-sm">데이터 로딩 중...</div>
      </div>
    </div>
  )

  if (isError) return (
    <div className="flex items-center justify-center h-[640px] bg-[#0f1117] rounded-xl border border-red-900/50">
      <div className="text-red-400 text-sm">데이터를 불러오지 못했습니다.</div>
    </div>
  )

  return (
    <div>
      <div className="bg-[#0f1117] rounded-xl overflow-hidden border border-gray-800">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">{companyName}</span>
            <span className="text-gray-600 text-sm font-mono">{ticker}</span>
          </div>
          {activeSupply && (
            <div className="flex gap-2">
              <SupplyBadge label="외인" value={activeSupply.foreign} variant="foreign" />
              <SupplyBadge label="기관" value={activeSupply.institution} variant="institution" />
              <SupplyBadge label="개인" value={activeSupply.individual} variant="individual" />
            </div>
          )}
        </div>

        {/* 지표 토글 툴바 */}
        <ChartToolbar options={chartOptions} onChange={toggleOption} />

        {/* 캔들 + MA + BB */}
        {ohlcv && (
          <CandleChart
            data={ohlcv}
            options={chartOptions}
            onCrosshairMove={setActiveDate}
          />
        )}

        {/* 거래량 패널 */}
        {ohlcv && (
          <>
            <div className="border-t-2 border-gray-700 mt-2" />
            <VolumePanel data={ohlcv} />
          </>
        )}

        {/* RSI 패널 */}
        {ohlcv && (
          <>
            <div className="border-t-2 border-gray-700 mt-2" />
            <RSIPanel data={ohlcv} />
          </>
        )}

        {/* 수급 패널 */}
        {supply && (
          <>
            <div className="border-t-2 border-gray-700 mt-2" />
            <SupplyOverlay data={supply} />
          </>
        )}

      </div>

      {/* Why Now Engine */}
      {supply && <SupplyInsight supplyData={supply} />}
    </div>
  )
}
