'use client'
import { useRouter } from 'next/navigation'
import { KoreanTicker, WorldIndex } from '../types'
import { isMarketOpen } from '@/shared/lib/marketUtils'

function TickerChip({ ticker, onClick }: { ticker: KoreanTicker; onClick?: () => void }) {
  const isPositive = ticker.changePercent >= 0
  const color = isPositive ? 'text-[var(--up)]' : 'text-[var(--down)]'
  const sign = isPositive ? '+' : ''
  const fmtPrice = ticker.price.toLocaleString('ko-KR')

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 h-14 border-r border-[#D1D5DB]/30 whitespace-nowrap transition-colors shrink-0
        ${ticker.isIndex ? 'cursor-default' : 'cursor-pointer hover:bg-[#F0EDE8]'}`}
    >
      <span className={`${
        ticker.isIndex ? 'text-[16px] text-[#1A1A2E] font-extrabold' : 'text-[14px] text-[#6B7280] font-semibold'
      }`}>
        {ticker.name}
      </span>
      <span className={`font-bold tabular-nums ${
        ticker.isIndex ? 'text-[16px] text-[#1A1A2E]' : 'text-[15px] text-[#1A1A2E]'
      }`}>{fmtPrice}</span>
      <span className={`font-bold tabular-nums ${color} ${ticker.isIndex ? 'text-[16px]' : 'text-[14px]'}`}>
        {sign}{ticker.changePercent.toFixed(2)}%
      </span>
    </div>
  )
}

export function KoreanTickerRow({ tickers, usdkrw }: { tickers: KoreanTicker[]; usdkrw?: WorldIndex }) {
  const router = useRouter()
  if (!tickers.length) return null

  const marketOpen = isMarketOpen()
  const indices = tickers.filter(t => t.isIndex)
  const stocks = tickers.filter(t => !t.isIndex)

  return (
    <div className="flex items-center h-14 border-b border-[#ECEAE4] leading-none">
      {/* 한국 label — LIVE 위치와 정렬 */}
      <div className="flex items-center gap-2.5 px-5 h-full border-r border-[#ECEAE4] shrink-0">
        <span className="w-[8px] h-[8px] invisible" />
        <span className="text-[14px] invisible select-none" aria-hidden="true">LIVE</span>
        <span className="text-[14px] font-bold text-[#4B5563]">한국</span>
        <span className={`text-[13px] px-2 py-1 rounded font-bold ${
          marketOpen ? 'bg-[#E8F5E9] text-[#00CC6A]' : 'bg-[#F0EDE8] text-[#9CA3AF]'
        }`}>
          {marketOpen ? '장중' : '장마감'}
        </span>
      </div>

      {/* KOSPI / KOSDAQ / 환율 */}
      <div className="flex shrink-0">
        {indices.map(t => <TickerChip key={t.code} ticker={t} />)}
        {usdkrw && (
          <div className="flex items-center gap-2.5 px-4 h-14 border-r border-[#D1D5DB]/30 whitespace-nowrap cursor-default shrink-0">
            <span className="text-[14px] font-semibold text-[#6B7280]">환율</span>
            <span className="text-[15px] font-bold text-[#1A1A2E] tabular-nums">
              {usdkrw.price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[14px] font-bold tabular-nums ${usdkrw.changePercent >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
              {usdkrw.changePercent >= 0 ? '+' : ''}{usdkrw.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-[#D1D5DB]/40 shrink-0" />

      {/* 종목 무한 스크롤 */}
      <div className="flex overflow-hidden relative flex-1">
        <div className="flex animate-ticker">
          {[...stocks, ...stocks].map((t, i) => (
            <TickerChip
              key={`${t.code}-${i}`}
              ticker={t}
              onClick={() => router.push(`/chart/${t.code}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
