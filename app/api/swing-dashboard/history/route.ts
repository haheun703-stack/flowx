import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('dashboard_swing')
      .select('date,brain_pct,brain_capped_pct,brain_verdict,alloc_swing,alloc_gold_etf,alloc_inverse,alloc_group_etf,alloc_small_cap,alloc_cash')
      .order('date', { ascending: false })
      .limit(7)

    if (error) {
      console.error('[API /swing-dashboard/history]', error.message)
      return NextResponse.json({ error: '히스토리 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: (data ?? []).reverse() })
  } catch (err) {
    console.error('[API /swing-dashboard/history]', err)
    return NextResponse.json({ error: '히스토리 조회 오류' }, { status: 500 })
  }
}
