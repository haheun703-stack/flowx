'use client'

import Link from 'next/link'
import { SupplyStock } from '../types'

export function SupplyRankPanel({ stocks, type }: {
  stocks: SupplyStock[]
  type: '외인' | '기관'
}) {
  const color = type === '외인' ? '#00ff88' : '#0ea5e9'

  return (
    <div className="flex flex-col bg-[#0a0f18]" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 터미널 스타일 헤더 */}
      <div className="flex items-center px-4 py-3 border-b border-[#1a2535]">
        <div className="w-2 h-2 rounded-full mr-2" style={{ background: color }} />
        <span className="text-sm font-black tracking-widest uppercase text-[#e2e8f0]">
          {type} 순매수 TOP 5
        </span>
      </div>

      {/* 컬럼 헤더 */}
      <div
        className="grid px-4 py-2 text-xs font-bold tracking-wider uppercase border-b border-[#1a2535]/50"
        style={{ gridTemplateColumns: '1fr 80px 60px 72px', color: '#64748b' }}
      >
        <span>종목</span>
        <span className="text-right">현재가</span>
        <span className="text-right">등락</span>
        <span className="text-right">순매수</span>
      </div>

      {stocks.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-[#64748b]">
          데이터 없음
        </div>
      ) : (
        stocks.map(s => (
          <Link
            key={s.code}
            href={`/chart/${s.code}`}
            className="grid items-center px-4 py-3 border-b border-[#1a2535]/50 transition-colors hover:bg-[#0d1420]"
            style={{ gridTemplateColumns: '1fr 80px 60px 72px' }}
          >
            <div>
              <div className="text-sm font-bold text-[#e2e8f0]">{s.name}</div>
              <div className="text-xs text-[#334155]">{s.code}</div>
            </div>
            <div className="text-right text-sm font-bold tabular-nums text-[#e2e8f0]">
              {s.price.toLocaleString()}
            </div>
            <div className="text-right text-sm font-bold tabular-nums" style={{
              color: s.changePercent >= 0 ? '#00ff88' : '#ff3b5c',
            }}>
              {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(1)}%
            </div>
            <div className="text-right text-sm font-black tabular-nums" style={{ color }}>
              +{(type === '외인' ? s.foreignNet : s.instNet).toLocaleString()}억
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
