'use client'

import { useHeatmap } from '../api/useDashboard'

function scoreColor(score: number) {
  if (score >= 70) return 'text-[#16A34A]'
  if (score >= 60) return 'text-[#2563EB]'
  if (score >= 50) return 'text-[#D97706]'
  return 'text-[#9CA3AF]'
}

export function SectorMomentumTable() {
  const { data, isLoading } = useHeatmap()
  const sectors = data?.slice(0, 10) ?? []

  return (
    <div className="flex flex-col h-full">
      <span className="fx-card-title">돈의 흐름 — 섹터 순위</span>

      {/* 테이블 헤더 */}
      <div className="grid items-center px-1 py-1.5 text-[9px] text-[#9CA3AF] font-medium border-b border-[#F0EDE8]"
        style={{ gridTemplateColumns: '20px 1fr 36px 44px' }}>
        <span className="text-center">#</span>
        <span>섹터</span>
        <span className="text-right">점수</span>
        <span className="text-right">5일</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[32px] border-b border-[#F5F4F0] animate-pulse bg-[#F5F4F0]/30" />
          ))
        ) : sectors.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[10px] text-[#C4C1BA]">데이터 없음</div>
        ) : (
          sectors.map((s, i) => (
            <div key={s.sector}
              className="grid items-center px-1 h-[32px] border-b border-[#F5F4F0] hover:bg-[#F0EDE8] transition-colors text-[10px]"
              style={{ gridTemplateColumns: '20px 1fr 36px 44px' }}>
              <span className="text-center text-[#9CA3AF] tabular-nums">{i + 1}</span>
              <span className="text-[11px] text-[#1A1A2E] font-medium truncate">{s.sector}</span>
              <span className={`text-right font-bold tabular-nums ${scoreColor(s.score)}`}>{s.score}</span>
              <span className={`text-right font-bold tabular-nums ${
                s.change_5d >= 0 ? 'text-[#2563EB]' : 'text-[#EF4444]'
              }`}>
                {s.change_5d >= 0 ? '+' : ''}{s.change_5d.toFixed(1)}%
              </span>
            </div>
          ))
        )}
      </div>

      <div className="fx-card-tip">
        점수가 높은 섹터에 돈이 몰리고 있어요
      </div>
    </div>
  )
}
