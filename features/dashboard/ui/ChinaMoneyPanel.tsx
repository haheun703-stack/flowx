'use client'

import { useDashboardChinaMoney } from '../api/useDashboard'

const SIGNAL_COLOR: Record<string, string> = {
  SURGE: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  INFLOW: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  SECTOR_FOCUS: 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/30',
  WATCH: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  NORMAL: 'text-[#64748b] bg-[#64748b]/10 border-[#64748b]/30',
}

const COLS = '1fr 72px 56px 56px 56px'

export function ChinaMoneyPanel() {
  const { data, isLoading } = useDashboardChinaMoney()

  const items = data?.signals?.filter(s => s.signal !== 'NORMAL').slice(0, 15) ?? []

  return (
    <div className="flex flex-col h-full text-xs" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          <span className="text-[#e2e8f0] text-sm font-black tracking-widest uppercase">외국인 자금 흐름</span>
          {data?.summary && (
            <span className="text-sm text-[#64748b] font-bold">
              SURGE {data.summary.SURGE ?? 0} · INFLOW {data.summary.INFLOW ?? 0}
            </span>
          )}
        </div>
        <span className="text-sm text-[#64748b] font-bold">{data?.date ?? ''}</span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/50 text-xs text-[#64748b] font-bold"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-left">종목</span>
        <span className="text-center">시그널</span>
        <span className="text-right">점수</span>
        <span className="text-right">Z-score</span>
        <span className="text-right">5일%</span>
      </div>

      {/* 데이터 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 mx-3 my-1 bg-[#1a2535] animate-pulse rounded-sm" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          items.map(item => (
            <div key={item.ticker} className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/30 hover:bg-[#0d1420] items-center"
              style={{ gridTemplateColumns: COLS }}>
              <div className="truncate">
                <span className="text-[#e2e8f0] text-sm font-bold">{item.name}</span>
                <span className="text-[#334155] ml-1">{item.ticker}</span>
              </div>
              <div className="text-center">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border font-bold ${SIGNAL_COLOR[item.signal] ?? SIGNAL_COLOR.NORMAL}`}>
                  {item.signal}
                </span>
              </div>
              <span className="text-right text-[#e2e8f0] font-bold">{item.score}</span>
              <span className={`text-right font-bold ${item.foreign_zscore >= 1.5 ? 'text-[#00ff88]' : 'text-[#64748b]'}`}>
                {item.foreign_zscore.toFixed(1)}
              </span>
              <span className={`text-right font-bold ${item.pct_change_5d >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                {item.pct_change_5d >= 0 ? '+' : ''}{item.pct_change_5d.toFixed(1)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
