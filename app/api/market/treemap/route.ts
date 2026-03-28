import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface TreemapStock {
  ticker: string
  name: string
  marketCap: number
  changePercent: number
  tradingValue: number
}

interface TreemapSector {
  name: string
  marketCap: number
  stocks: TreemapStock[]
}

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data, error } = await sb
      .from('treemap_stocks')
      .select('ticker, name, sector, market, change_pct, foreign_net, institution_net, price, updated_at')
      .order('sector')

    if (error) {
      console.error('[treemap] DB error:', error.message)
      return NextResponse.json({ sectors: [] }, { status: 500 })
    }

    if (!data?.length) {
      return NextResponse.json({ sectors: [], meta: { totalStocks: 0, lastUpdated: null } })
    }

    // 섹터별 그룹핑
    // NOTE: treemap_stocks에 market_cap 컬럼 없음 → price를 대체 사용
    //       정보봇에 market_cap 추가 요청 예정
    const sectorMap = new Map<string, TreemapStock[]>()

    for (const row of data) {
      const price = Number(row.price) || 0
      if (price <= 0) continue

      const stock: TreemapStock = {
        ticker: row.ticker,
        name: row.name,
        marketCap: price,          // TODO: market_cap 컬럼 추가 후 교체
        changePercent: Number(row.change_pct) || 0,
        tradingValue: Math.abs(Number(row.foreign_net) || 0) + Math.abs(Number(row.institution_net) || 0),
      }

      const existing = sectorMap.get(row.sector) ?? []
      existing.push(stock)
      sectorMap.set(row.sector, existing)
    }

    const sectors: TreemapSector[] = Array.from(sectorMap.entries())
      .map(([name, stocks]) => ({
        name,
        marketCap: stocks.reduce((sum, s) => sum + s.marketCap, 0),
        stocks: stocks.sort((a, b) => b.marketCap - a.marketCap),
      }))
      .sort((a, b) => b.marketCap - a.marketCap)

    const totalStocks = sectors.reduce((sum, s) => sum + s.stocks.length, 0)
    const lastUpdated = data[0]?.updated_at ?? new Date().toISOString()

    return NextResponse.json({
      sectors,
      meta: { totalStocks, lastUpdated },
    })
  } catch (e) {
    console.error('[treemap] error:', e)
    return NextResponse.json({ sectors: [] }, { status: 500 })
  }
}
