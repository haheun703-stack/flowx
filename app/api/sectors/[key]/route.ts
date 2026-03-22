import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params

  try {
    const supabase = getSupabaseAdmin()

    const [stocksRes, linksRes] = await Promise.all([
      supabase
        .from('sector_universe')
        .select('*')
        .eq('sector_key', key)
        .order('tier', { ascending: false }),
      supabase
        .from('sector_links')
        .select('*')
        .eq('sector_key', key),
    ])

    if (stocksRes.error) return NextResponse.json({ error: stocksRes.error.message }, { status: 500 })
    if (linksRes.error) return NextResponse.json({ error: linksRes.error.message }, { status: 500 })

    // Group stocks by tier
    const tiers: Record<number, typeof stocksRes.data> = {}
    for (const stock of stocksRes.data ?? []) {
      const t = stock.tier as number
      if (!tiers[t]) tiers[t] = []
      tiers[t].push(stock)
    }

    return NextResponse.json({
      key,
      stocks: stocksRes.data,
      tiers,
      links: linksRes.data,
    })
  } catch {
    return NextResponse.json({ error: 'Sector data unavailable' }, { status: 503 })
  }
}
