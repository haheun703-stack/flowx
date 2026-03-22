'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { TIER_COLORS, CONNECTION_COLOR } from '@/lib/chart-tokens'
import type { StockNode, SupplyLink } from '../api/useSectorData'

interface NetNode {
  name: string
  ticker: string
  tier: number
  x: number
  y: number
  radius: number
  connections: number
}

interface NetEdge {
  from: string
  to: string
  relation: string
  strength: number
}

function buildGraph(
  tiers: Record<number, StockNode[]>,
  links: SupplyLink[],
  width: number,
  height: number,
): { nodes: NetNode[]; edges: NetEdge[] } {
  const connectionCount: Record<string, number> = {}
  for (const link of links) {
    connectionCount[link.from_stock] = (connectionCount[link.from_stock] || 0) + 1
    connectionCount[link.to_stock] = (connectionCount[link.to_stock] || 0) + 1
  }

  // Position zones per tier
  const zones: Record<number, { xMin: number; xMax: number; yMin: number; yMax: number }> = {
    5: { xMin: 40, xMax: width * 0.2, yMin: 30, yMax: height * 0.25 },
    4: { xMin: width * 0.15, xMax: width * 0.75, yMin: 30, yMax: height * 0.4 },
    3: { xMin: width * 0.6, xMax: width - 40, yMin: 30, yMax: height * 0.45 },
    2: { xMin: width * 0.2, xMax: width * 0.75, yMin: height * 0.5, yMax: height * 0.7 },
    1: { xMin: 60, xMax: width - 60, yMin: height * 0.7, yMax: height - 30 },
  }

  const nodes: NetNode[] = []
  for (const tier of [5, 4, 3, 2, 1]) {
    const stocks = tiers[tier] ?? []
    const zone = zones[tier]
    const count = stocks.length
    if (count === 0) continue

    const xSpread = zone.xMax - zone.xMin
    const ySpread = zone.yMax - zone.yMin
    const cols = Math.max(1, Math.ceil(Math.sqrt(count * (xSpread / Math.max(ySpread, 1)))))

    stocks.forEach((stock, i) => {
      const conns = connectionCount[stock.stock_name] || 0
      const radius = Math.max(8, conns * 3 + 6)
      const row = Math.floor(i / cols)
      const col = i % cols
      const totalRows = Math.ceil(count / cols)

      const x = zone.xMin + (col + 0.5) * (xSpread / cols)
      const y = zone.yMin + (row + 0.5) * (ySpread / Math.max(totalRows, 1))

      nodes.push({
        name: stock.stock_name,
        ticker: stock.ticker,
        tier,
        x: Math.min(Math.max(x, 30), width - 30),
        y: Math.min(Math.max(y, 20), height - 20),
        radius,
        connections: conns,
      })
    })
  }

  const edges: NetEdge[] = links.map((l) => ({
    from: l.from_stock,
    to: l.to_stock,
    relation: l.relation,
    strength: l.strength,
  }))

  return { nodes, edges }
}

export function SectorNetwork({
  tiers,
  links,
}: {
  tiers: Record<number, StockNode[]>
  links: SupplyLink[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<NetNode[]>([])
  const edgesRef = useRef<NetEdge[]>([])
  const hoveredRef = useRef<string | null>(null)
  const dragRef = useRef<{ node: NetNode; offsetX: number; offsetY: number } | null>(null)
  const needsDrawRef = useRef(true)
  const animRef = useRef<number>(0)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const nodes = nodesRef.current
    const edges = edgesRef.current
    const hovered = hoveredRef.current
    const nodeMap = new Map<string, NetNode>()
    for (const n of nodes) nodeMap.set(n.name, n)

    // Find hovered connections
    const hovConnected = new Set<string>()
    if (hovered) {
      hovConnected.add(hovered)
      for (const e of edges) {
        if (e.from === hovered || e.to === hovered) {
          hovConnected.add(e.from)
          hovConnected.add(e.to)
        }
      }
    }

    // Draw edges
    for (const e of edges) {
      const from = nodeMap.get(e.from)
      const to = nodeMap.get(e.to)
      if (!from || !to) continue

      const isHL = hovered && (e.from === hovered || e.to === hovered)
      const isDim = hovered && !isHL

      ctx.beginPath()
      const midX = (from.x + to.x) / 2
      const cpOff = Math.abs(from.y - to.y) * 0.3 + 15
      ctx.moveTo(from.x, from.y)
      ctx.quadraticCurveTo(midX + cpOff * 0.15, (from.y + to.y) / 2 - cpOff * 0.2, to.x, to.y)

      if (isHL) {
        ctx.strokeStyle = CONNECTION_COLOR
        ctx.lineWidth = 1.8
        ctx.globalAlpha = 0.8
      } else if (isDim) {
        ctx.strokeStyle = '#444'
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 0.15
      } else {
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 0.7
        ctx.globalAlpha = 0.25
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // Draw nodes
    for (const node of nodes) {
      const colors = TIER_COLORS[node.tier] ?? TIER_COLORS[1]
      const isHov = node.name === hovered
      const isConn = hovConnected.has(node.name)
      const isDim = hovered && !isHov && !isConn

      ctx.globalAlpha = isDim ? 0.12 : 1

      // Circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
      ctx.fillStyle = colors.bg
      ctx.fill()
      ctx.strokeStyle = isHov ? CONNECTION_COLOR : colors.badge
      ctx.lineWidth = node.connections >= 5 ? 2.5 : 1.5
      ctx.stroke()

      // Label
      const fontSize = node.radius < 16 ? 7 : 9
      ctx.font = `${fontSize}px 'Pretendard', -apple-system, sans-serif`
      ctx.fillStyle = colors.text
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Truncate long names
      const maxLen = node.radius < 12 ? 4 : 8
      const label = node.name.length > maxLen ? node.name.slice(0, maxLen) + '..' : node.name
      ctx.fillText(label, node.x, node.y)

      ctx.globalAlpha = 1
    }

    needsDrawRef.current = false
  }, [])

  // Initialize graph
  useEffect(() => {
    if (!containerRef.current) return
    const w = containerRef.current.offsetWidth
    const h = 480
    const { nodes, edges } = buildGraph(tiers, links, w, h)
    nodesRef.current = nodes
    edgesRef.current = edges
    needsDrawRef.current = true
    draw()
  }, [tiers, links, draw])

  // Animation loop (only when needed)
  useEffect(() => {
    let active = true
    const loop = () => {
      if (!active) return
      if (needsDrawRef.current) draw()
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => {
      active = false
      cancelAnimationFrame(animRef.current)
    }
  }, [draw])

  const findNode = useCallback((x: number, y: number): NetNode | null => {
    const nodes = nodesRef.current
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      const dx = x - n.x
      const dy = y - n.y
      if (dx * dx + dy * dy <= (n.radius + 4) * (n.radius + 4)) return n
    }
    return null
  }, [])

  const getPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getPos(e)

      if (dragRef.current) {
        dragRef.current.node.x = pos.x - dragRef.current.offsetX
        dragRef.current.node.y = pos.y - dragRef.current.offsetY
        needsDrawRef.current = true
        return
      }

      const node = findNode(pos.x, pos.y)
      const prev = hoveredRef.current
      hoveredRef.current = node?.name ?? null

      if (hoveredRef.current !== prev) {
        needsDrawRef.current = true
        if (node) {
          setTooltip({
            x: pos.x,
            y: pos.y - 20,
            text: `${node.name} (${node.connections} connections)`,
          })
        } else {
          setTooltip(null)
        }
      }
    },
    [findNode, getPos],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = getPos(e)
      const node = findNode(pos.x, pos.y)
      if (node) {
        dragRef.current = {
          node,
          offsetX: pos.x - node.x,
          offsetY: pos.y - node.y,
        }
      }
    },
    [findNode, getPos],
  )

  const handleMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const handleMouseLeave = useCallback(() => {
    dragRef.current = null
    hoveredRef.current = null
    setTooltip(null)
    needsDrawRef.current = true
  }, [])

  return (
    <div ref={containerRef} className="relative" style={{ height: 480 }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: dragRef.current ? 'grabbing' : 'grab' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(44, 44, 42, 0.95)',
            color: '#e2e8f0',
            border: `1px solid ${CONNECTION_COLOR}`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
