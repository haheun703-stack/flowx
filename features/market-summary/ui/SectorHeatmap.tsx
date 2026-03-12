'use client'

import { SectorData } from '../types'

function getHeatColor(pct: number): string {
  if (pct >= 3)   return 'rgba(38,166,154,0.9)'
  if (pct >= 2)   return 'rgba(38,166,154,0.7)'
  if (pct >= 1)   return 'rgba(38,166,154,0.5)'
  if (pct >= 0)   return 'rgba(38,166,154,0.25)'
  if (pct >= -1)  return 'rgba(239,83,80,0.25)'
  if (pct >= -2)  return 'rgba(239,83,80,0.5)'
  if (pct >= -3)  return 'rgba(239,83,80,0.7)'
  return 'rgba(239,83,80,0.9)'
}

export function SectorHeatmap({ sectors }: { sectors: SectorData[] }) {
  if (!sectors.length) {
    return (
      <div className="flex flex-col" style={{ background: '#1c2030' }}>
        <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: '#2a2e39' }}>
          <div className="w-2 h-2 rounded-full mr-2" style={{ background: '#0ea5e9' }} />
          <span className="text-sm font-semibold" style={{ color: '#d1d4dc' }}>섹터 히트맵</span>
        </div>
        <div className="p-3 text-center text-sm" style={{ color: '#434651' }}>데이터 로딩중...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ background: '#1c2030' }}>
      <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: '#2a2e39' }}>
        <div className="w-2 h-2 rounded-full mr-2" style={{ background: '#0ea5e9' }} />
        <span className="text-sm font-semibold" style={{ color: '#d1d4dc' }}>섹터 히트맵</span>
        <span className="ml-2 text-xs" style={{ fontFamily: 'var(--font-terminal)', color: '#434651' }}>5일 기준</span>
      </div>

      <div className="grid grid-cols-3 gap-1 p-3">
        {sectors.map((sector, i) => (
          <div
            key={i}
            className="rounded px-3 py-2.5 text-center cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: getHeatColor(sector.changePercent) }}
          >
            <div className="text-xs font-medium mb-0.5" style={{ color: '#d1d4dc' }}>
              {sector.name}
            </div>
            <div className="text-sm font-bold" style={{
              fontFamily: 'var(--font-terminal)',
              color: sector.changePercent >= 0 ? '#26a69a' : '#ef5350',
            }}>
              {sector.changePercent >= 0 ? '+' : ''}{sector.changePercent.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
