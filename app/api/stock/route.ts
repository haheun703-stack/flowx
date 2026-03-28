import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ticker = searchParams.get('ticker')?.trim()
  if (!ticker) {
    return NextResponse.json({ error: 'ticker required' }, { status: 400 })
  }

  try {
    const sb = getSupabaseAdmin()

    // 1. quant_jarvis에서 해당 종목 pick + why_now
    const { data: jarvis } = await sb
      .from('quant_jarvis')
      .select('date, data')
      .order('date', { ascending: false })
      .limit(3)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pick: any = null
    let jarvisDate: string | null = null
    for (const row of jarvis ?? []) {
      const picks = row.data?.picks ?? []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const found = picks.find((p: any) => p.ticker === ticker)
      if (found) {
        pick = found
        jarvisDate = row.date
        break
      }
    }

    // 2. short_signals에서 최근 시그널 이력
    const { data: signals } = await sb
      .from('short_signals')
      .select('*')
      .eq('코드', ticker)
      .order('date', { ascending: false })
      .limit(10)

    // 3. morning_briefings에서 최근 언급
    const { data: briefings } = await sb
      .from('morning_briefings')
      .select('date, news_picks, sector_focus, market_status, kr_summary')
      .order('date', { ascending: false })
      .limit(5)

    // 4. stock_technicals에서 기술지표
    const { data: techRow } = await sb
      .from('stock_technicals')
      .select('*')
      .eq('ticker', ticker)
      .limit(1)
      .single()

    // 5. stock_valuations에서 밸류에이션
    const { data: valRow } = await sb
      .from('stock_valuations')
      .select('*')
      .eq('ticker', ticker)
      .limit(1)
      .single()

    // 6. ml_predictions에서 ML 예측
    const { data: mlRow } = await sb
      .from('ml_predictions')
      .select('*')
      .eq('code', ticker)
      .eq('pred_type', 'stock')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    // briefing에서 해당 종목 언급 찾기
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const briefingMentions = (briefings ?? []).filter((b: any) => {
      const picks = b.news_picks ?? []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return picks.some((p: any) => p.ticker === ticker || p.code === ticker)
    }).map((b) => ({
      date: b.date,
      market_status: b.market_status,
    }))

    return NextResponse.json({
      ticker,
      pick,
      jarvis_date: jarvisDate,
      why_now: pick?.why_now ?? null,
      technicals: techRow ?? null,
      valuations: valRow ?? null,
      ml_prediction: mlRow ?? null,
      signals: (signals ?? []).map((s) => ({
        date: s.date,
        signal_type: s.signal_type,
        grade: s['등급'] ?? '',
        score: s.total_score,
        entry_price: s.entry_price,
        target_price: s.target_price,
        stop_loss: s.stop_loss,
        reasons: s.signals ?? [],
      })),
      briefing_mentions: briefingMentions,
    })
  } catch (e) {
    console.error('[stock] error:', e)
    return NextResponse.json({ error: 'Stock data unavailable' }, { status: 500 })
  }
}
