'use client'

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { TIER_COLORS } from '@/lib/chart-tokens'
import { getDisplayName } from '@/lib/stock-name-ko'
import type { StockNode, SupplyLink } from '../api/useSectorData'

// ── 연결 라벨 한국어 ──
const RELATION_KO: Record<string, string> = {
  'ETF 구성': 'ETF에 포함', 'HBM/파운드리': 'HBM 메모리 납품',
  '장비 공급': '반도체 장비 납품', '광학/노광 장비': '노광장비 납품',
  '파운드리/HBM': '위탁생산/메모리', '메모리 경쟁/소재': '메모리 경쟁사',
  '증착/식각 장비': '증착·식각 장비 납품', '식각/세정 장비': '식각·세정 장비 납품',
  '검사/테스트 장비': '검사장비 납품', '장비/패키징 납품': '장비·패키징 납품',
  '파운드리 장비': '파운드리 장비 납품', '테스트 소켓': '테스트 소켓 납품',
  'F-35 공급망': 'F-35 전투기 부품', '미사일/레이더': '미사일·레이더 기술',
  '무인기/우주': '무인기·우주 기술', '장갑차량': '전차·장갑차 부품',
  '항공엔진/부품': '항공엔진·부품 납품', '유도무기/통신': '유도무기·통신 장비',
  'K2 전차 부품': 'K2 전차 부품 납품', '그룹사/엔진': '그룹사 엔진 공급',
  'LNG 단열/배관': 'LNG선 단열·배관', '그룹사 엔진': '그룹사 엔진 공급',
  '엔진 라이선스': '엔진 기술 라이선스', '엔진 기술제휴': '엔진 기술 제휴',
  'CMO 위탁생산': '바이오의약품 위탁생산', '바이오시밀러 경쟁': '바이오시밀러 경쟁사',
  '피하주사 기술제휴': '피하주사 플랫폼 제휴', 'ADC 기술협력': '항체약물접합 기술협력',
  '원료의약품': '원료의약품 공급', '신약 라이선스': '신약 기술 라이선스',
  'EV 경쟁/부품': '전기차 경쟁·부품', '그룹사 부품': '그룹사 부품 납품',
  '자율주행 협력': '자율주행 기술 협력', '전장부품 기술': '전장부품 기술 제휴',
  'ETF 구성종목': 'ETF 구성종목', 'CDMO 파트너': 'CDMO 위탁생산 파트너',
  '글로벌 IB 협력': '글로벌 IB 협력', '글로벌 경쟁사': '글로벌 경쟁사',
  'EV 경쟁': '전기차 경쟁', '산업용 로봇 경쟁': '산업용 로봇 경쟁',
  '협동로봇 경쟁': '협동로봇 경쟁', '원전 수혜': '원전 수혜',
  '원전 운영사': '원전 운영사', '풍력 타워 납품': '풍력 타워 납품',
  'PUBG 퍼블리싱': 'PUBG 퍼블리싱', '게임 투자': '게임 투자',
  '음반 유통': '음반 유통 파트너', '음원 스트리밍': '음원 스트리밍',
  '콘텐츠 제작': '콘텐츠 제작 파트너', '콘텐츠 경쟁': '콘텐츠 경쟁',
  '해운 얼라이언스': '해운 얼라이언스', '물류 경쟁': '물류 경쟁',
  '스카이팀 동맹': '스카이팀 동맹', 'K-푸드 경쟁': 'K-푸드 경쟁',
  '스낵 글로벌 경쟁': '스낵 글로벌 경쟁', '유제품 경쟁': '유제품 경쟁',
  '건설장비 경쟁': '건설장비 경쟁', '글로벌 건설 경쟁': '글로벌 건설 경쟁',
  '시멘트/건자재': '시멘트·건자재', 'K2 전차 협력': 'K2 전차 협력',
  '장갑차 협력': '장갑차 기술 협력', '벌크 수혜': '벌크선 수혜',
}

const CANVAS_FONT = '-apple-system, "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif'
const TIER_LABELS: Record<number, string> = {
  5: '글로벌 ETF', 4: '글로벌 대장주', 3: '소부장·장비', 2: '한국 대형주', 1: '한국 소부장',
}

// ── Sankey 내부 타입 ──
interface SankeyNode {
  id: string              // "tier-subcategory"
  tier: number
  subCategory: string
  stockNames: string[]    // 소속 종목명
  tickers: string[]
  changePcts: number[]
  foreignNets: number[]
  themeTags: string[]
  x: number; y: number
  w: number; h: number
  totalStrength: number   // 연결된 link strength 합
}

interface SankeyLink {
  sourceId: string
  targetId: string
  strength: number        // 합산된 strength
  relations: string[]     // 고유 관계 타입들
  sourceY: number         // 소스 노드 내 Y offset
  targetY: number         // 타겟 노드 내 Y offset
}

// ── 빌드 로직 ──
function buildSankey(
  stocks: StockNode[],
  links: SupplyLink[],
  width: number,
  height: number,
): { nodes: SankeyNode[]; links: SankeyLink[] } {
  // 1. 종목 → sub_category별 그룹
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

  // 2. 링크 → 그룹 간 합산
  const linkKey = (a: string, b: string) => `${a}|||${b}`
  const aggLinks = new Map<string, { sourceId: string; targetId: string; strength: number; relations: Set<string> }>()

  for (const l of links) {
    const src = stockToGroup.get(l.from_stock)
    const tgt = stockToGroup.get(l.to_stock)
    if (!src || !tgt || src === tgt) continue

    const key = linkKey(src, tgt)
    if (!aggLinks.has(key)) {
      aggLinks.set(key, { sourceId: src, targetId: tgt, strength: 0, relations: new Set() })
    }
    const a = aggLinks.get(key)!
    a.strength += l.strength
    a.relations.add(l.relation)
  }

  // 각 그룹의 totalStrength 계산
  for (const a of aggLinks.values()) {
    const sn = groupMap.get(a.sourceId)
    const tn = groupMap.get(a.targetId)
    if (sn) sn.totalStrength += a.strength
    if (tn) tn.totalStrength += a.strength
  }

  // 3. 존재하는 Tier만 추출, 왼→오른쪽 배치
  const tierSet = new Set<number>()
  for (const n of groupMap.values()) tierSet.add(n.tier)
  const tiers = Array.from(tierSet).sort((a, b) => b - a) // 5,4,3,2,1

  const MARGIN_X = 30
  const MARGIN_Y = 60
  const NODE_W = Math.min(160, Math.max(100, (width - MARGIN_X * 2) / (tiers.length * 2.5)))
  const colGap = tiers.length > 1
    ? (width - MARGIN_X * 2 - NODE_W) / (tiers.length - 1)
    : 0

  const STRENGTH_SCALE = 6
  const MIN_NODE_H = 40
  const NODE_GAP = 10

  // 4. 각 column 내 노드 Y 배치
  for (let ci = 0; ci < tiers.length; ci++) {
    const tier = tiers[ci]
    const colNodes = Array.from(groupMap.values()).filter(n => n.tier === tier)
    // 연결 많은 순 정렬
    colNodes.sort((a, b) => b.totalStrength - a.totalStrength || b.stockNames.length - a.stockNames.length)

    const x = MARGIN_X + ci * colGap

    // 노드 높이 계산
    let totalH = 0
    for (const n of colNodes) {
      n.w = NODE_W
      n.h = Math.max(MIN_NODE_H, n.totalStrength * STRENGTH_SCALE)
      // 종목 텍스트 높이도 반영 (종목당 ~16px + 헤더 28px)
      const textH = 28 + n.stockNames.length * 16
      n.h = Math.max(n.h, textH)
      totalH += n.h
    }
    totalH += (colNodes.length - 1) * NODE_GAP

    // 높이가 캔버스를 초과하면 축소
    const availH = height - MARGIN_Y * 2
    if (totalH > availH && colNodes.length > 0) {
      const scale = availH / totalH
      for (const n of colNodes) n.h = Math.max(MIN_NODE_H, Math.round(n.h * scale))
      totalH = colNodes.reduce((s, n) => s + n.h, 0) + (colNodes.length - 1) * NODE_GAP
    }

    let curY = MARGIN_Y + Math.max(0, (availH - totalH) / 2)
    for (const n of colNodes) {
      n.x = x
      n.y = curY
      curY += n.h + NODE_GAP
    }
  }

  // 5. 링크 Y offset 계산
  // 각 노드에서 나가는/들어오는 링크에 순서대로 Y offset 배분
  const nodeOutOffset = new Map<string, number>() // 현재까지 사용한 출력 높이
  const nodeInOffset = new Map<string, number>()

  const sankeyLinks: SankeyLink[] = []
  const sortedAgg = Array.from(aggLinks.values()).sort((a, b) => b.strength - a.strength)

  for (const a of sortedAgg) {
    const sn = groupMap.get(a.sourceId)
    const tn = groupMap.get(a.targetId)
    if (!sn || !tn) continue

    const linkH = Math.max(2, a.strength * STRENGTH_SCALE * 0.5)

    const outOff = nodeOutOffset.get(a.sourceId) ?? 0
    const inOff = nodeInOffset.get(a.targetId) ?? 0

    sankeyLinks.push({
      sourceId: a.sourceId,
      targetId: a.targetId,
      strength: a.strength,
      relations: Array.from(a.relations),
      sourceY: sn.y + 24 + outOff + linkH / 2,   // 24px = header area
      targetY: tn.y + 24 + inOff + linkH / 2,
    })

    nodeOutOffset.set(a.sourceId, outOff + linkH + 2)
    nodeInOffset.set(a.targetId, inOff + linkH + 2)
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

  // Canvas 높이 동적 결정
  const canvasHeight = useMemo(() => {
    const n = allStocks.length
    if (n > 80) return 1200
    if (n > 50) return 1000
    if (n > 30) return 800
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
    name: string
    stocks: string[]
    changePct: number
    foreignNet: number
    relations: string[]
  } | null>(null)

  // 테마 필터 ref
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

    // 연결된 노드 집합
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

    // 노드에 테마 매칭 종목이 있는지 확인
    const nodeHasTheme = (n: SankeyNode) => {
      if (!hasTheme) return true
      return n.stockNames.some(s => themeSet.has(s))
    }

    // ── Tier 헤더 라벨 ──
    const drawnTiers = new Set<number>()
    ctx.font = `bold 13px ${CANVAS_FONT}`
    ctx.textAlign = 'center'
    for (const n of nodes) {
      if (drawnTiers.has(n.tier)) continue
      drawnTiers.add(n.tier)
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(TIER_LABELS[n.tier] ?? `Tier ${n.tier}`, n.x + n.w / 2, 28)
      // 아래 화살표 방향 표시 (마지막 tier 제외)
    }
    // Tier 간 화살표
    const sortedTiers = Array.from(drawnTiers).sort((a, b) => b - a)
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const t1 = sortedTiers[i]
      const t2 = sortedTiers[i + 1]
      const n1 = nodes.find(n => n.tier === t1)
      const n2 = nodes.find(n => n.tier === t2)
      if (n1 && n2) {
        const midX = (n1.x + n1.w + n2.x) / 2
        ctx.fillStyle = '#475569'
        ctx.font = `18px ${CANVAS_FONT}`
        ctx.textAlign = 'center'
        ctx.fillText('→', midX, 28)
      }
    }

    // ── 링크 그리기 ──
    const STRENGTH_PX = 3  // 1 strength = 3px width

    for (const l of sLinks) {
      const sn = nodeMap.get(l.sourceId)
      const tn = nodeMap.get(l.targetId)
      if (!sn || !tn) continue

      const isHL = activeId && (l.sourceId === activeId || l.targetId === activeId)
      const isDim = activeId && !isHL
      const isThemeDim = hasTheme && !activeId
        && !nodeHasTheme(sn) && !nodeHasTheme(tn)

      const lineW = Math.max(2, l.strength * STRENGTH_PX)
      const x0 = sn.x + sn.w
      const y0 = l.sourceY
      const x1 = tn.x
      const y1 = l.targetY
      const cpx = (x0 + x1) / 2

      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1)
      ctx.lineWidth = lineW

      if (isHL) {
        // Gradient from source tier to target tier color
        const grad = ctx.createLinearGradient(x0, 0, x1, 0)
        const sc = TIER_COLORS[sn.tier] ?? TIER_COLORS[1]
        const tc = TIER_COLORS[tn.tier] ?? TIER_COLORS[1]
        grad.addColorStop(0, sc.badge)
        grad.addColorStop(1, tc.badge)
        ctx.strokeStyle = grad
        ctx.globalAlpha = 0.85
      } else if (isDim || isThemeDim) {
        ctx.strokeStyle = '#334155'
        ctx.globalAlpha = 0.08
      } else {
        const grad = ctx.createLinearGradient(x0, 0, x1, 0)
        const sc = TIER_COLORS[sn.tier] ?? TIER_COLORS[1]
        const tc = TIER_COLORS[tn.tier] ?? TIER_COLORS[1]
        grad.addColorStop(0, sc.light)
        grad.addColorStop(1, tc.light)
        ctx.strokeStyle = grad
        ctx.globalAlpha = 0.3
      }
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // ── 노드 그리기 ──
    for (const n of nodes) {
      const colors = TIER_COLORS[n.tier] ?? TIER_COLORS[1]
      const isActive = n.id === activeId
      const isConn = connectedIds.has(n.id)
      const isDim = activeId && !isActive && !isConn
      const isThemeDim = hasTheme && !activeId && !nodeHasTheme(n)

      ctx.globalAlpha = isDim ? 0.15 : isThemeDim ? 0.1 : 1

      // 노드 배경 (rounded rect)
      const r = 6
      ctx.beginPath()
      ctx.roundRect(n.x, n.y, n.w, n.h, r)
      ctx.fillStyle = isActive ? colors.border : colors.bg
      ctx.fill()
      ctx.strokeStyle = isActive ? '#C4B5FD' : colors.border
      ctx.lineWidth = isActive ? 2.5 : 1.2
      ctx.stroke()

      // glow for active
      if (isActive) {
        ctx.shadowColor = colors.badge
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.roundRect(n.x, n.y, n.w, n.h, r)
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // 헤더: sub_category 이름
      ctx.font = `bold 12px ${CANVAS_FONT}`
      ctx.textAlign = 'left'
      ctx.fillStyle = isActive ? '#ffffff' : colors.text
      ctx.fillText(n.subCategory, n.x + 8, n.y + 18)

      // 종목 개수 badge
      ctx.font = `bold 10px ${CANVAS_FONT}`
      ctx.textAlign = 'right'
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.7)' : colors.badge
      ctx.fillText(`${n.stockNames.length}종목`, n.x + n.w - 8, n.y + 18)

      // 종목 리스트
      ctx.font = `11px ${CANVAS_FONT}`
      ctx.textAlign = 'left'
      const maxVisible = Math.floor((n.h - 28) / 16)
      const visibleStocks = n.stockNames.slice(0, maxVisible)
      for (let si = 0; si < visibleStocks.length; si++) {
        const sName = getDisplayName(visibleStocks[si])
        const cy = n.y + 34 + si * 16
        const pct = n.changePcts[si] ?? 0

        // 종목명
        ctx.fillStyle = isActive ? 'rgba(255,255,255,0.9)' : '#cbd5e1'
        ctx.fillText(sName, n.x + 10, cy)

        // 등락률
        ctx.textAlign = 'right'
        ctx.fillStyle = pct >= 0 ? '#ff3b5c' : '#0ea5e9'
        ctx.fillText(`${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, n.x + n.w - 8, cy)
        ctx.textAlign = 'left'
      }
      if (n.stockNames.length > maxVisible) {
        const cy = n.y + 34 + maxVisible * 16
        ctx.fillStyle = isActive ? 'rgba(255,255,255,0.5)' : '#64748b'
        ctx.fillText(`+${n.stockNames.length - maxVisible}개 더...`, n.x + 10, cy)
      }

      ctx.globalAlpha = 1
    }

    // ── 선택된 노드: 연결 관계 라벨 ──
    if (selected) {
      ctx.font = `bold 11px ${CANVAS_FONT}`
      for (const l of sLinks) {
        if (l.sourceId !== selected && l.targetId !== selected) continue
        const sn = nodeMap.get(l.sourceId)
        const tn = nodeMap.get(l.targetId)
        if (!sn || !tn) continue

        const x0 = sn.x + sn.w
        const x1 = tn.x
        const mx = (x0 + x1) / 2
        const my = (l.sourceY + l.targetY) / 2

        const label = l.relations.map(r => RELATION_KO[r] ?? r).join(', ')
        const tw = ctx.measureText(label).width + 14
        const th = 22

        // 배경 박스
        ctx.fillStyle = 'rgba(0,0,0,0.85)'
        ctx.beginPath()
        ctx.roundRect(mx - tw / 2, my - th / 2, tw, th, 4)
        ctx.fill()

        // 텍스트
        ctx.fillStyle = '#FBBF24'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, mx, my)
        ctx.textBaseline = 'alphabetic'
      }
    }

    needsDrawRef.current = false
  }, [])

  // 그래프 초기화
  useEffect(() => {
    if (!containerRef.current) return
    const w = containerRef.current.offsetWidth
    const sankey = buildSankey(allStocks, links, w, canvasHeight)
    sankeyRef.current = sankey
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

  // ── 마우스 이벤트 ──
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
        // 연결 관계 수집
        const rels: string[] = []
        for (const l of sankeyRef.current.links) {
          if (l.sourceId === node.id || l.targetId === node.id) {
            for (const r of l.relations) rels.push(RELATION_KO[r] ?? r)
          }
        }
        setTooltip({
          x: pos.x, y: pos.y - 16,
          name: node.subCategory,
          stocks: node.stockNames.map(getDisplayName),
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
    if (node) {
      selectedRef.current = selectedRef.current === node.id ? null : node.id
    } else {
      selectedRef.current = null
    }
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
    <div ref={containerRef} className="relative" style={{ height: canvasHeight, minWidth: 800 }}>
      <div
        className="absolute top-1 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{ fontSize: 12, color: '#555' }}
      >
        그룹을 클릭하면 거래관계가 표시됩니다
      </div>
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
            left: Math.min(tooltip.x, (containerRef.current?.offsetWidth ?? 800) - 280),
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0,0,0,0.9)',
            color: '#e2e8f0',
            fontSize: 12,
            border: '1px solid #7F77DD',
            borderRadius: 8,
            padding: '10px 14px',
            lineHeight: 1.6,
            maxWidth: 280,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{tooltip.name}</div>
          <div style={{ color: '#94a3b8', fontSize: 11 }}>
            {tooltip.stocks.slice(0, 6).join(', ')}
            {tooltip.stocks.length > 6 ? ` 외 ${tooltip.stocks.length - 6}개` : ''}
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ color: tooltip.changePct >= 0 ? '#ff3b5c' : '#0ea5e9', fontWeight: 700 }}>
              평균 {tooltip.changePct >= 0 ? '+' : ''}{tooltip.changePct.toFixed(1)}%
            </span>
            <span style={{ color: '#94a3b8', marginLeft: 8 }}>
              외인 {formatForeign(tooltip.foreignNet)}
            </span>
          </div>
          {tooltip.relations.length > 0 && (
            <div style={{ color: '#FBBF24', fontSize: 11, marginTop: 4 }}>
              {tooltip.relations.slice(0, 4).join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
