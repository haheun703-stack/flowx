import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 최신 1건 (성적표 카드)
    const { data: latest, error: e1 } = await supabase
      .from('intelligence_daytrading_performance')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 최근 20거래일 (차트)
    const { data: chart, error: e2 } = await supabase
      .from('intelligence_daytrading_performance')
      .select('date,avg_return')
      .order('date', { ascending: false })
      .limit(20)

    if (e1 || e2) {
      console.error('[API /daytrading-performance]', e1?.message, e2?.message)
      return NextResponse.json({ error: '성적표 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({
      latest: latest ?? null,
      chart: (chart ?? []).reverse(),
    })
  } catch (err) {
    console.error('[API /daytrading-performance] error:', err)
    return NextResponse.json({ error: '성적표 데이터 조회 오류' }, { status: 500 })
  }
}
