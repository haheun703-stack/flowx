'use client'
import { useRouter } from 'next/navigation'
import { KoreanTicker } from '../types'

function TickerChip({ ticker, onClick }: { ticker: KoreanTicker; onClick?: () => void }) {
  const isPositive = ticker.changePercent >= 0
  const color = isPositive ? 'text-red-400' : 'text-blue-400'
  const sign = isPositive ? '+' : ''

  const fmtPrice = ticker.price.toLocaleString('ko-KR')

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-4 h-11 border-r border-gray-800/60 whitespace-nowrap transition-colors shrink-0
        ${ticker.isIndex
          ? 'cursor-default'
          : 'cursor-pointer hover:bg-gray-800/40'
        }`}
    >
      <span className={`text-sm font-medium ${ticker.isIndex ? 'text-gray-300' : 'text-gray-400'}`}>
        {ticker.name}
      </span>
      <span className="text-white text-sm font-mono">{fmtPrice}</span>
      <span className={`text-sm font-mono font-medium ${color}`}>
        {sign}{ticker.changePercent.toFixed(2)}%
      </span>
    </div>
  )
}

export function KoreanTickerRow({ tickers, isMarketOpen }: { tickers: KoreanTicker[]; isMarketOpen: boolean }) {
  const router = useRouter()
  if (!tickers.length) return null

  const indices = tickers.filter(t => t.isIndex)
  const stocks  = tickers.filter(t => !t.isIndex)

  return (
    <div className="flex items-center h-11 border-b border-gray-800/60 bg-[#080b10]">
      {/* 고정 라벨 */}
      <div className="flex items-center gap-1.5 px-4 h-full border-r border-gray-700/60 shrink-0">
        <img src="https://flagcdn.com/w20/kr.png" alt="KR" width={20} height={14} className="inline-block" />
        <span className="text-sm text-gray-300 font-bold tracking-wider">한국</span>
        <span className={`text-sm px-1.5 py-0.5 rounded-full font-medium ${
          isMarketOpen
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-700/50 text-gray-500'
        }`}>
          {isMarketOpen ? '장중' : '장마감'}
        </span>
      </div>

      {/* KOSPI / KOSDAQ 고정 */}
      <div className="flex border-r border-gray-700/60 shrink-0">
        {indices.map(t => <TickerChip key={t.code} ticker={t} />)}
      </div>

      {/* 구분선 */}
      <div className="w-px h-6 bg-gray-700/40 shrink-0" />

      {/* 종목 무한 스크롤 애니메이션 */}
      <div className="flex overflow-hidden relative flex-1">
        <div className="flex animate-ticker">
          {/* 2배 복제 → 끊김 없는 무한 루프 */}
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
