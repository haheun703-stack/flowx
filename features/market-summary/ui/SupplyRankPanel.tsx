'use client'

import Link from 'next/link'
import { SupplyStock } from '../types'

export function SupplyRankPanel({ stocks, type }: {
  stocks: SupplyStock[]
  type: '외인' | '기관'
}) {
  const color = type === '외인' ? 'var(--investor-foreign)' : 'var(--investor-inst)'

  return (
    <div className="flex flex-col bg-white" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 터미널 스타일 헤더 */}
      <div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
        <div className="w-2 h-2 rounded-full mr-2" style={{ background: color }} />
        <span className="text-sm font-black tracking-widest uppercase text-[var(--text-primary)]">
          {type} 순매수 TOP 5
        </span>
      </div>

      {/* 컬럼 헤더 */}
      <div
        className="grid px-4 py-2 text-xs font-bold tracking-wider uppercase border-b border-[var(--border)]/50 text-[var(--text-dim)]"
        style={{ gridTemplateColumns: '1fr 80px 60px 72px' }}
      >
        <span>종목</span>
        <span className="text-right">현재가</span>
        <span className="text-right">등락</span>
        <span className="text-right">순매수</span>
      </div>

      {stocks.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-[var(--text-dim)]">
          데이터 없음
        </div>
      ) : (
        stocks.map(s => (
          <Link
            key={s.code}
            href={`/chart/${s.code}`}
            className="grid items-center px-4 py-3 border-b border-[var(--border)]/50 transition-colors hover:bg-gray-50"
            style={{ gridTemplateColumns: '1fr 80px 60px 72px' }}
          >
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{s.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{s.code}</div>
            </div>
            <div className="text-right text-sm font-bold tabular-nums text-[var(--text-primary)]">
              {s.price.toLocaleString()}
            </div>
            <div className="text-right text-sm font-bold tabular-nums" style={{
              color: s.changePercent >= 0 ? 'var(--up)' : 'var(--down)',
            }}>
              {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(1)}%
            </div>
            <div className="text-right text-sm font-black tabular-nums" style={{ color }}>
              {(() => {
                const val = type === '외인' ? s.foreignNet : s.instNet
                return `${val >= 0 ? '+' : ''}${val.toLocaleString()}억`
              })()}
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
