'use client'

import type { UsMarketDaily } from '../types'

interface CardItem {
  label: string
  value: number | null
  change?: number | null
  desc?: string
}

function fmt(val: number | null, decimals = 2): string {
  if (val == null) return '—'
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function ChangeTag({ change }: { change: number | null }) {
  if (change == null) return <span className="text-[var(--text-muted)] text-[11px]">—</span>
  const up = change >= 0
  return (
    <span
      className="text-[11px] font-mono"
      style={{ color: up ? 'var(--up, #dc2626)' : 'var(--down, #2563eb)' }}
    >
      {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
    </span>
  )
}

export function UsIndexCards({ data }: { data: UsMarketDaily }) {
  const cards: CardItem[] = [
    { label: 'S&P 500', value: data.sp500_close, change: data.sp500_change, desc: '미국 대형주 500' },
    { label: 'NASDAQ', value: data.nasdaq_close, change: data.nasdaq_change, desc: '기술주 중심' },
    { label: 'DOW', value: data.dow_close, change: data.dow_change, desc: '다우 존스 30' },
    {
      label: 'VIX', value: data.vix,
      desc: data.vix ? (data.vix >= 30 ? '패닉 구간' : data.vix >= 25 ? '주의 구간' : '안정 구간') : '공포지수',
    },
    { label: 'SOXX', value: data.soxx_close, change: data.soxx_change, desc: '필라델피아 반도체' },
    {
      label: 'DXY', value: data.dxy,
      desc: data.dxy ? (data.dxy >= 104 ? '외인이탈 경고' : data.dxy >= 102 ? '강달러 주의' : '달러 안정') : '달러인덱스',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-[var(--border)] px-4 py-3 space-y-1 shadow-sm">
          <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase">
            {card.label}
          </div>
          <div className="text-[18px] font-mono font-semibold text-[var(--text-primary)]">
            {fmt(card.value)}
          </div>
          <div className="flex items-center justify-between">
            {card.change !== undefined ? (
              <ChangeTag change={card.change} />
            ) : (
              <span className="text-[11px] text-[var(--text-dim)]">{card.desc}</span>
            )}
            {card.change !== undefined && (
              <span className="text-[10px] text-[var(--text-dim)]">{card.desc}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
