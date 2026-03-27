import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabase()

    // 최신 날짜 기준 전체 ETF, 점수 내림차순
    const { data, error } = await supabase
      .from('dashboard_etf_signals')
      .select('*')
      .order('date', { ascending: false })
      .order('score', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[API /etf-signals] Supabase error:', error.message)
      return NextResponse.json({ error: 'ETF 시그널 조회 오류' }, { status: 500 })
    }

    if (!data?.length) return NextResponse.json({ items: [], date: null })

    const latestDate = data[0].date
    const items = data.filter((d) => d.date === latestDate)

    return NextResponse.json({ items, date: latestDate })
  } catch (err) {
    console.error('[API /etf-signals] error:', err)
    return NextResponse.json({ error: 'ETF 시그널 조회 오류' }, { status: 500 })
  }
}
