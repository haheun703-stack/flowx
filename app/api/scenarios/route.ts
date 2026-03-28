import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('quant_scenario_dashboard')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)

    if (error) {
      console.error('[API /scenarios] Supabase error:', error.message)
      return NextResponse.json({ error: '시나리오 조회 오류' }, { status: 500 })
    }

    const row = data?.[0]
    if (!row) return NextResponse.json(null)

    const payload = typeof row.data === 'object' && row.data !== null
      ? { ...row.data, date: row.date }
      : { date: row.date }
    return NextResponse.json(payload)
  } catch (err) {
    console.error('[API /scenarios] error:', err)
    return NextResponse.json({ error: '시나리오 조회 오류' }, { status: 500 })
  }
}
