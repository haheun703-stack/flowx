'use client'

import { IndexCard } from '../types'

export function IndexCards({ indices }: { indices: IndexCard[] }) {
  if (!indices.length) {
    return (
      <div className="grid grid-cols-3 gap-px border-b border-[var(--border)]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-5 py-4 animate-pulse bg-white">
            <div className="h-3 bg-gray-200 rounded w-16 mb-3" />
            <div className="h-5 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-px border-b border-[var(--border)]">
      {indices.map((idx, i) => (
        <div
          key={i}
          className="px-5 py-4 border-r border-[var(--border)] last:border-r-0 transition-colors cursor-pointer hover:bg-gray-50 bg-white"
          style={{ fontFamily: 'var(--font-terminal)' }}
        >
          <div className="text-xs font-bold tracking-widest uppercase mb-2 text-[var(--text-dim)]">
            {idx.name}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {idx.price.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {idx.currency}
            </span>
          </div>
          <div className="text-sm font-bold mt-1" style={{
            color: idx.changePercent >= 0 ? 'var(--up)' : 'var(--down)',
          }}>
            {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  )
}
