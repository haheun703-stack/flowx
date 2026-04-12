import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('us_market_daily')
      .select('date, sp500_close, nasdaq_close, dow_close')
      .order('date', { ascending: true })
      .limit(60)

    if (error) throw error

    return NextResponse.json({ history: data ?? [] })
  } catch (err) {
    console.error('[us-market/history]', err)
    return NextResponse.json({ history: [] })
  }
}
