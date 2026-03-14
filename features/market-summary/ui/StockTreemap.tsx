'use client'

import { useMemo, useState } from 'react'
import { hierarchy, treemap, treemapSquarify, HierarchyRectangularNode } from 'd3-hierarchy'
import { TreemapSector } from '../model/useTreemap'

const WIDTH = 1200
const HEIGHT = 700

function getChangeColor(pct: number): string {
  if (pct >= 3) return 'rgba(255,59,92,0.55)'
  if (pct >= 2) return 'rgba(255,59,92,0.40)'
  if (pct >= 1) return 'rgba(255,59,92,0.28)'
  if (pct > 0) return 'rgba(255,59,92,0.15)'
  if (pct === 0) return 'rgba(100,116,139,0.2)'
  if (pct > -1) return 'rgba(14,165,233,0.15)'
  if (pct > -2) return 'rgba(14,165,233,0.28)'
  if (pct > -3) return 'rgba(14,165,233,0.40)'
  return 'rgba(14,165,233,0.55)'
}

function getTextColor(pct: number): string {
  if (pct > 0) return '#ff3b5c'
  if (pct < 0) return '#0ea5e9'
  return '#64748b'
}

interface LeafNode {
  ticker: string
  name: string
  sector: string
  marketCap: number
  changePercent: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RectNode = HierarchyRectangularNode<any>

export function StockTreemap({ sectors }: { sectors: TreemapSector[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; stock: LeafNode } | null>(null)

  const { leaves, sectorLabels } = useMemo(() => {
    if (!sectors.length) return { leaves: [], sectorLabels: [] }

    const root = hierarchy({
      name: 'root',
      children: sectors.map(sec => ({
        name: sec.name,
        children: sec.stocks.map(s => ({
          name: s.name,
          value: s.marketCap,
          _data: { ...s, sector: sec.name } as LeafNode,
        })),
      })),
    })
      .sum((d: any) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    treemap()
      .size([WIDTH, HEIGHT])
      .paddingTop(18)
      .paddingInner(2)
      .paddingOuter(3)
      .tile(treemapSquarify)(root as any)

    const rectRoot = root as unknown as RectNode

    const leaves = rectRoot.leaves().map((leaf: RectNode) => ({
      x0: leaf.x0,
      y0: leaf.y0,
      x1: leaf.x1,
      y1: leaf.y1,
      data: leaf.data._data as LeafNode,
      parent: leaf.parent?.data?.name ?? '',
    }))

    const sectorLabels = (rectRoot.children ?? []).map((node: RectNode) => ({
      name: node.data.name as string,
      x0: node.x0,
      y0: node.y0,
      x1: node.x1,
    }))

    return { leaves, sectorLabels }
  }, [sectors])

  if (!sectors.length) {
    return (
      <div className="flex items-center justify-center h-full text-[#334155] text-sm">
        데이터 로딩중...
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-full"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* 섹터 라벨 */}
        {sectorLabels.map(sec => (
          <text
            key={sec.name}
            x={sec.x0 + 4}
            y={sec.y0 + 13}
            className="fill-[#94a3b8] font-bold"
            style={{ fontSize: 11, fontFamily: 'var(--font-jetbrains), monospace' }}
          >
            {sec.name}
          </text>
        ))}

        {/* 종목 박스 */}
        {leaves.map(leaf => {
          const w = leaf.x1 - leaf.x0
          const h = leaf.y1 - leaf.y0
          const d = leaf.data
          const showName = w > 50 && h > 24
          const showTicker = w > 70 && h > 38
          const showPercent = w > 40 && h > 20

          return (
            <g
              key={d.ticker}
              onMouseEnter={e => {
                const svg = e.currentTarget.ownerSVGElement
                if (!svg) return
                const pt = svg.createSVGPoint()
                pt.x = e.clientX
                pt.y = e.clientY
                const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse())
                setTooltip({ x: svgPt.x, y: svgPt.y, stock: d })
              }}
              onMouseLeave={() => setTooltip(null)}
              className="cursor-pointer"
            >
              <rect
                x={leaf.x0}
                y={leaf.y0}
                width={w}
                height={h}
                fill={getChangeColor(d.changePercent)}
                stroke="#0a0f18"
                strokeWidth={1}
                rx={2}
                className="transition-opacity hover:opacity-80"
              />
              {showName && (
                <text
                  x={leaf.x0 + w / 2}
                  y={leaf.y0 + (showTicker ? h / 2 - 6 : h / 2 + 1)}
                  textAnchor="middle"
                  className="fill-[#e2e8f0] font-bold"
                  style={{
                    fontSize: w > 100 ? 12 : 10,
                    fontFamily: 'var(--font-jetbrains), monospace',
                  }}
                >
                  {d.name.length > 8 && w < 90 ? d.name.slice(0, 6) + '..' : d.name}
                </text>
              )}
              {showTicker && (
                <text
                  x={leaf.x0 + w / 2}
                  y={leaf.y0 + h / 2 + 8}
                  textAnchor="middle"
                  className="fill-[#64748b]"
                  style={{ fontSize: 9, fontFamily: 'var(--font-jetbrains), monospace' }}
                >
                  {d.ticker}
                </text>
              )}
              {showPercent && (
                <text
                  x={leaf.x0 + w / 2}
                  y={leaf.y0 + h / 2 + (showTicker ? 20 : showName ? 14 : 4)}
                  textAnchor="middle"
                  fill={getTextColor(d.changePercent)}
                  style={{
                    fontSize: w > 80 ? 12 : 10,
                    fontWeight: 700,
                    fontFamily: 'var(--font-jetbrains), monospace',
                  }}
                >
                  {d.changePercent >= 0 ? '+' : ''}{d.changePercent.toFixed(2)}%
                </text>
              )}
            </g>
          )
        })}

        {/* 툴팁 */}
        {tooltip && (
          <g>
            <rect
              x={Math.min(tooltip.x + 10, WIDTH - 180)}
              y={Math.min(tooltip.y - 50, HEIGHT - 70)}
              width={170}
              height={62}
              rx={6}
              fill="#1a2535"
              stroke="#334155"
              strokeWidth={1}
            />
            <text
              x={Math.min(tooltip.x + 18, WIDTH - 172)}
              y={Math.min(tooltip.y - 32, HEIGHT - 52)}
              className="fill-white font-bold"
              style={{ fontSize: 12, fontFamily: 'var(--font-jetbrains), monospace' }}
            >
              {tooltip.stock.name} ({tooltip.stock.ticker})
            </text>
            <text
              x={Math.min(tooltip.x + 18, WIDTH - 172)}
              y={Math.min(tooltip.y - 16, HEIGHT - 36)}
              className="fill-[#94a3b8]"
              style={{ fontSize: 10, fontFamily: 'var(--font-jetbrains), monospace' }}
            >
              섹터: {tooltip.stock.sector}
            </text>
            <text
              x={Math.min(tooltip.x + 18, WIDTH - 172)}
              y={Math.min(tooltip.y, HEIGHT - 20)}
              fill={getTextColor(tooltip.stock.changePercent)}
              style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-jetbrains), monospace' }}
            >
              {tooltip.stock.changePercent >= 0 ? '+' : ''}{tooltip.stock.changePercent.toFixed(2)}%
              {' · '}시총 {(tooltip.stock.marketCap / 10000).toFixed(1)}조원
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
