'use client'

import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { TIER_COLORS, TIER_LABELS, CONNECTION_COLOR } from '@/lib/chart-tokens'
import { getDisplayName } from '@/lib/stock-name-ko'
import type { StockNode, SupplyLink } from '../api/useSectorData'

/* ── Stock Card ── */
const StockCard = memo(function StockCard({
  stock,
  isHighlighted,
  isDimmed,
  badge,
  onClick,
}: {
  stock: StockNode
  isHighlighted: boolean
  isDimmed: boolean
  badge?: string
  onClick: () => void
}) {
  const colors = TIER_COLORS[stock.tier] ?? TIER_COLORS[1]
  const isUp = stock.change_pct >= 0
  const displayName = getDisplayName(stock.stock_name)

  return (
    <div
      data-stock={stock.stock_name}
      onClick={onClick}
      className="relative cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      style={{
        minWidth: 110,
        padding: '10px 14px',
        borderRadius: 8,
        backgroundColor: colors.bg,
        border: `1.5px solid ${isHighlighted ? CONNECTION_COLOR : colors.border}`,
        opacity: isDimmed ? 0.12 : 1,
        transform: isHighlighted ? 'translateY(-2px)' : undefined,
        boxShadow: isHighlighted ? `0 4px 12px ${CONNECTION_COLOR}40` : undefined,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, lineHeight: 1.3 }}>
        {displayName}
      </div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.7, color: colors.text, marginTop: 2 }}>
        {stock.ticker}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: isUp ? '#E24B4A' : '#378ADD', marginTop: 3 }}>
        {isUp ? '+' : ''}{stock.change_pct.toFixed(1)}%
      </div>
      {badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
          style={{
            background: CONNECTION_COLOR,
            color: 'white',
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {badge}
        </div>
      )}
    </div>
  )
})

/* ── Tier Lane ── */
function TierLane({
  tier,
  stocks,
  selectedStock,
  connectedStocks,
  badges,
  onStockClick,
}: {
  tier: number
  stocks: StockNode[]
  selectedStock: string | null
  connectedStocks: Set<string>
  badges: Record<string, string>
  onStockClick: (name: string) => void
}) {
  const colors = TIER_COLORS[tier] ?? TIER_COLORS[1]
  const labels = TIER_LABELS[tier] ?? { label: `T${tier}`, sub: '' }
  const hasSelection = !!selectedStock

  return (
    <div
      className="flex"
      style={{ backgroundColor: `${colors.bg}30`, borderRadius: 8 }}
    >
      {/* Lane Label */}
      <div
        className="shrink-0 flex flex-col items-center justify-center py-4"
        style={{ width: 130, borderRight: `1px solid ${colors.border}40` }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.light }}>
          {'★'.repeat(tier)}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.light, marginTop: 2 }}>
          {labels.label}
        </div>
        <div style={{ fontSize: 11, color: colors.light, opacity: 0.8, marginTop: 2 }}>
          {labels.sub}
        </div>
        <div style={{ fontSize: 11, color: colors.light, opacity: 0.6, marginTop: 4 }}>
          {stocks.length}종목
        </div>
      </div>

      {/* Lane Body */}
      <div className="flex-1 flex flex-wrap gap-2 p-3 items-start">
        {stocks.map((stock) => {
          const name = stock.stock_name
          const isSelected = selectedStock === name
          const isConnected = connectedStocks.has(name)
          const isDimmed = hasSelection && !isSelected && !isConnected
          const isHighlighted = isSelected || isConnected

          return (
            <StockCard
              key={stock.id || stock.ticker}
              stock={stock}
              isHighlighted={isHighlighted}
              isDimmed={isDimmed}
              badge={badges[name]}
              onClick={() => onStockClick(name)}
            />
          )
        })}
      </div>
    </div>
  )
}

/* ── Flow Arrow ── */
function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-2 gap-3">
      <div className="flex-1 h-px bg-[#444]" />
      <span style={{ fontSize: 12, color: '#999' }} className="whitespace-nowrap">▼ {label}</span>
      <div className="flex-1 h-px bg-[#444]" />
    </div>
  )
}

/* ── Main Component ── */
export function SectorSwimlane({
  stocks,
  links,
  tiers,
}: {
  stocks: StockNode[]
  links: SupplyLink[]
  tiers: Record<number, StockNode[]>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [connectedStocks, setConnectedStocks] = useState<Set<string>>(new Set())
  const [badges, setBadges] = useState<Record<string, string>>({})
  const [paths, setPaths] = useState<{ d: string; key: string }[]>([])
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 })

  const tierOrder = [5, 4, 3, 2, 1]
  const flowLabels: Record<number, string> = {
    5: '벤치마크',
    4: '공급망',
    3: '한국시장',
    2: '소부장',
  }

  // Draw SVG connection bezier curves (zoom-safe)
  const drawConnections = useCallback(
    (stockName: string, connected: Set<string>) => {
      if (!containerRef.current) return
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      // Detect CSS zoom by comparing rendered vs CSS size
      const zoom = rect.width / container.offsetWidth || 1
      const newPaths: { d: string; key: string }[] = []

      const fromEl = container.querySelector(
        `[data-stock="${CSS.escape(stockName)}"]`
      ) as HTMLElement | null
      if (!fromEl) return

      connected.forEach((targetName) => {
        const toEl = container.querySelector(
          `[data-stock="${CSS.escape(targetName)}"]`
        ) as HTMLElement | null
        if (!toEl) return

        const fromR = fromEl.getBoundingClientRect()
        const toR = toEl.getBoundingClientRect()
        // Convert viewport pixels → CSS pixels (undo zoom)
        const sx = (fromR.left - rect.left + fromR.width / 2) / zoom
        const sy = (fromR.top - rect.top + fromR.height / 2) / zoom
        const ex = (toR.left - rect.left + toR.width / 2) / zoom
        const ey = (toR.top - rect.top + toR.height / 2) / zoom
        const midY = (sy + ey) / 2

        newPaths.push({
          d: `M${sx} ${sy} C${sx} ${midY} ${ex} ${midY} ${ex} ${ey}`,
          key: `${stockName}-${targetName}`,
        })
      })

      setPaths(newPaths)
    },
    [],
  )

  const handleStockClick = useCallback(
    (stockName: string) => {
      if (selectedStock === stockName) {
        setSelectedStock(null)
        setConnectedStocks(new Set())
        setBadges({})
        setPaths([])
        return
      }

      const connected = new Set<string>()
      const newBadges: Record<string, string> = {}

      for (const link of links) {
        if (link.from_stock === stockName) {
          connected.add(link.to_stock)
          newBadges[link.to_stock] = link.relation
        }
        if (link.to_stock === stockName) {
          connected.add(link.from_stock)
          newBadges[link.from_stock] = link.relation
        }
      }

      setSelectedStock(stockName)
      setConnectedStocks(connected)
      setBadges(newBadges)

      requestAnimationFrame(() => drawConnections(stockName, connected))
    },
    [links, selectedStock, drawConnections],
  )

  // Click outside to deselect
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-stock]')) return
      setSelectedStock(null)
      setConnectedStocks(new Set())
      setBadges({})
      setPaths([])
    },
    [],
  )

  // Track container size for SVG overlay (use offsetWidth for zoom-safe CSS pixels)
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(() => {
      if (containerRef.current) {
        setSvgSize({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        })
      }
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Redraw connections when size changes
  useEffect(() => {
    if (selectedStock && connectedStocks.size > 0) {
      drawConnections(selectedStock, connectedStocks)
    }
  }, [svgSize, selectedStock, connectedStocks, drawConnections])

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={handleContainerClick}
    >
      {/* Connection hint — 상단 */}
      {!selectedStock && links.length > 0 && (
        <div className="text-center py-2 mb-1" style={{ fontSize: 13, color: '#aaa' }}>
          종목 클릭 → 공급망 연결 확인
        </div>
      )}

      {/* SVG overlay for connection lines */}
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none z-10"
        width={svgSize.w}
        height={svgSize.h}
        style={{ overflow: 'visible' }}
      >
        {paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill="none"
            stroke={CONNECTION_COLOR}
            strokeWidth={2}
            strokeDasharray="6 4"
            opacity={0.8}
          />
        ))}
        {/* Source dot (zoom-safe) */}
        {selectedStock && (() => {
          if (!containerRef.current) return null
          const el = containerRef.current.querySelector(
            `[data-stock="${CSS.escape(selectedStock)}"]`
          )
          if (!el) return null
          const rect = containerRef.current.getBoundingClientRect()
          const zoom = rect.width / containerRef.current.offsetWidth || 1
          const r = el.getBoundingClientRect()
          return (
            <circle
              cx={(r.left - rect.left + r.width / 2) / zoom}
              cy={(r.top - rect.top + r.height / 2) / zoom}
              r={5}
              fill="#534AB7"
            />
          )
        })()}
        {/* Target dots (zoom-safe) */}
        {connectedStocks.size > 0 && (() => {
          if (!containerRef.current) return null
          const rect = containerRef.current.getBoundingClientRect()
          const zoom = rect.width / containerRef.current.offsetWidth || 1
          return Array.from(connectedStocks).map((name) => {
            const el = containerRef.current?.querySelector(
              `[data-stock="${CSS.escape(name)}"]`
            )
            if (!el) return null
            const r = el.getBoundingClientRect()
            return (
              <circle
                key={name}
                cx={(r.left - rect.left + r.width / 2) / zoom}
                cy={(r.top - rect.top + r.height / 2) / zoom}
                r={4}
                fill={CONNECTION_COLOR}
              />
            )
          })
        })()}
      </svg>

      {/* Tier lanes */}
      <div className="flex flex-col gap-0">
        {tierOrder.map((tier, i) => {
          const tierStocks = tiers[tier] ?? []
          if (tierStocks.length === 0) return null
          return (
            <div key={tier}>
              <TierLane
                tier={tier}
                stocks={tierStocks}
                selectedStock={selectedStock}
                connectedStocks={connectedStocks}
                badges={badges}
                onStockClick={handleStockClick}
              />
              {i < tierOrder.length - 1 && flowLabels[tier] && (
                <FlowArrow label={flowLabels[tier]} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
