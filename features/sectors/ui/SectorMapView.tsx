'use client'

import { useState, useMemo } from 'react'
import { SectorSwimlane } from './SectorSwimlane'
import { SectorNetwork } from './SectorNetwork'
import { useSectorData } from '../api/useSectorData'
import { SECTOR_LIST } from '@/lib/chart-tokens'

/** Hot themes get emoji badges */
const THEME_EMOJI: Record<string, string> = {
  HBM: '🔥', AI서버: '🤖', EUV: '🔬', NATO수출: '🌍', 폴란드: '🇵🇱',
  'K2전차': '🎯', 'KF-21': '✈️', LNG: '⛽', 원전: '☢️', 비만: '💊',
  CDMO: '🧬', 'K-POP': '🎵', 배당: '💰', EV: '⚡', 휴머노이드: '🤖',
}

/** Minimum count to show a theme pill */
const MIN_THEME_COUNT = 3

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

  // Build dynamic theme list from actual data
  const themeList = useMemo(() => {
    if (!data?.stocks) return []
    const counts: Record<string, number> = {}
    for (const stock of data.stocks) {
      for (const tag of stock.theme_tags ?? []) {
        counts[tag] = (counts[tag] || 0) + 1
      }
    }
    // Sort by count desc, filter out low-count themes
    return Object.entries(counts)
      .filter(([, count]) => count >= MIN_THEME_COUNT)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count, emoji: THEME_EMOJI[tag] }))
  }, [data?.stocks])

  const hasThemeTags = themeList.length > 0

  // Reset theme when switching sectors
  const handleSectorChange = (key: string) => {
    setSectorKey(key)
    setActiveTheme(null)
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#534AB7]" />
          <span className="text-base font-bold text-[var(--text-primary)] tracking-wider uppercase">
            섹터맵
          </span>
          <span className="text-sm text-[var(--text-muted)]">{sectorName}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--text-muted)]">
            {data?.stocks?.length ?? 0}종목 · {data?.links?.length ?? 0}연결
          </span>
        </div>
      </div>

      {/* Sector tabs */}
      <div className="flex overflow-x-auto gap-2 px-5 py-3 border-b border-[var(--border)]/50 scrollbar-hide">
        {SECTOR_LIST.map((s) => (
          <button
            key={s.key}
            onClick={() => handleSectorChange(s.key)}
            className={`shrink-0 rounded-md transition-colors ${
              sectorKey === s.key
                ? 'bg-[#534AB7] text-[var(--text-primary)] font-semibold'
                : 'bg-gray-100 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
            }`}
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Dynamic theme filter pills */}
      {hasThemeTags && (
        <div className="flex overflow-x-auto gap-1.5 px-5 py-2.5 border-b border-[var(--border)]/30 scrollbar-hide">
          {/* "전체" button */}
          <button
            onClick={() => setActiveTheme(null)}
            className={`shrink-0 rounded-full transition-all text-xs font-bold ${
              activeTheme === null
                ? 'bg-[#534AB7] text-[var(--text-primary)] shadow-lg shadow-[#534AB7]/30'
                : 'bg-gray-100 text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-gray-200'
            }`}
            style={{ padding: '6px 14px' }}
          >
            전체 <span className="opacity-60">{data?.stocks?.length ?? 0}</span>
          </button>
          {/* Dynamic theme pills */}
          {themeList.map(({ tag, count, emoji }) => {
            const isActive = activeTheme === tag
            return (
              <button
                key={tag}
                onClick={() => setActiveTheme(isActive ? null : tag)}
                className={`shrink-0 rounded-full transition-all text-xs font-bold ${
                  isActive
                    ? 'bg-[#534AB7] text-[var(--text-primary)] shadow-lg shadow-[#534AB7]/30'
                    : 'bg-gray-100 text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-gray-200'
                }`}
                style={{ padding: '6px 14px' }}
              >
                {tag}{emoji ?? ''}{' '}
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
              ? 'bg-white text-[var(--text-primary)] border border-[#534AB7]'
              : 'text-[var(--text-muted)] border border-transparent hover:border-[var(--border)]'
          }`}
        >
          공급망 흐름도
        </button>
        <button
          onClick={() => canNetwork && setView('network')}
          className={`px-4 py-1.5 rounded text-sm font-bold transition-colors ${
            view === 'network'
              ? 'bg-white text-[var(--text-primary)] border border-[#534AB7]'
              : canNetwork
                ? 'text-[var(--text-muted)] border border-transparent hover:border-[var(--border)]'
                : 'text-[var(--text-muted)] border border-transparent opacity-50 cursor-not-allowed'
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
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : !data || !data.stocks?.length ? (
          <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm">
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
