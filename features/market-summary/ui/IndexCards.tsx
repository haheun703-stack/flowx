'use client'

import { IndexCard } from '../types'

export function IndexCards({ indices }: { indices: IndexCard[] }) {
  if (!indices.length) {
    return (
      <div className="grid grid-cols-3 gap-px border-b" style={{ borderColor: '#2a2e39' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3 animate-pulse" style={{ background: '#1c2030' }}>
            <div className="h-3 bg-[#2a2e39] rounded w-16 mb-2" />
            <div className="h-4 bg-[#2a2e39] rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-px border-b" style={{ borderColor: '#2a2e39' }}>
      {indices.map((idx, i) => (
        <div
          key={i}
          className="px-4 py-3 border-r last:border-r-0 transition-colors cursor-pointer hover:brightness-110"
          style={{ borderColor: '#2a2e39', background: '#1c2030', fontFamily: 'var(--font-terminal)' }}
        >
          <div className="text-xs mb-1" style={{ color: '#434651' }}>
            {idx.name}
          </div>
          <div className="text-sm font-bold" style={{ color: '#d1d4dc' }}>
            {idx.price.toLocaleString()}
            <span className="text-xs ml-1 font-normal" style={{ color: '#434651' }}>
              {idx.currency}
            </span>
          </div>
          <div className="text-sm font-bold" style={{
            color: idx.changePercent >= 0 ? '#26a69a' : '#ef5350',
          }}>
            {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  )
}
