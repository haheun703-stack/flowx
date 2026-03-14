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

export interface DailyKOSPIPoint {
  date: string   // YYYY-MM-DD
  close: number
}

/**
 * 네이버 주식 API — KOSPI 지수 일봉 (최근 30일)
 */
export async function fetchDailyKOSPI(count = 30): Promise<DailyKOSPIPoint[]> {
  const url = `https://api.stock.naver.com/chart/domestic/index/KOSPI?periodType=dayCandle&count=${count}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Naver API error: ${res.status}`)

  const json: NaverChartResponse = await res.json()

  return json.priceInfos
    .map(item => ({
      date: formatKRXDate(item.localDate),
      close: item.closePrice,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-count)
}
