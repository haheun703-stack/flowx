import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { safeStringArray } from '@/shared/lib/safeJson'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') // GLOBAL | DOMESTIC | null(전체)
  const dateStr = searchParams.get('date') // YYYY-MM-DD, default today
  const tier = searchParams.get('tier') ?? 'SIGNAL' // PaywallBlur 해제 상태, 복구 시 'FREE'로

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('intelligence_news')
      .select('*')
      .order('rank', { ascending: true })

    // 봇이 scope 대신 category 컬럼 사용
    if (scope) query = query.eq('category', scope)

    if (dateStr) {
      query = query.eq('date', dateStr)
    } else {
      // 최신 날짜 데이터
      query = query.order('date', { ascending: false }).limit(40)
    }

    // FREE 유저: rank 1-3만 노출
    if (tier === 'FREE') {
      query = query.lte('rank', 3)
    }

    const { data, error } = await query

    if (error) {
      console.error('[news] DB error:', error.message)
      return NextResponse.json({ error: '뉴스 데이터 조회 오류' }, { status: 500 })
    }

    // 날짜별 그루핑
    const latestDate = data?.[0]?.date ?? null

    // 봇 컬럼명 → 프론트엔드 타입 매핑
    const items = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      date: row.date,
      scope: row.scope ?? row.category ?? 'GLOBAL',
      rank: row.rank,
      title: row.title,
      impact: row.impact ?? row.impact_level ?? 'MEDIUM',
      impact_score: row.impact_score ?? 3,
      kr_impact: row.kr_impact ?? row.summary ?? null,
      impact_description: row.impact_description ?? null,
      related_tickers: Array.isArray(row.related_tickers)
        ? (row.related_tickers as Record<string, unknown>[]).map(t => ({
            code: t.code ?? t.ticker ?? '',
            name: t.name ?? '',
            change_pct: Number(t.change_pct) || 0,
          }))
        : [],
      sectors: safeStringArray(row.sectors ?? row.impact_sectors),
      source: row.source ?? null,
      published_at: row.published_at ?? null,
    }))

    return NextResponse.json({
      date: latestDate,
      items,
      count: items.length,
    })
  } catch {
    return NextResponse.json({ error: 'Information news unavailable' }, { status: 503 })
  }
}
