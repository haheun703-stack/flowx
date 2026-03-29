'use client'

import { useDashboardEtf } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const GRADE_COLOR: Record<string, string> = {
  '적극매수': 'text-[var(--green)] bg-[var(--green)]/10 border-[var(--green)]/30',
  '매수': 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  '관망': 'text-[var(--yellow)] bg-[var(--yellow)]/10 border-[var(--yellow)]/30',
  '매도': 'text-[var(--up)] bg-[var(--up)]/10 border-[var(--up)]/30',
  '적극매도': 'text-rose-700 bg-rose-500/10 border-rose-500/30',
}

const COLS = '1fr 60px 48px 48px 48px 40px'

export function EtfSignalPanel() {
  const { data, isLoading } = useDashboardEtf()
  const items = data?.etfs?.slice(0, 15) ?? []
  const dateStr = data?.updated_at ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full text-xs bg-white ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">ETF 시그널</span>
          <span className="text-[11px] text-[var(--text-dim)] font-bold">{data?.etf_count ?? 0}종목</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[var(--text-dim)] font-bold">{dateStr}</span>
        </div>
      </div>
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[11px] text-[var(--text-dim)] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>ETF</span>
        <span className="text-center">시그널</span>
        <span className="text-right">점수</span>
        <span className="text-right">1일%</span>
        <span className="text-right">5일%</span>
        <span className="text-right">RSI</span>
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
            <div key={item.etf_code} className={`grid px-2 py-1 border-b border-[var(--border)]/30 hover:bg-gray-50 items-center ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <div className="truncate">
                <span className="text-[13px] text-[var(--text-primary)] font-medium">{item.sector}</span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">{item.etf_name}</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] px-1 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[item.grade] ?? 'text-[var(--text-dim)]'}`}>
                  {item.grade}
                </span>
              </div>
              <span className="text-right text-[13px] text-[var(--text-primary)] font-bold tabular-nums">{item.score.toFixed(0)}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${item.ret_1 >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                {item.ret_1 >= 0 ? '+' : ''}{item.ret_1.toFixed(1)}
              </span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${item.ret_5 >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                {item.ret_5 >= 0 ? '+' : ''}{item.ret_5.toFixed(1)}
              </span>
              <span className={`text-right text-[13px] tabular-nums ${
                item.rsi >= 70 ? 'text-[var(--up)]' : item.rsi <= 30 ? 'text-[var(--down)]' : 'text-[var(--text-dim)]'
              }`}>{item.rsi.toFixed(0)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
