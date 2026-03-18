import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const revalidate = 300 // 5분 캐시

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') // GLOBAL | DOMESTIC | null(전체)
  const dateStr = searchParams.get('date') // YYYY-MM-DD, default today
  const tier = searchParams.get('tier') ?? 'FREE' // FREE | SIGNAL

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('intelligence_news')
      .select('*')
      .order('rank', { ascending: true })

    if (scope) query = query.eq('scope', scope)

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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // 날짜별 그루핑
    const latestDate = data?.[0]?.date ?? null

    return NextResponse.json({
      date: latestDate,
      items: data ?? [],
      count: data?.length ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Intelligence news unavailable' }, { status: 503 })
  }
}
