'use client'

import { useDashboardChinaMoney } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const SIGNAL_KR: Record<string, string> = {
  SURGE: '급유입',
  INFLOW: '유입 중',
  SECTOR_FOCUS: '섹터집중',
  WATCH: '관심',
}

const SIGNAL_STYLE: Record<string, string> = {
  SURGE: 'text-[#2563EB] bg-[#EFF6FF]',
  INFLOW: 'text-[#16A34A] bg-[#E8F5E9]',
  SECTOR_FOCUS: 'text-[#2563EB] bg-[#EFF6FF]',
  WATCH: 'text-[#D97706] bg-[#FFFBEB]',
}

export function ChinaMoneyPanel() {
  const { data, isLoading } = useDashboardChinaMoney()
  const items = data?.signals?.filter(s => s.signal !== 'NORMAL').slice(0, 10) ?? []
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 30 : false

  return (
    <div className={`flex flex-col h-full ${isStale ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[18px] font-[800] text-[#1A1A2E] tracking-wide">외국인 자금 흐름</span>
        <span className="text-[14px] font-[800] text-[#4B5563]">{dateStr}</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[40px] border-b border-[#F5F4F0] animate-pulse bg-[#F5F4F0]/30" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[15px] font-semibold text-[#C4C1BA]">
            외국인 자금 데이터를 불러오는 중입니다.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.ticker}
              className="flex items-center justify-between px-1 h-[40px] border-b border-[#F5F4F0] hover:bg-[#F0EDE8] transition-colors">
              <span className="text-[15px] text-[#1A1A2E] font-bold truncate mr-2">{item.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[13px] px-1.5 py-0.5 rounded font-bold ${
                  SIGNAL_STYLE[item.signal] ?? 'text-[#9CA3AF] bg-[#F5F4F0]'
                }`}>
                  {SIGNAL_KR[item.signal] ?? item.signal}
                </span>
                <span className={`text-[15px] font-bold tabular-nums ${
                  item.pct_change_5d >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
                }`}>
                  {item.pct_change_5d >= 0 ? '+' : ''}{item.pct_change_5d.toFixed(1)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fx-card-tip">
        외국인 투자자가 집중적으로 사고 있는 종목이에요
      </div>
    </div>
  )
}
