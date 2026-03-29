'use client'

import { useMemo } from 'react'
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
  const changeColor = sector.avgChange > 0 ? '#dc2626' : sector.avgChange < 0 ? '#2563eb' : '#888'
  const changeSign = sector.avgChange > 0 ? '+' : ''

  return (
    <Link
      href={`/sectors/${sector.key}`}
      className="group block bg-white rounded-xl p-5 min-h-[200px] border border-transparent hover:border-[#534AB7] transition-all hover:bg-gray-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">
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
          const c = m.change > 0 ? '#dc2626' : m.change < 0 ? '#2563eb' : '#888'
          return (
            <div key={m.name} className="flex items-center justify-between" style={{ fontSize: 13 }}>
              <span className="text-[var(--text-dim)] truncate mr-3">{getDisplayName(m.name)}</span>
              <span className="font-mono font-bold shrink-0" style={{ color: c }}>
                {m.change > 0 ? '+' : ''}{m.change}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
        <span>{sector.stockCount}종목</span>
        <span>{sector.linkCount}연결</span>
      </div>
    </Link>
  )
}

function SectorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 min-h-[200px] animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-5 w-20 bg-gray-200 rounded" />
        <div className="h-5 w-14 bg-gray-200 rounded" />
      </div>
      <div className="h-2.5 bg-gray-200 rounded mb-4" />
      <div className="space-y-1.5 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="h-3 w-28 bg-gray-200 rounded" />
    </div>
  )
}

export function SectorGrid() {
  const { data, isLoading } = useSectorOverview()

  const ordered = useMemo(() => SECTOR_LIST.map((s) => {
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
  }), [data?.sectors])

  return (
    <div className="flex flex-col min-h-[calc(100vh/1.25-88px)] bg-[var(--bg-base)]" style={{ fontFamily: FONT }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#534AB7]" />
          <span className="text-2xl font-black tracking-widest uppercase text-[var(--text-primary)]">
            섹터맵
          </span>
          <span className="text-sm font-black text-[var(--text-dim)]">13개 섹터 · 공급망 분석</span>
        </div>
      </div>

      {/* 설명 */}
      <div className="px-6 py-2 text-xs text-gray-500 border-b border-[var(--border)]/50">
        섹터 클릭 → 5티어 플로우차트 + 공급망 연결 확인 · 색상 = 티어 분포
      </div>

      {/* Grid */}
      <div className="flex-1 p-6">
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
