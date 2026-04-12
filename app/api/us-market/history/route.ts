import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('us_market_daily')
      .select('date,sp500_close,sp500_change,nasdaq_close,nasdaq_change,dow_close,dow_change,soxx_close,soxx_change,vix,fear_greed,fear_greed_label')
      .order('date', { ascending: false })
      .limit(30)

    if (error) throw error

    // Reverse to chronological order (oldest first)
    const sorted = (data ?? []).reverse()
    return NextResponse.json({ history: sorted })
  } catch (err) {
    console.error('[us-market/history]', err)
    return NextResponse.json({ history: [] })
  }
}
