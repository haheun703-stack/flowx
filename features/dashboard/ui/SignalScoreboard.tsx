'use client'

import { useState } from 'react'
import { useScoreboard, type ScoreboardPeriod } from '../api/useDashboard'

const PERIOD_LABELS: Record<ScoreboardPeriod, string> = { '30D': '30일', '60D': '60일', '90D': '90일', 'ALL': '전체' }

export function SignalScoreboard() {
  const [period, setPeriod] = useState<ScoreboardPeriod>('30D')
  const { data, isLoading } = useScoreboard('QUANT', period)

  const winRate = data?.win_rate ?? 0
  const avgReturn = data?.avg_return ?? 0
  const topStock = data?.recent_closed?.[0]

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className="fx-card-title mb-0">AI 시그널 성적표</span>
        <div className="flex gap-1">
          {(['30D', '60D', '90D', 'ALL'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-0.5 text-[15px] font-bold rounded transition-colors ${
                period === p
                  ? 'text-[#1A1A2E] bg-[#F0EDE8]'
                  : 'text-[#B0ADA6] hover:text-[#6B7280]'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[90px] bg-[#F5F4F0] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {/* 적중률 */}
          <div className="bg-[#F5F4F0] rounded-lg p-[10px] text-center h-[90px] flex flex-col justify-center">
            <div className="text-[14px] font-semibold text-[#9CA3AF] mb-1">적중률</div>
            <div className={`text-[28px] font-bold tabular-nums ${
              winRate >= 70 ? 'text-[#16A34A]' : winRate >= 50 ? 'text-[#2563EB]' : 'text-[#9CA3AF]'
            }`}>
              {winRate.toFixed(0)}%
            </div>
            <div className="text-[13px] font-semibold text-[#B0ADA6]">
              성공 {data?.win_count ?? 0} / 실패 {data?.loss_count ?? 0}
            </div>
          </div>

          {/* 평균 수익률 */}
          <div className="bg-[#F5F4F0] rounded-lg p-[10px] text-center h-[90px] flex flex-col justify-center">
            <div className="text-[14px] font-semibold text-[#9CA3AF] mb-1">평균 수익률</div>
            <div className={`text-[28px] font-bold tabular-nums ${
              avgReturn > 0 ? 'text-[var(--up)]' : avgReturn < 0 ? 'text-[var(--down)]' : 'text-[#9CA3AF]'
            }`}>
              {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
            </div>
            <div className="text-[13px] font-semibold text-[#B0ADA6]">시그널 기준</div>
          </div>

          {/* 최근 성과 TOP */}
          <div className="bg-[#F5F4F0] rounded-lg p-[10px] text-center h-[90px] flex flex-col justify-center">
            <div className="text-[14px] font-semibold text-[#9CA3AF] mb-1">최근 성과 TOP</div>
            {topStock ? (
              <>
                <div className="text-[28px] font-bold text-[#16A34A] tabular-nums">
                  +{topStock.return_pct}%
                </div>
                <div className="text-[13px] font-semibold text-[#B0ADA6] truncate">
                  {topStock.ticker_name}
                </div>
              </>
            ) : (
              <div className="text-[28px] font-bold text-[#B0ADA6]">—</div>
            )}
          </div>

          {/* 활성 시그널 */}
          <div className="bg-[#F5F4F0] rounded-lg p-[10px] text-center h-[90px] flex flex-col justify-center">
            <div className="text-[14px] font-semibold text-[#9CA3AF] mb-1">활성 시그널</div>
            <div className="text-[28px] font-bold text-[#2563EB] tabular-nums">
              {data?.total_signals ?? 0}건
            </div>
            <div className="text-[13px] font-semibold text-[#B0ADA6]">
              {PERIOD_LABELS[period]}
            </div>
          </div>
        </div>
      )}

      {/* 주린이 설명 */}
      <div className="fx-card-tip">
        지난 시그널이 얼마나 맞았는지 보여드려요
      </div>
    </div>
  )
}
