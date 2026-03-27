'use client'
import { useMarketTicker } from '../model/useMarketTicker'
import { WorldIndexRow } from './WorldIndexRow'
import { KoreanTickerRow } from './KoreanTickerRow'

export function TickerBanner() {
  const { worldIndices, koreanTickers, isLoading } = useMarketTicker()

  if (isLoading) {
    return (
      <div className="h-[52px] bg-[#080b10] border-b border-gray-800/60 flex items-center px-4">
        <div className="flex gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#080b10] sticky top-[53px] z-30">
      {/* 1행: 세계 지수 */}
      <WorldIndexRow indices={worldIndices} />
      {/* 2행: 한국 시장 */}
      <KoreanTickerRow tickers={koreanTickers} />
    </div>
  )
}
