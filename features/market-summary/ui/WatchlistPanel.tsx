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
    <div className="flex flex-col w-72 shrink-0 border-l border-[var(--border)] h-full bg-white"
      style={{ fontFamily: 'var(--font-terminal)' }}>

      {/* 터미널 스타일 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-black tracking-widest uppercase text-[var(--text-primary)]">
          관심 종목
        </span>
        <span className="text-xs font-bold text-[var(--text-dim)]">{items.length}종목</span>
      </div>

      {/* 검색 */}
      <div className="px-4 py-2.5 border-b border-[var(--border)]">
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="종목명 검색 ..."
          className="w-full bg-transparent text-sm outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
        />
      </div>

      {/* 종목 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(item => (
          <Link
            key={item.code}
            href={`/chart/${item.code}`}
            className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]/50 transition-colors hover:bg-gray-50"
          >
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {item.name}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {item.code}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold tabular-nums text-[var(--text-primary)]">
                {item.price.toLocaleString()}
              </div>
              <div className="text-xs font-bold tabular-nums" style={{
                color: item.changePercent >= 0 ? 'var(--up)' : 'var(--down)',
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
