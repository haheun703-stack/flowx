'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy'
import type { TreemapSector, TreemapStock } from '../model/useTreemap'
import type { SizeBy } from './StockTreemap'
import { SECTOR_LIST } from '@/lib/chart-tokens'

const SECTOR_NAME_TO_KEY = Object.fromEntries(
  SECTOR_LIST.map((s) => [s.name, s.key])
)

// ─── 색상 매핑 (Finviz 스타일: 상승=빨강, 하락=파랑) ───

function getSectorColor(changePercent: number): string {
  if (changePercent >= 10) return '#991B1B'
  if (changePercent >= 5)  return '#DC2626'
  if (changePercent >= 2)  return '#EF4444'
  if (changePercent >= 0)  return '#F87171'
  if (changePercent >= -2) return '#93C5FD'
  if (changePercent >= -5) return '#60A5FA'
  return '#2563EB'
}

function getTextSize(ratio: number) {
  if (ratio > 0.3)  return { name: 16, pct: 18, cap: 9 }
  if (ratio > 0.1)  return { name: 13, pct: 14, cap: 8 }
  if (ratio > 0.03) return { name: 11, pct: 12, cap: 8 }
  return { name: 9, pct: 10, cap: 7 }
}

function fmt(v: number) {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1)}조`
  if (abs >= 1) return `${sign}${Math.round(abs).toLocaleString()}억`
  return `${sign}${abs.toFixed(1)}억`
}

function fmtCap(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`
  return `${Math.round(v).toLocaleString()}억`
}

// ─── 범례 ───

const LEGEND = [
  { label: '급등 10%+', color: '#991B1B' },
  { label: '강한상승 5~10%', color: '#DC2626' },
  { label: '상승 2~5%', color: '#EF4444' },
  { label: '소폭 0~2%', color: '#F87171' },
  { label: '보합', color: '#9CA3AF' },
  { label: '소폭하락', color: '#93C5FD' },
  { label: '하락', color: '#60A5FA' },
  { label: '급락', color: '#2563EB' },
]

// ─── treemap 계산 (d3-hierarchy) ───

interface TreemapRect {
  key: string
  x0: number; y0: number; x1: number; y1: number
}

function computeTreemapLayout<T extends { key: string; value: number }>(
  items: T[],
  width: number,
  height: number,
  padding = 2,
): (T & TreemapRect)[] {
  if (items.length === 0 || width <= 0 || height <= 0) return []

  const root = hierarchy({ children: items })
    .sum(d => ('value' in d ? Math.max(d.value as number, 0.01) : 0))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  const layout = treemap<{ children: T[] }>()
    .size([width, height])
    .padding(padding)
    .round(true)
    .tile(treemapSquarify)

  layout(root as any)

  return (root.leaves() as any[]).map(leaf => ({
    ...leaf.data,
    x0: leaf.x0,
    y0: leaf.y0,
    x1: leaf.x1,
    y1: leaf.y1,
  }))
}

// ─── 종목 드릴다운 트리맵 ───

function StockDrilldownGrid({ stocks, sizeBy }: { stocks: TreemapStock[]; sizeBy: SizeBy }) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 400 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      setSize({ w: width, h: Math.max(300, Math.min(width * 0.5, 500)) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const items = useMemo(() => {
    const top50 = stocks.slice(0, 50)
    return top50.map(s => ({
      ...s,
      key: s.ticker,
      value: sizeBy === 'tradingValue' ? s.tradingValue
        : sizeBy === 'changeAbs' ? Math.abs(s.changePercent) * 100 + 1
        : s.marketCap,
    }))
  }, [stocks, sizeBy])

  const rects = useMemo(() => computeTreemapLayout(items, size.w, size.h), [items, size])

  const totalCap = stocks.reduce((s, st) => s + st.marketCap, 0)

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: size.h }}>
      {rects.map(r => {
        const w = r.x1 - r.x0
        const h = r.y1 - r.y0
        const color = getSectorColor(r.changePercent)
        const ratio = r.marketCap / totalCap
        const ts = getTextSize(ratio)
        const sign = r.changePercent >= 0 ? '+' : ''

        return (
          <button
            key={r.key}
            onClick={() => router.push(`/stock/${r.ticker}`)}
            className="absolute overflow-hidden cursor-pointer hover:brightness-110 transition-all"
            style={{
              left: r.x0, top: r.y0, width: w, height: h,
              backgroundColor: color,
              borderRadius: 4,
            }}
          >
            <div className="flex flex-col items-center justify-center h-full px-1" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {h > 30 && <div className="font-bold truncate w-full text-center" style={{ fontSize: Math.min(ts.name, w / 5) }}>{r.name}</div>}
              {h > 20 && <div className="font-black tabular-nums" style={{ fontSize: Math.min(ts.pct, w / 4) }}>{sign}{r.changePercent.toFixed(2)}%</div>}
              {h > 45 && w > 50 && <div className="opacity-70" style={{ fontSize: 7 }}>{r.ticker}</div>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── 드릴다운 카드 ───

function SectorDrillDown({ sector, sizeBy, onClose }: { sector: TreemapSector; sizeBy: SizeBy; onClose: () => void }) {
  const sign = sector.avgChange >= 0 ? '+' : ''
  const changeColor = sector.avgChange >= 0 ? '#DC2626' : '#2563EB'

  const foreignTotal = sector.stocks.reduce((s, st) => s + st.foreignNet, 0)
  const instTotal = sector.stocks.reduce((s, st) => s + st.instNet, 0)

  return (
    <div className="fx-card-green animate-[slideDown_0.3s_ease]">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-[#1A1A2E]">{sector.name}</span>
          <span className="text-sm font-black tabular-nums" style={{ color: changeColor }}>
            {sign}{sector.avgChange.toFixed(2)}%
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[10px] font-medium text-[#00CC6A] px-3 py-1 border border-[#00FF88] rounded-md hover:bg-[#E8F5E9] transition-colors"
        >
          ← 전체 섹터로
        </button>
      </div>

      {/* 메타 */}
      <div className="flex gap-2 md:gap-3 text-[10px] text-[#6B7280] mb-3 flex-wrap">
        <span><b className="text-[#1A1A2E]">{sector.stocks.length}</b>종목</span>
        <span>시총 <b className="text-[#1A1A2E]">{fmtCap(sector.marketCap)}</b></span>
        <span>외국인 <b className={foreignTotal >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>{fmt(foreignTotal)}</b></span>
        <span>기관 <b className={instTotal >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>{fmt(instTotal)}</b></span>
      </div>

      {/* 종목 트리맵 */}
      <StockDrilldownGrid stocks={sector.stocks} sizeBy={sizeBy} />

      {/* 하단 링크 */}
      {SECTOR_NAME_TO_KEY[sector.name] && (
        <div className="mt-3 text-center">
          <a
            href={`/sectors/${SECTOR_NAME_TO_KEY[sector.name]}`}
            className="text-[11px] font-bold text-[var(--blue)] hover:underline"
          >
            {sector.name} {sector.stocks.length}종목 전체 리스트 보기 →
          </a>
        </div>
      )}
    </div>
  )
}

// ─── 메인: 22개 섹터 트리맵 그리드 ───

interface SectorTreemapGridProps {
  sectors: TreemapSector[]
  sizeBy: SizeBy
}

export function SectorTreemapGrid({ sectors, sizeBy }: SectorTreemapGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1000, h: 600 })
  const [selectedSector, setSelectedSector] = useState<string | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      setSize({ w: width, h: Math.max(400, Math.min(width * 0.55, 700)) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const sectorItems = useMemo(() =>
    sectors.filter(s => s.name !== '기타').map(s => ({
      ...s,
      key: s.name,
      value: sizeBy === 'tradingValue' ? s.tradingValue
        : sizeBy === 'changeAbs' ? Math.abs(s.avgChange) * 100 + 1
        : s.marketCap,
    })),
    [sectors, sizeBy]
  )

  const rects = useMemo(() => computeTreemapLayout(sectorItems, size.w, size.h, 3), [sectorItems, size])

  const totalCap = sectorItems.reduce((s, si) => s + si.marketCap, 0)

  const selectedData = selectedSector
    ? sectors.find(s => s.name === selectedSector) ?? null
    : null

  function handleClick(name: string) {
    setSelectedSector(prev => prev === name ? null : name)
  }

  return (
    <div className="space-y-3">
      {/* 22개 섹터 트리맵 */}
      <div ref={containerRef} className="relative w-full rounded-lg overflow-hidden" style={{ height: size.h }}>
        {rects.map(r => {
          const w = r.x1 - r.x0
          const h = r.y1 - r.y0
          const color = getSectorColor(r.avgChange)
          const ratio = r.marketCap / totalCap
          const ts = getTextSize(ratio)
          const sign = r.avgChange >= 0 ? '+' : ''
          const isSelected = selectedSector === r.key

          return (
            <button
              key={r.key}
              onClick={() => handleClick(r.key)}
              className="absolute overflow-hidden cursor-pointer hover:brightness-110 transition-all"
              style={{
                left: r.x0, top: r.y0, width: w, height: h,
                backgroundColor: color,
                borderRadius: 4,
                boxShadow: isSelected ? '0 0 0 3px #00FF88' : 'none',
                zIndex: isSelected ? 1 : 0,
              }}
            >
              <div className="flex flex-col items-center justify-center h-full px-1" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {h > 30 && <div className="font-bold truncate w-full text-center" style={{ fontSize: Math.min(ts.name, w / 5) }}>{r.name}</div>}
                <div className="font-black tabular-nums" style={{ fontSize: Math.min(ts.pct, w / 4) }}>{sign}{r.avgChange.toFixed(2)}%</div>
                {h > 50 && w > 60 && <div className="opacity-60" style={{ fontSize: ts.cap }}>시총 {fmtCap(r.marketCap)}</div>}
              </div>
            </button>
          )
        })}
      </div>

      {/* 드릴다운 */}
      {selectedData && (
        <SectorDrillDown
          sector={selectedData}
          sizeBy={sizeBy}
          onClose={() => setSelectedSector(null)}
        />
      )}

      {/* 범례 */}
      <div className="flex items-center justify-center gap-2 flex-wrap py-2">
        {LEGEND.map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-[var(--text-muted)]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
