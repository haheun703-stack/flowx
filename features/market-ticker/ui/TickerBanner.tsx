'use client'
import { useMarketTicker } from '../model/useMarketTicker'
import { WorldIndexRow } from './WorldIndexRow'
import { KoreanTickerRow } from './KoreanTickerRow'

export function TickerBanner() {
  const { worldIndices, koreanTickers, isLoading } = useMarketTicker()

  if (isLoading) {
    return (
      <div className="h-[52px] bg-white border-b border-[var(--border)] flex items-center px-4">
        <div className="flex gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white sticky top-[53px] z-30">
      <WorldIndexRow indices={worldIndices} />
      <KoreanTickerRow tickers={koreanTickers} />
    </div>
  )
}
