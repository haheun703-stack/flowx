import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const source = searchParams.get('source') // DART | EDGAR | null(전체)
  const dateStr = searchParams.get('date')
  const rawLimit = parseInt(searchParams.get('limit') ?? '30', 10)
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 30 : rawLimit, 1), 100)

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('intelligence_disclosures')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (source) query = query.eq('source', source)
    if (dateStr) query = query.eq('date', dateStr)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // 봇 컬럼명 → 프론트엔드 타입 매핑
    const items = (data ?? []).map((row: Record<string, unknown>) => {
      // severity(CRITICAL/WARNING) → sentiment(POSITIVE/CAUTION/NEUTRAL)
      const severity = row.severity as string | undefined
      let sentiment = row.sentiment as string | undefined
      if (!sentiment && severity) {
        sentiment = (severity === 'CRITICAL' || severity === 'WARNING') ? 'CAUTION' : 'NEUTRAL'
      }
      const tags = Array.isArray(row.tags) ? row.tags : []

      return {
        id: row.id,
        date: row.date,
        source: row.source,
        ticker: row.ticker ?? null,
        ticker_name: row.ticker_name ?? null,
        title: row.title,
        category: row.category ?? (tags[0] as string) ?? null,
        sentiment: sentiment ?? 'NEUTRAL',
        ai_summary: row.ai_summary ?? null,
        tags,
        original_url: row.original_url ?? null,
      }
    })

    return NextResponse.json({
      date: data?.[0]?.date ?? null,
      items,
      count: items.length,
    })
  } catch {
    return NextResponse.json({ error: 'Disclosures unavailable' }, { status: 503 })
  }
}
