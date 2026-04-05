'use client'

import Link from 'next/link'
import { useShortSignals } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const GRADE_STYLE: Record<string, string> = {
  'AA': 'text-[#16A34A] bg-[#E8F5E9]',
  'A':  'text-[#2563EB] bg-[#EFF6FF]',
  'B':  'text-[#D97706] bg-[#FFFBEB]',
  'C':  'text-[#9CA3AF] bg-[#F5F4F0]',
}

const SIGNAL_LABEL: Record<string, string> = {
  FORCE_BUY: '적극매수',
  BUY: '매수',
  WATCH: '관심',
}

function gradeColor(score: number) {
  if (score >= 70) return 'text-[#16A34A]'
  if (score >= 60) return 'text-[#2563EB]'
  if (score >= 50) return 'text-[#D97706]'
  return 'text-[#9CA3AF]'
}

export function AIRecommendPanel() {
  const { data, isLoading } = useShortSignals('all')
  const stocks = data?.slice(0, 12) ?? []
  const dateStr = stocks[0]?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 30 : false

  return (
    <div className={`flex flex-col h-full ${isStale ? 'opacity-50' : ''}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className="fx-card-title mb-0">AI 선별 종목 (매수 시그널)</span>
        <div className="flex items-center gap-2">
          {rel && (
            <span className={`text-[14px] font-bold ${rel.daysAgo === 0 ? 'text-[#00CC6A]' : 'text-[#B0ADA6]'}`}>
              {rel.label}
            </span>
          )}
          <span className="text-[14px] font-extrabold text-[#6B7280]">{dateStr}</span>
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div className="grid items-center px-1 py-1.5 text-[14px] text-[#9CA3AF] font-bold border-b border-[#F0EDE8]"
        style={{ gridTemplateColumns: '24px 1fr 80px 80px 56px 48px' }}>
        <span className="text-center">#</span>
        <span>종목</span>
        <span className="text-right">현재가</span>
        <span className="text-right">목표가</span>
        <span className="text-right">등급</span>
        <span className="text-right">점수</span>
      </div>

      {/* 테이블 바디 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[44px] border-b border-[#F5F4F0] animate-pulse bg-[#F5F4F0]/30" />
          ))
        ) : stocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[15px] font-semibold text-[#C4C1BA]">
            현재 AI가 선별한 종목이 없습니다. 시장 상황을 분석 중이에요.
          </div>
        ) : (
          stocks.map((stock, i) => (
            <Link key={stock.code} href={`/chart/${stock.code}`}
              className="grid items-center px-1 h-[44px] border-b border-[#F5F4F0] hover:bg-[#F0EDE8] transition-colors text-[15px]"
              style={{ gridTemplateColumns: '24px 1fr 80px 80px 56px 48px' }}>
              <span className="text-center text-[#9CA3AF] font-semibold tabular-nums">{i + 1}</span>
              <div className="min-w-0 pl-1">
                <span className="text-[16px] text-[#1A1A2E] font-bold truncate block">{stock.name}</span>
              </div>
              <span className="text-right text-[#1A1A2E] font-semibold tabular-nums">{stock.entry_price?.toLocaleString()}</span>
              <span className="text-right text-[#1A1A2E] font-semibold tabular-nums">{stock.target_price?.toLocaleString()}</span>
              <div className="text-right">
                <span className={`inline-block text-[13px] px-1.5 py-0.5 rounded font-bold ${
                  GRADE_STYLE[stock.grade] ?? 'text-[#9CA3AF] bg-[#F5F4F0]'
                }`}>
                  {SIGNAL_LABEL[stock.signal_type] ?? stock.grade}
                </span>
              </div>
              <span className={`text-right font-bold tabular-nums ${gradeColor(stock.total_score)}`}>
                {stock.total_score}
              </span>
            </Link>
          ))
        )}
      </div>

      {/* 주린이 설명 */}
      <div className="fx-card-tip">
        점수가 높을수록 AI가 매수에 유리하다고 판단한 종목입니다 (100점 만점)
      </div>
    </div>
  )
}
