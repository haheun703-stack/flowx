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
      className={`flex items-center gap-2 px-4 h-11 border-r border-[var(--border)]/40 whitespace-nowrap transition-colors shrink-0
        ${ticker.isIndex
          ? 'cursor-default'
          : 'cursor-pointer hover:bg-gray-50'
        }`}
    >
      <span className={`text-sm font-medium ${ticker.isIndex ? 'text-[var(--text-dim)]' : 'text-gray-600'}`}>
        {ticker.name}
      </span>
      <span className="text-[var(--text-primary)] text-sm font-mono font-bold">{fmtPrice}</span>
      <span className={`text-sm font-mono font-bold ${color}`}>
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
  const stocks  = tickers.filter(t => !t.isIndex)

  return (
    <div className="flex items-center h-11 border-b border-[var(--border)] bg-white leading-none">
      {/* 고정 라벨 */}
      <div className="flex items-center gap-1.5 px-4 h-full border-r border-[var(--border)] shrink-0">
        <img src="https://flagcdn.com/w20/kr.png" alt="KR" width={20} height={14} className="inline-block" />
        <span className="text-sm text-[var(--text-primary)] font-bold tracking-wider">한국</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
          marketOpen
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {marketOpen ? '장중' : '장마감'}
        </span>
      </div>

      {/* KOSPI / KOSDAQ / 환율 고정 */}
      <div className="flex border-r border-[var(--border)] shrink-0">
        {indices.map(t => <TickerChip key={t.code} ticker={t} />)}
        {usdkrw && (
          <div className="flex items-center gap-2 px-4 h-11 border-r border-[var(--border)]/40 whitespace-nowrap cursor-default shrink-0">
            <span className="text-sm font-medium text-[var(--text-dim)]">환율</span>
            <span className="text-[var(--text-primary)] text-sm font-mono font-bold">{usdkrw.price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`text-sm font-mono font-bold ${usdkrw.changePercent >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
              {usdkrw.changePercent >= 0 ? '+' : ''}{usdkrw.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="w-px h-6 bg-gray-300/40 shrink-0" />

      {/* 종목 무한 스크롤 애니메이션 */}
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
