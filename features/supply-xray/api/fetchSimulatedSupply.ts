import { SupplyData } from '@/entities/stock/types'
import { fetchOHLCV } from './fetchOHLCV'

/**
 * 수급 데이터 시뮬레이션 (Fallback)
 * KIS API 실패 시 OHLCV 데이터 기반으로 수급을 추정 생성합니다.
 */
export async function fetchSimulatedSupply(ticker: string): Promise<SupplyData[]> {
  const ohlcv = await fetchOHLCV(ticker, 120)

  const seed = parseInt(ticker) || 5930

  return ohlcv.map((candle, i) => {
    const priceChange = candle.close - candle.open
    const volumeScale = candle.volume / 100

    const trend = priceChange / candle.open
    const noise = seededRandom(seed + i)

    const foreign = Math.round(
      volumeScale * (trend * 30 + (noise - 0.45) * 8)
    )
    const institution = Math.round(
      volumeScale * (trend * 20 + (seededRandom(seed + i + 1000) - 0.5) * 6)
    )
    const individual = -(foreign + institution)

    return {
      date: candle.time,
      foreign,
      institution,
      individual,
    }
  })
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
