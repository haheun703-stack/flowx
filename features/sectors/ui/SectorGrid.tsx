'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { SECTOR_LIST, TIER_COLORS } from '@/lib/chart-tokens'

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
      className="group block bg-[#131722] border border-[#2a2a3a] rounded-lg p-4 hover:border-[#534AB7] transition-all hover:bg-[#131722]/80"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#e2e8f0] group-hover:text-white">
          {meta?.name ?? sector.name}
        </h3>
        <span
          className="text-sm font-mono font-bold"
          style={{ color: changeColor }}
        >
          {changeSign}{sector.avgChange}%
        </span>
      </div>

      {/* Tier distribution bar */}
      <div className="flex gap-px h-2 rounded overflow-hidden mb-3">
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
      <div className="space-y-1 mb-3">
        {sector.topMovers.map((m) => {
          const c = m.change > 0 ? '#ff3b5c' : m.change < 0 ? '#0ea5e9' : '#888'
          return (
            <div key={m.name} className="flex items-center justify-between text-[11px]">
              <span className="text-[#8a8a8a] truncate mr-2">{m.name}</span>
              <span className="font-mono shrink-0" style={{ color: c }}>
                {m.change > 0 ? '+' : ''}{m.change}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-3 text-[10px] text-[#555]">
        <span>{sector.stockCount}종목</span>
        <span>{sector.linkCount}연결</span>
      </div>
    </Link>
  )
}

function SectorCardSkeleton() {
  return (
    <div className="bg-[#131722] border border-[#2a2a3a] rounded-lg p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 w-16 bg-[#1a2535] rounded" />
        <div className="h-4 w-12 bg-[#1a2535] rounded" />
      </div>
      <div className="h-2 bg-[#1a2535] rounded mb-3" />
      <div className="space-y-1 mb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 bg-[#1a2535] rounded" />
        ))}
      </div>
      <div className="h-3 w-24 bg-[#1a2535] rounded" />
    </div>
  )
}

export function SectorGrid() {
  const { data, isLoading } = useSectorOverview()

  // Merge API data with SECTOR_LIST order
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
    <div className="flex flex-col" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-1 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#534AB7]" />
        <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">
          섹터맵
        </span>
        <span className="text-[11px] text-[#8a8a8a]">
          13개 섹터 · 공급망 분석
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 13 }).map((_, i) => <SectorCardSkeleton key={i} />)
          : ordered.map((s) => <SectorCard key={s.key} sector={s} />)
        }
      </div>
    </div>
  )
}
