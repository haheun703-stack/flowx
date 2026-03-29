'use client'

import { useHeatmap } from '../api/useDashboard'

const COLS = '24px 1fr 44px 52px 52px 52px 36px 56px'

export function SectorMomentumTable() {
  const { data, isLoading } = useHeatmap()
  const sectors = data?.slice(0, 12) ?? []

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">섹터 모멘텀</span>
        </div>
        <span className="text-[11px] text-[var(--text-dim)] font-bold">TOP {sectors.length}</span>
      </div>
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[11px] text-[var(--text-dim)] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">#</span>
        <span>섹터</span>
        <span className="text-right">점수</span>
        <span className="text-right">5일</span>
        <span className="text-right">20일</span>
        <span className="text-right">60일</span>
        <span className="text-right">RSI</span>
        <span className="text-right">수급</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[32px] border-b border-[var(--border)]/30 animate-pulse bg-gray-50/50" />
          ))
        ) : sectors.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">데이터 없음</div>
        ) : (
          sectors.map((s, i) => (
            <div key={s.sector}
              className={`grid items-center px-2 py-1 border-b border-[var(--border)]/30 hover:bg-gray-50 transition-colors text-xs cursor-pointer ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <span className="text-center text-[13px] text-[var(--text-dim)] tabular-nums">{i + 1}</span>
              <span className="text-[13px] text-[var(--text-primary)] font-medium truncate">{s.sector}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${
                s.score >= 70 ? 'text-[var(--up)]' : s.score >= 50 ? 'text-[var(--yellow)]' : 'text-[var(--down)]'
              }`}>{s.score}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${
                s.change_5d >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
              }`}>{s.change_5d >= 0 ? '+' : ''}{s.change_5d.toFixed(1)}</span>
              <span className={`text-right text-[13px] tabular-nums ${
                s.change_20d >= 0 ? 'text-[var(--up)]/80' : 'text-[var(--down)]/80'
              }`}>{s.change_20d >= 0 ? '+' : ''}{s.change_20d.toFixed(1)}</span>
              <span className="text-right text-[13px] tabular-nums text-[var(--text-dim)]">
                {s.change_60d >= 0 ? '+' : ''}{s.change_60d.toFixed(1)}
              </span>
              <span className={`text-right text-[13px] tabular-nums ${
                s.rsi >= 70 ? 'text-[var(--up)]' : s.rsi <= 30 ? 'text-[var(--green)]' : 'text-[var(--text-dim)]'
              }`}>{s.rsi}</span>
              <div className="flex items-center justify-end gap-1 text-[10px]">
                <span className={s.foreign_flow > 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>
                  외{s.foreign_flow > 0 ? '▲' : '▼'}
                </span>
                <span className={s.inst_flow > 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>
                  기{s.inst_flow > 0 ? '▲' : '▼'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
