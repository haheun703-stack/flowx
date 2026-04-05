'use client'

import { useShortSignals } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const GRADE_COLOR: Record<string, string> = {
  AA: 'text-[var(--up)] bg-[var(--up)]/10 border-[var(--up)]/30',
  A: 'text-[var(--green)] bg-[var(--green)]/10 border-[var(--green)]/30',
  B: 'text-[var(--yellow)] bg-[var(--yellow)]/10 border-[var(--yellow)]/30',
}

const SIGNAL_LABEL: Record<string, string> = {
  FORCE_BUY: '강력 포착', STRONG_PICK: '강력 포착',
  BUY: '포착', PICK: '포착',
  WATCH: '관심',
}

const SIGNAL_COLOR: Record<string, string> = {
  FORCE_BUY: 'text-[var(--up)]', STRONG_PICK: 'text-[var(--up)]',
  BUY: 'text-[var(--green)]', PICK: 'text-[var(--green)]',
  WATCH: 'text-[var(--yellow)]',
}

const COLS = '1fr 36px 64px 64px 40px 52px'

export function SniperWatchPanel() {
  const { data, isLoading } = useShortSignals('watch')
  const items = data?.slice(0, 15) ?? []
  const dateStr = items[0]?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 30 : false

  return (
    <div className={`flex flex-col h-full text-xs bg-white ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">스나이퍼 워치</span>
          <span className="text-[11px] text-[var(--text-dim)] font-bold">포착 시그널</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[var(--text-dim)] font-bold">{dateStr}</span>
        </div>
      </div>
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[11px] text-[var(--text-dim)] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>종목</span>
        <span className="text-center">등급</span>
        <span className="text-right">진입가</span>
        <span className="text-right">목표가</span>
        <span className="text-right">점수</span>
        <span className="text-center">판정</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[32px] mx-2 my-px bg-gray-100 animate-pulse rounded-sm" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">데이터 없음</div>
        ) : (
          items.map((item, i) => (
            <div key={item.code} className={`grid px-2 py-1 border-b border-[var(--border)]/30 hover:bg-gray-50 items-center ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <div className="truncate">
                <span className="text-[13px] text-[var(--text-primary)] font-medium">{item.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">{item.code}</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] px-1 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[item.grade] ?? 'text-[var(--text-dim)]'}`}>
                  {item.grade}
                </span>
              </div>
              <span className="text-right text-[13px] text-[var(--text-primary)] font-bold tabular-nums">{item.entry_price?.toLocaleString()}</span>
              <span className="text-right text-[13px] text-[var(--green)] font-bold tabular-nums">{item.target_price?.toLocaleString()}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${
                item.total_score >= 80 ? 'text-[var(--green)]' :
                item.total_score >= 60 ? 'text-[var(--yellow)]' : 'text-[var(--text-dim)]'
              }`}>{item.total_score}</span>
              <div className="text-center">
                <span className={`text-[10px] font-bold ${SIGNAL_COLOR[item.signal_type] ?? 'text-[var(--text-dim)]'}`}>
                  {SIGNAL_LABEL[item.signal_type] ?? item.signal_type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
