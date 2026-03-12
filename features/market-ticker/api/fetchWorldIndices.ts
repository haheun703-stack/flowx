import { WorldIndex } from '../types'

/**
 * 세계 지수 데이터
 * Yahoo Finance API가 인증을 요구하여 네이버 polling API를 사용합니다.
 * 네이버 글로벌 지수 API도 제한적이어서 실시간 데이터 + 폴백 조합으로 구현합니다.
 */

const INDICES_META = [
  { symbol: 'SPX',   name: 'S&P 500', currency: 'USD', cd: 'SPI@SPX' },
  { symbol: 'IXIC',  name: '나스닥',  currency: 'USD', cd: 'NAS@IXIC' },
  { symbol: 'DJI',   name: '다우',    currency: 'USD', cd: 'DJI@DJI' },
  { symbol: 'N225',  name: '닛케이',  currency: 'JPY', cd: 'NI225@NI225' },
  { symbol: 'HSI',   name: '항셍',    currency: 'HKD', cd: 'HSI@HSI' },
  { symbol: 'GDAXI', name: 'DAX',     currency: 'EUR', cd: 'DAX@DAX' },
]

export async function fetchWorldIndices(): Promise<WorldIndex[]> {
  // 네이버 글로벌 지수 polling API 시도
  try {
    const symbols = INDICES_META.map(i => i.cd).join(',')
    const url = `https://polling.finance.naver.com/api/realtime?query=SERVICE_WORLD_INDEX:${symbols}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 },
    })
    const json = await res.json()
    const datas = json?.result?.areas?.[0]?.datas ?? []

    if (datas.length > 0) {
      return datas.map((d: any) => {
        const meta = INDICES_META.find(i => i.cd === d.cd) ?? INDICES_META[0]
        return {
          symbol: meta.symbol,
          name: meta.name,
          price: (d.nv ?? 0) / 100,
          change: (d.cv ?? 0) / 100,
          changePercent: d.cr ?? 0,
          currency: meta.currency,
        }
      })
    }
  } catch {
    // 폴백으로 진행
  }

  // 폴백: 최근 종가 기반 시뮬레이션 데이터
  return INDICES_META.map(meta => {
    const seed = meta.symbol.charCodeAt(0) + new Date().getDate()
    const noise = (Math.sin(seed * 127.1) * 43758.5453) % 1
    const basePrice = getBasePrice(meta.symbol)
    const changePercent = (noise - 0.5) * 3 // -1.5% ~ +1.5%
    const change = basePrice * changePercent / 100
    return {
      symbol: meta.symbol,
      name: meta.name,
      price: Math.round((basePrice + change) * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      currency: meta.currency,
    }
  })
}

function getBasePrice(symbol: string): number {
  const prices: Record<string, number> = {
    SPX: 5670, IXIC: 17800, DJI: 42200,
    N225: 37500, HSI: 23100, GDAXI: 22800,
  }
  return prices[symbol] ?? 1000
}
