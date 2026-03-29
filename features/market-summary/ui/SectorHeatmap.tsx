'use client'

import { SectorData } from '../types'

function getHeatColor(pct: number): string {
  if (pct >= 3)   return 'rgba(220,38,38,0.20)'
  if (pct >= 2)   return 'rgba(220,38,38,0.14)'
  if (pct >= 1)   return 'rgba(220,38,38,0.08)'
  if (pct >= 0)   return 'rgba(220,38,38,0.04)'
  if (pct >= -1)  return 'rgba(37,99,235,0.04)'
  if (pct >= -2)  return 'rgba(37,99,235,0.08)'
  if (pct >= -3)  return 'rgba(37,99,235,0.14)'
  return 'rgba(37,99,235,0.20)'
}

export function SectorHeatmap({ sectors }: { sectors: SectorData[] }) {
  if (!sectors.length) {
    return (
      <div className="flex flex-col bg-white">
        <div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
          <div className="w-2 h-2 rounded-full mr-2 bg-[var(--blue)]" />
          <span className="text-sm font-black tracking-widest uppercase text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-terminal)' }}>섹터 히트맵</span>
        </div>
        <div className="p-4 text-center text-sm text-[var(--text-dim)]">데이터 로딩중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-white">
      {/* 터미널 스타일 헤더 */}
      <div className="flex items-center px-4 py-3 border-b border-[var(--border)]"
        style={{ fontFamily: 'var(--font-terminal)' }}>
        <div className="w-2 h-2 rounded-full mr-2 bg-[var(--blue)]" />
        <span className="text-sm font-black tracking-widest uppercase text-[var(--text-primary)]">섹터 히트맵</span>
        <span className="ml-2 text-xs tracking-wider text-[var(--text-muted)]">5일 기준</span>
      </div>

      {/* 3x3 그리드 */}
      <div className="grid grid-cols-3 gap-1.5 p-4">
        {sectors.map((sector, i) => (
          <div
            key={i}
            className="rounded-sm px-4 py-4 text-center cursor-pointer transition-all hover:brightness-95 border border-[var(--border)]/50"
            style={{ background: getHeatColor(sector.changePercent) }}
          >
            <div className="text-sm font-bold mb-1 text-[var(--text-primary)]">
              {sector.name}
            </div>
            <div className="text-base font-black" style={{
              fontFamily: 'var(--font-terminal)',
              color: sector.changePercent >= 0 ? 'var(--up)' : 'var(--down)',
            }}>
              {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
