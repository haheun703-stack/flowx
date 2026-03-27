import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabase()

    // 최신 날짜 기준 TOP 50 (점수 내림차순)
    const { data, error } = await supabase
      .from('dashboard_smart_money')
      .select('*')
      .order('date', { ascending: false })
      .order('score', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[API /smart-money] Supabase error:', error.message)
      return NextResponse.json({ error: '세력포착 조회 오류' }, { status: 500 })
    }

    if (!data?.length) return NextResponse.json({ items: [], date: null })

    const latestDate = data[0].date
    const items = data.filter((d) => d.date === latestDate)

    return NextResponse.json({ items, date: latestDate })
  } catch (err) {
    console.error('[API /smart-money] error:', err)
    return NextResponse.json({ error: '세력포착 조회 오류' }, { status: 500 })
  }
}
