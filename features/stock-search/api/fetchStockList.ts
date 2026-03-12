import { StockItem } from '../types'

async function fetchMarketList(market: 'KOSPI' | 'KOSDAQ'): Promise<StockItem[]> {
  const params = new URLSearchParams({
    bld: 'dbms/MDC/STAT/standard/MDCSTAT01901',
    locale: 'ko_KR',
    mktId: market === 'KOSPI' ? 'STK' : 'KSQ',
    csvxls_isNo: 'false',
  })

  const res = await fetch(
    'https://data.krx.co.kr/comm/bldAttendant/getJsonData.cmd',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    }
  )

  if (!res.ok) return []

  const json = await res.json()

  return (json.OutBlock_1 ?? []).map((row: any) => ({
    code: row.ISU_SRT_CD,
    name: row.ISU_ABBRV,
    market,
  }))
}

export async function fetchStockList(): Promise<StockItem[]> {
  const [kospi, kosdaq] = await Promise.all([
    fetchMarketList('KOSPI'),
    fetchMarketList('KOSDAQ'),
  ])
  return [...kospi, ...kosdaq]
}
