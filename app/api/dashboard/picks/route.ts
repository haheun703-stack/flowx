import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data, error } = await sb
      .from('treemap_stocks')
      .select('ticker, name, price, change_pct, foreign_net, institution_net, market_cap')
      .order('market_cap', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[dashboard/picks] DB error:', error.message)
      return NextResponse.json({ error: '추천 종목 조회 오류' }, { status: 500 })
    }

    const picks = (data ?? []).map((r: Record<string, unknown>) => ({
      ticker: r.ticker as string,
      name: r.name as string,
      close: Number(r.price ?? 0),
      price_change: Number(r.change_pct ?? 0),
      foreign_5d: Number(r.foreign_net ?? 0),
      inst_5d: Number(r.institution_net ?? 0),
    }))

    return NextResponse.json({ picks })
  } catch {
    return NextResponse.json({ error: 'picks data unavailable' }, { status: 500 })
  }
}
