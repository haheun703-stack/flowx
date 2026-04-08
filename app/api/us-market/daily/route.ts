import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('us_market_daily')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '데이터 없음' }, { status: 404 })
    }

    const latest = data[0]

    return NextResponse.json({
      date: latest.date,
      sp500_close: latest.sp500_close,
      sp500_change: latest.sp500_change,
      nasdaq_close: latest.nasdaq_close,
      nasdaq_change: latest.nasdaq_change,
      dow_close: latest.dow_close,
      dow_change: latest.dow_change,
      vix: latest.vix,
      fear_greed: latest.fear_greed,
      fear_greed_label: latest.fear_greed_label,
      us_3y_yield: latest.us_3y_yield,
      us_2y_yield: latest.us_2y_yield,
      us_10y_yield: latest.us_10y_yield,
      spread_3y_10y: latest.spread_3y_10y,
      spread_2y_10y: latest.spread_2y_10y,
      dxy: latest.dxy,
      wti: latest.wti,
      gold: latest.gold,
      soxx_close: latest.soxx_close,
      soxx_change: latest.soxx_change,
      sector_etf: latest.sector_etf ?? {},
      kr_impact: latest.kr_impact,
      risk_flags: latest.risk_flags ?? [],
    })
  } catch (err) {
    console.error('[us-market/daily]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
