'use client'

import Link from 'next/link'
import { useShortSignals } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

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

const COLS = '64px 1fr 64px 56px 44px 36px'

export function AIRecommendPanel() {
  const { data, isLoading } = useShortSignals('all')
  const stocks = data?.slice(0, 12) ?? []
  const dateStr = stocks[0]?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full bg-[#0a0f18] ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">AI 추천</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[#00ff88]' : 'text-[#555]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[#8a8a8a] font-bold">{dateStr}</span>
        </div>
      </div>
      <div className="grid px-2 py-1 border-b border-[#2a2a3a] text-[11px] text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">신호</span>
        <span>종목</span>
        <span className="text-right">진입가</span>
        <span className="text-right">목표</span>
        <span className="text-right">배수</span>
        <span className="text-right">점수</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[32px] border-b border-[#2a2a3a]/30 animate-pulse bg-[#0d1420]/30" />
          ))
        ) : stocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          stocks.map((stock, i) => (
            <Link key={stock.code} href={`/chart/${stock.code}`}
              className={`grid items-center px-2 py-1 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] cursor-pointer transition-colors text-xs ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <span className={`text-[10px] px-1 py-0.5 rounded-sm border text-center whitespace-nowrap ${GRADE_COLOR[stock.grade] ?? 'text-[#64748b] border-[#334155]'}`}>
                {SIGNAL_LABEL[stock.signal_type] ?? stock.grade}
              </span>
              <div className="min-w-0 pl-1">
                <div className="text-[13px] text-[#e2e8f0] font-medium truncate">{stock.name}</div>
                <div className="text-[10px] text-[#555]">{stock.code}</div>
              </div>
              <span className="text-right text-[13px] text-[#e2e8f0] tabular-nums">{stock.entry_price?.toLocaleString()}</span>
              <span className="text-right text-[13px] text-[#00ff88] tabular-nums font-bold">{stock.target_price?.toLocaleString()}</span>
              <span className="text-right text-[13px] text-[#f59e0b] font-bold tabular-nums">x{stock.volume_ratio?.toFixed(1)}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${
                stock.total_score >= 80 ? 'text-[#00ff88]' :
                stock.total_score >= 60 ? 'text-[#f59e0b]' : 'text-[#64748b]'
              }`}>{stock.total_score}</span>
            </Link>
          ))
        )}
      </div>
      <div className="flex gap-3 px-3 py-1.5 border-t border-[#2a2a3a] text-[11px] font-bold text-[#8a8a8a]">
        <span>AA <span className="text-[#00ff88]">{stocks.filter(s => s.grade === 'AA').length}</span></span>
        <span>A <span className="text-[#00cc6a]">{stocks.filter(s => s.grade === 'A').length}</span></span>
        <span>B <span className="text-[#0ea5e9]">{stocks.filter(s => s.grade === 'B').length}</span></span>
        <span className="ml-auto">총 <span className="text-[#e2e8f0]">{stocks.length}</span></span>
      </div>
    </div>
  )
}
