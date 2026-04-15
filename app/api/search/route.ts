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
    const sigRows: { ticker: string; name: string; grade: string; score: number; source: string; date: string | undefined; has_why_now: boolean }[] = []
    for (const sig of signals ?? []) {
      const ticker = sig['코드'] ?? sig.code ?? ''
      if (seenTickers.has(ticker)) continue
      seenTickers.add(ticker)
      const rawName = sig.name ?? ''
      sigRows.push({
        ticker,
        name: rawName,
        grade: sig['등급'] ?? sig.grade ?? '',
        score: sig.total_score ?? 0,
        source: 'signal',
        date: sig.date,
        has_why_now: false,
      })
    }

    // name이 비어있거나 종목코드인 경우 stock_master에서 보정
    const needsName = sigRows.filter((r) => !r.name || /^\d{6}$/.test(r.name))
    if (needsName.length > 0) {
      const codes = [...new Set(needsName.map((r) => r.ticker))]
      const { data: masters } = await sb
        .from('stock_master')
        .select('ticker, name')
        .in('ticker', codes)
      if (masters && masters.length > 0) {
        const nameMap = new Map(masters.map((m) => [m.ticker, m.name]))
        for (const r of sigRows) {
          if (!r.name || /^\d{6}$/.test(r.name)) {
            r.name = nameMap.get(r.ticker) ?? r.name ?? r.ticker
          }
        }
      }
    }
    results.push(...sigRows)

    return NextResponse.json({
      results,
      briefing_date: briefing?.date ?? null,
    })
  } catch (e) {
    console.error('[search] error:', e)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
