'use client'

import type { UsMarketDaily } from '../types'
import { MAG7_LABELS } from '../types'

const MAG7_ORDER = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA']

export function UsMag7Panel({ data }: { data: UsMarketDaily }) {
  const mag7 = data.mag7
  if (!mag7) return null

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 shadow-sm">
      <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-3">
        Magnificent 7
      </div>
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {MAG7_ORDER.map((ticker) => {
          const stock = mag7[ticker]
          if (!stock) return null
          const info = MAG7_LABELS[ticker] ?? { name: ticker, icon: '' }
          const chg = stock.change
          const color = chg >= 0 ? '#dc2626' : '#2563eb'

          return (
            <div
              key={ticker}
              className="rounded-lg px-3 py-2.5 text-center border border-[var(--border)] transition-all hover:scale-[1.02] cursor-default"
              style={{
                background: chg >= 0
                  ? `rgba(220,38,38,${Math.min(Math.abs(chg) * 0.04, 0.18)})`
                  : `rgba(37,99,235,${Math.min(Math.abs(chg) * 0.04, 0.18)})`,
              }}
            >
              <div className="text-[14px] mb-0.5">{info.icon}</div>
              <div className="text-[10px] font-mono text-[var(--text-muted)]">{ticker}</div>
              <div className="text-[11px] font-semibold text-[var(--text-primary)] truncate">{info.name}</div>
              <div className="text-[12px] font-mono font-bold mt-0.5" style={{ color }}>
                {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
              </div>
              <div className="text-[10px] font-mono text-[var(--text-dim)] mt-0.5">
                ${stock.close.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
