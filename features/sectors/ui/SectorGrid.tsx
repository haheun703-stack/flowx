'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { SECTOR_LIST, TIER_COLORS } from '@/lib/chart-tokens'
import { getDisplayName } from '@/lib/stock-name-ko'

const FONT = 'var(--font-jetbrains), monospace'

interface SectorSummary {
  key: string
  name: string
  stockCount: number
  linkCount: number
  avgChange: number
  tierCounts: Record<number, number>
  topMovers: { name: string; change: number }[]
}

function useSectorOverview() {
  return useQuery<{ sectors: SectorSummary[] }>({
    queryKey: ['sectors-overview'],
    queryFn: async () => {
      const res = await fetch('/api/sectors')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

function SectorCard({ sector }: { sector: SectorSummary }) {
  const meta = SECTOR_LIST.find((s) => s.key === sector.key)
  const changeColor = sector.avgChange > 0 ? '#ff3b5c' : sector.avgChange < 0 ? '#0ea5e9' : '#888'
  const changeSign = sector.avgChange > 0 ? '+' : ''

  return (
    <Link
      href={`/sectors/${sector.key}`}
      className="group block bg-[#0a0f18] border border-[#1a2535] rounded-lg p-5 hover:border-[#534AB7] transition-all hover:bg-[#0e1420]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-[#e2e8f0] group-hover:text-white">
          {meta?.name ?? sector.name}
        </h3>
        <span
          className="text-lg font-mono font-black"
          style={{ color: changeColor }}
        >
          {changeSign}{sector.avgChange}%
        </span>
      </div>

      {/* Tier distribution bar */}
      <div className="flex gap-px h-2.5 rounded overflow-hidden mb-4">
        {[5, 4, 3, 2, 1].map((tier) => {
          const count = sector.tierCounts[tier] || 0
          if (count === 0) return null
          return (
            <div
              key={tier}
              style={{
                flex: count,
                backgroundColor: TIER_COLORS[tier].badge,
              }}
              title={`Tier ${tier}: ${count}종목`}
            />
          )
        })}
      </div>

      {/* Top movers */}
      <div className="space-y-1.5 mb-4">
        {sector.topMovers.map((m) => {
          const c = m.change > 0 ? '#ff3b5c' : m.change < 0 ? '#0ea5e9' : '#888'
          return (
            <div key={m.name} className="flex items-center justify-between" style={{ fontSize: 13 }}>
              <span className="text-[#94a3b8] truncate mr-3">{getDisplayName(m.name)}</span>
              <span className="font-mono font-bold shrink-0" style={{ color: c }}>
                {m.change > 0 ? '+' : ''}{m.change}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 text-xs text-[#64748b]">
        <span>{sector.stockCount}종목</span>
        <span>{sector.linkCount}연결</span>
      </div>
    </Link>
  )
}

function SectorCardSkeleton() {
  return (
    <div className="bg-[#0a0f18] border border-[#1a2535] rounded-lg p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-5 w-20 bg-[#1a2535] rounded" />
        <div className="h-5 w-14 bg-[#1a2535] rounded" />
      </div>
      <div className="h-2.5 bg-[#1a2535] rounded mb-4" />
      <div className="space-y-1.5 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-[#1a2535] rounded" />
        ))}
      </div>
      <div className="h-3 w-28 bg-[#1a2535] rounded" />
    </div>
  )
}

export function SectorGrid() {
  const { data, isLoading } = useSectorOverview()

  const ordered = SECTOR_LIST.map((s) => {
    const found = data?.sectors.find((d) => d.key === s.key)
    return found ?? {
      key: s.key,
      name: s.name,
      stockCount: 0,
      linkCount: 0,
      avgChange: 0,
      tierCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      topMovers: [],
    }
  })

  return (
    <div className="flex flex-col min-h-[calc(100vh/1.25-88px)]" style={{ background: '#131722', fontFamily: FONT }}>
      {/* Header — 트리맵과 동일 스타일 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
          <span className="text-base font-black tracking-widest uppercase text-white">
            섹터맵
          </span>
          <span className="text-sm font-black text-[#94a3b8]">13개 섹터 · 공급망 분석</span>
        </div>
      </div>

      {/* 설명 */}
      <div className="px-4 py-1.5 text-xs text-[#64748b] border-b border-[#1a2535]/50">
        섹터 클릭 → 5티어 플로우차트 + 공급망 연결 확인 · 색상 = 티어 분포
      </div>

      {/* Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 13 }).map((_, i) => <SectorCardSkeleton key={i} />)
            : ordered.map((s) => <SectorCard key={s.key} sector={s} />)
          }
        </div>
      </div>
    </div>
  )
}
