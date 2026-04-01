'use client'
import { useMarketTicker } from '../model/useMarketTicker'
import { WorldIndexRow } from './WorldIndexRow'
import { KoreanTickerRow } from './KoreanTickerRow'

export function TickerBanner() {
  const { worldIndices, koreanTickers, isLoading } = useMarketTicker()

  if (isLoading) {
    return (
      <div className="bg-[#F5F4F0]">
        <div className="h-10 flex items-center px-4">
          <div className="flex gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-2.5 w-16 bg-[#E8E6E0] rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="h-10 border-t border-[#ECEAE4] flex items-center px-4">
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-2.5 w-16 bg-[#E8E6E0] rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #00FF88, #00CC6A 30%, #00FF88 60%, #00CC6A)' }} />
      </div>
    )
  }

  const usdkrw = worldIndices.find(i => i.symbol === 'USDKRW')

  return (
    <div className="bg-[#F5F4F0]">
      <WorldIndexRow indices={worldIndices} />
      <KoreanTickerRow tickers={koreanTickers} usdkrw={usdkrw} />
      {/* 하단 녹색 그래디언트 라인 */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, #00FF88, #00CC6A 30%, #00FF88 60%, #00CC6A)' }} />
    </div>
  )
}
