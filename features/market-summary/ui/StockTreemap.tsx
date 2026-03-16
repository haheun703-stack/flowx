'use client'

import { useMemo, useState } from 'react'
import { hierarchy, treemap, treemapSquarify, HierarchyRectangularNode } from 'd3-hierarchy'
import { TreemapSector } from '../model/useTreemap'

export type SizeBy = 'marketCap' | 'tradingValue' | 'changeAbs'

const WIDTH = 1200
const HEIGHT = 900
const FONT = 'var(--font-jetbrains), monospace'

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

/** 박스 크기에 맞는 폰트 크기 계산 */
function fitFontSize(text: string, boxW: number, boxH: number, maxSize: number): number {
  const charW = text.length * 0.6
  const byWidth = (boxW * 0.85) / charW
  const byHeight = boxH * 0.65
  return Math.min(byWidth, byHeight, maxSize)
}

/** 박스 너비에 맞게 텍스트 자르기 */
function truncate(text: string, boxW: number, fontSize: number): string {
  const maxChars = Math.floor((boxW * 0.85) / (fontSize * 0.6))
  if (text.length <= maxChars) return text
  if (maxChars <= 2) return text.slice(0, 1)
  return text.slice(0, maxChars - 1) + '..'
}

export interface LeafNode {
  ticker: string
  name: string
  sector: string
  marketCap: number
  changePercent: number
  tradingValue: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RectNode = HierarchyRectangularNode<any>

function getSizeValue(stock: LeafNode, sizeBy: SizeBy): number {
  switch (sizeBy) {
    case 'marketCap': return stock.marketCap
    case 'tradingValue': return stock.tradingValue || 1
    case 'changeAbs': return Math.abs(stock.changePercent) * 100 + 1 // 0% 방지
  }
}

interface StockTreemapProps {
  sectors: TreemapSector[]
  sizeBy?: SizeBy
  selectedTicker?: string | null
  onStockClick?: (stock: LeafNode) => void
}

export function StockTreemap({ sectors, sizeBy = 'marketCap', selectedTicker, onStockClick }: StockTreemapProps) {
  const [tooltip, setTooltip] = useState<{ cx: number; top: number; stock: LeafNode } | null>(null)

  const { leaves, sectorLabels } = useMemo(() => {
    if (!sectors.length) return { leaves: [], sectorLabels: [] }

    const root = hierarchy({
      name: 'root',
      children: sectors.map(sec => ({
        name: sec.name,
        children: sec.stocks.map(s => ({
          name: s.name,
          value: getSizeValue({ ...s, sector: sec.name } as LeafNode, sizeBy),
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
    }))

    const sectorLabels = (rectRoot.children ?? []).map((node: RectNode) => ({
      name: node.data.name as string,
      x0: node.x0,
      y0: node.y0,
      x1: node.x1,
    }))

    return { leaves, sectorLabels }
  }, [sectors, sizeBy])

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
            fill="#fbbf24"
            style={{ fontSize: 13, fontWeight: 900, fontFamily: FONT }}
          >
            {sec.name}
          </text>
        ))}

        {/* 종목 박스 */}
        {leaves.map((leaf) => {
          const w = leaf.x1 - leaf.x0
          const h = leaf.y1 - leaf.y0
          const d = leaf.data
          const isSelected = selectedTicker === d.ticker

          const tooSmall = w < 28 || h < 16

          const pctText = `${d.changePercent >= 0 ? '+' : ''}${d.changePercent.toFixed(2)}%`
          let lines: { text: string; fill: string; bold: boolean }[] = []

          if (!tooSmall) {
            const dim = Math.max(w, h)
            const narrow = Math.min(w, h)
            if (dim > 48 && narrow > 30) {
              lines = [
                { text: d.name, fill: '#e2e8f0', bold: true },
                { text: d.ticker, fill: '#cbd5e1', bold: true },
                { text: pctText, fill: getTextColor(d.changePercent), bold: true },
              ]
            } else if (dim > 32 && narrow > 20) {
              lines = [
                { text: d.name, fill: '#e2e8f0', bold: true },
                { text: pctText, fill: getTextColor(d.changePercent), bold: true },
              ]
            } else {
              lines = [
                { text: pctText, fill: getTextColor(d.changePercent), bold: true },
              ]
            }
          }

          const lineHeight = lines.length > 0 ? Math.min(h * 0.45 / lines.length, 17) : 0
          const totalTextH = lineHeight * lines.length
          const startY = leaf.y0 + (h - totalTextH) / 2 + lineHeight * 0.75

          return (
            <g
              key={d.ticker}
              onMouseEnter={() => {
                setTooltip({ cx: leaf.x0 + w / 2, top: leaf.y0, stock: d })
              }}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onStockClick?.(d)}
              className="cursor-pointer"
            >
              <rect
                x={leaf.x0}
                y={leaf.y0}
                width={w}
                height={h}
                fill={getChangeColor(d.changePercent)}
                stroke={isSelected ? '#fbbf24' : '#0a0f18'}
                strokeWidth={isSelected ? 2 : 1}
                rx={2}
                className="transition-opacity hover:opacity-80"
              />

              <g>
                {lines.map((line, li) => {
                  const fs = fitFontSize(line.text, w, lineHeight, 14)
                  if (fs < 6) return null
                  const displayText = truncate(line.text, w, fs)
                  return (
                    <text
                      key={li}
                      x={leaf.x0 + w / 2}
                      y={startY + li * lineHeight}
                      textAnchor="middle"
                      fill={line.fill}
                      style={{
                        fontSize: fs,
                        fontWeight: line.bold ? 700 : 400,
                        fontFamily: FONT,
                      }}
                    >
                      {displayText}
                    </text>
                  )
                })}
              </g>
            </g>
          )
        })}

        {/* 툴팁 */}
        {tooltip && (() => {
          const TW = 200
          const TH = 72
          const GAP = 6
          let tx = tooltip.cx - TW / 2
          if (tx < 4) tx = 4
          if (tx + TW > WIDTH - 4) tx = WIDTH - 4 - TW
          let ty = tooltip.top - TH - GAP
          if (ty < 4) ty = tooltip.top + GAP

          const tvText = tooltip.stock.tradingValue >= 10000
            ? `${(tooltip.stock.tradingValue / 10000).toFixed(1)}조`
            : `${Math.round(tooltip.stock.tradingValue)}억`

          return (
            <g>
              <rect
                x={tx}
                y={ty}
                width={TW}
                height={TH}
                rx={6}
                fill="#1a2535"
                stroke="#334155"
                strokeWidth={1}
              />
              <text
                x={tx + 10}
                y={ty + 18}
                className="fill-white font-bold"
                style={{ fontSize: 12, fontFamily: FONT }}
              >
                {tooltip.stock.name} ({tooltip.stock.ticker})
              </text>
              <text
                x={tx + 10}
                y={ty + 34}
                className="fill-[#94a3b8]"
                style={{ fontSize: 10, fontFamily: FONT }}
              >
                섹터: {tooltip.stock.sector}
              </text>
              <text
                x={tx + 10}
                y={ty + 50}
                fill={getTextColor(tooltip.stock.changePercent)}
                style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT }}
              >
                {tooltip.stock.changePercent >= 0 ? '+' : ''}{tooltip.stock.changePercent.toFixed(2)}%
                {' · '}시총 {(tooltip.stock.marketCap / 10000).toFixed(1)}조
              </text>
              <text
                x={tx + 10}
                y={ty + 64}
                className="fill-[#64748b]"
                style={{ fontSize: 10, fontFamily: FONT }}
              >
                거래대금 {tvText}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
