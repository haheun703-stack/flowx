'use client'

import { SectorData } from '../types'

function getHeatStyle(pct: number): { bg: string; text: string } {
  if (pct >= 15)  return { bg: '#FEE2E2', text: '#991B1B' }
  if (pct >= 5)   return { bg: '#FEF2F2', text: '#dc2626' }
  if (pct >= 0)   return { bg: '#FEF9C3', text: '#A16207' }
  if (pct >= -5)  return { bg: '#EFF6FF', text: '#2563eb' }
  return { bg: '#DBEAFE', text: '#1D4ED8' }
}

export function SectorHeatmap({ sectors }: { sectors: SectorData[] }) {
  if (!sectors.length) {
    return (
      <div>
        <span className="fx-card-title">섹터별 등락 한눈에 (5일 기준)</span>
        <div className="text-[15px] font-semibold text-[#C4C1BA] text-center py-6">데이터 로딩중...</div>
      </div>
    )
  }

  return (
    <div>
      <span className="fx-card-title">섹터별 등락 한눈에 (5일 기준)</span>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {sectors.slice(0, 9).map((sector, i) => {
          const style = getHeatStyle(sector.changePercent)
          return (
            <div
              key={i}
              className="rounded-md p-[10px] text-center transition-all hover:brightness-95"
              style={{ background: style.bg }}
            >
              <div className="text-[13px] md:text-[15px] font-semibold mb-0.5" style={{ color: style.text }}>
                {sector.name}
              </div>
              <div className="text-[18px] font-bold tabular-nums" style={{ color: style.text }}>
                {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>

      <div className="fx-card-tip">
        빨간색이 진할수록 많이 오른 섹터, 파란색은 내린 섹터예요
      </div>
    </div>
  )
}
