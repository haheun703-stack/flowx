'use client'

import { SectorData } from '../types'

function getHeatColor(pct: number): string {
  if (pct >= 3)   return 'rgba(0,255,136,0.35)'
  if (pct >= 2)   return 'rgba(0,255,136,0.25)'
  if (pct >= 1)   return 'rgba(0,255,136,0.15)'
  if (pct >= 0)   return 'rgba(0,255,136,0.08)'
  if (pct >= -1)  return 'rgba(255,59,92,0.08)'
  if (pct >= -2)  return 'rgba(255,59,92,0.15)'
  if (pct >= -3)  return 'rgba(255,59,92,0.25)'
  return 'rgba(255,59,92,0.35)'
}

export function SectorHeatmap({ sectors }: { sectors: SectorData[] }) {
  if (!sectors.length) {
    return (
      <div className="flex flex-col bg-[#0a0f18]">
        <div className="flex items-center px-4 py-3 border-b border-[#1a2535]">
          <div className="w-2 h-2 rounded-full mr-2 bg-[#0ea5e9]" />
          <span className="text-sm font-black tracking-widest uppercase" style={{ color: '#e2e8f0', fontFamily: 'var(--font-terminal)' }}>섹터 히트맵</span>
        </div>
        <div className="p-4 text-center text-sm" style={{ color: '#64748b' }}>데이터 로딩중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-[#0a0f18]">
      {/* 터미널 스타일 헤더 */}
      <div className="flex items-center px-4 py-3 border-b border-[#1a2535]"
        style={{ fontFamily: 'var(--font-terminal)' }}>
        <div className="w-2 h-2 rounded-full mr-2 bg-[#0ea5e9]" />
        <span className="text-sm font-black tracking-widest uppercase text-[#e2e8f0]">섹터 히트맵</span>
        <span className="ml-2 text-xs tracking-wider text-[#334155]">5일 기준</span>
      </div>

      {/* 3x3 그리드 — 셀 크기 확대 */}
      <div className="grid grid-cols-3 gap-1.5 p-4">
        {sectors.map((sector, i) => (
          <div
            key={i}
            className="rounded-sm px-4 py-4 text-center cursor-pointer transition-all hover:brightness-125 border border-[#1a2535]/50"
            style={{ background: getHeatColor(sector.changePercent) }}
          >
            <div className="text-sm font-bold mb-1 text-[#e2e8f0]">
              {sector.name}
            </div>
            <div className="text-base font-black" style={{
              fontFamily: 'var(--font-terminal)',
              color: sector.changePercent >= 0 ? '#00ff88' : '#ff3b5c',
            }}>
              {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
