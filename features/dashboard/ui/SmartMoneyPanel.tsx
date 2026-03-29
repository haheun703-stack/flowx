'use client'

import Link from 'next/link'
import { useShortSignals } from '../api/useDashboard'

export function SmartMoneyPanel() {
  const { data, isLoading } = useShortSignals('force')
  const stocks = data?.slice(0, 12) ?? []
  const COLS = '1fr 64px 44px 44px'

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--yellow)] animate-pulse" />
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">세력 포착</span>
        </div>
        <span className="text-[11px] text-[var(--text-dim)] font-bold">포착 <span className="text-[var(--yellow)]">{stocks.length}</span></span>
      </div>
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[11px] text-[var(--text-dim)] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>종목</span>
        <span className="text-right">진입가</span>
        <span className="text-center">등급</span>
        <span className="text-right">배수</span>
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
              <div>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    stock.volume_ratio >= 2 ? 'bg-[var(--up)]' :
                    stock.volume_ratio >= 1.5 ? 'bg-[var(--yellow)]' : 'bg-[var(--text-dim)]'
                  }`} />
                  <span className="text-[13px] text-[var(--text-primary)] font-medium">{stock.name}</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] ml-3">{stock.code}</div>
              </div>
              <span className="text-right text-[13px] text-[var(--text-primary)] tabular-nums">{stock.entry_price?.toLocaleString()}</span>
              <span className={`text-center text-[13px] font-bold ${
                stock.grade === 'AA' ? 'text-[var(--green)]' :
                stock.grade === 'A' ? 'text-emerald-600' : 'text-[var(--text-dim)]'
              }`}>{stock.grade}</span>
              <span className="text-right text-[13px] text-[var(--yellow)] font-bold tabular-nums">x{stock.volume_ratio?.toFixed(1)}</span>
            </Link>
          ))
        )}
      </div>
      <div className="flex gap-3 px-3 py-1.5 border-t border-[var(--border)] text-[11px] font-bold text-[var(--text-dim)]">
        <span>x2.0+ <span className="text-[var(--up)]">{stocks.filter(s => s.volume_ratio >= 2).length}</span></span>
        <span>x1.5+ <span className="text-[var(--yellow)]">{stocks.filter(s => s.volume_ratio >= 1.5 && s.volume_ratio < 2).length}</span></span>
      </div>
    </div>
  )
}
