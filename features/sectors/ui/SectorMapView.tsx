'use client'

import { useState } from 'react'
import { SectorSwimlane } from './SectorSwimlane'
import { SectorNetwork } from './SectorNetwork'
import { useSectorData } from '../api/useSectorData'
import { SECTOR_LIST } from '@/lib/chart-tokens'

export function SectorMapView({
  initialSector = 'semiconductor',
  userTier = 'free',
}: {
  initialSector?: string
  userTier?: 'free' | 'signal' | 'pro' | 'vip'
}) {
  const [sectorKey, setSectorKey] = useState(initialSector)
  const [view, setView] = useState<'swimlane' | 'network'>('swimlane')
  const { data, isLoading } = useSectorData(sectorKey)
  // 베타 기간: Network 뷰 전체 공개 (정식 출시 후 false로 변경)
  const BETA_MODE = true
  const canNetwork = BETA_MODE || userTier === 'pro' || userTier === 'vip'

  const sectorName = SECTOR_LIST.find((s) => s.key === sectorKey)?.name ?? sectorKey

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#534AB7]" />
          <span className="text-base font-bold text-[#e2e8f0] tracking-wider uppercase">
            섹터맵
          </span>
          <span className="text-sm text-[#8a8a8a]">{sectorName}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#555]">
            {data?.stocks?.length ?? 0}종목 · {data?.links?.length ?? 0}연결
          </span>
        </div>
      </div>

      {/* Sector tabs */}
      <div className="flex overflow-x-auto gap-2 px-5 py-3 border-b border-[#1a1a2a] scrollbar-hide">
        {SECTOR_LIST.map((s) => (
          <button
            key={s.key}
            onClick={() => setSectorKey(s.key)}
            className={`shrink-0 rounded-md transition-colors ${
              sectorKey === s.key
                ? 'bg-[#534AB7] text-white font-semibold'
                : 'bg-[#1a2535] text-[#8a8a8a] hover:text-[#e2e8f0] font-medium'
            }`}
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 px-5 py-2">
        <button
          onClick={() => setView('swimlane')}
          className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
            view === 'swimlane'
              ? 'bg-[#131722] text-[#e2e8f0] border border-[#534AB7]'
              : 'text-[#8a8a8a] border border-transparent hover:border-[#333]'
          }`}
        >
          Flowchart
        </button>
        <button
          onClick={() => canNetwork && setView('network')}
          className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
            view === 'network'
              ? 'bg-[#131722] text-[#e2e8f0] border border-[#534AB7]'
              : canNetwork
                ? 'text-[#8a8a8a] border border-transparent hover:border-[#333]'
                : 'text-[#555] border border-transparent opacity-50 cursor-not-allowed'
          }`}
          disabled={!canNetwork}
        >
          Network{' '}<span className="text-xs opacity-50">PRO</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#1a2535] animate-pulse rounded" />
            ))}
          </div>
        ) : !data || !data.stocks?.length ? (
          <div className="flex items-center justify-center h-64 text-[#334155] text-sm">
            데이터 없음 — 장 시작 전
          </div>
        ) : view === 'swimlane' ? (
          <SectorSwimlane
            stocks={data.stocks}
            links={data.links}
            tiers={data.tiers}
          />
        ) : (
          <SectorNetwork
            tiers={data.tiers}
            links={data.links}
          />
        )}
      </div>
    </div>
  )
}
