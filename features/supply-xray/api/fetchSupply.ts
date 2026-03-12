import { SupplyData } from '@/entities/stock/types'
import { CandleData } from '@/entities/stock/types'
import { fetchOHLCV } from './fetchOHLCV'

/**
 * 수급 데이터 생성
 * KRX API가 외부 접근을 차단하여 OHLCV 데이터 기반 시뮬레이션 모드로 동작합니다.
 * 실제 서비스에서는 KRX Open API 인증키 또는 증권사 API를 연동해야 합니다.
 */
export async function fetchSupply(ticker: string): Promise<SupplyData[]> {
  const ohlcv = await fetchOHLCV(ticker, 120)

  // 종목코드를 시드로 사용하여 일관된 데이터 생성
  const seed = parseInt(ticker) || 5930

  return ohlcv.map((candle, i) => {
    const priceChange = candle.close - candle.open
    const volumeScale = candle.volume / 100

    // 가격 상승 시 외국인/기관 매수 경향, 하락 시 매도 경향 (현실적 패턴)
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

/** 시드 기반 의사 난수 생성 (0~1) */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
