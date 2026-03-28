import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] })
  }

  try {
    const sb = getSupabaseAdmin()

    // quant_jarvis 최신 데이터에서 picks 검색
    const { data: jarvis } = await sb
      .from('quant_jarvis')
      .select('date, data')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const picks: any[] = jarvis?.data?.picks ?? []
    const matchedPicks = picks.filter((p) => {
      const name = (p.name ?? '').toLowerCase()
      const ticker = (p.ticker ?? '').toLowerCase()
      return name.includes(q.toLowerCase()) || ticker.includes(q.toLowerCase())
    }).slice(0, 10)

    // short_signals에서 최근 시그널 검색
    const { data: signals } = await sb
      .from('short_signals')
      .select('*')
      .or(`name.ilike.%${q}%,코드.ilike.%${q}%`)
      .order('date', { ascending: false })
      .limit(5)

    // morning_briefings에서 언급된 종목 검색
    const { data: briefing } = await sb
      .from('morning_briefings')
      .select('date, news_picks, sector_focus')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    const results: { ticker: string; name: string; grade: string; score: number; source: string; date: string | undefined; has_why_now: boolean }[] = matchedPicks.map((p) => ({
      ticker: p.ticker,
      name: p.name,
      grade: p.grade ?? '',
      score: p.total_score ?? 0,
      source: 'jarvis',
      date: jarvis?.date,
      has_why_now: !!p.why_now,
    }))

    // 시그널에서 추가 (중복 제거)
    const seenTickers = new Set(results.map((r) => r.ticker))
    for (const sig of signals ?? []) {
      const ticker = sig['코드'] ?? ''
      if (seenTickers.has(ticker)) continue
      seenTickers.add(ticker)
      results.push({
        ticker,
        name: sig.name ?? '',
        grade: sig['등급'] ?? '',
        score: sig.total_score ?? 0,
        source: 'signal',
        date: sig.date,
        has_why_now: false,
      })
    }

    return NextResponse.json({
      results,
      briefing_date: briefing?.date ?? null,
    })
  } catch (e) {
    console.error('[search] error:', e)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
