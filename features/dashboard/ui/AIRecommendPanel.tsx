'use client'

import Link from 'next/link'
import { useShortSignals } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const GRADE_COLOR: Record<string, string> = {
  'AA': 'text-[var(--green)] border-[var(--green)]/30 bg-[var(--green)]/5',
  'A':  'text-emerald-600 border-emerald-500/20 bg-transparent',
  'B':  'text-[var(--blue)] border-[var(--blue)]/20 bg-transparent',
  'C':  'text-[var(--text-dim)] border-[var(--border)] bg-transparent',
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
    <div className={`flex flex-col h-full bg-white ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">AI 추천</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[var(--text-dim)] font-bold">{dateStr}</span>
        </div>
      </div>
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[11px] text-[var(--text-dim)] font-bold uppercase"
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
            <div key={i} className="h-[32px] border-b border-[var(--border)]/30 animate-pulse bg-gray-50/50" />
          ))
        ) : stocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">데이터 없음</div>
        ) : (
          stocks.map((stock, i) => (
            <Link key={stock.code} href={`/chart/${stock.code}`}
              className={`grid items-center px-2 py-1 border-b border-[var(--border)]/30 hover:bg-gray-50 cursor-pointer transition-colors text-xs ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <span className={`text-[10px] px-1 py-0.5 rounded-sm border text-center whitespace-nowrap ${GRADE_COLOR[stock.grade] ?? 'text-[var(--text-dim)] border-[var(--border)]'}`}>
                {SIGNAL_LABEL[stock.signal_type] ?? stock.grade}
              </span>
              <div className="min-w-0 pl-1">
                <div className="text-[13px] text-[var(--text-primary)] font-medium truncate">{stock.name}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{stock.code}</div>
              </div>
              <span className="text-right text-[13px] text-[var(--text-primary)] tabular-nums">{stock.entry_price?.toLocaleString()}</span>
              <span className="text-right text-[13px] text-[var(--green)] tabular-nums font-bold">{stock.target_price?.toLocaleString()}</span>
              <span className="text-right text-[13px] text-[var(--yellow)] font-bold tabular-nums">x{stock.volume_ratio?.toFixed(1)}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${
                stock.total_score >= 80 ? 'text-[var(--green)]' :
                stock.total_score >= 60 ? 'text-[var(--yellow)]' : 'text-[var(--text-dim)]'
              }`}>{stock.total_score}</span>
            </Link>
          ))
        )}
      </div>
      <div className="flex gap-3 px-3 py-1.5 border-t border-[var(--border)] text-[11px] font-bold text-[var(--text-dim)]">
        <span>AA <span className="text-[var(--green)]">{stocks.filter(s => s.grade === 'AA').length}</span></span>
        <span>A <span className="text-emerald-600">{stocks.filter(s => s.grade === 'A').length}</span></span>
        <span>B <span className="text-[var(--blue)]">{stocks.filter(s => s.grade === 'B').length}</span></span>
        <span className="ml-auto">총 <span className="text-[var(--text-primary)]">{stocks.length}</span></span>
      </div>
    </div>
  )
}
