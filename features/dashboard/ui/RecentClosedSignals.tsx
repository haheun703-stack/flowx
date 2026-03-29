'use client'

import { useSignals } from '../api/useDashboard'

export function RecentClosedSignals() {
  const { data, isLoading } = useSignals(undefined, 'CLOSED')
  const signals = data?.signals?.slice(0, 10) ?? []

  return (
    <div className="border-b border-[var(--border)] bg-white">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[var(--text-dim)] tracking-wider uppercase">Recent Closed</span>
          <span className="text-[10px] text-[var(--text-muted)]">{signals.length}건</span>
        </div>

        {isLoading ? (
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[36px] flex-1 bg-gray-100 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : signals.length === 0 ? (
          <div className="text-[11px] text-[var(--text-muted)] py-1">청산 시그널 없음</div>
        ) : (
          <div className="flex gap-1 overflow-x-auto pb-1">
            {signals.map((s) => {
              const isPositive = s.return_pct >= 0
              return (
                <div key={s.id} className="shrink-0 bg-gray-50 rounded px-2 py-1.5 border border-[var(--border)] min-w-[120px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[var(--text-primary)] font-medium truncate">{s.ticker_name}</span>
                    <span className={`text-[11px] font-bold tabular-nums shrink-0 ${isPositive ? 'text-[var(--green)]' : 'text-[var(--up)]'}`}>
                      {isPositive ? '+' : ''}{s.return_pct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-[var(--text-muted)]">
                      {s.entry_price?.toLocaleString()} → {s.current_price?.toLocaleString()}
                    </span>
                  </div>
                  {s.close_date && (
                    <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{s.close_date}</div>
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
