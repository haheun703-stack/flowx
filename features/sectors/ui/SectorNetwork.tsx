'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { TIER_COLORS } from '@/lib/chart-tokens'
import { getDisplayName } from '@/lib/stock-name-ko'
import type { StockNode, SupplyLink } from '../api/useSectorData'

/** Dynamic canvas height based on stock count */
function getCanvasHeight(stockCount: number): number {
  if (stockCount > 50) return 850
  if (stockCount > 30) return 700
  if (stockCount > 15) return 550
  return 450
}

// ── 연결 라벨 한국어 쉬운 말 ──
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
  themeTags?: string[]
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

  // ── 동적 레이아웃: 종목 수에 따라 xGap 자동 조절 ──
  const tierYs = [80, 220, 380, 540, 700]
  const nodes: NetNode[] = []

  for (const tier of [5, 4, 3, 2, 1]) {
    const stocks = tiers[tier] ?? []
    if (stocks.length === 0) continue
    const y = tierYs[5 - tier]
    const margin = 60
    const available = width - margin * 2
    const xGap = Math.max(50, Math.min(120, available / Math.max(stocks.length, 1)))
    const totalWidth = (stocks.length - 1) * xGap
    const xStart = Math.max(margin, (width - totalWidth) / 2)

    stocks.forEach((stock, i) => {
      const conns = connectionCount[stock.stock_name] || 0
      const radius = Math.max(20, Math.min(35, conns * 3 + 12))

      const x = xStart + i * xGap
      const yOffset = (i % 3 - 1) * 12
      const yPos = y + yOffset

      nodes.push({
        name: stock.stock_name,
        ticker: stock.ticker,
        tier,
        x: Math.min(Math.max(x, 30), width - 30),
        y: Math.min(Math.max(yPos, 30), height - 30),
        radius,
        connections: conns,
        change_pct: stock.change_pct,
        foreign_net: stock.foreign_net,
        themeTags: stock.theme_tags,
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
  stocks,
  activeTheme,
}: {
  tiers: Record<number, StockNode[]>
  links: SupplyLink[]
  stocks?: StockNode[]
  activeTheme?: string | null
}) {
  const totalStocks = stocks?.length ?? Object.values(tiers).flat().length
  const canvasHeight = getCanvasHeight(totalStocks)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<NetNode[]>([])
  const edgesRef = useRef<NetEdge[]>([])
  const hoveredRef = useRef<string | null>(null)
  const selectedRef = useRef<string | null>(null)
  const dragRef = useRef<{ node: NetNode; offsetX: number; offsetY: number } | null>(null)
  const needsDrawRef = useRef(true)
  const animRef = useRef<number>(0)
  const themeMatchRef = useRef<Set<string>>(new Set())
  const hasThemeRef = useRef(false)

  // Update theme refs when activeTheme changes
  useEffect(() => {
    const set = new Set<string>()
    if (activeTheme && stocks) {
      for (const s of stocks) {
        if (s.theme_tags?.includes(activeTheme)) set.add(s.stock_name)
      }
    }
    themeMatchRef.current = set
    hasThemeRef.current = !!activeTheme && set.size > 0
    needsDrawRef.current = true
  }, [activeTheme, stocks])
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
    const themeSet = themeMatchRef.current
    const hasTheme = hasThemeRef.current

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

    // ── Draw edges ──
    for (const e of edges) {
      const from = nodeMap.get(e.from)
      const to = nodeMap.get(e.to)
      if (!from || !to) continue

      const isHL = activeNode && (e.from === activeNode || e.to === activeNode)
      const isDim = activeNode && !isHL
      const isThemeDim = hasTheme && !activeNode && (!themeSet.has(e.from) || !themeSet.has(e.to))

      ctx.beginPath()
      const midX = (from.x + to.x) / 2
      const cpOff = Math.abs(from.y - to.y) * 0.3 + 20
      ctx.moveTo(from.x, from.y)
      ctx.quadraticCurveTo(midX + cpOff * 0.15, (from.y + to.y) / 2 - cpOff * 0.2, to.x, to.y)

      if (isHL) {
        ctx.strokeStyle = '#A78BFA'
        ctx.lineWidth = 2.5
        ctx.globalAlpha = 0.9
      } else if (isDim || isThemeDim) {
        ctx.strokeStyle = '#4B5563'
        ctx.lineWidth = 0.5
        ctx.globalAlpha = 0.1
      } else {
        ctx.strokeStyle = '#4B5563'
        ctx.lineWidth = 0.8
        ctx.globalAlpha = 0.35
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // ── Draw nodes ──
    for (const node of nodes) {
      const colors = TIER_COLORS[node.tier] ?? TIER_COLORS[1]
      const isHov = node.name === hovered
      const isSel = node.name === selected
      const isConn = activeConnected.has(node.name)
      const isDim = activeNode && !isHov && !isSel && !isConn
      const isThemeDim = hasTheme && !activeNode && !themeSet.has(node.name)

      ctx.globalAlpha = isDim ? 0.35 : isThemeDim ? 0.1 : 1

      // Circle
      const drawRadius = (isHov || isSel) ? node.radius + 3 : node.radius
      ctx.beginPath()
      ctx.arc(node.x, node.y, drawRadius, 0, Math.PI * 2)
      ctx.fillStyle = colors.bg
      ctx.fill()
      ctx.strokeStyle = (isHov || isSel) ? '#C4B5FD' : colors.badge
      ctx.lineWidth = (isHov || isSel) ? 3 : node.connections >= 5 ? 2.5 : 1.5
      ctx.stroke()

      // glow
      if (isSel) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, drawRadius + 5, 0, Math.PI * 2)
        ctx.strokeStyle = '#A78BFA'
        ctx.lineWidth = 2
        ctx.globalAlpha = isDim ? 0.25 : 0.5
        ctx.stroke()
        ctx.globalAlpha = isDim ? 0.35 : 1
      }

      // ── 노드 안 텍스트: 흰색 + 검정 외곽선 (어떤 배경에서도 선명) ──
      const displayName = getDisplayName(node.name)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 원 안에 들어갈 최대 텍스트 너비 (반지름의 80%)
      const maxW = drawRadius * 1.6
      let fSize = drawRadius >= 35 ? 13 : drawRadius >= 28 ? 12 : 11
      ctx.font = `800 ${fSize}px "Pretendard", -apple-system, sans-serif`

      // 줄바꿈 함수: 글자 단위로 잘라서 maxW에 맞게 분배
      const wrapLines = (text: string, mw: number): string[] => {
        if (ctx.measureText(text).width <= mw) return [text]
        const spaceIdx = text.indexOf(' ')
        if (spaceIdx > 0) {
          const a = text.slice(0, spaceIdx)
          const b = text.slice(spaceIdx + 1)
          if (ctx.measureText(a).width <= mw && ctx.measureText(b).width <= mw) return [a, b]
        }
        const mid = Math.ceil(text.length / 2)
        const line1 = text.slice(0, mid)
        const line2 = text.slice(mid)
        if (ctx.measureText(line1).width > mw || ctx.measureText(line2).width > mw) {
          const t = Math.ceil(text.length / 3)
          return [text.slice(0, t), text.slice(t, t * 2), text.slice(t * 2)]
        }
        return [line1, line2]
      }

      let lines = wrapLines(displayName, maxW)
      if (lines.length > 2 && fSize > 10) {
        fSize = 10
        ctx.font = `800 ${fSize}px "Pretendard", -apple-system, sans-serif`
        lines = wrapLines(displayName, maxW)
      }

      const lineH = fSize + 3
      const totalH = lines.length * lineH
      const startY = node.y - totalH / 2 + lineH / 2
      // 검정 외곽선 먼저 → 흰색 채우기 (어떤 배경에서도 선명)
      ctx.strokeStyle = 'rgba(0,0,0,0.7)'
      ctx.lineWidth = 3
      ctx.lineJoin = 'round'
      for (let li = 0; li < lines.length; li++) {
        ctx.strokeText(lines[li], node.x, startY + li * lineH)
      }
      ctx.fillStyle = '#FFFFFF'
      for (let li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], node.x, startY + li * lineH)
      }

      ctx.globalAlpha = 1
    }

    // ── 선택된 노드: 연결 라벨 (노란색 + 검정 배경 박스) ──
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
        const offset = (labelIdx % 2 === 0) ? -18 : 18
        const labelY = midY + offset

        const label = getRelationKo(e.relation)
        const labelWidth = ctx.measureText(label).width + 16

        // 배경 박스
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.beginPath()
        ctx.roundRect(midX - labelWidth / 2, labelY - 12, labelWidth, 24, 4)
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
    const { nodes, edges } = buildGraph(tiers, links, w, canvasHeight)
    nodesRef.current = nodes
    edgesRef.current = edges
    needsDrawRef.current = true
    draw()
  }, [tiers, links, draw, canvasHeight])

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

  const formatForeign = (v: number) => {
    if (Math.abs(v) >= 1e8) return `${v > 0 ? '+' : ''}${(v / 1e8).toFixed(0)}억`
    if (Math.abs(v) >= 1e4) return `${v > 0 ? '+' : ''}${(v / 1e4).toFixed(0)}만`
    return `${v > 0 ? '+' : ''}${v.toLocaleString()}`
  }

  return (
    <div ref={containerRef} className="relative" style={{ height: canvasHeight, minWidth: 800 }}>
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
