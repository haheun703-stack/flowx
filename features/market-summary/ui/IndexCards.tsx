'use client'

import { IndexCard } from '../types'

export function IndexCards({ indices }: { indices: IndexCard[] }) {
  if (!indices.length) {
    return (
      <div className="grid grid-cols-3 gap-px border-b border-[#1a2535]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-5 py-4 animate-pulse bg-[#0a0f18]">
            <div className="h-3 bg-[#1a2535] rounded w-16 mb-3" />
            <div className="h-5 bg-[#1a2535] rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-px border-b border-[#1a2535]">
      {indices.map((idx, i) => (
        <div
          key={i}
          className="px-5 py-4 border-r border-[#1a2535] last:border-r-0 transition-colors cursor-pointer hover:bg-[#0d1420]"
          style={{ background: '#0a0f18', fontFamily: 'var(--font-terminal)' }}
        >
          <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#64748b' }}>
            {idx.name}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold" style={{ color: '#e2e8f0' }}>
              {idx.price.toLocaleString()}
            </span>
            <span className="text-xs" style={{ color: '#334155' }}>
              {idx.currency}
            </span>
          </div>
          <div className="text-sm font-bold mt-1" style={{
            color: idx.changePercent >= 0 ? '#00ff88' : '#ff3b5c',
          }}>
            {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  )
}
