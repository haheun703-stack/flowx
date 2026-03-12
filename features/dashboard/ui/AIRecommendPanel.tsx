'use client'

import Link from 'next/link'
import { useDashboardPicks } from '../api/useDashboard'

function formatPrice(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}만`
  return v.toLocaleString()
}

const SIGNAL_COLORS: Record<string, string> = {
  '적극매수': 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/5',
  '매수':     'text-[#00cc6a] border-[#00cc6a]/20 bg-transparent',
  '관심매수': 'text-[#0ea5e9] border-[#0ea5e9]/20 bg-transparent',
  '관찰':     'text-[#64748b] border-[#334155] bg-transparent',
}

// 신호(72) 종목(1fr) 현재가(80) 등락(64) 수급(48) 점수(40)
const COLS = '100px 1fr 80px 64px 48px 40px'

export function AIRecommendPanel() {
  const { data, isLoading } = useDashboardPicks()

  const stocks = data?.picks
    ?.filter(p => ['적극매수', '매수', '관심매수'].includes(p.grade))
    ?.slice(0, 12) ?? []

  return (
    <div className="flex flex-col h-full bg-[#0a0f18]"
      style={{ fontFamily: 'var(--font-terminal)' }}>

      {/* 패널 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
          <span className="text-xl font-black text-[#e2e8f0] tracking-widest uppercase">AI 추천</span>
        </div>
        <span className="text-sm text-[#64748b] font-bold">{data?.target_date_label ?? ''}</span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid text-xs text-[#64748b] font-bold tracking-widest uppercase border-b border-[#1a2535] px-3 py-2"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">신호</span>
        <span className="text-center">종목</span>
        <span className="text-center">현재가</span>
        <span className="text-center">등락</span>
        <span className="text-center">수급</span>
        <span className="text-center">점수</span>
      </div>

      {/* 종목 행 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 border-b border-[#1a2535]/50 animate-pulse bg-[#0d1420]/30" />
          ))
        ) : (
          stocks.map(stock => (
            <Link
              key={stock.ticker}
              href={`/chart/${stock.ticker}`}
              className="grid items-center px-3 py-2 border-b border-[#1a2535]/50 hover:bg-[#0d1420] cursor-pointer transition-colors text-xs"
              style={{ gridTemplateColumns: COLS }}
            >
              <span className={`text-[10px] px-3 py-1.5 rounded-sm border tracking-tight text-center whitespace-nowrap ${SIGNAL_COLORS[stock.grade] ?? 'text-[#64748b] border-[#334155]'}`}>
                {stock.grade}
              </span>
              <div className="min-w-0 pl-1">
                <div className="text-[#e2e8f0] font-medium truncate">{stock.name}</div>
                <div className="text-[#334155] text-[10px]">{stock.ticker}</div>
              </div>
              <span className="text-right text-[#e2e8f0] tabular-nums">
                {formatPrice(stock.close)}
              </span>
              <span className={`text-right tabular-nums font-bold ${
                stock.price_change >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'
              }`}>
                {stock.price_change >= 0 ? '+' : ''}{stock.price_change.toFixed(1)}%
              </span>
              <div className="flex justify-center gap-0.5">
                <span className={`text-[10px] ${stock.foreign_5d > 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                  {stock.foreign_5d > 0 ? '▲' : '▼'}
                </span>
                <span className={`text-[10px] ${stock.inst_5d > 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                  {stock.inst_5d > 0 ? '▲' : '▼'}
                </span>
              </div>
              <span className={`text-right font-bold tabular-nums ${
                stock.total_score >= 80 ? 'text-[#00ff88]' :
                stock.total_score >= 60 ? 'text-[#f59e0b]' :
                'text-[#64748b]'
              }`}>
                {stock.total_score.toFixed(0)}
              </span>
            </Link>
          ))
        )}
      </div>

      {/* 하단 통계 */}
      <div className="flex gap-4 px-4 py-2 border-t border-[#1a2535] text-sm font-bold text-[#64748b]">
        <span>적극매수 <span className="text-[#00ff88]">{data?.stats?.['적극매수'] ?? 0}</span></span>
        <span>매수 <span className="text-[#00cc6a]">{data?.stats?.['매수'] ?? 0}</span></span>
        <span>관심 <span className="text-[#0ea5e9]">{data?.stats?.['관심매수'] ?? 0}</span></span>
        <span className="ml-auto">총 <span className="text-[#e2e8f0]">{data?.picks?.length ?? 0}</span></span>
      </div>
    </div>
  )
}
