'use client'

import { useDashboardSector } from '../api/useDashboard'

export function SectorMomentumTable() {
  const { data, isLoading } = useDashboardSector()

  const sectors = data?.sectors?.slice(0, 12) ?? []

  return (
    <div className="flex flex-col h-full bg-[#0a0f18]"
      style={{ fontFamily: 'var(--font-terminal)' }}>

      {/* 패널 헤더 */}
      <div className="grid items-center px-4 py-3 border-b border-[#1a2535]"
        style={{ gridTemplateColumns: '28px 1fr 56px 72px 72px 72px 48px 56px' }}>
        <div className="flex items-center gap-2 col-span-2">
          <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
          <span className="text-xl font-black text-[#e2e8f0] tracking-widest uppercase">섹터 모멘텀</span>
        </div>
        <span className="text-[#64748b] text-sm font-bold text-center col-span-6">TOP {sectors.length}</span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid text-sm text-[#64748b] font-bold tracking-widest uppercase border-b border-[#1a2535] px-4 py-2"
        style={{ gridTemplateColumns: '28px 1fr 56px 72px 72px 72px 48px 56px' }}>
        <span className="text-center">#</span>
        <span className="text-left">섹터</span>
        <span className="text-right">점수</span>
        <span className="text-right">5일</span>
        <span className="text-right">20일</span>
        <span className="text-right">60일</span>
        <span className="text-right">RSI</span>
        <span className="text-right">순위</span>
      </div>

      {/* 섹터 행 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 border-b border-[#1a2535]/50 animate-pulse bg-[#0d1420]/30" />
          ))
        ) : (
          sectors.map(s => (
            <div
              key={s.etf_code}
              className="grid items-center px-4 py-2 border-b border-[#1a2535]/50 hover:bg-[#0d1420] transition-colors text-xs cursor-pointer group"
              style={{ gridTemplateColumns: '28px 1fr 56px 72px 72px 72px 48px 56px' }}
            >
              <span className="text-center text-[#64748b] tabular-nums">{s.rank}</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[#e2e8f0] font-medium group-hover:text-white truncate">{s.sector}</span>
                {s.acceleration && (
                  <span className="text-[9px] text-[#00ff88] border border-[#00ff88]/20 px-1 rounded-sm">가속</span>
                )}
                {s.category === 'theme' && (
                  <span className="text-[9px] text-[#334155]">테마</span>
                )}
              </div>
              <span className="text-right text-[#ff3b5c] font-bold tabular-nums">
                {s.momentum_score.toFixed(0)}
              </span>
              <span className={`text-right font-bold tabular-nums ${
                s.ret_5 >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'
              }`}>
                {s.ret_5 >= 0 ? '+' : ''}{s.ret_5.toFixed(1)}%
              </span>
              <span className={`text-right tabular-nums ${
                s.ret_20 >= 0 ? 'text-[#ff3b5c]/80' : 'text-[#0ea5e9]/80'
              }`}>
                {s.ret_20 >= 0 ? '+' : ''}{s.ret_20.toFixed(1)}%
              </span>
              <span className="text-right tabular-nums text-[#64748b]">
                {s.ret_60 >= 0 ? '+' : ''}{s.ret_60.toFixed(1)}%
              </span>
              <span className={`text-right tabular-nums ${
                s.rsi_14 >= 70 ? 'text-[#ff3b5c]' :
                s.rsi_14 <= 30 ? 'text-[#00ff88]' :
                'text-[#64748b]'
              }`}>
                {s.rsi_14.toFixed(0)}
              </span>
              <div className="flex items-center justify-end gap-1">
                {s.rank_change > 0 ? (
                  <span className="text-[#ff3b5c]">▲{s.rank_change}</span>
                ) : s.rank_change < 0 ? (
                  <span className="text-[#0ea5e9]">▼{Math.abs(s.rank_change)}</span>
                ) : (
                  <span className="text-[#334155]">—</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
