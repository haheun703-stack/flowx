'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WatchItem } from '../types'

export function WatchlistPanel({ items }: { items: WatchItem[] }) {
  const [filter, setFilter] = useState('')

  const filtered = items.filter(i =>
    i.name.includes(filter) || i.code.includes(filter)
  )

  return (
    <div className="flex flex-col w-72 shrink-0 border-l h-full"
      style={{ background: '#131722', borderColor: '#2a2e39' }}>

      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#2a2e39' }}>
        <span className="text-sm font-semibold" style={{ color: '#d1d4dc' }}>
          관심 종목
        </span>
        <div className="flex gap-2 text-xs" style={{ fontFamily: 'var(--font-terminal)', color: '#434651' }}>
          <span>{items.length}종목</span>
        </div>
      </div>

      {/* 검색 */}
      <div className="px-3 py-2 border-b" style={{ borderColor: '#2a2e39' }}>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="종목명 검색..."
          className="w-full bg-transparent text-sm outline-none"
          style={{
            color: '#d1d4dc',
            fontFamily: 'var(--font-terminal)',
          }}
        />
      </div>

      {/* 종목 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(item => (
          <Link
            key={item.code}
            href={`/chart/${item.code}`}
            className="flex items-center justify-between px-4 py-3 border-b transition-colors hover:brightness-110"
            style={{ borderColor: '#1e2538' }}
          >
            <div>
              <div className="text-sm font-medium" style={{ color: '#d1d4dc' }}>
                {item.name}
              </div>
              <div className="text-xs" style={{ fontFamily: 'var(--font-terminal)', color: '#434651' }}>
                {item.code}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm tabular-nums" style={{ fontFamily: 'var(--font-terminal)', color: '#d1d4dc' }}>
                {item.price.toLocaleString()}
              </div>
              <div className="text-xs font-bold tabular-nums" style={{
                fontFamily: 'var(--font-terminal)',
                color: item.changePercent >= 0 ? '#26a69a' : '#ef5350',
              }}>
                {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
