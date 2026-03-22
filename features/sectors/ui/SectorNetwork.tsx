'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { TIER_COLORS, CONNECTION_COLOR } from '@/lib/chart-tokens'
import { getDisplayName } from '@/lib/stock-name-ko'
import type { StockNode, SupplyLink } from '../api/useSectorData'

const CANVAS_HEIGHT = 700

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

  // Position zones per tier — 여유 있게 배치
  const pad = 60
  const zones: Record<number, { xMin: number; xMax: number; yMin: number; yMax: number }> = {
    5: { xMin: pad, xMax: width * 0.25, yMin: pad, yMax: height * 0.2 },
    4: { xMin: width * 0.1, xMax: width * 0.85, yMin: height * 0.08, yMax: height * 0.32 },
    3: { xMin: width * 0.55, xMax: width - pad, yMin: height * 0.15, yMax: height * 0.42 },
    2: { xMin: width * 0.15, xMax: width * 0.8, yMin: height * 0.48, yMax: height * 0.68 },
    1: { xMin: pad, xMax: width - pad, yMin: height * 0.72, yMax: height - pad },
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
      // 더 큰 노드: 기본 14, 연결 많을수록 커짐
      const radius = Math.max(14, conns * 4 + 10)
      const row = Math.floor(i / cols)
      const col = i % cols
      const totalRows = Math.ceil(count / cols)

      const x = zone.xMin + (col + 0.5) * (xSpread / cols)
      const y = zone.yMin + (row + 0.5) * (ySpread / Math.max(totalRows, 1))

      nodes.push({
        name: stock.stock_name,
        ticker: stock.ticker,
        tier,
        x: Math.min(Math.max(x, pad), width - pad),
        y: Math.min(Math.max(y, pad), height - pad),
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
  const selectedRef = useRef<string | null>(null)
  const dragRef = useRef<{ node: NetNode; offsetX: number; offsetY: number } | null>(null)
  const needsDrawRef = useRef(true)
  const animRef = useRef<number>(0)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
    const selected = selectedRef.current
    const activeNode = hovered || selected
    const nodeMap = new Map<string, NetNode>()
    for (const n of nodes) nodeMap.set(n.name, n)

    // Find active connections
    const activeConnected = new Set<string>()
    if (activeNode) {
      activeConnected.add(activeNode)
      for (const e of edges) {
        if (e.from === activeNode || e.to === activeNode) {
          activeConnected.add(e.from)
          activeConnected.add(e.to)
        }
      }
    }

    // Draw edges
    for (const e of edges) {
      const from = nodeMap.get(e.from)
      const to = nodeMap.get(e.to)
      if (!from || !to) continue

      const isHL = activeNode && (e.from === activeNode || e.to === activeNode)
      const isDim = activeNode && !isHL

      ctx.beginPath()
      const midX = (from.x + to.x) / 2
      const cpOff = Math.abs(from.y - to.y) * 0.3 + 20
      ctx.moveTo(from.x, from.y)
      ctx.quadraticCurveTo(midX + cpOff * 0.15, (from.y + to.y) / 2 - cpOff * 0.2, to.x, to.y)

      if (isHL) {
        ctx.strokeStyle = CONNECTION_COLOR
        ctx.lineWidth = 2.5
        ctx.globalAlpha = 0.85
      } else if (isDim) {
        ctx.strokeStyle = '#444'
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 0.1
      } else {
        ctx.strokeStyle = '#555'
        ctx.lineWidth = 0.8
        ctx.globalAlpha = 0.3
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // Draw nodes
    for (const node of nodes) {
      const colors = TIER_COLORS[node.tier] ?? TIER_COLORS[1]
      const isHov = node.name === hovered
      const isSel = node.name === selected
      const isConn = activeConnected.has(node.name)
      const isDim = activeNode && !isHov && !isSel && !isConn

      ctx.globalAlpha = isDim ? 0.1 : 1

      // Circle — 선택 시 더 크게
      const drawRadius = (isHov || isSel) ? node.radius + 3 : node.radius
      ctx.beginPath()
      ctx.arc(node.x, node.y, drawRadius, 0, Math.PI * 2)
      ctx.fillStyle = colors.bg
      ctx.fill()
      ctx.strokeStyle = (isHov || isSel) ? CONNECTION_COLOR : colors.badge
      ctx.lineWidth = (isHov || isSel) ? 3 : node.connections >= 5 ? 2.5 : 1.5
      ctx.stroke()

      // 선택된 노드에 glow 효과
      if (isSel) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, drawRadius + 4, 0, Math.PI * 2)
        ctx.strokeStyle = CONNECTION_COLOR
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.4
        ctx.stroke()
        ctx.globalAlpha = isDim ? 0.1 : 1
      }

      // Label — 더 큰 폰트
      const fontSize = node.radius < 18 ? 10 : node.radius < 25 ? 12 : 14
      ctx.font = `bold ${fontSize}px 'Pretendard', -apple-system, sans-serif`
      ctx.fillStyle = '#e2e8f0'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Korean display name
      const displayName = getDisplayName(node.name)
      const maxLen = node.radius < 18 ? 4 : node.radius < 25 ? 6 : 8
      const label = displayName.length > maxLen ? displayName.slice(0, maxLen) + '..' : displayName
      ctx.fillText(label, node.x, node.y)

      ctx.globalAlpha = 1
    }

    // 선택된 노드가 있으면 연결 관계 라벨 표시
    if (selected) {
      for (const e of edges) {
        if (e.from !== selected && e.to !== selected) continue
        const from = nodeMap.get(e.from)
        const to = nodeMap.get(e.to)
        if (!from || !to) continue

        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2 - 10
        ctx.font = `bold 11px 'Pretendard', sans-serif`
        ctx.fillStyle = CONNECTION_COLOR
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(e.relation, mx, my)
      }
    }

    needsDrawRef.current = false
  }, [])

  // Initialize graph
  useEffect(() => {
    if (!containerRef.current) return
    const w = containerRef.current.offsetWidth
    const { nodes, edges } = buildGraph(tiers, links, w, CANVAS_HEIGHT)
    nodesRef.current = nodes
    edgesRef.current = edges
    needsDrawRef.current = true
    draw()
  }, [tiers, links, draw])

  // Animation loop
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
      if (dx * dx + dy * dy <= (n.radius + 6) * (n.radius + 6)) return n
    }
    return null
  }, [])

  // Zoom-safe mouse position
  const getPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    // getBoundingClientRect includes CSS zoom, offsetWidth does not
    const zoom = rect.width / canvas.offsetWidth || 1
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    }
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
            y: pos.y - node.radius - 12,
            text: `${getDisplayName(node.name)} (${node.connections}개 연결)`,
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
        setIsDragging(true)
      }
    },
    [findNode, getPos],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const wasDrag = dragRef.current
      const pos = getPos(e)

      // 드래그 없이 클릭 → 선택 토글
      if (wasDrag) {
        const movedDist = Math.abs(pos.x - (wasDrag.node.x + wasDrag.offsetX)) +
                          Math.abs(pos.y - (wasDrag.node.y + wasDrag.offsetY))
        if (movedDist < 5) {
          // 클릭 (드래그 아님)
          const node = wasDrag.node
          if (selectedRef.current === node.name) {
            selectedRef.current = null
          } else {
            selectedRef.current = node.name
          }
          needsDrawRef.current = true
        }
      } else {
        // 빈 공간 클릭 → 선택 해제
        const node = findNode(pos.x, pos.y)
        if (!node) {
          selectedRef.current = null
          needsDrawRef.current = true
        }
      }

      dragRef.current = null
      setIsDragging(false)
    },
    [findNode, getPos],
  )

  const handleMouseLeave = useCallback(() => {
    dragRef.current = null
    hoveredRef.current = null
    setTooltip(null)
    setIsDragging(false)
    needsDrawRef.current = true
  }, [])

  return (
    <div ref={containerRef} className="relative" style={{ height: CANVAS_HEIGHT }}>
      {/* 안내 텍스트 */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{ fontSize: 13, color: '#777' }}
      >
        원 클릭 → 공급망 연결 확인 · 드래그로 이동
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 px-3 py-1.5 rounded font-bold whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(20, 20, 30, 0.95)',
            color: '#e2e8f0',
            fontSize: 13,
            border: `1px solid ${CONNECTION_COLOR}`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
