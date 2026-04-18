import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('intelligence_briefing')
      .select('id,date,verdict,sentiment,confidence,updated_at')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /dashboard/market-report] Supabase error:', error.message)
      return NextResponse.json({ error: '시장 판단 조회 오류' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({
        date: null,
        kospi_regime: 'NEUTRAL',
        verdict: null,
        confidence: 0,
        kospi_slots: 0,
        relay_fired: 0,
        relay_signals: 0,
      })
    }

    // sentiment → kospi_regime 매핑 (기존 카드 호환)
    const regimeMap: Record<string, string> = {
      BULLISH: 'BULL',
      BEARISH: 'BEAR',
      NEUTRAL: 'NEUTRAL',
      CAUTION: 'CAUTION',
    }

    return NextResponse.json({
      date: data.date,
      generated_at: data.updated_at,
      kospi_regime: regimeMap[data.sentiment] ?? 'NEUTRAL',
      verdict: data.verdict,
      confidence: data.confidence ?? 0,
      // 슬롯/릴레이는 이 테이블에 없으므로 기본값
      kospi_slots: 0,
      relay_fired: 0,
      relay_signals: 0,
      market_stance: data.sentiment,
      us_grade: '',
      us_score: 0,
      quantum_count: 0,
      positions_total: 0,
      buys: 0,
      sells: 0,
    })
  } catch (err) {
    console.error('[API /dashboard/market-report] error:', err)
    return NextResponse.json({ error: '시장 판단 조회 오류' }, { status: 500 })
  }
}
