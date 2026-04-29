'use client'

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy'
import type { HierarchyRectangularNode } from 'd3-hierarchy'
import { TreemapSector } from '../model/useTreemap'

/* ── Types ── */
export type SizeBy = 'marketCap' | 'tradingValue' | 'changeAbs'

export interface LeafNode {
  ticker: string
  name: string
  market: string
  sector: string
  marketCap: number
  changePercent: number
  tradingValue: number
  price: number
  foreignNet: number
  instNet: number
}

interface Rect { x0: number; y0: number; x1: number; y1: number }
interface LayoutLeaf extends Rect { data: LeafNode }
interface SectorRect extends Rect { name: string }
interface TreemapLayout { leaves: LayoutLeaf[]; sectorRects: SectorRect[] }
interface Camera { x: number; y: number; zoom: number }
interface TooltipData { screenX: number; screenY: number; stock: LeafNode }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RectNode = HierarchyRectangularNode<any>

/* ── Constants ── */
const CANVAS_FONT = '-apple-system, "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif'
const VIRTUAL_W = 1600
const VIRTUAL_H = 1000
const ANIM_DURATION = 400
const MIN_ZOOM = 0.5
const MAX_ZOOM = 8.0
const CAMERA_DAMP = 0.12

/* ── Color System (섹터별 트리맵과 동일한 Finviz 단계 색상) ── */
function getChangeColor(pct: number): string {
  if (pct >= 10) return '#991B1B'
  if (pct >= 5)  return '#DC2626'
  if (pct >= 2)  return '#EF4444'
  if (pct >= 0)  return '#F87171'
  if (pct >= -2) return '#93C5FD'
  if (pct >= -5) return '#60A5FA'
  return '#2563EB'
}

/* ── Layout Helpers ── */
function getSizeValue(stock: LeafNode, sizeBy: SizeBy): number {
  switch (sizeBy) {
    case 'marketCap': return stock.marketCap
    case 'tradingValue': return stock.tradingValue || 1
    case 'changeAbs': return Math.abs(stock.changePercent) * 100 + 1
  }
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function formatMarketCap(v: number): string {
  return v >= 10000 ? `${(v / 10000).toFixed(1)}조` : `${Math.round(v)}억`
}

function formatTradingValue(v: number): string {
  return v >= 10000 ? `${(v / 10000).toFixed(1)}조` : `${Math.round(v)}억`
}

/* ── Canvas Text Helpers ── */
function drawTextOutlined(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  fontSize: number, fillColor: string, zoom: number,
) {
  ctx.font = `bold ${fontSize}px ${CANVAS_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = fontSize < 6 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.6)'
  ctx.lineWidth = Math.max(1, (fontSize < 6 ? 2 : 3)) / zoom
  ctx.lineJoin = 'round'
  ctx.strokeText(text, x, y)
  ctx.fillStyle = fillColor
  ctx.fillText(text, x, y)
}

function drawCellText(
  ctx: CanvasRenderingContext2D,
  data: LeafNode, rect: Rect, zoom: number,
) {
  const w = rect.x1 - rect.x0
  const h = rect.y1 - rect.y0
  const visW = w * zoom
  const visH = h * zoom
  if (visW < 8 || visH < 8) return

  const cx = rect.x0 + w / 2
  const cy = rect.y0 + h / 2
  const pctText = `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`
  const shortPct = `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(1)}%`

  if (visW > 70 && visH > 50) {
    // Large: name + ticker + pct (3 lines)
    const fs = Math.min(14 / zoom, w * 0.12, h * 0.16)
    if (fs < 2) return
    const lineH = fs * 1.5
    drawTextOutlined(ctx, data.name, cx, cy - lineH, fs, '#FFFFFF', zoom)
    drawTextOutlined(ctx, data.ticker, cx, cy, fs * 0.8, '#ffffffcc', zoom)
    drawTextOutlined(ctx, pctText, cx, cy + lineH, fs, '#FFFFFF', zoom)
  } else if (visW > 40 && visH > 28) {
    // Medium: name + pct (2 lines)
    const fs = Math.min(12 / zoom, w * 0.14, h * 0.22)
    if (fs < 2) return
    const lineH = fs * 1.4
    drawTextOutlined(ctx, data.name, cx, cy - lineH / 2, fs, '#FFFFFF', zoom)
    drawTextOutlined(ctx, pctText, cx, cy + lineH / 2, fs, '#FFFFFF', zoom)
  } else if (visW > 24 && visH > 16) {
    // Small: name only (fits better than %)
    const fs = Math.min(10 / zoom, w * 0.18, h * 0.35)
    if (fs < 2) return
    drawTextOutlined(ctx, data.name, cx, cy, fs, '#FFFFFF', zoom)
  } else {
    // Tiny: short pct only
    const fs = Math.min(8 / zoom, w * 0.22, h * 0.5)
    if (fs < 1.5) return
    drawTextOutlined(ctx, shortPct, cx, cy, fs, '#FFFFFF', zoom)
  }
}

/* ── Component ── */
interface StockTreemapProps {
  sectors: TreemapSector[]
  sizeBy?: SizeBy
  selectedTicker?: string | null
  onStockClick?: (stock: LeafNode) => void
  onSectorDrillDown?: (sectorName: string | null) => void
}

export function StockTreemap({
  sectors, sizeBy = 'marketCap',
  selectedTicker, onStockClick, onSectorDrillDown,
}: StockTreemapProps) {
  /* ── Refs ── */
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const layoutRef = useRef<TreemapLayout>({ leaves: [], sectorRects: [] })
  const prevLayoutRef = useRef<TreemapLayout | null>(null)
  const animProgressRef = useRef(1)
  const animStartRef = useRef(0)

  const cameraRef = useRef<Camera>({ x: VIRTUAL_W / 2, y: VIRTUAL_H / 2, zoom: 1 })
  const targetCameraRef = useRef<Camera>({ x: VIRTUAL_W / 2, y: VIRTUAL_H / 2, zoom: 1 })
  const initialZoomRef = useRef(1)

  const hoveredRef = useRef<string | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef<{ mx: number; my: number; cx: number; cy: number } | null>(null)
  const needsDrawRef = useRef(true)
  const animFrameRef = useRef(0)

  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  /* ── Compute Layout ── */
  // 1) 시총 비중 1.5% 미만 섹터 제외 → 박스 너무 작아서 읽을 수 없음
  // 2) 섹터당 시총 비중 기반 종목 수 할당 (전체 ~80개)
  const TARGET_TOTAL = 80
  const MIN_SECTOR_RATIO = 0.015
  const trimmedSectors = useMemo(() => {
    const totalCap = sectors.reduce((s, sec) => s + sec.marketCap, 0)
    if (totalCap <= 0) return sectors

    return sectors
      .filter(sec => sec.marketCap / totalCap >= MIN_SECTOR_RATIO)
      .map(sec => {
        const ratio = sec.marketCap / totalCap
        const maxStocks = Math.max(2, Math.min(15, Math.round(ratio * TARGET_TOTAL)))
        return {
          ...sec,
          stocks: sec.stocks.slice(0, maxStocks),
        }
      })
  }, [sectors])

  const layout = useMemo((): TreemapLayout => {
    if (!trimmedSectors.length) return { leaves: [], sectorRects: [] }

    const root = hierarchy({
      name: 'root',
      children: trimmedSectors.map(sec => ({
        name: sec.name,
        children: (sec.stocks ?? []).map(s => ({
          name: s.name,
          value: getSizeValue({ ...s, sector: sec.name } as LeafNode, sizeBy),
          _data: { ...s, sector: sec.name } as LeafNode,
        })),
      })),
    })
      .sum((d: any) => d.value ?? 0) // eslint-disable-line @typescript-eslint/no-explicit-any
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    treemap()
      .size([VIRTUAL_W, VIRTUAL_H])
      .paddingTop(22)
      .paddingInner(2)
      .paddingOuter(4)
      .tile(treemapSquarify)(root as any) // eslint-disable-line @typescript-eslint/no-explicit-any

    const rectRoot = root as unknown as RectNode

    const leaves: LayoutLeaf[] = rectRoot.leaves().map((leaf: RectNode) => ({
      x0: leaf.x0, y0: leaf.y0, x1: leaf.x1, y1: leaf.y1,
      data: leaf.data._data as LeafNode,
    }))

    const sectorRects: SectorRect[] = (rectRoot.children ?? []).map((node: RectNode) => ({
      name: node.data.name as string,
      x0: node.x0, y0: node.y0, x1: node.x1, y1: node.y1,
    }))

    return { leaves, sectorRects }
  }, [trimmedSectors, sizeBy])

  // On layout change → trigger animation
  useEffect(() => {
    const prev = layoutRef.current
    if (prev.leaves.length > 0 && layout.leaves.length > 0) {
      prevLayoutRef.current = prev
      animProgressRef.current = 0
      animStartRef.current = performance.now()
    }
    layoutRef.current = layout
    needsDrawRef.current = true
  }, [layout])

  /* ── Coordinate transforms ── */
  const screenToWorld = useCallback((sx: number, sy: number): { wx: number; wy: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { wx: 0, wy: 0 }
    const cam = cameraRef.current
    const cw = canvas.offsetWidth
    const ch = canvas.offsetHeight
    return {
      wx: (sx - cw / 2) / cam.zoom + cam.x,
      wy: (sy - ch / 2) / cam.zoom + cam.y,
    }
  }, [])

  /* ── Hit testing ── */
  const findLeafAt = useCallback((sx: number, sy: number): LeafNode | null => {
    const { wx, wy } = screenToWorld(sx, sy)
    const leaves = layoutRef.current.leaves
    for (let i = leaves.length - 1; i >= 0; i--) {
      const l = leaves[i]
      if (wx >= l.x0 && wx <= l.x1 && wy >= l.y0 && wy <= l.y1) return l.data
    }
    return null
  }, [screenToWorld])

  const findSectorAt = useCallback((sx: number, sy: number): string | null => {
    const { wx, wy } = screenToWorld(sx, sy)
    const cam = cameraRef.current
    for (const sec of layoutRef.current.sectorRects) {
      const labelH = 20 / cam.zoom
      if (wx >= sec.x0 && wx <= sec.x1 && wy >= sec.y0 && wy <= sec.y0 + labelH) {
        return sec.name
      }
    }
    return null
  }, [screenToWorld])

  /* ── Camera controls ── */
  const resetZoom = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cw = canvas.offsetWidth
    const ch = canvas.offsetHeight
    const fitZoom = Math.min(cw / VIRTUAL_W, ch / VIRTUAL_H)
    targetCameraRef.current = { x: VIRTUAL_W / 2, y: VIRTUAL_H / 2, zoom: fitZoom }
    initialZoomRef.current = fitZoom
    needsDrawRef.current = true
    onSectorDrillDown?.(null)
  }, [onSectorDrillDown])

  const drillIntoSector = useCallback((sectorName: string) => {
    const sec = layoutRef.current.sectorRects.find(s => s.name === sectorName)
    if (!sec) return
    const canvas = canvasRef.current
    if (!canvas) return
    const sw = sec.x1 - sec.x0
    const sh = sec.y1 - sec.y0
    const cw = canvas.offsetWidth
    const ch = canvas.offsetHeight
    const zoomX = cw / (sw * 1.1)
    const zoomY = ch / (sh * 1.1)
    targetCameraRef.current = {
      x: sec.x0 + sw / 2,
      y: sec.y0 + sh / 2,
      zoom: Math.min(zoomX, zoomY, MAX_ZOOM),
    }
    needsDrawRef.current = true
    onSectorDrillDown?.(sectorName)
  }, [onSectorDrillDown])

  /* ── Draw ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    const targetW = Math.round(w * dpr)
    const targetH = Math.round(h * dpr)
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW
      canvas.height = targetH
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const cam = cameraRef.current
    const currLayout = layoutRef.current
    const prevLayout = prevLayoutRef.current
    const animT = easeOutCubic(animProgressRef.current)

    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.scale(cam.zoom, cam.zoom)
    ctx.translate(-cam.x, -cam.y)

    // Build prev lookup for animation
    let prevMap: Map<string, Rect> | null = null
    if (prevLayout && animT < 1) {
      prevMap = new Map()
      for (const l of prevLayout.leaves) prevMap.set(l.data.ticker, l)
    }

    // 1. Sector backgrounds
    for (const sec of currLayout.sectorRects) {
      ctx.fillStyle = '#e2e5ea'
      ctx.fillRect(sec.x0, sec.y0, sec.x1 - sec.x0, sec.y1 - sec.y0)
    }

    // 2. Leaf cells
    for (const leaf of currLayout.leaves) {
      let rx = leaf.x0, ry = leaf.y0, rx1 = leaf.x1, ry1 = leaf.y1

      // Animate from prev position
      if (prevMap) {
        const prev = prevMap.get(leaf.data.ticker)
        if (prev) {
          rx = prev.x0 + (leaf.x0 - prev.x0) * animT
          ry = prev.y0 + (leaf.y0 - prev.y0) * animT
          rx1 = prev.x1 + (leaf.x1 - prev.x1) * animT
          ry1 = prev.y1 + (leaf.y1 - prev.y1) * animT
        }
      }

      const rw = rx1 - rx
      const rh = ry1 - ry
      if (rw < 1 || rh < 1) continue

      // Fill
      ctx.fillStyle = getChangeColor(leaf.data.changePercent)
      ctx.fillRect(rx, ry, rw, rh)

      // Border
      const isHovered = hoveredRef.current === leaf.data.ticker
      const isSelected = selectedTicker === leaf.data.ticker
      if (isSelected) {
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 2.5 / cam.zoom
      } else if (isHovered) {
        ctx.strokeStyle = '#374151'
        ctx.lineWidth = 1.5 / cam.zoom
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'
        ctx.lineWidth = 1 / cam.zoom
      }
      ctx.strokeRect(rx, ry, rw, rh)

      // Text
      drawCellText(ctx, leaf.data, { x0: rx, y0: ry, x1: rx1, y1: ry1 }, cam.zoom)
    }

    // 3. Sector labels (on top)
    for (const sec of currLayout.sectorRects) {
      const fs = Math.min(14, 13 / cam.zoom)
      if (fs < 3) continue
      ctx.font = `900 ${fs}px ${CANVAS_FONT}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#111827'
      ctx.fillText(sec.name, sec.x0 + 4 / cam.zoom, sec.y0 + 3 / cam.zoom)
    }

    ctx.restore()
    needsDrawRef.current = false
  }, [selectedTicker])

  /* ── Event Handlers ── */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    dragStartRef.current = {
      mx: e.clientX - rect.left,
      my: e.clientY - rect.top,
      cx: cameraRef.current.x,
      cy: cameraRef.current.y,
    }
    isDraggingRef.current = false
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top

    if (dragStartRef.current) {
      const dx = sx - dragStartRef.current.mx
      const dy = sy - dragStartRef.current.my
      if (Math.abs(dx) + Math.abs(dy) > 3) isDraggingRef.current = true

      if (isDraggingRef.current) {
        cameraRef.current.x = dragStartRef.current.cx - dx / cameraRef.current.zoom
        cameraRef.current.y = dragStartRef.current.cy - dy / cameraRef.current.zoom
        targetCameraRef.current = { ...cameraRef.current }
        needsDrawRef.current = true
        setTooltip(null)
        return
      }
    }

    // Hover
    const leaf = findLeafAt(sx, sy)
    if (leaf?.ticker !== hoveredRef.current) {
      hoveredRef.current = leaf?.ticker ?? null
      needsDrawRef.current = true
      setTooltip(leaf ? { screenX: sx, screenY: sy, stock: leaf } : null)
    } else if (leaf && tooltip) {
      setTooltip({ screenX: sx, screenY: sy, stock: leaf })
    }
  }, [findLeafAt, tooltip])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current && dragStartRef.current) {
      const rect = canvasRef.current!.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top

      // Sector label click → drill-down
      const sector = findSectorAt(sx, sy)
      if (sector) { drillIntoSector(sector); dragStartRef.current = null; return }

      // Stock click
      const leaf = findLeafAt(sx, sy)
      if (leaf) onStockClick?.(leaf)
    }
    dragStartRef.current = null
    isDraggingRef.current = false
  }, [findLeafAt, findSectorAt, drillIntoSector, onStockClick])

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = null
    setTooltip(null)
    needsDrawRef.current = true
    dragStartRef.current = null
    isDraggingRef.current = false
  }, [])

  const handleDoubleClick = useCallback(() => {
    resetZoom()
  }, [resetZoom])

  /* ── Touch Support ── */
  const touchRef = useRef<{ id1: number; id2: number; dist: number; cx: number; cy: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      const rect = canvasRef.current!.getBoundingClientRect()
      dragStartRef.current = {
        mx: t.clientX - rect.left,
        my: t.clientY - rect.top,
        cx: cameraRef.current.x,
        cy: cameraRef.current.y,
      }
      isDraggingRef.current = false
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0], t2 = e.touches[1]
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      touchRef.current = {
        id1: t1.identifier, id2: t2.identifier, dist,
        cx: cameraRef.current.x, cy: cameraRef.current.y,
      }
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (e.touches.length === 1 && dragStartRef.current) {
      const t = e.touches[0]
      const rect = canvasRef.current!.getBoundingClientRect()
      const sx = t.clientX - rect.left
      const sy = t.clientY - rect.top
      const dx = sx - dragStartRef.current.mx
      const dy = sy - dragStartRef.current.my
      if (Math.abs(dx) + Math.abs(dy) > 3) isDraggingRef.current = true
      cameraRef.current.x = dragStartRef.current.cx - dx / cameraRef.current.zoom
      cameraRef.current.y = dragStartRef.current.cy - dy / cameraRef.current.zoom
      targetCameraRef.current = { ...cameraRef.current }
      needsDrawRef.current = true
    } else if (e.touches.length === 2 && touchRef.current) {
      const t1 = e.touches[0], t2 = e.touches[1]
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      const scale = dist / touchRef.current.dist
      const newZoom = clamp(cameraRef.current.zoom * (1 + (scale - 1) * 0.3), MIN_ZOOM, MAX_ZOOM)
      cameraRef.current.zoom = newZoom
      targetCameraRef.current = { ...cameraRef.current }
      touchRef.current.dist = dist
      needsDrawRef.current = true
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      if (!isDraggingRef.current && dragStartRef.current) {
        const rect = canvasRef.current!.getBoundingClientRect()
        const ct = e.changedTouches[0]
        const sx = ct.clientX - rect.left
        const sy = ct.clientY - rect.top
        const leaf = findLeafAt(sx, sy)
        if (leaf) onStockClick?.(leaf)
      }
      dragStartRef.current = null
      isDraggingRef.current = false
      touchRef.current = null
    }
  }, [findLeafAt, onStockClick])

  /* ── Wheel zoom ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const cam = cameraRef.current
      const cw = canvas.offsetWidth
      const ch = canvas.offsetHeight

      // World position under cursor
      const wx = (sx - cw / 2) / cam.zoom + cam.x
      const wy = (sy - ch / 2) / cam.zoom + cam.y

      const factor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = clamp(cam.zoom * factor, MIN_ZOOM, MAX_ZOOM)

      // Keep point under cursor fixed
      cam.zoom = newZoom
      cam.x = wx - (sx - cw / 2) / newZoom
      cam.y = wy - (sy - ch / 2) / newZoom
      targetCameraRef.current = { ...cam }
      needsDrawRef.current = true
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [])

  /* ── Resize ── */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => {
      resetZoom()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [resetZoom])

  /* ── Initial zoom ── */
  useEffect(() => {
    if (sectors.length > 0) resetZoom()
  }, [sectors.length, resetZoom])

  /* ── Render Loop ── */
  useEffect(() => {
    let active = true
    const loop = () => {
      if (!active) return

      // Camera damping
      const cam = cameraRef.current
      const tgt = targetCameraRef.current
      if (Math.abs(cam.x - tgt.x) > 0.01 ||
          Math.abs(cam.y - tgt.y) > 0.01 ||
          Math.abs(cam.zoom - tgt.zoom) > 0.001) {
        cam.x += (tgt.x - cam.x) * CAMERA_DAMP
        cam.y += (tgt.y - cam.y) * CAMERA_DAMP
        cam.zoom += (tgt.zoom - cam.zoom) * CAMERA_DAMP
        needsDrawRef.current = true
      }

      // Animation progress
      if (animProgressRef.current < 1) {
        const elapsed = performance.now() - animStartRef.current
        animProgressRef.current = Math.min(elapsed / ANIM_DURATION, 1)
        needsDrawRef.current = true
        if (animProgressRef.current >= 1) prevLayoutRef.current = null
      }

      if (needsDrawRef.current) draw()
      animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)
    return () => { active = false; cancelAnimationFrame(animFrameRef.current) }
  }, [draw])

  /* ── Render ── */
  if (!sectors.length) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
        데이터 로딩중...
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ minHeight: 280 }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* DOM Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: Math.min(tooltip.screenX, (containerRef.current?.offsetWidth ?? 800) - 220),
            top: Math.max(tooltip.screenY - 110, 8),
            background: 'rgba(255, 255, 255, 0.97)',
            border: '1px solid #e2e5ea',
            borderRadius: 8,
            padding: '10px 14px',
            minWidth: 200,
            color: '#111827',
            lineHeight: 1.6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', fontFamily: CANVAS_FONT }}>
            {tooltip.stock.name}
            <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: 6, fontSize: 12 }}>
              {tooltip.stock.ticker}
            </span>
          </div>
          <div style={{ color: '#d97706', fontSize: 12, fontFamily: CANVAS_FONT }}>
            {tooltip.stock.sector}
          </div>
          <div style={{ marginTop: 4, fontFamily: CANVAS_FONT }}>
            <span style={{
              color: tooltip.stock.changePercent >= 0 ? '#dc2626' : '#2563eb',
              fontWeight: 700, fontSize: 16,
            }}>
              {tooltip.stock.changePercent >= 0 ? '+' : ''}{tooltip.stock.changePercent.toFixed(2)}%
            </span>
          </div>
          {tooltip.stock.price > 0 && (
            <div style={{ color: '#111827', fontSize: 13, fontWeight: 600, fontFamily: CANVAS_FONT }}>
              {tooltip.stock.price.toLocaleString()}원
            </div>
          )}
          <div style={{ color: '#6b7280', fontSize: 11, fontFamily: CANVAS_FONT }}>
            시총 {formatMarketCap(tooltip.stock.marketCap)} · 거래대금 {formatTradingValue(tooltip.stock.tradingValue)}
          </div>
          {(tooltip.stock.foreignNet !== 0 || tooltip.stock.instNet !== 0) && (
            <div style={{ fontSize: 11, fontFamily: CANVAS_FONT, display: 'flex', gap: 8 }}>
              <span style={{ color: tooltip.stock.foreignNet >= 0 ? '#dc2626' : '#2563eb' }}>
                외인 {tooltip.stock.foreignNet >= 0 ? '+' : ''}{formatTradingValue(tooltip.stock.foreignNet)}
              </span>
              <span style={{ color: tooltip.stock.instNet >= 0 ? '#dc2626' : '#2563eb' }}>
                기관 {tooltip.stock.instNet >= 0 ? '+' : ''}{formatTradingValue(tooltip.stock.instNet)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
