'use client'

import { useDashboardMarket, useMarketSnapshot } from '../api/useDashboard'

export function SidePanel() {
  const { data, isLoading } = useDashboardMarket()
  const { data: snap } = useMarketSnapshot()

  const regime = data?.kospi_regime ?? 'NEUTRAL'
  const regimeColor =
    regime === 'BULL'    ? 'text-[#00ff88]' :
    regime === 'CAUTION' ? 'text-[#f59e0b]' :
    regime === 'BEAR'    ? 'text-[#ff3b5c]' :
    'text-[#64748b]'

  const slots = data?.kospi_slots ?? 0

  return (
    <div className="w-56 shrink-0 border-r border-[#2a2a3a] bg-[#0a0f18] flex flex-col text-xs"
      style={{ fontFamily: 'var(--font-terminal)' }}>

      {/* 헤더 */}
      <div className="px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">장세판단</span>
          <span className="text-[10px] text-[#555]">{data?.generated_at ?? ''}</span>
        </div>
      </div>

      {/* 메인 레짐 */}
      <div className="px-3 py-3 border-b border-[#2a2a3a] text-center">
        {isLoading ? (
          <div className="h-8 bg-[#1a2535] animate-pulse rounded-sm mx-auto w-16" />
        ) : (
          <>
            <div className={`text-3xl font-black ${regimeColor}`}>
              {data?.market_stance ?? '—'}
            </div>
            <div className="text-[10px] text-[#555] tracking-widest font-bold">{regime}</div>
          </>
        )}
      </div>

      {/* 시장별 상태 */}
      <div className="border-b border-[#2a2a3a]">
        {[
          { label: 'KOSPI', value: regime },
          { label: 'US', value: data?.us_grade ?? '—' },
          { label: '매수', value: `${data?.buys ?? 0}건` },
          { label: '매도', value: `${data?.sells ?? 0}건` },
        ].map((row, i) => (
          <div key={row.label} className={`flex items-center justify-between px-3 py-1 border-b border-[#2a2a3a]/30 last:border-b-0 ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}>
            <span className="text-[11px] text-[#8a8a8a]">{row.label}</span>
            <span className={`text-[13px] font-bold tabular-nums ${
              row.value === 'BULL' || row.value === 'BULLISH' ? 'text-[#00ff88]' :
              row.value === 'BEAR' || row.value === 'BEARISH' ? 'text-[#ff3b5c]' :
              row.value === 'CAUTION' || row.value === 'NEUTRAL' ? 'text-[#f59e0b]' :
              'text-[#e2e8f0]'
            }`}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* 매수 슬롯 */}
      <div className="px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-[#8a8a8a]">매수 슬롯</span>
          <span className="text-[13px] text-[#e2e8f0] font-bold tabular-nums">{slots}/5</span>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex-1 h-2.5 rounded-sm border ${
              i < slots
                ? 'bg-[#00ff88]/50 border-[#00ff88]/70'
                : 'bg-transparent border-[#2a2a3a]'
            }`} />
          ))}
        </div>
      </div>

      {/* 릴레이 */}
      <div className="px-3 py-2 border-b border-[#2a2a3a] flex items-center justify-between">
        <span className="text-[11px] text-[#8a8a8a]">릴레이</span>
        <span className="text-[13px] text-[#0ea5e9] font-bold tabular-nums">
          {data?.relay_fired ?? 0} / {data?.relay_signals ?? 0}
        </span>
      </div>

      {/* 투자자 동향 */}
      {snap && (snap.foreign_inst.foreign_net !== 0 || snap.foreign_inst.inst_net !== 0) && (
        <div className="border-b border-[#2a2a3a]">
          <div className="px-3 py-1.5 border-b border-[#2a2a3a]/30">
            <span className="text-[10px] text-[#555] tracking-widest font-bold uppercase">투자자 동향</span>
          </div>
          {[
            { label: '외국인', value: snap.foreign_inst.foreign_net },
            { label: '기관', value: snap.foreign_inst.inst_net },
            { label: '개인', value: snap.foreign_inst.individual_net },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-3 py-1">
              <span className="text-[11px] text-[#8a8a8a]">{row.label}</span>
              <span className={`text-[12px] font-bold tabular-nums ${row.value >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                {row.value >= 0 ? '+' : ''}{(row.value / 1e8).toFixed(0)}억
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 주요종목 */}
      {snap && snap.stocks.length > 0 && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-3 py-1.5 border-b border-[#2a2a3a]/30 sticky top-0 bg-[#0a0f18]">
            <span className="text-[10px] text-[#555] tracking-widest font-bold uppercase">주요종목</span>
          </div>
          {snap.stocks.map((s, i) => (
            <div key={s.code} className={`flex items-center justify-between px-3 py-1 ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}>
              <span className="text-[11px] text-[#c8d0da] truncate mr-1">{s.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#e2e8f0] font-bold tabular-nums">
                  {s.price.toLocaleString()}
                </span>
                <span className={`text-[10px] font-bold tabular-nums ${s.changePercent >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                  {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!snap?.stocks.length && <div className="flex-1" />}

      <div className="px-3 py-1.5 border-t border-[#2a2a3a]">
        <div className="text-[#2a2a3a] text-[9px] tracking-widest">FLOWX TERMINAL v1</div>
      </div>
    </div>
  )
}
