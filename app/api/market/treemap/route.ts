import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

export const revalidate = 300

interface SectorMapping {
  [ticker: string]: { name: string; sector: string }
}

interface NaverStock {
  itemCode: string
  stockName: string
  closePrice: string
  fluctuationsRatio: string
  marketValue: string
}

interface TreemapStock {
  ticker: string
  name: string
  marketCap: number
  changePercent: number
}

interface TreemapSector {
  name: string
  marketCap: number
  stocks: TreemapStock[]
}

function parseNumber(s: string): number {
  return parseFloat(s.replace(/,/g, '')) || 0
}

async function fetchNaverStocks(market: 'KOSPI' | 'KOSDAQ', pageSize = 60): Promise<NaverStock[]> {
  try {
    const url = `https://m.stock.naver.com/api/stocks/marketValue/${market}?page=1&pageSize=${pageSize}`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return []
    const json = await res.json()
    return json.stocks ?? []
  } catch {
    return []
  }
}

export async function GET() {
  try {
    // 1. 정적 섹터 매핑 읽기
    const mappingPath = path.join(process.cwd(), 'public', 'data', 'treemap', 'sector_stocks.json')
    const mapping: SectorMapping = JSON.parse(readFileSync(mappingPath, 'utf-8'))

    // 2. KOSPI + KOSDAQ 시가총액 데이터 가져오기
    const [kospi, kosdaq] = await Promise.all([
      fetchNaverStocks('KOSPI', 80),
      fetchNaverStocks('KOSDAQ', 20),
    ])
    const allStocks = [...kospi, ...kosdaq]

    // 3. 매핑된 종목만 추출 + 섹터 정보 합치기
    const sectorMap = new Map<string, TreemapStock[]>()

    for (const item of allStocks) {
      const info = mapping[item.itemCode]
      if (!info) continue

      const stock: TreemapStock = {
        ticker: item.itemCode,
        name: info.name,
        marketCap: parseNumber(item.marketValue), // 억원 단위
        changePercent: parseNumber(item.fluctuationsRatio),
      }

      if (stock.marketCap <= 0) continue

      const existing = sectorMap.get(info.sector) ?? []
      existing.push(stock)
      sectorMap.set(info.sector, existing)
    }

    // 4. 섹터별 그룹핑 + 정렬
    const sectors: TreemapSector[] = Array.from(sectorMap.entries())
      .map(([name, stocks]) => ({
        name,
        marketCap: stocks.reduce((sum, s) => sum + s.marketCap, 0),
        stocks: stocks.sort((a, b) => b.marketCap - a.marketCap),
      }))
      .sort((a, b) => b.marketCap - a.marketCap)

    return NextResponse.json({ sectors })
  } catch (e) {
    console.error('Treemap API error:', e)
    return NextResponse.json({ sectors: [] }, { status: 500 })
  }
}
