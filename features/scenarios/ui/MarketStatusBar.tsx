'use client'

import type { MarketStatus } from '../types'

const VERDICT_STYLE: Record<string, { color: string; bg: string }> = {
  '적극매수': { color: 'text-[var(--green)]', bg: 'bg-green-50' },
  '매수': { color: 'text-[var(--green)]', bg: 'bg-green-50' },
  '관망': { color: 'text-[var(--yellow)]', bg: 'bg-yellow-50' },
  '매도': { color: 'text-[var(--up)]', bg: 'bg-red-50' },
}

export default function MarketStatusBar({ status }: { status: MarketStatus }) {
  const vs = VERDICT_STYLE[status.verdict] ?? { color: 'text-[var(--text-dim)]', bg: 'bg-gray-50' }

  const cards = [
    { label: '시장 판단', value: status.verdict, sub: `레짐: ${status.regime}`, color: vs.color, bg: vs.bg },
    { label: 'KOSPI', value: (Number(status.kospi) || 0).toLocaleString(), sub: `${(Number(status.kospi_chg) || 0) >= 0 ? '+' : ''}${(Number(status.kospi_chg) || 0).toFixed(2)}%`, color: (Number(status.kospi_chg) || 0) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]', bg: 'bg-gray-50' },
    { label: 'VIX', value: (Number(status.vix) || 0).toFixed(1), sub: (Number(status.vix) || 0) >= 25 ? '공포' : (Number(status.vix) || 0) >= 20 ? '경계' : '안정', color: (Number(status.vix) || 0) >= 25 ? 'text-[var(--up)]' : (Number(status.vix) || 0) >= 20 ? 'text-[var(--yellow)]' : 'text-[var(--green)]', bg: 'bg-gray-50' },
    { label: '현금 비중', value: `${Number(status.cash_pct) || 0}%`, sub: `SHIELD: ${status.shield_status ?? 'N/A'}`, color: (Number(status.cash_pct) || 0) >= 50 ? 'text-[var(--yellow)]' : 'text-[var(--text-primary)]', bg: 'bg-gray-50' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`${c.bg} rounded-lg p-3 border border-[var(--border)]`}>
          <p className="text-[var(--text-muted)] text-xs mb-1">{c.label}</p>
          <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          <p className="text-[var(--text-muted)] text-xs mt-0.5">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
