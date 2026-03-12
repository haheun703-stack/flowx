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
      <div className="px-4 py-3 border-b border-[#1a2535] flex items-center justify-between">
        <span className="text-[#e2e8f0] text-sm font-black tracking-widest uppercase">장세 판단</span>
        <span className="text-[#64748b] font-bold">기준 {data?.generated_at ?? ''}</span>
      </div>

      {/* 메인 레짐 */}
      <div className="px-4 py-6 border-b border-[#1a2535] text-center">
        {isLoading ? (
          <div className="h-10 bg-[#1a2535] animate-pulse rounded-sm mx-auto w-20" />
        ) : (
          <>
            <div className={`text-3xl font-black tracking-widest mb-1 ${regimeColor}`}>
              {data?.market_stance ?? '—'}
            </div>
            <div className="text-[#334155] text-[10px] tracking-widest">{regime}</div>
          </>
        )}
      </div>

      {/* 시장별 상태 */}
      <div className="border-b border-[#1a2535]">
        {[
          { label: 'KOSPI', value: regime },
          { label: 'US', value: data?.us_grade ?? '—' },
          { label: '매수', value: `${data?.buys ?? 0}건` },
          { label: '매도', value: `${data?.sells ?? 0}건` },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a2535]/50 hover:bg-[#0d1420]">
            <span className="text-[#e2e8f0] text-sm font-bold">{row.label}</span>
            <span className={`text-sm font-black ${
              row.value === 'BULL' || row.value === 'BULLISH' ? 'text-[#00ff88]' :
              row.value === 'BEAR' || row.value === 'BEARISH' ? 'text-[#ff3b5c]' :
              row.value === 'CAUTION' || row.value === 'NEUTRAL' ? 'text-[#f59e0b]' :
              'text-[#e2e8f0]'
            }`}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* 매수 슬롯 시각화 */}
      <div className="px-4 py-4 border-b border-[#1a2535]">
        <div className="text-[#e2e8f0] text-sm font-bold tracking-widest mb-2">매수 슬롯</div>
        <div className="flex gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex-1 h-5 rounded-sm border ${
              i < slots
                ? 'bg-[#00ff88]/50 border-[#00ff88]/70'
                : 'bg-transparent border-[#1a2535]'
            }`} />
          ))}
        </div>
        <div className="text-right mt-1 text-[#e2e8f0] text-sm font-bold">{slots} / 5</div>
      </div>

      {/* 릴레이 */}
      <div className="px-4 py-4 border-b border-[#1a2535]">
        <div className="text-[#e2e8f0] text-sm font-bold tracking-widest mb-2">릴레이</div>
        <div className="text-[#0ea5e9] font-black text-base">
          {data?.relay_fired ?? 0} / {data?.relay_signals ?? 0}
        </div>
      </div>

      <div className="flex-1" />

      {/* 하단 버전 */}
      <div className="px-4 py-3 border-t border-[#1a2535]">
        <div className="text-[#1a2535] text-[10px] tracking-widest">FLOWX TERMINAL v1</div>
      </div>
    </div>
  )
}
