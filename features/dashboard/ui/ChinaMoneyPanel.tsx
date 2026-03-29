'use client'

import { useDashboardChinaMoney } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const SIGNAL_COLOR: Record<string, string> = {
  SURGE: 'text-[var(--up)] bg-[var(--up)]/10 border-[var(--up)]/30',
  INFLOW: 'text-[var(--green)] bg-[var(--green)]/10 border-[var(--green)]/30',
  SECTOR_FOCUS: 'text-[var(--blue)] bg-[var(--blue)]/10 border-[var(--blue)]/30',
  WATCH: 'text-[var(--yellow)] bg-[var(--yellow)]/10 border-[var(--yellow)]/30',
  NORMAL: 'text-[var(--text-dim)] bg-gray-100 border-[var(--border)]',
}

const COLS = '1fr 60px 44px 48px 48px'

export function ChinaMoneyPanel() {
  const { data, isLoading } = useDashboardChinaMoney()
  const items = data?.signals?.filter(s => s.signal !== 'NORMAL').slice(0, 15) ?? []
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full text-xs bg-white ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">외국인 자본 흐름</span>
          {data?.summary && (
            <span className="text-[11px] text-[var(--text-dim)] font-bold">
              SURGE {data.summary.SURGE ?? 0} · INFLOW {data.summary.INFLOW ?? 0}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[var(--text-dim)] font-bold">{dateStr}</span>
        </div>
      </div>
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[11px] text-[var(--text-dim)] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>종목</span>
        <span className="text-center">시그널</span>
        <span className="text-right">점수</span>
        <span className="text-right">Z값</span>
        <span className="text-right">5일%</span>
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
            <div key={item.ticker} className={`grid px-2 py-1 border-b border-[var(--border)]/30 hover:bg-gray-50 items-center ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <div className="truncate">
                <span className="text-[13px] text-[var(--text-primary)] font-medium">{item.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">{item.ticker}</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-bold ${SIGNAL_COLOR[item.signal] ?? SIGNAL_COLOR.NORMAL}`}>
                  {item.signal}
                </span>
              </div>
              <span className="text-right text-[13px] text-[var(--text-primary)] font-bold tabular-nums">{item.score}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${item.foreign_zscore >= 1.5 ? 'text-[var(--green)]' : 'text-[var(--text-dim)]'}`}>
                {item.foreign_zscore.toFixed(1)}
              </span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${item.pct_change_5d >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                {item.pct_change_5d >= 0 ? '+' : ''}{item.pct_change_5d.toFixed(1)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
