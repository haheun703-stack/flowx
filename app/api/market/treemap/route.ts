import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface TreemapStock {
  ticker: string
  name: string
  market: string
  marketCap: number
  changePercent: number
  tradingValue: number
  price: number
  foreignNet: number
  instNet: number
}

interface TreemapSector {
  name: string
  marketCap: number
  tradingValue: number
  avgChange: number
  stocks: TreemapStock[]
}

const ETC_LIMIT = 50

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data, error } = await sb
      .from('treemap_stocks')
      .select('ticker, name, sector, market, change_pct, foreign_net, institution_net, price, market_cap, trading_volume, updated_at')
      .order('market_cap', { ascending: false })

    if (error) {
      console.error('[treemap] DB error:', error.message)
      return NextResponse.json({ sectors: [] }, { status: 500 })
    }

    if (!data?.length) {
      return NextResponse.json({ sectors: [], meta: { totalStocks: 0, lastUpdated: null } })
    }

    // 섹터별 그룹핑
    const sectorMap = new Map<string, TreemapStock[]>()

    for (const row of data) {
      const marketCap = Number(row.market_cap) || Number(row.price) || 0
      if (marketCap <= 0) continue

      const stock: TreemapStock = {
        ticker: row.ticker,
        name: row.name,
        market: row.market ?? 'KOSPI',
        marketCap,
        changePercent: Number(row.change_pct) || 0,
        tradingValue: Number(row.trading_volume) || (Math.abs(Number(row.foreign_net) || 0) + Math.abs(Number(row.institution_net) || 0)),
        price: Number(row.price) || 0,
        foreignNet: Number(row.foreign_net) || 0,
        instNet: Number(row.institution_net) || 0,
      }

      const sector = row.sector ?? '기타'
      const existing = sectorMap.get(sector) ?? []
      existing.push(stock)
      sectorMap.set(sector, existing)
    }

    const sectors: TreemapSector[] = Array.from(sectorMap.entries())
      .map(([name, stocks]) => {
        // "기타" 섹터는 시총 TOP 50만
        const limited = name === '기타' ? stocks.slice(0, ETC_LIMIT) : stocks
        const totalMcap = limited.reduce((sum, s) => sum + s.marketCap, 0)
        const totalTv = limited.reduce((sum, s) => sum + s.tradingValue, 0)
        const weightedChange = totalMcap > 0
          ? limited.reduce((sum, s) => sum + s.changePercent * s.marketCap, 0) / totalMcap
          : 0

        return {
          name,
          marketCap: totalMcap,
          tradingValue: totalTv,
          avgChange: Math.round(weightedChange * 100) / 100,
          stocks: limited,
        }
      })
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
