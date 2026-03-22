import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { SECTOR_LIST } from '@/lib/chart-tokens'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params

  // Validate sector key
  if (!SECTOR_LIST.some((s) => s.key === key)) {
    return NextResponse.json({ error: `Invalid sector: ${key}` }, { status: 404 })
  }

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

    const stocks = stocksRes.data ?? []
    const links = linksRes.data ?? []

    // Group stocks by tier (safe typing)
    const tiers: Record<number, typeof stocks> = {}
    for (const stock of stocks) {
      const t = stock.tier as number
      if (t < 1 || t > 5) continue // skip invalid tiers
      if (!tiers[t]) tiers[t] = []
      tiers[t].push(stock)
    }

    return NextResponse.json({ key, stocks, tiers, links })
  } catch {
    return NextResponse.json({ error: 'Sector data unavailable' }, { status: 503 })
  }
}
