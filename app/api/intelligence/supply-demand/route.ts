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

    // 봇 컬럼명 → 프론트엔드 타입 매핑
    const row = data as Record<string, unknown>
    const mapped = {
      id: row.id,
      date: row.date,
      foreign_net: row.foreign_net ?? 0,
      inst_net: row.inst_net ?? row.institution_net ?? 0,
      individual_net: row.individual_net ?? 0,
      foreign_streak: typeof row.foreign_streak === 'number' ? row.foreign_streak : 0,
      inst_streak: typeof row.inst_streak === 'number' ? row.inst_streak : 0,
      sector_flows: tier === 'FREE' ? [] : (row.sector_flows ?? []),
      summary: row.summary ?? null,
    }

    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json({ error: 'Supply-demand unavailable' }, { status: 503 })
  }
}
