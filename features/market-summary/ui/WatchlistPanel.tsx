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
    <div className="flex flex-col w-72 shrink-0 border-l border-[#1a2535] h-full bg-[#0a0f18]"
      style={{ fontFamily: 'var(--font-terminal)' }}>

      {/* 터미널 스타일 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]">
        <span className="text-sm font-black tracking-widest uppercase text-[#e2e8f0]">
          관심 종목
        </span>
        <span className="text-xs font-bold text-[#64748b]">{items.length}종목</span>
      </div>

      {/* 검색 */}
      <div className="px-4 py-2.5 border-b border-[#1a2535]">
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="종목명 검색 ..."
          className="w-full bg-transparent text-sm outline-none text-[#e2e8f0] placeholder-[#334155]"
        />
      </div>

      {/* 종목 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(item => (
          <Link
            key={item.code}
            href={`/chart/${item.code}`}
            className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]/50 transition-colors hover:bg-[#0d1420]"
          >
            <div>
              <div className="text-sm font-bold text-[#e2e8f0]">
                {item.name}
              </div>
              <div className="text-xs text-[#334155]">
                {item.code}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold tabular-nums text-[#e2e8f0]">
                {item.price.toLocaleString()}
              </div>
              <div className="text-xs font-bold tabular-nums" style={{
                color: item.changePercent >= 0 ? '#00ff88' : '#ff3b5c',
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
