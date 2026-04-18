import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('intelligence_swing_system')
      .select('date,action_guide,regime,brain_raw_pct,brain_capped_pct,regime_cap_reason')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /intelligence/swing-system] Supabase error:', error.message)
      return NextResponse.json({ error: '스윙시스템 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? null })
  } catch (err) {
    console.error('[API /intelligence/swing-system] error:', err)
    return NextResponse.json({ error: '스윙시스템 조회 오류' }, { status: 500 })
  }
}
