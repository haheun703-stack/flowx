'use client'

import { useState, useMemo } from 'react'
import { SectorSwimlane } from './SectorSwimlane'
import { SectorNetwork } from './SectorNetwork'
import { useSectorData } from '../api/useSectorData'
import { SECTOR_LIST } from '@/lib/chart-tokens'

/** Theme filter definitions (only shown for sectors that have theme_tags) */
const THEME_FILTERS: { key: string | null; label: string; emoji?: string }[] = [
  { key: null, label: '전체' },
  { key: 'HBM', label: 'HBM', emoji: '🔥' },
  { key: 'AI서버', label: 'AI서버' },
  { key: 'EUV', label: 'EUV' },
  { key: '전력반도체', label: '전력반도체' },
  { key: 'SiC', label: 'SiC' },
  { key: '파운드리', label: '파운드리' },
]

export function SectorMapView({
  initialSector = 'semiconductor',
  userTier = 'free',
}: {
  initialSector?: string
  userTier?: 'free' | 'signal' | 'pro' | 'vip'
}) {
  const [sectorKey, setSectorKey] = useState(initialSector)
  const [view, setView] = useState<'swimlane' | 'network'>('swimlane')
  const [activeTheme, setActiveTheme] = useState<string | null>(null)
  const { data, isLoading } = useSectorData(sectorKey)
  const BETA_MODE = true
  const canNetwork = BETA_MODE || userTier === 'pro' || userTier === 'vip'

  const sectorName = SECTOR_LIST.find((s) => s.key === sectorKey)?.name ?? sectorKey

  // Check if current sector has theme_tags data
  const hasThemeTags = useMemo(() => {
    if (!data?.stocks) return false
    return data.stocks.some((s) => s.theme_tags && s.theme_tags.length > 0)
  }, [data?.stocks])

  // Count matching stocks per theme
  const themeCounts = useMemo(() => {
    if (!data?.stocks) return {}
    const counts: Record<string, number> = {}
    for (const stock of data.stocks) {
      for (const tag of stock.theme_tags ?? []) {
        counts[tag] = (counts[tag] || 0) + 1
      }
    }
    return counts
  }, [data?.stocks])

  // Reset theme when switching sectors
  const handleSectorChange = (key: string) => {
    setSectorKey(key)
    setActiveTheme(null)
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#534AB7]" />
          <span className="text-base font-bold text-white tracking-wider uppercase">
            섹터맵
          </span>
          <span className="text-sm text-gray-500">{sectorName}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">
            {data?.stocks?.length ?? 0}종목 · {data?.links?.length ?? 0}연결
          </span>
        </div>
      </div>

      {/* Sector tabs */}
      <div className="flex overflow-x-auto gap-2 px-5 py-3 border-b border-gray-800/50 scrollbar-hide">
        {SECTOR_LIST.map((s) => (
          <button
            key={s.key}
            onClick={() => handleSectorChange(s.key)}
            className={`shrink-0 rounded-md transition-colors ${
              sectorKey === s.key
                ? 'bg-[#534AB7] text-white font-semibold'
                : 'bg-[#1a2535] text-gray-500 hover:text-white font-medium'
            }`}
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Theme filter pills (only for sectors with theme data) */}
      {hasThemeTags && (
        <div className="flex overflow-x-auto gap-1.5 px-5 py-2.5 border-b border-gray-800/30 scrollbar-hide">
          {THEME_FILTERS.map((t) => {
            const count = t.key ? themeCounts[t.key] ?? 0 : data?.stocks?.length ?? 0
            const isActive = activeTheme === t.key
            if (t.key && count === 0) return null
            return (
              <button
                key={t.key ?? '__all'}
                onClick={() => setActiveTheme(isActive ? null : t.key)}
                className={`shrink-0 rounded-full transition-all text-xs font-bold ${
                  isActive
                    ? 'bg-[#534AB7] text-white shadow-lg shadow-[#534AB7]/30'
                    : 'bg-[#1a2535] text-gray-400 hover:text-white hover:bg-[#2a3545]'
                }`}
                style={{ padding: '6px 14px' }}
              >
                {t.label}{t.emoji ? t.emoji : ''}{' '}
                <span className="opacity-60">{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* View toggle */}
      <div className="flex items-center gap-2 px-5 py-2">
        <button
          onClick={() => setView('swimlane')}
          className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
            view === 'swimlane'
              ? 'bg-[#131722] text-white border border-[#534AB7]'
              : 'text-gray-500 border border-transparent hover:border-gray-700'
          }`}
        >
          공급망 흐름도
        </button>
        <button
          onClick={() => canNetwork && setView('network')}
          className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
            view === 'network'
              ? 'bg-[#131722] text-white border border-[#534AB7]'
              : canNetwork
                ? 'text-gray-500 border border-transparent hover:border-gray-700'
                : 'text-gray-700 border border-transparent opacity-50 cursor-not-allowed'
          }`}
          disabled={!canNetwork}
        >
          네트워크 뷰{' '}<span className="text-xs opacity-50">PRO</span>
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
          <div className="flex items-center justify-center h-64 text-gray-700 text-sm">
            데이터 없음 — 장 시작 전
          </div>
        ) : view === 'swimlane' ? (
          <SectorSwimlane
            stocks={data.stocks}
            links={data.links}
            tiers={data.tiers}
            activeTheme={activeTheme}
          />
        ) : (
          <SectorNetwork
            tiers={data.tiers}
            links={data.links}
            stocks={data.stocks}
            activeTheme={activeTheme}
          />
        )}
      </div>
    </div>
  )
}
