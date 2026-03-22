'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { TIER_COLORS } from '@/lib/chart-tokens'
import { getDisplayName } from '@/lib/stock-name-ko'
import type { StockNode, SupplyLink } from '../api/useSectorData'

const CANVAS_HEIGHT = 700

// ── 문제 4: 연결 라벨 한국어 쉬운 말 ──
const RELATION_KO: Record<string, string> = {
  'ETF 구성': 'ETF에 포함',
  'HBM/파운드리': 'HBM 메모리 납품',
  '장비 공급': '반도체 장비 납품',
  '광학/노광 장비': '노광장비 납품',
  '파운드리/HBM': '위탁생산/메모리',
  '메모리 경쟁/소재': '메모리 경쟁사',
  '증착/식각 장비': '증착·식각 장비 납품',
  '식각/세정 장비': '식각·세정 장비 납품',
  '검사/테스트 장비': '검사장비 납품',
  '장비/패키징 납품': '장비·패키징 납품',
  '파운드리 장비': '파운드리 장비 납품',
  '테스트 소켓': '테스트 소켓 납품',
  'F-35 공급망': 'F-35 전투기 부품',
  '미사일/레이더': '미사일·레이더 기술',
  '무인기/우주': '무인기·우주 기술',
  '장갑차량': '전차·장갑차 부품',
  '항공엔진/부품': '항공엔진·부품 납품',
  '유도무기/통신': '유도무기·통신 장비',
  'K2 전차 부품': 'K2 전차 부품 납품',
  '그룹사/엔진': '그룹사 엔진 공급',
  'LNG 단열/배관': 'LNG선 단열·배관',
  '그룹사 엔진': '그룹사 엔진 공급',
  '엔진 라이선스': '엔진 기술 라이선스',
  '엔진 기술제휴': '엔진 기술 제휴',
  'CMO 위탁생산': '바이오의약품 위탁생산',
  '바이오시밀러 경쟁': '바이오시밀러 경쟁사',
  '피하주사 기술제휴': '피하주사 플랫폼 제휴',
  'ADC 기술협력': '항체약물접합 기술협력',
  '원료의약품': '원료의약품 공급',
  '신약 라이선스': '신약 기술 라이선스',
  'EV 경쟁/부품': '전기차 경쟁·부품',
  '그룹사 부품': '그룹사 부품 납품',
  '자율주행 협력': '자율주행 기술 협력',
  '전장부품 기술': '전장부품 기술 제휴',
}

function getRelationKo(rel: string): string {
  return RELATION_KO[rel] || rel
}

// ── 티어 한국어 이름 (툴팁용) ──
const TIER_KO: Record<number, string> = {
  5: '글로벌 ETF',
  4: '글로벌 대장주',
  3: '소부장·장비',
  2: '한국 대형주',
  1: '한국 소부장',
}

interface NetNode {
  name: string
  ticker: string
  tier: number
  x: number
  y: number
  radius: number
  connections: number
  change_pct: number
  foreign_net: number
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

  // ── 문제 3: 티어별 y 좌표 더 넓게 분산 ──
  const pad = 60
  const zones: Record<number, { xMin: number; xMax: number; yMin: number; yMax: number }> = {
    5: { xMin: pad, xMax: width * 0.25, yMin: pad, yMax: height * 0.15 },
    4: { xMin: width * 0.1, xMax: width * 0.85, yMin: height * 0.18, yMax: height * 0.32 },
    3: { xMin: width * 0.55, xMax: width - pad, yMin: height * 0.36, yMax: height * 0.52 },
    2: { xMin: width * 0.15, xMax: width * 0.8, yMin: height * 0.56, yMax: height * 0.72 },
    1: { xMin: pad, xMax: width - pad, yMin: height * 0.76, yMax: height - pad },
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
      // ── 문제 1: 최소 radius 25px ──
      const radius = Math.max(25, conns * 4 + 14)
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
        change_pct: stock.change_pct,
        foreign_net: stock.foreign_net,
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
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    name: string
    tierLabel: string
    connections: number
    change_pct: number
    foreign_net: number
  } | null>(null)
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

    // ── Draw edges (문제 5: 연결선 색상 더 밝게) ──
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
        ctx.strokeStyle = '#A78BFA' // 밝은 보라
        ctx.lineWidth = 2.5
        ctx.globalAlpha = 0.9
      } else if (isDim) {
        ctx.strokeStyle = '#4B5563'
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 0.15
      } else {
        ctx.strokeStyle = '#4B5563'
        ctx.lineWidth = 0.8
        ctx.globalAlpha = 0.35
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // ── Draw nodes (문제 1: 텍스트 시인성 개선) ──
    for (const node of nodes) {
      const colors = TIER_COLORS[node.tier] ?? TIER_COLORS[1]
      const isHov = node.name === hovered
      const isSel = node.name === selected
      const isConn = activeConnected.has(node.name)
      const isDim = activeNode && !isHov && !isSel && !isConn

      // dim 상태에서도 opacity 0.4 이상 유지
      ctx.globalAlpha = isDim ? 0.4 : 1

      // Circle
      const drawRadius = (isHov || isSel) ? node.radius + 3 : node.radius
      ctx.beginPath()
      ctx.arc(node.x, node.y, drawRadius, 0, Math.PI * 2)
      ctx.fillStyle = colors.bg
      ctx.fill()
      ctx.strokeStyle = (isHov || isSel) ? '#C4B5FD' : colors.badge
      ctx.lineWidth = (isHov || isSel) ? 3 : node.connections >= 5 ? 2.5 : 1.5
      ctx.stroke()

      // 선택된 노드에 glow 효과
      if (isSel) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, drawRadius + 5, 0, Math.PI * 2)
        ctx.strokeStyle = '#A78BFA'
        ctx.lineWidth = 2
        ctx.globalAlpha = isDim ? 0.3 : 0.5
        ctx.stroke()
        ctx.globalAlpha = isDim ? 0.4 : 1
      }

      // Label: 흰색 700 12px, 안 들어가면 아래에
      const displayName = getDisplayName(node.name)
      ctx.font = '700 12px "Pretendard", -apple-system, sans-serif'
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const textWidth = ctx.measureText(displayName).width
      if (textWidth < drawRadius * 1.8) {
        ctx.fillText(displayName, node.x, node.y)
      } else {
        ctx.fillText(displayName, node.x, node.y + drawRadius + 14)
      }

      ctx.globalAlpha = 1
    }

    // ── 선택된 노드: 연결 라벨 (문제 2: 배경 박스 + 노란색) ──
    if (selected) {
      ctx.font = '700 12px "Pretendard", -apple-system, sans-serif'
      let labelIdx = 0
      for (const e of edges) {
        if (e.from !== selected && e.to !== selected) continue
        const from = nodeMap.get(e.from)
        const to = nodeMap.get(e.to)
        if (!from || !to) continue

        const midX = (from.x + to.x) / 2
        const midY = (from.y + to.y) / 2
        // 문제 3: 라벨 겹침 방지 — 짝수/홀수 오프셋
        const offset = (labelIdx % 2 === 0) ? -18 : 18
        const labelY = midY + offset

        const label = getRelationKo(e.relation)
        const labelWidth = ctx.measureText(label).width + 14

        // 배경 박스
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
        ctx.beginPath()
        ctx.roundRect(midX - labelWidth / 2, labelY - 11, labelWidth, 22, 4)
        ctx.fill()

        // 텍스트
        ctx.fillStyle = '#FBBF24'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, midX, labelY)

        labelIdx++
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
            y: pos.y - node.radius - 16,
            name: getDisplayName(node.name),
            tierLabel: `${node.tier}★ ${TIER_KO[node.tier] || ''}`,
            connections: node.connections,
            change_pct: node.change_pct,
            foreign_net: node.foreign_net,
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

      if (wasDrag) {
        const movedDist =
          Math.abs(pos.x - (wasDrag.node.x + wasDrag.offsetX)) +
          Math.abs(pos.y - (wasDrag.node.y + wasDrag.offsetY))
        if (movedDist < 5) {
          const node = wasDrag.node
          if (selectedRef.current === node.name) {
            selectedRef.current = null
          } else {
            selectedRef.current = node.name
          }
          needsDrawRef.current = true
        }
      } else {
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

  // 외인 순매수 포맷
  const formatForeign = (v: number) => {
    if (Math.abs(v) >= 1e8) return `${v > 0 ? '+' : ''}${(v / 1e8).toFixed(0)}억`
    if (Math.abs(v) >= 1e4) return `${v > 0 ? '+' : ''}${(v / 1e4).toFixed(0)}만`
    return `${v > 0 ? '+' : ''}${v.toLocaleString()}`
  }

  return (
    <div ref={containerRef} className="relative" style={{ height: CANVAS_HEIGHT }}>
      {/* 문제 4: 안내 텍스트 한국어 쉬운 말 */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{ fontSize: 13, color: '#777' }}
      >
        종목을 클릭하면 거래관계가 보입니다 · 드래그로 위치 이동
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
      {/* 문제 6: 멀티라인 툴팁 */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#e2e8f0',
            fontSize: 12,
            border: '1px solid #A78BFA',
            borderRadius: 8,
            padding: '10px 14px',
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{tooltip.name}</div>
          <div style={{ color: '#94a3b8' }}>
            {tooltip.tierLabel} · {tooltip.connections}개 거래관계
          </div>
          <div>
            <span style={{ color: tooltip.change_pct >= 0 ? '#ff3b5c' : '#0ea5e9', fontWeight: 700 }}>
              {tooltip.change_pct >= 0 ? '+' : ''}
              {tooltip.change_pct.toFixed(1)}%
            </span>
            <span style={{ color: '#94a3b8', marginLeft: 8 }}>
              외인 {formatForeign(tooltip.foreign_net)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
