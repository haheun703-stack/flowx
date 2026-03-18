'use client'

import { useDashboardChinaMoney } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const SIGNAL_COLOR: Record<string, string> = {
  SURGE: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  INFLOW: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  SECTOR_FOCUS: 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/30',
  WATCH: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  NORMAL: 'text-[#64748b] bg-[#64748b]/10 border-[#64748b]/30',
}

const COLS = '1fr 60px 44px 48px 48px'

export function ChinaMoneyPanel() {
  const { data, isLoading } = useDashboardChinaMoney()
  const items = data?.signals?.filter(s => s.signal !== 'NORMAL').slice(0, 15) ?? []
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full text-xs ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">외국인 자본 흐름</span>
          {data?.summary && (
            <span className="text-[11px] text-[#8a8a8a] font-bold">
              SURGE {data.summary.SURGE ?? 0} · INFLOW {data.summary.INFLOW ?? 0}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[#00ff88]' : 'text-[#555]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[#8a8a8a] font-bold">{dateStr}</span>
        </div>
      </div>
      <div className="grid px-2 py-1 border-b border-[#2a2a3a] text-[11px] text-[#8a8a8a] font-bold uppercase"
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
            <div key={i} className="h-[32px] mx-2 my-px bg-[#1a2535] animate-pulse rounded-sm" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          items.map((item, i) => (
            <div key={item.ticker} className={`grid px-2 py-1 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] items-center ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <div className="truncate">
                <span className="text-[13px] text-[#e2e8f0] font-medium">{item.name}</span>
                <span className="text-[10px] text-[#555] ml-1">{item.ticker}</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-bold ${SIGNAL_COLOR[item.signal] ?? SIGNAL_COLOR.NORMAL}`}>
                  {item.signal}
                </span>
              </div>
              <span className="text-right text-[13px] text-[#e2e8f0] font-bold tabular-nums">{item.score}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${item.foreign_zscore >= 1.5 ? 'text-[#00ff88]' : 'text-[#64748b]'}`}>
                {item.foreign_zscore.toFixed(1)}
              </span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${item.pct_change_5d >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                {item.pct_change_5d >= 0 ? '+' : ''}{item.pct_change_5d.toFixed(1)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
