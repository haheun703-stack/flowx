import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const [scenarioRes, sectorRes] = await Promise.all([
      supabase
        .from('intelligence_conviction_notes')
        .select('*')
        .eq('session', 'PM')
        .order('date', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('sector_universe')
        .select('sector_key, sector_name, change_pct'),
    ])

    if (scenarioRes.error || !scenarioRes.data) {
      return NextResponse.json({ error: 'No scenario data' }, { status: 404 })
    }

    const data = scenarioRes.data

    // flowx_html 후처리
    if (data.flowx_html) {
      // 왼쪽 맵 SVG를 상단 정렬 (기본은 세로 중앙)
      data.flowx_html = data.flowx_html.replace(
        '</style>',
        '.map-stage{align-items:flex-start!important;justify-content:flex-start!important;padding-top:8px}\n</style>'
      )
      // 섹터 데이터 주입
      if (sectorRes.data?.length) {
        data.flowx_html = injectSectorScores(data.flowx_html, sectorRes.data)
      }
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Scenario unavailable' }, { status: 503 })
  }
}

interface SectorStock { sector_key: string; sector_name: string; change_pct: number | null }

function injectSectorScores(html: string, stocks: SectorStock[]): string {
  // 섹터별 avgChange 계산
  const map = new Map<string, { name: string; total: number; count: number }>()
  for (const s of stocks) {
    if (!map.has(s.sector_key)) map.set(s.sector_key, { name: s.sector_name, total: 0, count: 0 })
    const entry = map.get(s.sector_key)!
    entry.total += s.change_pct ?? 0
    entry.count++
  }

  const sectors = Array.from(map.entries())
    .map(([key, v]) => ({ key, name: v.name, avg: v.count > 0 ? v.total / v.count : 0 }))
    .sort((a, b) => b.avg - a.avg)

  if (!sectors.length) return html

  // --- SVG 바 차트 생성 ---
  const barH = 18, gap = 6, startY = 60, halfW = 175
  const maxAbs = Math.max(...sectors.map(s => Math.abs(s.avg)), 3)
  const svgBars = sectors.map((s, i) => {
    const y = startY + i * (barH + gap)
    const w = Math.max(2, Math.abs(s.avg) / maxAbs * halfW)
    const isPos = s.avg >= 0
    const color = isPos ? '#2ed47a' : '#ff4e4e'
    const barX = isPos ? 300 : 300 - w
    const sign = isPos ? '+' : ''
    return [
      `<text x="36" y="${y + 13}" font-family="'IBM Plex Sans KR',sans-serif" font-size="11" fill="#e8e6e0">${s.name}</text>`,
      `<rect x="${barX}" y="${y}" width="${w}" height="${barH}" rx="3" fill="${color}88"><animate attributeName="width" from="0" to="${w}" dur="0.6s" fill="freeze"/></rect>`,
      `<text x="${isPos ? 300 + w + 6 : barX - 6}" y="${y + 13}" font-family="'IBM Plex Mono',monospace" font-size="10" fill="${color}" text-anchor="${isPos ? 'start' : 'end'}">${sign}${s.avg.toFixed(2)}%</text>`,
    ].join('\n')
  }).join('\n')

  const svgH = Math.max(420, startY + sectors.length * (barH + gap) + 20)
  const centerLine = `<line x1="300" y1="${startY - 5}" x2="300" y2="${startY + sectors.length * (barH + gap)}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`
  const newSvg = `<svg viewBox="0 0 600 ${svgH}" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="600" height="${svgH}" fill="#0a1520"/>
  <text x="300" y="38" font-family="'Bebas Neue',sans-serif" font-size="16" fill="#e8e6e0" text-anchor="middle" letter-spacing="2">섹터별 등락률 스코어</text>
  <text x="300" y="${startY - 12}" font-family="'IBM Plex Mono',monospace" font-size="9" fill="#4a4845" text-anchor="middle">\u2190 \ud558\ub77d | \uc0c1\uc2b9 \u2192</text>
  ${centerLine}
  ${svgBars}
</svg>`

  // 기존 빈 SVG 교체
  html = html.replace(
    /(<div class="map-stage"[^>]*id="stage-map-4"[^>]*>[\s\S]*?)<svg[\s\S]*?<\/svg>/,
    `$1${newSvg}`
  )

  // --- 내러티브 카드 생성 ---
  const top5 = sectors.slice(0, 5)
  const bottom3 = sectors.slice(-3).reverse()

  const makeCard = (s: typeof sectors[0]) => {
    const color = s.avg >= 0 ? '#2ed47a' : '#ff4e4e'
    const cls = s.avg >= 0 ? 'sig-buy' : 'sig-sell'
    const arrow = s.avg >= 0 ? '\u25b2 +' : '\u25bc '
    return `<div class="scard"><div class="sc-l"><div class="sc-tick" style="color:${color}">${s.name}</div></div><span class="sc-sig ${cls}">${arrow}${s.avg.toFixed(2)}%</span></div>`
  }

  const newNarr = `<div id="narr-4" class="narr-section" style="display:none"><div class="slabel">STEP 05 \u00b7 \uc139\ud130 \uc2a4\ucf54\uc5b4</div>
<div class="stitle">\uc139\ud130\ubcc4 \uc790\uae08<br>\ud750\ub984 \uc9c0\uc218</div>
<div class="ssub">FlowX \uc139\ud130 \uc720\ub2c8\ubc84\uc2a4 ${sectors.length}\uac1c \uc139\ud130 \u00b7 \uc2e4\uc2dc\uac04 \ub4f1\ub77d\ub960 \uae30\uc900</div>
<div class="ntxt"><strong style="color:#2ed47a">\uc0c1\uc704 \uc139\ud130</strong></div>
${top5.map(makeCard).join('')}
${bottom3.length > 0 ? `<div class="ntxt" style="margin-top:8px"><strong style="color:#ff4e4e">\ud558\uc704 \uc139\ud130</strong></div>${bottom3.map(makeCard).join('')}` : ''}
<div class="tip-box"><strong>\uc77d\ub294 \ubc95</strong> \u2014 \ub9c9\ub300\uac00 \uae38\uc218\ub85d \ud604\uc7ac \uc790\uae08\uc774 \uc9d1\uc911\ub418\ub294 \uc139\ud130\uc785\ub2c8\ub2e4.</div></div>`

  // 기존 빈 narr-4 교체
  html = html.replace(
    /<div id="narr-4"[^>]*>[\s\S]*?<\/div>(?=<div id="narr-5")/,
    newNarr
  )

  return html
}
