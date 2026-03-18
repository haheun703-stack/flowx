import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const revalidate = 300 // 5분 캐시

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
      // morning_briefings 테이블 없으면 기존 market_briefing 폴백
      const { data: fallback, error: fbErr } = await supabase
        .from('market_briefing')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (fbErr) return NextResponse.json({ error: 'No briefing data' }, { status: 404 })

      // 기존 스키마를 새 스키마로 매핑
      return NextResponse.json({
        date: fallback.date,
        market_status: fallback.direction ?? 'NEUTRAL',
        us_summary: fallback.us_summary,
        kr_summary: fallback.kr_summary,
        news_picks: fallback.news_picks ?? [],
        sector_focus: [],
        kospi_close: fallback.kospi_close,
      })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Briefing unavailable' }, { status: 503 })
  }
}
