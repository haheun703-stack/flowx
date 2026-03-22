import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const [stocksRes, linksRes] = await Promise.all([
      sb.from('sector_universe')
        .select('sector_key, sector_name, tier, stock_name, change_pct'),
      sb.from('sector_links')
        .select('sector_key'),
    ])

    const stocks = stocksRes.data ?? []
    const links = linksRes.data ?? []

    // Group by sector
    const sectorMap = new Map<string, {
      key: string
      name: string
      stockCount: number
      linkCount: number
      avgChange: number
      tierCounts: Record<number, number>
      topMovers: { name: string; change: number }[]
    }>()

    for (const s of stocks) {
      if (!sectorMap.has(s.sector_key)) {
        sectorMap.set(s.sector_key, {
          key: s.sector_key,
          name: s.sector_name,
          stockCount: 0,
          linkCount: 0,
          avgChange: 0,
          tierCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          topMovers: [],
        })
      }
      const entry = sectorMap.get(s.sector_key)!
      entry.stockCount++
      entry.tierCounts[s.tier] = (entry.tierCounts[s.tier] || 0) + 1
      entry.topMovers.push({ name: s.stock_name, change: s.change_pct ?? 0 })
    }

    // Count links per sector
    for (const l of links) {
      const entry = sectorMap.get(l.sector_key)
      if (entry) entry.linkCount++
    }

    // Calculate averages + sort top movers
    const sectors = Array.from(sectorMap.values()).map((s) => {
      const totalChange = s.topMovers.reduce((sum, m) => sum + m.change, 0)
      s.avgChange = s.stockCount > 0 ? +(totalChange / s.stockCount).toFixed(2) : 0
      s.topMovers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      s.topMovers = s.topMovers.slice(0, 3)
      return s
    })

    return NextResponse.json({ sectors })
  } catch {
    return NextResponse.json({ sectors: [] }, { status: 500 })
  }
}
