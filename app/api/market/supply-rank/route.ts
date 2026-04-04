import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    // 외국인 순매수 TOP 5
    const { data: foreignRows } = await sb
      .from('treemap_stocks')
      .select('ticker, name, price, change_pct, foreign_net, institution_net')
      .gt('foreign_net', 0)
      .order('foreign_net', { ascending: false })
      .limit(5)

    // 기관 순매수 TOP 5
    const { data: instRows } = await sb
      .from('treemap_stocks')
      .select('ticker, name, price, change_pct, foreign_net, institution_net')
      .gt('institution_net', 0)
      .order('institution_net', { ascending: false })
      .limit(5)

    const mapRow = (r: Record<string, unknown>) => ({
      code: r.ticker as string,
      name: r.name as string,
      price: Number(r.price ?? 0),
      changePercent: Number(r.change_pct ?? 0),
      foreignNet: Math.round(Number(r.foreign_net ?? 0) / 100),
      instNet: Math.round(Number(r.institution_net ?? 0) / 100),
    })

    return NextResponse.json({
      foreign: (foreignRows ?? []).map(mapRow),
      inst: (instRows ?? []).map(mapRow),
    })
  } catch (e) {
    console.error('market/supply-rank error:', e)
    return NextResponse.json({ foreign: [], inst: [] }, { status: 500 })
  }
}
