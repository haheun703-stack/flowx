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

    const [scenarioResult, summaryResult] = await Promise.all([
      query,
      Promise.resolve(supabase.from('scenario_hit_summary').select('*').single()).then(r => r.data).catch(() => null),
    ])

    if (scenarioResult.error) return NextResponse.json({ error: scenarioResult.error.message }, { status: 500 })

    return NextResponse.json({
      items: scenarioResult.data ?? [],
      count: scenarioResult.data?.length ?? 0,
      hit_summary: summaryResult,
    })
  } catch {
    return NextResponse.json({ error: 'Scenarios unavailable' }, { status: 503 })
  }
}
