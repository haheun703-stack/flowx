import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { readJsonFile } from '@/shared/lib/dataReader'
import { fetchWorldIndices } from '@/features/market-ticker/api/fetchWorldIndices'

export const dynamic = 'force-dynamic'

/* ── Types ── */
interface SectorMomentumFile {
  date: string
  sectors: {
    sector: string
    ret_5: number
    momentum_score: number
    category: string
  }[]
}

interface ShortSignal {
  code: string
  name: string
  grade: string
  signal_type: string
  total_score: number
  entry_price: number
  target_price: number
  stop_loss: number
  volume_ratio: number
  holding_days: number
  date: string
  source?: string
}

/* ── Panel 6: 릴레이 체인 (섹터 로테이션 + 원자재) ── */
async function buildPanel6() {
  // 1. 섹터 데이터 — sector_momentum.json
  let hotSectors: { sector: string; status: string; change: string }[] = []
  try {
    const momentum = readJsonFile<SectorMomentumFile>('sector_rotation/sector_momentum.json')
    const sorted = momentum.sectors
      .filter(s => s.category === 'sector')
      .sort((a, b) => b.ret_5 - a.ret_5)

    hotSectors = sorted.slice(0, 8).map(s => {
      let status = 'CLUSTER'
      if (s.ret_5 > 2) status = 'HOT'
      else if (s.ret_5 > 0) status = 'ROTATION'
      const sign = s.ret_5 >= 0 ? '+' : ''
      return { sector: s.sector, status, change: `${sign}${s.ret_5.toFixed(1)}%` }
    })
  } catch { /* fallback empty */ }

  // 2. 원자재 데이터 — world indices
  let commodities: { name: string; change: string }[] = []
  try {
    const indices = await fetchWorldIndices()
    const targets = ['WTI', 'GOLD', 'COPPER']
    commodities = targets.map(sym => {
      const item = indices.find(i => i.symbol === sym)
      if (!item) return { name: sym, change: '0.0%' }
      const sign = item.changePercent >= 0 ? '+' : ''
      return { name: item.name, change: `${sign}${item.changePercent.toFixed(1)}%` }
    })
  } catch { /* fallback empty */ }

  return { hot_sectors: hotSectors, commodities }
}

/* ── Panel 7: 적중률 대시보드 ── */
async function buildPanel7() {
  const supabase = getSupabaseAdmin()

  // 최근 30일간의 시그널 데이터에서 적중률 계산
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateStr = thirtyDaysAgo.toISOString().split('T')[0]

  const { data: signals } = await supabase
    .from('short_signals')
    .select('grade, signal_type, total_score, entry_price, target_price, stop_loss, source')
    .gte('date', dateStr)
    .order('date', { ascending: false })

  if (!signals || signals.length === 0) return null

  // 소스별 그룹핑 (signal_type or source 기반)
  const sourceMap = new Map<string, { total: number; hit: number }>()

  // signal_type 기반 분류
  const typeMapping: Record<string, string> = {
    FORCE_BUY: 'MOMENTUM',
    BUY: 'QUANT',
    WATCH: 'RELAY',
  }

  for (const s of signals) {
    const src = typeMapping[s.signal_type] ?? 'BOTTOM'
    const existing = sourceMap.get(src) ?? { total: 0, hit: 0 }
    existing.total++
    // 적중 기준: total_score >= 70이고, 목표가까지 거리 > 손절가까지 거리 (R:R > 1)
    if (s.total_score >= 65 && s.target_price > s.entry_price) {
      const rr = (s.target_price - s.entry_price) / Math.max(1, s.entry_price - s.stop_loss)
      if (rr >= 1) existing.hit++
    }
    sourceMap.set(src, existing)
  }

  // AA/A 등급 시그널은 SMART_MONEY로 별도 집계
  const smartMoneySignals = signals.filter(s => s.grade === 'AA' || s.grade === 'A')
  if (smartMoneySignals.length > 0) {
    const hit = smartMoneySignals.filter(s => s.total_score >= 75).length
    sourceMap.set('SMART_MONEY', { total: smartMoneySignals.length, hit })
  }

  const sources = Array.from(sourceMap.entries()).map(([name, { total, hit }]) => ({
    name,
    total,
    hit,
    rate: total > 0 ? Math.round((hit / total) * 1000) / 10 : 0,
  })).sort((a, b) => b.rate - a.rate)

  const totalAll = sources.reduce((s, x) => s + x.total, 0)
  const hitAll = sources.reduce((s, x) => s + x.hit, 0)
  const overallRate = totalAll > 0 ? Math.round((hitAll / totalAll) * 1000) / 10 : 0

  return { overall_rate: overallRate, sources }
}

/* ── Panel 8: 변곡점 알림 ── */
async function buildPanel8() {
  const supabase = getSupabaseAdmin()

  // 최신 날짜 시그널
  const { data: latest } = await supabase
    .from('short_signals')
    .select('date')
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (!latest) return null

  const { data: signals } = await supabase
    .from('short_signals')
    .select('code, name, grade, total_score, entry_price, target_price, stop_loss, holding_days, volume_ratio')
    .eq('date', latest.date)
    .order('total_score', { ascending: true })

  if (!signals || signals.length === 0) return null

  const items: { ticker: string; type: string; reason: string; severity: string }[] = []

  for (const s of signals) {
    const reasons: string[] = []
    let type = ''
    let severity = ''

    // EXIT 조건: 목표가 근접 (entry → target 거리의 90% 이상 도달 추정)
    if (s.holding_days >= 10 && s.total_score >= 80) {
      type = 'EXIT'
      reasons.push('보유기간 장기화 + 고점수 (목표가 도달 추정)')
      severity = 'HIGH'
    }

    // REDUCE 조건: 낮은 점수
    if (s.total_score < 55) {
      type = type || 'REDUCE'
      reasons.push(`점수 ${s.total_score} (기준 미달)`)
      severity = severity || 'HIGH'
    }

    // 손절 근접 (entry_price가 stop_loss에 가까워진 경우)
    if (s.entry_price > 0 && s.stop_loss > 0) {
      const distToStop = (s.entry_price - s.stop_loss) / s.entry_price
      if (distToStop < 0.03) {
        type = type || 'EXIT'
        reasons.push('손절가 근접 (3% 이내)')
        severity = 'CRITICAL'
      }
    }

    // 거래량 급감
    if (s.volume_ratio < 0.5) {
      type = type || 'REDUCE'
      reasons.push('거래량 급감 (평균 대비 50% 미만)')
      severity = severity || 'MEDIUM'
    }

    // 보유일 과다
    if (s.holding_days >= 15) {
      type = type || 'REDUCE'
      reasons.push(`보유 ${s.holding_days}일 (장기화 주의)`)
      severity = severity || 'MEDIUM'
    }

    if (type && reasons.length > 0) {
      items.push({
        ticker: s.name,
        type,
        reason: reasons.join(' + '),
        severity,
      })
    }
  }

  // 심각도 순 정렬 (CRITICAL > HIGH > MEDIUM)
  const sevOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 }
  items.sort((a, b) => (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3))

  return { items: items.slice(0, 10) }
}

/* ── Main Handler ── */
export async function GET() {
  try {
    const [panel6, panel7, panel8] = await Promise.allSettled([
      buildPanel6(),
      buildPanel7(),
      buildPanel8(),
    ])

    return NextResponse.json({
      panel_6_relay: panel6.status === 'fulfilled' ? panel6.value : null,
      panel_7_patterns: panel7.status === 'fulfilled' ? panel7.value : null,
      panel_8_alerts: panel8.status === 'fulfilled' ? panel8.value : null,
    })
  } catch (e) {
    console.error('vip-content error:', e)
    return NextResponse.json({
      panel_6_relay: null,
      panel_7_patterns: null,
      panel_8_alerts: null,
    })
  }
}
