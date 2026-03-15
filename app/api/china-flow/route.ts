import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data: latest } = await supabase
      .from('china_flow')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) return NextResponse.json([])

    const { data, error } = await supabase
      .from('china_flow')
      .select('*')
      .eq('date', latest.date)
      .order('score', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
      date: row.date,
      ticker: row.code,
      name: row.name,
      signal: row.signal ?? 'NORMAL',
      score: (row.score as number) ?? 0,
      reasons: [],
      foreign_net_5d: 0,
      foreign_zscore: (row.z_score as number) ?? 0,
      ewy_decouple: false,
      consecutive_days: 0,
      pct_change_5d: (row.change_5d_pct as number) ?? 0,
    }))
    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json([])
  }
}
