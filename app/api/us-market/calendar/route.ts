import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const sb = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // YYYY-MM

    let query = sb
      .from('us_market_calendar')
      .select('*')
      .order('date', { ascending: true })

    if (month) {
      const start = `${month}-01`
      const [y, m] = month.split('-').map(Number)
      const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
      query = query.gte('date', start).lt('date', nextMonth)
    } else {
      // 기본: 오늘 기준 전후 30일
      const today = new Date()
      const from = new Date(today)
      from.setDate(from.getDate() - 7)
      const to = new Date(today)
      to.setDate(to.getDate() + 30)
      query = query.gte('date', from.toISOString().slice(0, 10)).lte('date', to.toISOString().slice(0, 10))
    }

    const { data, error } = await query.limit(200)
    if (error) throw error

    return NextResponse.json({ events: data ?? [] })
  } catch (err) {
    console.error('[us-market/calendar]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
