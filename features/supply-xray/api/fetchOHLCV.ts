import { CandleData } from '@/entities/stock/types'
import { formatKRXDate } from '@/shared/lib/formatters'

interface NaverPriceInfo {
  localDate: string
  closePrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  accumulatedTradingVolume: number
}

interface NaverChartResponse {
  priceInfos: NaverPriceInfo[]
}

export async function fetchOHLCV(ticker: string, count = 120): Promise<CandleData[]> {
  const url = `https://api.stock.naver.com/chart/domestic/item/${ticker}?periodType=dayCandle&count=${count}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Naver API error: ${res.status}`)

  const json: NaverChartResponse = await res.json()

  return json.priceInfos
    .map(item => ({
      time: formatKRXDate(item.localDate),
      open: item.openPrice,
      high: item.highPrice,
      low: item.lowPrice,
      close: item.closePrice,
      volume: item.accumulatedTradingVolume,
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
}
