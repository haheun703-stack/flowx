import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const sp = req.nextUrl.searchParams
    const month = sp.get('month') // YYYY-MM
    const market = sp.get('market') // KR | US  (optional)

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })

    // 월별 이벤트 (캘린더 렌더링)
    let monthStart: string
    let monthEnd: string
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      monthStart = `${month}-01`
      const [y, m] = month.split('-').map(Number)
      const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
      monthEnd = `${next}-01`
    } else {
      // 기본: 이번 달
      const [y, m] = today.split('-').map(Number)
      monthStart = `${y}-${String(m).padStart(2, '0')}-01`
      const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
      monthEnd = `${next}-01`
    }

    let monthQ = supabase
      .from('market_calendar')
      .select('*')
      .gte('event_date', monthStart)
      .lt('event_date', monthEnd)
      .order('event_date')

    if (market === 'KR') monthQ = monthQ.in('market', ['KR', 'GLOBAL'])
    else if (market === 'US') monthQ = monthQ.in('market', ['US', 'GLOBAL'])

    // 향후 30일 이벤트 (리스트용)
    const end30 = new Date(new Date(today).getTime() + 30 * 86400000)
      .toISOString().slice(0, 10)

    let upcomingQ = supabase
      .from('market_calendar')
      .select('*')
      .gte('event_date', today)
      .lte('event_date', end30)
      .order('event_date')
      .limit(20)

    if (market === 'KR') upcomingQ = upcomingQ.in('market', ['KR', 'GLOBAL'])
    else if (market === 'US') upcomingQ = upcomingQ.in('market', ['US', 'GLOBAL'])

    const [{ data: events, error: e1 }, { data: upcoming, error: e2 }] = await Promise.all([
      monthQ,
      upcomingQ,
    ])

    if (e1 || e2) {
      console.error('[API /market/calendar]', e1?.message, e2?.message)
      return NextResponse.json({ error: '캘린더 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({
      events: events ?? [],
      upcoming: upcoming ?? [],
      month: monthStart.slice(0, 7),
    })
  } catch (err) {
    console.error('[API /market/calendar] error:', err)
    return NextResponse.json({ error: '캘린더 데이터 조회 오류' }, { status: 500 })
  }
}
