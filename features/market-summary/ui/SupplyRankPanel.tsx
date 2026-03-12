'use client'

import Link from 'next/link'
import { SupplyStock } from '../types'

export function SupplyRankPanel({ stocks, type }: {
  stocks: SupplyStock[]
  type: '외인' | '기관'
}) {
  const color = type === '외인' ? '#00ff88' : '#42a5f5'

  return (
    <div className="flex flex-col" style={{ background: '#1c2030' }}>
      <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: '#2a2e39' }}>
        <div className="w-2 h-2 rounded-full mr-2" style={{ background: color }} />
        <span className="text-sm font-semibold" style={{ color: '#d1d4dc' }}>
          {type} 순매수 TOP 5
        </span>
      </div>

      {/* 컬럼 헤더 */}
      <div
        className="grid px-4 py-1.5 text-xs border-b"
        style={{
          gridTemplateColumns: '1fr 72px 56px 64px',
          borderColor: '#2a2e39',
          color: '#434651',
          fontFamily: 'var(--font-terminal)',
        }}
      >
        <span>종목</span>
        <span className="text-right">현재가</span>
        <span className="text-right">등락</span>
        <span className="text-right">순매수</span>
      </div>

      {stocks.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm" style={{ color: '#434651' }}>
          데이터 없음
        </div>
      ) : (
        stocks.map(s => (
          <Link
            key={s.code}
            href={`/chart/${s.code}`}
            className="grid items-center px-4 py-2.5 border-b transition-colors hover:brightness-110"
            style={{
              gridTemplateColumns: '1fr 72px 56px 64px',
              borderColor: '#2a2e39',
              fontFamily: 'var(--font-terminal)',
            }}
          >
            <div>
              <div className="text-sm font-medium" style={{ color: '#d1d4dc' }}>{s.name}</div>
              <div className="text-xs" style={{ color: '#434651' }}>{s.code}</div>
            </div>
            <div className="text-right text-sm tabular-nums" style={{ color: '#d1d4dc' }}>
              {s.price.toLocaleString()}
            </div>
            <div className="text-right text-sm font-bold tabular-nums" style={{
              color: s.changePercent >= 0 ? '#26a69a' : '#ef5350',
            }}>
              {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(1)}%
            </div>
            <div className="text-right text-sm font-bold tabular-nums" style={{ color }}>
              +{(type === '외인' ? s.foreignNet : s.instNet).toLocaleString()}억
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
