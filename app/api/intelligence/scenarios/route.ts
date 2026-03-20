import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const session = searchParams.get('session') // AM | PM | null (both)

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('intelligence_scenarios')
      .select('*')
      .order('date', { ascending: false })
      .order('session', { ascending: true })
      .limit(10)

    if (session) query = query.eq('session', session)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // 적중률 요약 조회
    let hit_summary = null
    try {
      const { data: summary } = await supabase
        .from('scenario_hit_summary')
        .select('*')
        .single()
      hit_summary = summary
    } catch { /* view 없으면 무시 */ }

    return NextResponse.json({
      items: data ?? [],
      count: data?.length ?? 0,
      hit_summary,
    })
  } catch {
    return NextResponse.json({ error: 'Scenarios unavailable' }, { status: 503 })
  }
}
