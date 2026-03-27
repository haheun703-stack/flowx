import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabase()
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

    return NextResponse.json({ ...row.data, date: row.date })
  } catch (err) {
    console.error('[API /scenarios] error:', err)
    return NextResponse.json({ error: '시나리오 조회 오류' }, { status: 500 })
  }
}
