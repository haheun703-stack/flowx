import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const revalidate = 300

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'ACTIVE' // ACTIVE | EXPIRED | HIT | MISS | ALL

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('intelligence_scenarios')
      .select('*')
      .order('date', { ascending: false })
      .order('confidence', { ascending: false })
      .limit(20)

    if (status !== 'ALL') query = query.eq('status', status)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      items: data ?? [],
      count: data?.length ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Scenarios unavailable' }, { status: 503 })
  }
}
