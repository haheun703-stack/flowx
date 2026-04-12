import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const sb = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)

    const grade = searchParams.get('grade')       // S, A, B, C, D
    const market = searchParams.get('market')     // KOSPI, KOSDAQ
    const category = searchParams.get('category') // large_cap, mid_cap, small_cap, micro_cap
    const theme = searchParams.get('theme')       // 테마 키워드
    const sort = searchParams.get('sort') ?? 'total_score' // 정렬 컬럼
    const limit = Math.min(Number(searchParams.get('limit') ?? 300), 500)

    // 최신 날짜 조회
    const { data: latest } = await sb
      .from('stock_discovery')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) {
      return NextResponse.json({ date: null, items: [], summary: null })
    }

    let query = sb
      .from('stock_discovery')
      .select('*')
      .eq('date', latest.date)

    if (grade) query = query.eq('grade', grade)
    if (market) query = query.eq('market', market)
    if (category) query = query.eq('category', category)

    // 정렬
    const validSorts = [
      'total_score', 'theme_score', 'order_score', 'earnings_score',
      'supply_score', 'technical_score', 'global_score', 'market_cap',
    ]
    const sortCol = validSorts.includes(sort) ? sort : 'total_score'
    query = query.order(sortCol, { ascending: false }).limit(limit)

    const { data: items, error } = await query

    if (error) throw error

    // 테마 필터 (JSONB 배열 검색은 클라이언트에서)
    let filtered = items ?? []
    if (theme) {
      filtered = filtered.filter((item: Record<string, unknown>) => {
        const keywords = item.theme_keywords as string[] | null
        return keywords?.some((k: string) => k.includes(theme))
      })
    }

    // 등급별 카운트 (필터 전 전체 기준)
    const { data: counts } = await sb
      .from('stock_discovery')
      .select('grade')
      .eq('date', latest.date)

    const summary = { S: 0, A: 0, B: 0, C: 0, D: 0, total: 0 }
    if (counts) {
      for (const row of counts) {
        const g = row.grade as keyof typeof summary
        if (g in summary) summary[g]++
        summary.total++
      }
    }

    return NextResponse.json({
      date: latest.date,
      items: filtered,
      summary,
    })
  } catch (err) {
    console.error('[discovery]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
