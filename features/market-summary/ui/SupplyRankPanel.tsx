'use client'

import Link from 'next/link'
import { SupplyStock } from '../types'

export function SupplyRankPanel({ stocks, type }: {
  stocks: SupplyStock[]
  type: '외인' | '기관'
}) {
  const title = type === '외인'
    ? '외국인이 가장 많이 산 종목 TOP 5'
    : '기관이 가장 많이 산 종목 TOP 5'

  return (
    <div>
      <span className="fx-card-title">{title}</span>

      {/* 테이블 헤더 */}
      <div className="grid items-center px-1 py-1.5 text-[9px] text-[#9CA3AF] font-medium border-b border-[#F0EDE8]"
        style={{ gridTemplateColumns: '1fr 64px 48px 60px' }}>
        <span>종목</span>
        <span className="text-right">현재가</span>
        <span className="text-right">등락</span>
        <span className="text-right">순매수</span>
      </div>

      {stocks.length === 0 ? (
        <div className="text-[10px] text-[#C4C1BA] text-center py-6">데이터 없음</div>
      ) : (
        stocks.slice(0, 5).map(s => (
          <Link
            key={s.code}
            href={`/chart/${s.code}`}
            className="grid items-center px-1 h-[36px] border-b border-[#F5F4F0] hover:bg-[#F0EDE8] transition-colors text-[10px]"
            style={{ gridTemplateColumns: '1fr 64px 48px 60px' }}
          >
            <span className="text-[11px] text-[#1A1A2E] font-bold truncate">{s.name}</span>
            <span className="text-right text-[#1A1A2E] tabular-nums">{s.price.toLocaleString()}</span>
            <span className={`text-right font-bold tabular-nums ${
              s.changePercent >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
            }`}>
              {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(1)}%
            </span>
            <span className="text-right font-bold tabular-nums text-[var(--up)]">
              {(() => {
                const val = type === '외인' ? s.foreignNet : s.instNet
                return `${val >= 0 ? '+' : ''}${val.toLocaleString()}억`
              })()}
            </span>
          </Link>
        ))
      )}

      <div className="fx-card-tip">
        외국인이 많이 사는 종목은 중장기 상승 가능성이 있어요
      </div>
    </div>
  )
}
