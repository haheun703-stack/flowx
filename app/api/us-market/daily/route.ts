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
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: '데이터 없음' }, { status: 404 })
    }

    return NextResponse.json({
      ...data,
      sector_etf: data.sector_etf ?? {},
      risk_flags: data.risk_flags ?? [],
      mag7: data.mag7 ?? null,
      futures: data.futures ?? null,
      crypto: data.crypto ?? null,
      forex: data.forex ?? null,
      yield_curve: data.yield_curve ?? null,
      breadth: data.breadth ?? null,
      us_news: data.us_news ?? null,
    })
  } catch (err) {
    console.error('[us-market/daily]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
