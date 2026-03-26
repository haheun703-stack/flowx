import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// intelligence_briefing (봇 생성) + macro_data + intelligence_news → BriefingData 합성
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const [briefingRes, macroRes, newsRes] = await Promise.allSettled([
      supabase
        .from('intelligence_briefing')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('macro_data')
        .select('indices, vix, date')
        .order('date', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('intelligence_news')
        .select('title, summary, related_tickers')
        .order('date', { ascending: false })
        .limit(5),
    ])

    const briefing = briefingRes.status === 'fulfilled' ? briefingRes.value.data : null
    const macro = macroRes.status === 'fulfilled' ? macroRes.value.data : null
    const news = newsRes.status === 'fulfilled' ? newsRes.value.data : null

    if (!briefing) {
      return NextResponse.json({ error: 'No briefing data' }, { status: 404 })
    }

    // sentiment → direction 매핑
    const dirMap: Record<string, string> = {
      BULLISH: 'BULL', BEARISH: 'BEAR', NEUTRAL: 'NEUTRAL',
    }
    const direction = dirMap[briefing.sentiment] ?? 'NEUTRAL'

    // KOSPI 종가 (macro_data.indices에서 추출)
    let kospiClose = 0
    if (macro?.indices && Array.isArray(macro.indices)) {
      const kospi = macro.indices.find((i: { symbol: string }) =>
        i.symbol === 'KOSPI' || i.symbol === '코스피')
      if (kospi) kospiClose = kospi.price ?? 0
    }

    // VIX 기반 시장 국면
    const vixVal = macro?.vix?.price ?? 0
    const marketPhase = vixVal > 35 ? '패닉장' : vixVal > 25 ? '경계장' : vixVal > 20 ? '조정장' : '안정장'

    // US summary (S&P500, NASDAQ, DOW)
    let usSummary = ''
    if (macro?.indices && Array.isArray(macro.indices)) {
      const usIdx = macro.indices.filter((i: { symbol: string }) =>
        ['SPX', 'IXIC', 'DJI', 'SP500'].includes(i.symbol))
      if (usIdx.length > 0) {
        usSummary = usIdx.map((i: { symbol: string; name: string; change: number }) => {
          const sign = i.change >= 0 ? '+' : ''
          return `${i.name ?? i.symbol} ${sign}${i.change?.toFixed(1) ?? 0}%`
        }).join(', ')
      }
    }

    // news_picks (최신 뉴스에서 종목 추출)
    // related_tickers는 jsonb — [{code, name, change_pct}] 객체 배열
    const newsPicks = (news ?? [])
      .filter((n: { related_tickers?: unknown[] }) => n.related_tickers && n.related_tickers.length > 0)
      .slice(0, 3)
      .map((n: { title: string; related_tickers: Record<string, unknown>[] }) => {
        const t = n.related_tickers[0] ?? {}
        return {
          code: String(t.code ?? t.ticker ?? ''),
          name: String(t.name ?? ''),
          reason: n.title,
        }
      })

    return NextResponse.json({
      date: briefing.date,
      direction,
      market_phase: marketPhase,
      kospi_close: kospiClose,
      us_summary: usSummary || '미국 시장 데이터 수집 중',
      kr_summary: briefing.verdict ?? '시장 분석 진행 중',
      news_picks: newsPicks,
    })
  } catch {
    return NextResponse.json({ error: 'Briefing unavailable' }, { status: 503 })
  }
}
