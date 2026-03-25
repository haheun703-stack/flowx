import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('morning_briefings')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // morning_briefings 없으면 intelligence_briefing 폴백
      const { data: fallback, error: fbErr } = await supabase
        .from('intelligence_briefing')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (fbErr) return NextResponse.json({ error: 'No briefing data' }, { status: 404 })

      const dirMap: Record<string, string> = { BULLISH: 'BULL', BEARISH: 'BEAR', NEUTRAL: 'NEUTRAL' }
      return NextResponse.json({
        date: fallback.date,
        market_status: dirMap[fallback.sentiment] ?? 'NEUTRAL',
        us_summary: '',
        kr_summary: fallback.verdict ?? '',
        news_picks: [],
        sector_focus: [],
        kospi_close: 0,
      })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Briefing unavailable' }, { status: 503 })
  }
}
