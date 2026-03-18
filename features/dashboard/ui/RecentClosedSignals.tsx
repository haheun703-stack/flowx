'use client'

import { useSignals } from '../api/useDashboard'

export function RecentClosedSignals() {
  const { data, isLoading } = useSignals(undefined, 'CLOSED')
  const signals = data?.signals?.slice(0, 10) ?? []

  return (
    <div className="border-b border-[#2a2a3a]" style={{ background: '#0d1117' }}>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase">Recent Closed</span>
          <span className="text-[10px] text-[#555]">{signals.length}건</span>
        </div>

        {isLoading ? (
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[36px] flex-1 bg-[#1a2535] animate-pulse rounded-sm" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div className="text-[11px] text-[#334155] py-1">청산 시그널 없음</div>
        ) : (
          <div className="flex gap-1 overflow-x-auto pb-1">
            {signals.map((s) => {
              const isPositive = s.return_pct >= 0
              return (
                <div key={s.id} className="shrink-0 bg-[#0a0f18] rounded px-2 py-1.5 border border-[#1a2535] min-w-[120px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#cbd5e1] font-medium truncate">{s.ticker_name}</span>
                    <span className={`text-[11px] font-bold tabular-nums shrink-0 ${isPositive ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}>
                      {isPositive ? '+' : ''}{s.return_pct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-[#555]">
                      {s.entry_price?.toLocaleString()} → {s.current_price?.toLocaleString()}
                    </span>
                  </div>
                  {s.close_date && (
                    <div className="text-[9px] text-[#444] mt-0.5">{s.close_date}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
