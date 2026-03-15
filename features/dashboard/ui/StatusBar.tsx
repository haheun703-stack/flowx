'use client'

import { useState, useEffect } from 'react'
import { useDashboardMarket, useMarketSnapshot } from '../api/useDashboard'

function useRealtimeClock() {
  const [now, setNow] = useState('')
  useEffect(() => {
    const fmt = () => {
      const d = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
    setNow(fmt())
    const id = setInterval(() => setNow(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function StatusBar() {
  const { data } = useDashboardMarket()
  const { data: snap } = useMarketSnapshot()
  const clock = useRealtimeClock()

  const regime = data?.kospi_regime ?? 'NEUTRAL'
  const regimeColor = {
    BULL:    'text-[var(--green)] border-[var(--green)]/30 bg-[var(--green)]/5',
    CAUTION: 'text-[var(--yellow)] border-[var(--yellow)]/30 bg-[var(--yellow)]/5',
    BEAR:    'text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/5',
    NEUTRAL: 'text-[var(--text-dim)] border-[var(--text-muted)] bg-transparent',
  }[regime] ?? 'text-[var(--text-dim)]'

  const stance = data?.market_stance ?? '—'
  const stanceColor = {
    '강세': 'text-[#00ff88]',
    '약세': 'text-[#ff3b5c]',
    '관망': 'text-[#f59e0b]',
  }[stance] ?? 'text-[#64748b]'

  return (
    <div className="flex items-center gap-0 border-b border-[#2a2a3a] bg-[#0a0f18] text-sm h-11 leading-none"
      style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 장세 레짐 */}
      <div className={`flex items-center gap-2 px-4 h-full border-r border-[#2a2a3a] ${regimeColor}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        <span className="font-bold tracking-widest">{regime}</span>
      </div>

      {/* 장세 판단 */}
      <div className={`flex items-center gap-2 px-4 h-full border-r border-[#2a2a3a] ${stanceColor}`}>
        <span className="font-bold">{stance}</span>
      </div>

      {/* KOSPI 지수 */}
      {snap && snap.kospi_price > 0 && (
        <div className="flex items-center gap-1.5 px-4 h-full border-r border-[#2a2a3a]">
          <span className="text-[#64748b]">KOSPI</span>
          <span className="text-[#e2e8f0] font-bold tabular-nums">{snap.kospi_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className={`font-bold tabular-nums ${snap.kospi_change >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
            {snap.kospi_change >= 0 ? '+' : ''}{snap.kospi_change.toFixed(2)}%
          </span>
        </div>
      )}

      {/* KOSDAQ 지수 */}
      {snap && snap.kosdaq_price > 0 && (
        <div className="flex items-center gap-1.5 px-4 h-full border-r border-[#2a2a3a]">
          <span className="text-[#64748b]">KOSDAQ</span>
          <span className="text-[#e2e8f0] font-bold tabular-nums">{snap.kosdaq_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className={`font-bold tabular-nums ${snap.kosdaq_change >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
            {snap.kosdaq_change >= 0 ? '+' : ''}{snap.kosdaq_change.toFixed(2)}%
          </span>
        </div>
      )}

      {/* 매수 슬롯 */}
      <div className="flex items-center gap-2 px-4 h-full border-r border-[#2a2a3a]">
        <span className="text-[#64748b]">슬롯</span>
        <span className="text-[#00ff88] font-bold">{data?.kospi_slots ?? 0}</span>
        <span className="text-[#334155]">/ 5</span>
      </div>

      {/* US */}
      <div className="flex items-center gap-2 px-4 h-full border-r border-[#2a2a3a]">
        <span className="text-[#64748b]">US</span>
        <span className={`font-bold ${
          data?.us_grade === 'BULLISH' ? 'text-[#00ff88]' :
          data?.us_grade === 'BEARISH' ? 'text-[#ff3b5c]' :
          'text-[#f59e0b]'
        }`}>{data?.us_grade ?? '—'}</span>
      </div>

      {/* 외국인/기관 */}
      {snap && (snap.foreign_inst.foreign_net !== 0 || snap.foreign_inst.inst_net !== 0) && (
        <div className="flex items-center gap-2 px-4 h-full border-r border-[#2a2a3a]">
          <span className={`font-bold ${snap.foreign_inst.foreign_net >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
            외{snap.foreign_inst.foreign_net >= 0 ? '▲' : '▼'}
          </span>
          <span className={`font-bold ${snap.foreign_inst.inst_net >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
            기{snap.foreign_inst.inst_net >= 0 ? '▲' : '▼'}
          </span>
        </div>
      )}

      <div className="flex-1" />

      {/* 실시간 시계 */}
      <div className="px-4 text-[#94a3b8] text-sm font-bold tracking-wider font-mono">
        {clock}
      </div>

      {/* LIVE 인디케이터 */}
      <div className="flex items-center gap-1.5 px-4 h-full border-l border-[#2a2a3a]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping opacity-75" />
        <span className="text-[#00ff88] text-xs tracking-widest font-bold">LIVE</span>
      </div>
    </div>
  )
}
