import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const revalidate = 300

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tier = searchParams.get('tier') ?? 'FREE'

  try {
    const supabase = getSupabaseAdmin()

    // 최신 날짜 1건
    const { data, error } = await supabase
      .from('intelligence_supply_demand')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // FREE 유저: summary만, sector_flows 제거
    if (tier === 'FREE' && data) {
      return NextResponse.json({
        ...data,
        sector_flows: [],
      })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Supply-demand unavailable' }, { status: 503 })
  }
}
