'use client'

import { useDashboardMarket } from '../api/useDashboard'

export function SidePanel() {
  const { data, isLoading } = useDashboardMarket()

  const regime = data?.kospi_regime ?? 'NEUTRAL'
  const regimeColor =
    regime === 'BULL'    ? 'text-[#00ff88]' :
    regime === 'CAUTION' ? 'text-[#f59e0b]' :
    regime === 'BEAR'    ? 'text-[#ff3b5c]' :
    'text-[#64748b]'

  const slots = data?.kospi_slots ?? 0

  return (
    <div className="w-60 shrink-0 border-r border-[#1a2535] bg-[#0a0f18] flex flex-col text-xs"
      style={{ fontFamily: 'var(--font-terminal)' }}>

      {/* 헤더 */}
      <div className="px-3 py-2 border-b border-[#1a2535]">
        <div className="flex items-center justify-between">
          <span className="text-[#e2e8f0] text-sm font-black uppercase">장세판단</span>
          <span className="text-[10px] text-[#334155]">{data?.generated_at ?? ''}</span>
        </div>
      </div>

      {/* 메인 레짐 — 중앙 크게 */}
      <div className="px-3 py-4 border-b border-[#1a2535] text-center">
        {isLoading ? (
          <div className="h-10 bg-[#1a2535] animate-pulse rounded-sm mx-auto w-20" />
        ) : (
          <>
            <div className={`text-4xl font-black mb-0.5 ${regimeColor}`}>
              {data?.market_stance ?? '—'}
            </div>
            <div className="text-[#334155] text-[10px] tracking-widest font-bold">{regime}</div>
          </>
        )}
      </div>

      {/* 시장별 상태 — 컴팩트 */}
      <div className="border-b border-[#1a2535]">
        {[
          { label: 'KOSPI', value: regime },
          { label: 'US', value: data?.us_grade ?? '—' },
          { label: '매수', value: `${data?.buys ?? 0}건` },
          { label: '매도', value: `${data?.sells ?? 0}건` },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a2535]/30 last:border-b-0">
            <span className="text-[#64748b] text-xs">{row.label}</span>
            <span className={`text-xs font-black ${
              row.value === 'BULL' || row.value === 'BULLISH' ? 'text-[#00ff88]' :
              row.value === 'BEAR' || row.value === 'BEARISH' ? 'text-[#ff3b5c]' :
              row.value === 'CAUTION' || row.value === 'NEUTRAL' ? 'text-[#f59e0b]' :
              'text-[#e2e8f0]'
            }`}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* 매수 슬롯 */}
      <div className="px-3 py-2.5 border-b border-[#1a2535]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[#64748b] text-xs">매수 슬롯</span>
          <span className="text-[#e2e8f0] text-xs font-bold">{slots}/5</span>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex-1 h-3 rounded-sm border ${
              i < slots
                ? 'bg-[#00ff88]/50 border-[#00ff88]/70'
                : 'bg-transparent border-[#1a2535]'
            }`} />
          ))}
        </div>
      </div>

      {/* 릴레이 */}
      <div className="px-3 py-2.5 border-b border-[#1a2535] flex items-center justify-between">
        <span className="text-[#64748b] text-xs">릴레이</span>
        <span className="text-[#0ea5e9] font-black text-sm">
          {data?.relay_fired ?? 0} / {data?.relay_signals ?? 0}
        </span>
      </div>

      <div className="flex-1" />

      {/* 하단 버전 */}
      <div className="px-3 py-2 border-t border-[#1a2535]">
        <div className="text-[#1a2535] text-[9px] tracking-widest">FLOWX TERMINAL v1</div>
      </div>
    </div>
  )
}
