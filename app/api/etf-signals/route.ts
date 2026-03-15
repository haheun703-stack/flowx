import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data: latest } = await supabase
      .from('etf_signals')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) return NextResponse.json([])

    const { data, error } = await supabase
      .from('etf_signals')
      .select('*')
      .eq('date', latest.date)
      .order('sector_rotation_rank', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const SIGNAL_KR: Record<string, string> = {
      STRONG_BUY: '적극매수', BUY: '매수', HOLD: '관망', SELL: '매도', STRONG_SELL: '적극매도',
    }

    const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
      date: row.date,
      sector: row.name,
      etf_code: row.code,
      etf_name: row.name,
      close: 0,
      ret_1: (row.change_1d as number) ?? 0,
      ret_5: (row.change_5d as number) ?? 0,
      ret_20: 0,
      rsi: (row.rsi as number) ?? 0,
      score: (row.score as number) ?? 0,
      grade: SIGNAL_KR[row.signal as string] ?? '관망',
      sector_rotation_rank: (row.sector_rotation_rank as number) ?? 0,
      reasons: [],
    }))
    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json([])
  }
}
