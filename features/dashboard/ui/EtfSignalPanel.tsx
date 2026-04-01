'use client'

import { useDashboardEtf } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const GRADE_STYLE: Record<string, string> = {
  '적극매수': 'text-[#16A34A] bg-[#E8F5E9]',
  '매수': 'text-[#16A34A] bg-[#E8F5E9]',
  '관망': 'text-[#9CA3AF] bg-[#F5F4F0]',
  '매도': 'text-[#DC2626] bg-[#FEE2E2]',
  '적극매도': 'text-[#DC2626] bg-[#FEE2E2]',
}

export function EtfSignalPanel() {
  const { data, isLoading } = useDashboardEtf()
  const items = data?.etfs?.slice(0, 5) ?? []
  const dateStr = data?.updated_at ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full ${isStale ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="fx-card-title">ETF 시그널 (상위 5개)</span>
        <span className="text-[14px] font-extrabold text-[#6B7280]">{dateStr}</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[44px] border-b border-[#F5F4F0] animate-pulse bg-[#F5F4F0]/30" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[15px] font-semibold text-[#C4C1BA]">
            ETF 시그널을 분석 중입니다.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.etf_code}
              className="flex items-center justify-between px-1 py-2 border-b border-[#F5F4F0] hover:bg-[#F0EDE8] transition-colors">
              <div className="min-w-0 mr-2">
                <div className="text-[15px] text-[#1A1A2E] font-bold truncate">{item.sector}</div>
                <div className="text-[13px] font-semibold text-[#B0ADA6] truncate">{item.etf_name}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[13px] px-1.5 py-0.5 rounded font-bold ${
                  GRADE_STYLE[item.grade] ?? 'text-[#9CA3AF] bg-[#F5F4F0]'
                }`}>
                  {item.grade}
                </span>
                <span className={`text-[15px] font-bold tabular-nums ${
                  item.ret_5 >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
                }`}>
                  {item.ret_5 >= 0 ? '+' : ''}{item.ret_5.toFixed(1)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fx-card-tip">
        개별 종목이 어렵다면 ETF로 섹터에 투자하세요
      </div>
    </div>
  )
}
