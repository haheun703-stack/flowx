import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 1) 새 테이블 우선 (intelligence_stealth_scan — 단타봇 통합 스펙)
    const { data: newData, error: newErr } = await supabase
      .from('intelligence_stealth_scan')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!newErr && newData) {
      return NextResponse.json({ data: newData })
    }

    // 2) 폴백: 레거시 테이블 (intelligence_oneshot_stealth)
    const { data, error } = await supabase
      .from('intelligence_oneshot_stealth')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /intelligence/stealth] Supabase error:', error.message)
      return NextResponse.json({ error: '선매집 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? null })
  } catch (err) {
    console.error('[API /intelligence/stealth] error:', err)
    return NextResponse.json({ error: '선매집 조회 오류' }, { status: 500 })
  }
}
