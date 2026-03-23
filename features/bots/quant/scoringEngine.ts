// 퀀트봇 — Soft Scoring 엔진 (100점 만점)
// 릴레이 크로스오버 + 기술적 분석 + 수급 + 레짐 보정

import { fetchOHLCV } from '@/features/supply-xray/api/fetchOHLCV'
import { calcSMA, calcRSI, calcMACD, calcBollinger, calcVolumeSMA } from '@/shared/lib/ta'
import { detectRegime, type RegimeResult } from '@/shared/lib/regime'
import { KOREAN_STOCKS } from '@/features/market-ticker/api/fetchKoreanTickers'

export interface ScoredStock {
  ticker: string
  name: string
  score: number
  rawScore: number
  breakdown: {
    relay: number
    technical: number
    supply: number
    regime: string
    multiplier: number
  }
  signals: string[]
}

interface SupplyContext {
  foreign_net: number
  inst_net: number
}

export async function runScoringEngine(
  supplyCtx: SupplyContext,
): Promise<{ stocks: ScoredStock[]; regime: RegimeResult }> {
  const regime = await detectRegime()

  // 모든 종목 OHLCV를 병렬 조회 (실패 시 skip)
  const results = await Promise.allSettled(
    KOREAN_STOCKS.map(async (stock) => {
      const candles = await fetchOHLCV(stock.code, 120)
      return { stock, candles }
    })
  )

  const scored: ScoredStock[] = []

  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    const { stock, candles } = r.value
    if (candles.length < 60) continue // 최소 60일 데이터 필요

    const last = candles.length - 1
    const signals: string[] = []
    let rawScore = 0

    // 1. 릴레이 크로스오버 (SMA5 > SMA20 > SMA60)
    const sma5 = calcSMA(candles, 5)
    const sma20 = calcSMA(candles, 20)
    const sma60 = calcSMA(candles, 60)

    const s5 = sma5[last], s20 = sma20[last], s60 = sma60[last]
    if (!isNaN(s5) && !isNaN(s20) && !isNaN(s60)) {
      if (s5 > s20 && s20 > s60) {
        rawScore += 35; signals.push('릴레이 3중 정배열(+35)')
      } else if (s5 > s20) {
        rawScore += 25; signals.push('릴레이 2중 정배열(+25)')
      } else if (s5 > s60) {
        rawScore += 15; signals.push('릴레이 부분 정배열(+15)')
      }
    }

    // 2. 기술적 분석 5항목
    // 2-1. RSI (50~70)
    const rsi = calcRSI(candles)
    const rsiVal = rsi[last]
    if (!isNaN(rsiVal) && rsiVal >= 50 && rsiVal <= 70) {
      rawScore += 10; signals.push(`RSI ${rsiVal.toFixed(0)} 적정(+10)`)
    }

    // 2-2. MACD 골든크로스
    const macd = calcMACD(candles)
    if (!isNaN(macd.histogram[last]) && !isNaN(macd.histogram[last - 1])) {
      if (macd.histogram[last] > 0 && macd.histogram[last - 1] <= 0) {
        rawScore += 10; signals.push('MACD 골든크로스(+10)')
      }
    }

    // 2-3. 볼린저 하단 이탈 후 복귀
    const bb = calcBollinger(candles)
    if (!isNaN(bb.lower[last]) && !isNaN(bb.lower[last - 1])) {
      if (candles[last - 1].close < bb.lower[last - 1] && candles[last].close >= bb.lower[last]) {
        rawScore += 5; signals.push('볼린저 하단 복귀(+5)')
      }
    }

    // 2-4. 거래량 20MA 돌파
    const volMA = calcVolumeSMA(candles, 20)
    if (!isNaN(volMA[last]) && candles[last].volume > volMA[last] * 2) {
      rawScore += 5; signals.push('거래량 급증(+5)')
    }

    // 2-5. 이전 고점 돌파 (20일 고점)
    const high20 = Math.max(...candles.slice(last - 20, last).map(c => c.high))
    if (candles[last].close > high20) {
      rawScore += 5; signals.push('20일 고점 돌파(+5)')
    }

    // 3. 수급 파워
    const { foreign_net, inst_net } = supplyCtx
    if (foreign_net > 0 && inst_net > 0) {
      rawScore += 20; signals.push('외국인+기관 동시매수(+20)')
    } else if (foreign_net > 0) {
      rawScore += 15; signals.push('외국인 순매수(+15)')
    } else if (inst_net > 0) {
      rawScore += 10; signals.push('기관 순매수(+10)')
    } else if (foreign_net < 0 && inst_net < 0) {
      rawScore -= 15; signals.push('외국인+기관 동시매도(-15)')
    }

    // 4. 레짐 보정
    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore * regime.multiplier)))

    scored.push({
      ticker: stock.code,
      name: stock.name,
      score: finalScore,
      rawScore,
      breakdown: {
        relay: s5 > s20 && s20 > s60 ? 35 : s5 > s20 ? 25 : s5 > s60 ? 15 : 0,
        technical: rawScore - (s5 > s20 && s20 > s60 ? 35 : s5 > s20 ? 25 : s5 > s60 ? 15 : 0) - (foreign_net > 0 && inst_net > 0 ? 20 : foreign_net > 0 ? 15 : inst_net > 0 ? 10 : foreign_net < 0 && inst_net < 0 ? -15 : 0),
        supply: foreign_net > 0 && inst_net > 0 ? 20 : foreign_net > 0 ? 15 : inst_net > 0 ? 10 : foreign_net < 0 && inst_net < 0 ? -15 : 0,
        regime: regime.regime,
        multiplier: regime.multiplier,
      },
      signals,
    })
  }

  // 점수 내림차순 정렬
  scored.sort((a, b) => b.score - a.score)
  return { stocks: scored, regime }
}
