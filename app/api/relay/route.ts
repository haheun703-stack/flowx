import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('dashboard_relay')
      .select('*')
      .order('date', { ascending: false })
      .order('score', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[API /relay] Supabase error:', error.message)
      return NextResponse.json({ error: '릴레이 조회 오류' }, { status: 500 })
    }

    if (!data?.length) return NextResponse.json({ items: [], date: null })

    const latestDate = data[0].date
    const items = data.filter((d) => d.date === latestDate)

    return NextResponse.json({ items, date: latestDate })
  } catch (err) {
    console.error('[API /relay] error:', err)
    return NextResponse.json({ error: '릴레이 조회 오류' }, { status: 500 })
  }
}
