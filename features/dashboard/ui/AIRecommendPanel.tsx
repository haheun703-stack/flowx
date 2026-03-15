'use client'

import Link from 'next/link'
import { useShortSignals } from '../api/useDashboard'

const GRADE_COLOR: Record<string, string> = {
  'AA': 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/5',
  'A':  'text-[#00cc6a] border-[#00cc6a]/20 bg-transparent',
  'B':  'text-[#0ea5e9] border-[#0ea5e9]/20 bg-transparent',
  'C':  'text-[#64748b] border-[#334155] bg-transparent',
}

const SIGNAL_LABEL: Record<string, string> = {
  FORCE_BUY: '적극매수',
  BUY: '매수',
  WATCH: '관심',
}

const COLS = '80px 1fr 80px 64px 56px 40px'

export function AIRecommendPanel() {
  const { data, isLoading } = useShortSignals('all')

  const stocks = data?.slice(0, 12) ?? []

  return (
    <div className="flex flex-col h-full bg-[#0a0f18]"
      style={{ fontFamily: 'var(--font-terminal)' }}>

      {/* 패널 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
          <span className="text-xl font-black text-[#e2e8f0] tracking-widest uppercase">AI 추천</span>
        </div>
        <span className="text-sm text-[#64748b] font-bold">{stocks[0]?.date ?? ''}</span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid text-xs text-[#64748b] font-bold tracking-widest uppercase border-b border-[#1a2535] px-3 py-2"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">신호</span>
        <span className="text-center">종목</span>
        <span className="text-center">진입가</span>
        <span className="text-center">목표</span>
        <span className="text-center">배수</span>
        <span className="text-center">점수</span>
      </div>

      {/* 종목 행 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 border-b border-[#1a2535]/50 animate-pulse bg-[#0d1420]/30" />
          ))
        ) : stocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          stocks.map(stock => (
            <Link
              key={stock.code}
              href={`/chart/${stock.code}`}
              className="grid items-center px-3 py-2 border-b border-[#1a2535]/50 hover:bg-[#0d1420] cursor-pointer transition-colors text-xs"
              style={{ gridTemplateColumns: COLS }}
            >
              <span className={`text-[10px] px-3 py-1.5 rounded-sm border tracking-tight text-center whitespace-nowrap ${GRADE_COLOR[stock.grade] ?? 'text-[#64748b] border-[#334155]'}`}>
                {SIGNAL_LABEL[stock.signal_type] ?? stock.grade}
              </span>
              <div className="min-w-0 pl-1">
                <div className="text-[#e2e8f0] font-medium truncate">{stock.name}</div>
                <div className="text-[#334155] text-[10px]">{stock.code}</div>
              </div>
              <span className="text-right text-[#e2e8f0] tabular-nums">
                {stock.entry_price?.toLocaleString()}
              </span>
              <span className="text-right text-[#00ff88] tabular-nums font-bold">
                {stock.target_price?.toLocaleString()}
              </span>
              <span className="text-right text-[#f59e0b] font-bold tabular-nums">
                x{stock.volume_ratio?.toFixed(1)}
              </span>
              <span className={`text-right font-bold tabular-nums ${
                stock.total_score >= 80 ? 'text-[#00ff88]' :
                stock.total_score >= 60 ? 'text-[#f59e0b]' :
                'text-[#64748b]'
              }`}>
                {stock.total_score}
              </span>
            </Link>
          ))
        )}
      </div>

      {/* 하단 통계 */}
      <div className="flex gap-4 px-4 py-2 border-t border-[#1a2535] text-sm font-bold text-[#64748b]">
        <span>AA <span className="text-[#00ff88]">{stocks.filter(s => s.grade === 'AA').length}</span></span>
        <span>A <span className="text-[#00cc6a]">{stocks.filter(s => s.grade === 'A').length}</span></span>
        <span>B <span className="text-[#0ea5e9]">{stocks.filter(s => s.grade === 'B').length}</span></span>
        <span className="ml-auto">총 <span className="text-[#e2e8f0]">{stocks.length}</span></span>
      </div>
    </div>
  )
}
