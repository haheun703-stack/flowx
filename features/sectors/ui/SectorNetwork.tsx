'use client'

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { TIER_COLORS } from '@/lib/chart-tokens'
import { getDisplayName } from '@/lib/stock-name-ko'
import type { StockNode, SupplyLink } from '../api/useSectorData'

// ── 연결 라벨 한국어 ──
const RELATION_KO: Record<string, string> = {
  'ETF 구성': 'ETF에 포함', 'HBM/파운드리': 'HBM 납품',
  '장비 공급': '장비 납품', '광학/노광 장비': '노광장비',
  '파운드리/HBM': '위탁생산', '메모리 경쟁/소재': '메모리 경쟁',
  '증착/식각 장비': '증착·식각', '식각/세정 장비': '식각·세정',
  '검사/테스트 장비': '검사장비', '장비/패키징 납품': '장비·패키징',
  '파운드리 장비': '파운드리 장비', '테스트 소켓': '테스트 소켓',
  'F-35 공급망': 'F-35 부품', '미사일/레이더': '미사일·레이더',
  '무인기/우주': '무인기·우주', '장갑차량': '전차·장갑차',
  '항공엔진/부품': '항공엔진', '유도무기/통신': '유도무기',
  'K2 전차 부품': 'K2 전차', '그룹사/엔진': '그룹사 엔진',
  'LNG 단열/배관': 'LNG 배관', '그룹사 엔진': '그룹사 엔진',
  '엔진 라이선스': '엔진 라이선스', '엔진 기술제휴': '엔진 제휴',
  'CMO 위탁생산': 'CMO 위탁', '바이오시밀러 경쟁': '바이오 경쟁',
  '피하주사 기술제휴': '피하주사 제휴', 'ADC 기술협력': 'ADC 협력',
  '원료의약품': '원료의약품', '신약 라이선스': '신약 라이선스',
  'EV 경쟁/부품': 'EV 경쟁·부품', '그룹사 부품': '그룹사 부품',
  '자율주행 협력': '자율주행', '전장부품 기술': '전장부품',
  'ETF 구성종목': 'ETF 구성', 'CDMO 파트너': 'CDMO',
  '글로벌 IB 협력': 'IB 협력', '글로벌 경쟁사': '글로벌 경쟁',
  'EV 경쟁': 'EV 경쟁', '산업용 로봇 경쟁': '로봇 경쟁',
  '협동로봇 경쟁': '협동로봇', '원전 수혜': '원전 수혜',
  '원전 운영사': '원전 운영', '풍력 타워 납품': '풍력 타워',
  'PUBG 퍼블리싱': 'PUBG', '게임 투자': '게임 투자',
  '음반 유통': '음반 유통', '음원 스트리밍': '음원 스트리밍',
  '콘텐츠 제작': '콘텐츠 제작', '콘텐츠 경쟁': '콘텐츠 경쟁',
  '해운 얼라이언스': '해운 동맹', '물류 경쟁': '물류 경쟁',
  '스카이팀 동맹': '스카이팀', 'K-푸드 경쟁': 'K-푸드 경쟁',
  '스낵 글로벌 경쟁': '스낵 경쟁', '유제품 경쟁': '유제품 경쟁',
  '건설장비 경쟁': '건설장비', '글로벌 건설 경쟁': '건설 경쟁',
  '시멘트/건자재': '시멘트·건자재', 'K2 전차 협력': 'K2 전차',
  '장갑차 협력': '장갑차 협력', '벌크 수혜': '벌크선 수혜',
  'ASIC 설계': 'ASIC 설계',
}

const CANVAS_FONT = '-apple-system, "Malgun Gothic", "맑은 고딕", sans-serif'
const TIER_LABELS: Record<number, string> = {
  5: 'ETF', 4: '글로벌', 3: '소부장·장비', 2: '한국 대형', 1: '한국 소부장',
}

// 다크 모드 노드 배경색 (TIER_COLORS.badge 기반 + 투명도)
const DARK_NODE_BG: Record<number, string> = {
  5: 'rgba(83,74,183,0.35)',   // 보라
  4: 'rgba(24,95,165,0.35)',   // 파랑
  3: 'rgba(15,110,86,0.35)',   // 초록
  2: 'rgba(133,79,11,0.35)',   // 금색
  1: 'rgba(153,60,29,0.35)',   // 주황
}
const DARK_NODE_BORDER: Record<number, string> = {
  5: 'rgba(83,74,183,0.7)',
  4: 'rgba(24,95,165,0.7)',
  3: 'rgba(15,110,86,0.7)',
  2: 'rgba(133,79,11,0.7)',
  1: 'rgba(153,60,29,0.7)',
}

// ── Sankey 내부 타입 ──
interface SankeyNode {
  id: string
  tier: number
  subCategory: string
  stockNames: string[]
  tickers: string[]
  changePcts: number[]
  foreignNets: number[]
  themeTags: string[]
  x: number; y: number
  w: number; h: number
  totalStrength: number
}

interface SankeyLink {
  sourceId: string
  targetId: string
  strength: number
  relations: string[]
  sourceY: number
  targetY: number
}

// ── 레이아웃 상수 ──
const MARGIN_X = 16
const MARGIN_Y = 50
const NODE_GAP = 8
const LINE_H = 18        // 종목 1줄 높이
const HEADER_H = 26       // 그룹 헤더 높이
const MIN_NODE_H = 44
const LINK_SCALE = 2.5    // strength → px

function buildSankey(
  stocks: StockNode[],
  links: SupplyLink[],
  width: number,
  height: number,
): { nodes: SankeyNode[]; links: SankeyLink[] } {
  // 1. sub_category별 그룹핑
  const stockToGroup = new Map<string, string>()
  const groupMap = new Map<string, SankeyNode>()

  for (const s of stocks) {
    const sub = s.sub_category || '기타'
    const id = `${s.tier}-${sub}`
    stockToGroup.set(s.stock_name, id)

    if (!groupMap.has(id)) {
      groupMap.set(id, {
        id, tier: s.tier, subCategory: sub,
        stockNames: [], tickers: [], changePcts: [], foreignNets: [], themeTags: [],
        x: 0, y: 0, w: 0, h: 0, totalStrength: 0,
      })
    }
    const g = groupMap.get(id)!
    g.stockNames.push(s.stock_name)
    g.tickers.push(s.ticker)
    g.changePcts.push(s.change_pct)
    g.foreignNets.push(Number(s.foreign_net) || 0)
    for (const tag of s.theme_tags ?? []) {
      if (!g.themeTags.includes(tag)) g.themeTags.push(tag)
    }
  }

  // 2. 링크 합산
  const aggLinks = new Map<string, { sourceId: string; targetId: string; strength: number; relations: Set<string> }>()
  for (const l of links) {
    const src = stockToGroup.get(l.from_stock)
    const tgt = stockToGroup.get(l.to_stock)
    if (!src || !tgt || src === tgt) continue
    const key = `${src}|||${tgt}`
    if (!aggLinks.has(key)) {
      aggLinks.set(key, { sourceId: src, targetId: tgt, strength: 0, relations: new Set() })
    }
    const a = aggLinks.get(key)!
    a.strength += l.strength
    a.relations.add(l.relation)
  }

  for (const a of aggLinks.values()) {
    const sn = groupMap.get(a.sourceId)
    const tn = groupMap.get(a.targetId)
    if (sn) sn.totalStrength += a.strength
    if (tn) tn.totalStrength += a.strength
  }

  // 3. Tier columns
  const tierSet = new Set<number>()
  for (const n of groupMap.values()) tierSet.add(n.tier)
  const tierArr = Array.from(tierSet).sort((a, b) => b - a)
  const colCount = tierArr.length

  // 노드 폭: 캔버스를 column 수로 균등 분할 (간격 포함)
  const gapBetweenCols = 40
  const totalGaps = (colCount - 1) * gapBetweenCols
  const nodeW = Math.max(130, Math.floor((width - MARGIN_X * 2 - totalGaps) / colCount))

  // 4. column별 Y 배치 — 높이는 종목 수 기반
  for (let ci = 0; ci < colCount; ci++) {
    const tier = tierArr[ci]
    const colNodes = Array.from(groupMap.values()).filter(n => n.tier === tier)
    colNodes.sort((a, b) => b.totalStrength - a.totalStrength || b.stockNames.length - a.stockNames.length)

    const x = MARGIN_X + ci * (nodeW + gapBetweenCols)

    // 각 노드: 높이 = 헤더 + 종목수 × LINE_H (최대 8줄까지 표시)
    for (const n of colNodes) {
      n.w = nodeW
      const visibleLines = Math.min(n.stockNames.length, 8)
      n.h = Math.max(MIN_NODE_H, HEADER_H + visibleLines * LINE_H + 6)
    }

    let totalH = colNodes.reduce((s, n) => s + n.h, 0) + Math.max(0, colNodes.length - 1) * NODE_GAP
    const availH = height - MARGIN_Y * 2

    // 초과 시 축소
    if (totalH > availH && colNodes.length > 0) {
      const scale = availH / totalH
      for (const n of colNodes) {
        n.h = Math.max(MIN_NODE_H, Math.round(n.h * scale))
      }
      totalH = colNodes.reduce((s, n) => s + n.h, 0) + (colNodes.length - 1) * NODE_GAP
    }

    let curY = MARGIN_Y + Math.max(0, (availH - totalH) / 2)
    for (const n of colNodes) {
      n.x = x
      n.y = curY
      curY += n.h + NODE_GAP
    }
  }

  // 5. 링크 Y offset
  const nodeOutOff = new Map<string, number>()
  const nodeInOff = new Map<string, number>()
  const sankeyLinks: SankeyLink[] = []
  const sorted = Array.from(aggLinks.values()).sort((a, b) => b.strength - a.strength)

  for (const a of sorted) {
    const sn = groupMap.get(a.sourceId)
    const tn = groupMap.get(a.targetId)
    if (!sn || !tn) continue

    const linkH = Math.max(2, a.strength * LINK_SCALE)
    const oOff = nodeOutOff.get(a.sourceId) ?? 0
    const iOff = nodeInOff.get(a.targetId) ?? 0

    // Y는 노드 중앙 부근에서 시작
    const sCenter = sn.y + sn.h / 2
    const tCenter = tn.y + tn.h / 2

    sankeyLinks.push({
      sourceId: a.sourceId,
      targetId: a.targetId,
      strength: a.strength,
      relations: Array.from(a.relations),
      sourceY: sCenter - (sorted.length * linkH / 4) + oOff + linkH / 2,
      targetY: tCenter - (sorted.length * linkH / 4) + iOff + linkH / 2,
    })

    nodeOutOff.set(a.sourceId, oOff + linkH + 1)
    nodeInOff.set(a.targetId, iOff + linkH + 1)
  }

  return { nodes: Array.from(groupMap.values()), links: sankeyLinks }
}

// ── 메인 컴포넌트 ──
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
  const allStocks = useMemo(() => stocks ?? Object.values(tiers).flat(), [stocks, tiers])

  const canvasHeight = useMemo(() => {
    const n = allStocks.length
    if (n > 80) return 1400
    if (n > 50) return 1100
    if (n > 30) return 850
    if (n > 15) return 650
    return 500
  }, [allStocks.length])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sankeyRef = useRef<{ nodes: SankeyNode[]; links: SankeyLink[] }>({ nodes: [], links: [] })
  const hoveredRef = useRef<string | null>(null)
  const selectedRef = useRef<string | null>(null)
  const needsDrawRef = useRef(true)
  const animRef = useRef<number>(0)
  const themeMatchRef = useRef<Set<string>>(new Set())
  const hasThemeRef = useRef(false)

  const [tooltip, setTooltip] = useState<{
    x: number; y: number
    name: string; stockList: string[]
    changePct: number; foreignNet: number
    relations: string[]
  } | null>(null)

  useEffect(() => {
    const set = new Set<string>()
    if (activeTheme && allStocks.length > 0) {
      for (const s of allStocks) {
        if (s.theme_tags?.includes(activeTheme)) set.add(s.stock_name)
      }
    }
    themeMatchRef.current = set
    hasThemeRef.current = !!activeTheme && set.size > 0
    needsDrawRef.current = true
  }, [activeTheme, allStocks])

  // ── Canvas Draw ──
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

    const { nodes, links: sLinks } = sankeyRef.current
    const hovered = hoveredRef.current
    const selected = selectedRef.current
    const activeId = hovered || selected
    const themeSet = themeMatchRef.current
    const hasTheme = hasThemeRef.current
    const nodeMap = new Map<string, SankeyNode>()
    for (const n of nodes) nodeMap.set(n.id, n)

    const connectedIds = new Set<string>()
    if (activeId) {
      connectedIds.add(activeId)
      for (const l of sLinks) {
        if (l.sourceId === activeId || l.targetId === activeId) {
          connectedIds.add(l.sourceId)
          connectedIds.add(l.targetId)
        }
      }
    }

    const nodeHasTheme = (n: SankeyNode) => {
      if (!hasTheme) return true
      return n.stockNames.some(s => themeSet.has(s))
    }

    // ── Tier 헤더 ──
    const drawnTiers = new Set<number>()
    for (const n of nodes) {
      if (drawnTiers.has(n.tier)) continue
      drawnTiers.add(n.tier)
      ctx.font = `bold 14px ${CANVAS_FONT}`
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e2e8f0'
      ctx.fillText(TIER_LABELS[n.tier] ?? `Tier ${n.tier}`, n.x + n.w / 2, 30)
    }
    // Tier 간 화살표
    const sortedTiers = Array.from(drawnTiers).sort((a, b) => b - a)
    ctx.font = `16px ${CANVAS_FONT}`
    ctx.fillStyle = '#475569'
    ctx.textAlign = 'center'
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const n1 = nodes.find(n => n.tier === sortedTiers[i])
      const n2 = nodes.find(n => n.tier === sortedTiers[i + 1])
      if (n1 && n2) ctx.fillText('→', (n1.x + n1.w + n2.x) / 2, 30)
    }

    // ── 링크 ──
    for (const l of sLinks) {
      const sn = nodeMap.get(l.sourceId)
      const tn = nodeMap.get(l.targetId)
      if (!sn || !tn) continue

      const isHL = activeId && (l.sourceId === activeId || l.targetId === activeId)
      const isDim = activeId && !isHL
      const isThemeDim = hasTheme && !activeId && !nodeHasTheme(sn) && !nodeHasTheme(tn)

      const lineW = Math.max(2, l.strength * LINK_SCALE)
      const x0 = sn.x + sn.w
      const y0 = Math.max(sn.y + 10, Math.min(sn.y + sn.h - 10, l.sourceY))
      const x1 = tn.x
      const y1 = Math.max(tn.y + 10, Math.min(tn.y + tn.h - 10, l.targetY))
      const cpx = (x0 + x1) / 2

      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1)
      ctx.lineWidth = lineW
      ctx.lineCap = 'round'

      if (isHL) {
        const grad = ctx.createLinearGradient(x0, 0, x1, 0)
        grad.addColorStop(0, TIER_COLORS[sn.tier]?.badge ?? '#7F77DD')
        grad.addColorStop(1, TIER_COLORS[tn.tier]?.badge ?? '#7F77DD')
        ctx.strokeStyle = grad
        ctx.globalAlpha = 0.9
      } else if (isDim || isThemeDim) {
        ctx.strokeStyle = '#1e293b'
        ctx.globalAlpha = 0.1
      } else {
        const grad = ctx.createLinearGradient(x0, 0, x1, 0)
        grad.addColorStop(0, TIER_COLORS[sn.tier]?.light ?? '#9DC8F5')
        grad.addColorStop(1, TIER_COLORS[tn.tier]?.light ?? '#9DC8F5')
        ctx.strokeStyle = grad
        ctx.globalAlpha = 0.25
      }
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // ── 노드 ──
    for (const n of nodes) {
      const isActive = n.id === activeId
      const isConn = connectedIds.has(n.id)
      const isDim = activeId && !isActive && !isConn
      const isThemeDim = hasTheme && !activeId && !nodeHasTheme(n)

      ctx.globalAlpha = isDim ? 0.12 : isThemeDim ? 0.08 : 1

      // 배경
      ctx.beginPath()
      ctx.roundRect(n.x, n.y, n.w, n.h, 6)
      ctx.fillStyle = isActive
        ? (DARK_NODE_BORDER[n.tier] ?? 'rgba(100,100,100,0.6)')
        : (DARK_NODE_BG[n.tier] ?? 'rgba(50,50,50,0.3)')
      ctx.fill()
      ctx.strokeStyle = isActive ? '#C4B5FD' : (DARK_NODE_BORDER[n.tier] ?? 'rgba(100,100,100,0.4)')
      ctx.lineWidth = isActive ? 2 : 1
      ctx.stroke()

      // 헤더: sub_category
      ctx.font = `bold 13px ${CANVAS_FONT}`
      ctx.textAlign = 'left'
      ctx.fillStyle = '#ffffff'
      const headerText = n.subCategory.length > 10
        ? n.subCategory.slice(0, 9) + '…' : n.subCategory
      ctx.fillText(headerText, n.x + 8, n.y + 17)

      // 종목 수
      ctx.font = `bold 11px ${CANVAS_FONT}`
      ctx.textAlign = 'right'
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(`${n.stockNames.length}`, n.x + n.w - 8, n.y + 17)

      // 구분선
      ctx.beginPath()
      ctx.moveTo(n.x + 6, n.y + HEADER_H - 2)
      ctx.lineTo(n.x + n.w - 6, n.y + HEADER_H - 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 종목 리스트
      const maxLines = Math.floor((n.h - HEADER_H - 4) / LINE_H)
      const visible = n.stockNames.slice(0, Math.min(maxLines, 8))

      for (let si = 0; si < visible.length; si++) {
        const cy = n.y + HEADER_H + 4 + si * LINE_H + 12
        const name = getDisplayName(visible[si])
        const pct = n.changePcts[si] ?? 0

        // 종목명 (왼쪽 정렬, 흰색)
        ctx.font = `12px ${CANVAS_FONT}`
        ctx.textAlign = 'left'
        ctx.fillStyle = '#e2e8f0'
        // 이름이 너무 길면 자르기
        const maxNameW = n.w - 60
        let displayN = name
        while (ctx.measureText(displayN).width > maxNameW && displayN.length > 2) {
          displayN = displayN.slice(0, -1)
        }
        if (displayN !== name) displayN += '…'
        ctx.fillText(displayN, n.x + 8, cy)

        // 등락률 (오른쪽 정렬)
        ctx.font = `bold 11px ${CANVAS_FONT}`
        ctx.textAlign = 'right'
        ctx.fillStyle = pct >= 0 ? '#ff3b5c' : '#38bdf8'
        ctx.fillText(`${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, n.x + n.w - 8, cy)
      }

      // +N개 더
      if (n.stockNames.length > visible.length) {
        const cy = n.y + HEADER_H + 4 + visible.length * LINE_H + 12
        ctx.font = `11px ${CANVAS_FONT}`
        ctx.textAlign = 'left'
        ctx.fillStyle = '#64748b'
        ctx.fillText(`+${n.stockNames.length - visible.length}개`, n.x + 8, cy)
      }

      ctx.globalAlpha = 1
    }

    // ── 선택 시 관계 라벨 ──
    if (selected) {
      ctx.font = `bold 11px ${CANVAS_FONT}`
      let labelIdx = 0
      for (const l of sLinks) {
        if (l.sourceId !== selected && l.targetId !== selected) continue
        const sn = nodeMap.get(l.sourceId)
        const tn = nodeMap.get(l.targetId)
        if (!sn || !tn) continue

        const mx = (sn.x + sn.w + tn.x) / 2
        const my = (l.sourceY + l.targetY) / 2 + (labelIdx % 2 === 0 ? -14 : 14)

        const label = l.relations.map(r => RELATION_KO[r] ?? r).join(', ')
        const tw = ctx.measureText(label).width + 12
        const th = 20

        ctx.fillStyle = 'rgba(0,0,0,0.9)'
        ctx.beginPath()
        ctx.roundRect(mx - tw / 2, my - th / 2, tw, th, 4)
        ctx.fill()

        ctx.fillStyle = '#FBBF24'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, mx, my)
        ctx.textBaseline = 'alphabetic'
        labelIdx++
      }
    }

    needsDrawRef.current = false
  }, [])

  // 그래프 초기화
  useEffect(() => {
    if (!containerRef.current) return
    const w = containerRef.current.offsetWidth
    sankeyRef.current = buildSankey(allStocks, links, w, canvasHeight)
    needsDrawRef.current = true
    draw()
  }, [allStocks, links, draw, canvasHeight])

  // rAF 루프
  useEffect(() => {
    let active = true
    const loop = () => {
      if (!active) return
      if (needsDrawRef.current) draw()
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => { active = false; cancelAnimationFrame(animRef.current) }
  }, [draw])

  // ── 히트 테스트 ──
  const findNode = useCallback((mx: number, my: number): SankeyNode | null => {
    for (const n of sankeyRef.current.nodes) {
      if (mx >= n.x && mx <= n.x + n.w && my >= n.y && my <= n.y + n.h) return n
    }
    return null
  }, [])

  const getPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const zoom = rect.width / canvas.offsetWidth || 1
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e)
    const node = findNode(pos.x, pos.y)
    const prev = hoveredRef.current
    hoveredRef.current = node?.id ?? null

    if (hoveredRef.current !== prev) {
      needsDrawRef.current = true
      if (node) {
        const avgPct = node.changePcts.length > 0
          ? node.changePcts.reduce((a, b) => a + b, 0) / node.changePcts.length : 0
        const totalForeign = node.foreignNets.reduce((a, b) => a + b, 0)
        const rels: string[] = []
        for (const l of sankeyRef.current.links) {
          if (l.sourceId === node.id || l.targetId === node.id) {
            for (const r of l.relations) rels.push(RELATION_KO[r] ?? r)
          }
        }
        setTooltip({
          x: pos.x, y: pos.y - 16,
          name: node.subCategory,
          stockList: node.stockNames.map(getDisplayName),
          changePct: avgPct,
          foreignNet: totalForeign,
          relations: [...new Set(rels)],
        })
      } else {
        setTooltip(null)
      }
    }
  }, [findNode, getPos])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e)
    const node = findNode(pos.x, pos.y)
    selectedRef.current = node ? (selectedRef.current === node.id ? null : node.id) : null
    needsDrawRef.current = true
  }, [findNode, getPos])

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = null
    setTooltip(null)
    needsDrawRef.current = true
  }, [])

  const formatForeign = (v: number) => {
    if (Math.abs(v) >= 1e8) return `${v > 0 ? '+' : ''}${(v / 1e8).toFixed(0)}억`
    if (Math.abs(v) >= 1e4) return `${v > 0 ? '+' : ''}${(v / 1e4).toFixed(0)}만`
    return `${v > 0 ? '+' : ''}${v.toLocaleString()}`
  }

  return (
    <div ref={containerRef} className="relative" style={{ height: canvasHeight, minWidth: 700 }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: 'pointer' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
      />
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: Math.min(tooltip.x, (containerRef.current?.offsetWidth ?? 700) - 260),
            top: Math.max(40, tooltip.y),
            transform: 'translate(-50%, -100%)',
            background: 'rgba(15,23,42,0.95)',
            color: '#e2e8f0',
            fontSize: 12,
            border: '1px solid #7F77DD',
            borderRadius: 8,
            padding: '10px 14px',
            lineHeight: 1.5,
            maxWidth: 260,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{tooltip.name}</div>
          <div style={{ color: '#94a3b8', fontSize: 11 }}>
            {tooltip.stockList.slice(0, 5).join(', ')}
            {tooltip.stockList.length > 5 ? ` 외 ${tooltip.stockList.length - 5}개` : ''}
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ color: tooltip.changePct >= 0 ? '#ff3b5c' : '#38bdf8', fontWeight: 700 }}>
              평균 {tooltip.changePct >= 0 ? '+' : ''}{tooltip.changePct.toFixed(1)}%
            </span>
            <span style={{ color: '#94a3b8', marginLeft: 8 }}>
              외인 {formatForeign(tooltip.foreignNet)}
            </span>
          </div>
          {tooltip.relations.length > 0 && (
            <div style={{ color: '#FBBF24', fontSize: 11, marginTop: 3 }}>
              {tooltip.relations.slice(0, 3).join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
