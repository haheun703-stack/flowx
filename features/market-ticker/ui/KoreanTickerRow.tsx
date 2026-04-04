'use client'
import { useRouter } from 'next/navigation'
import { KoreanTicker, WorldIndex } from '../types'
import { isMarketOpen } from '@/shared/lib/marketUtils'

function TickerChip({ ticker, onClick, compact }: { ticker: KoreanTicker; onClick?: () => void; compact?: boolean }) {
  const isPositive = ticker.changePercent >= 0
  const color = isPositive ? 'text-[var(--up)]' : 'text-[var(--down)]'
  const sign = isPositive ? '+' : ''
  const fmtPrice = ticker.price.toLocaleString('ko-KR')

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-1.5 px-2.5 h-10 border-r border-[#D1D5DB]/30 whitespace-nowrap transition-colors shrink-0
          ${ticker.isIndex ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <span className={`${
          ticker.isIndex ? 'text-[12px] text-[#1A1A2E] font-extrabold' : 'text-[11px] text-[#6B7280] font-semibold'
        }`}>
          {ticker.name}
        </span>
        <span className={`font-bold tabular-nums ${
          ticker.isIndex ? 'text-[12px] text-[#1A1A2E]' : 'text-[12px] text-[#1A1A2E]'
        }`}>{fmtPrice}</span>
        <span className={`font-bold tabular-nums ${color} ${ticker.isIndex ? 'text-[11px]' : 'text-[11px]'}`}>
          {sign}{ticker.changePercent.toFixed(2)}%
        </span>
      </div>
    )
  }

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

  // 모바일용: 인덱스 + 종목 전부 스크롤
  const allTickers = [...indices, ...stocks]

  return (
    <div className="flex items-center h-10 md:h-14 border-b border-[#ECEAE4] leading-none">
      {/* 한국 label */}
      <div className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-5 h-full border-r border-[#ECEAE4] shrink-0">
        <span className="text-[11px] md:text-[14px] font-bold text-[#4B5563]">한국</span>
        <span className={`text-[10px] md:text-[13px] px-1.5 md:px-2 py-0.5 md:py-1 rounded font-bold ${
          marketOpen ? 'bg-[#E8F5E9] text-[#00CC6A]' : 'bg-[#F0EDE8] text-[#9CA3AF]'
        }`}>
          {marketOpen ? '장중' : '장마감'}
        </span>
      </div>

      {/* 데스크톱: KOSPI / KOSDAQ / 환율 (고정) */}
      <div className="hidden md:flex shrink-0">
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
      <div className="hidden md:block w-px h-5 bg-[#D1D5DB]/40 shrink-0" />

      {/* 모바일: 전부 스크롤 (인덱스 + 종목) */}
      <div className="md:hidden flex overflow-hidden relative flex-1">
        <div className="flex animate-ticker">
          {[...allTickers, ...allTickers].map((t, i) => (
            <TickerChip
              key={`${t.code}-${i}`}
              ticker={t}
              compact
              onClick={t.isIndex ? undefined : () => router.push(`/chart/${t.code}`)}
            />
          ))}
        </div>
      </div>

      {/* 데스크톱: 종목만 스크롤 */}
      <div className="hidden md:flex overflow-hidden relative flex-1">
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
