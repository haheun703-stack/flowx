import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('dashboard_crash_bounce')
      .select('*')
      .order('date', { ascending: false })
      .order('score', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[API /crash-bounce] Supabase error:', error.message)
      return NextResponse.json({ error: '급락반등 조회 오류' }, { status: 500 })
    }

    if (!data?.length) return NextResponse.json({ items: [], date: null })

    const latestDate = data[0].date
    const items = data.filter((d) => d.date === latestDate)

    return NextResponse.json({ items, date: latestDate })
  } catch (err) {
    console.error('[API /crash-bounce] error:', err)
    return NextResponse.json({ error: '급락반등 조회 오류' }, { status: 500 })
  }
}
