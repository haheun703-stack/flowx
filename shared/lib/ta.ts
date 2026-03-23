// 기술적 분석 유틸 (Technical Analysis)
// CandleData[] → 지표 계산

import { CandleData } from '@/entities/stock/types'

/** 단순이동평균 (Simple Moving Average) */
export function calcSMA(candles: CandleData[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) { result.push(NaN); continue }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close
    result.push(sum / period)
  }
  return result
}

/** RSI (Relative Strength Index) */
export function calcRSI(candles: CandleData[], period = 14): number[] {
  const result: number[] = new Array(candles.length).fill(NaN)
  if (candles.length < period + 1) return result

  let avgGain = 0
  let avgLoss = 0

  // 첫 period 구간의 평균
  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close
    if (diff > 0) avgGain += diff
    else avgLoss += Math.abs(diff)
  }
  avgGain /= period
  avgLoss /= period

  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  // 이후 Wilder smoothing
  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? Math.abs(diff) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }
  return result
}

/** MACD (Moving Average Convergence Divergence) */
export function calcMACD(
  candles: CandleData[],
  fast = 12, slow = 26, sig = 9,
): { macd: number[]; signal: number[]; histogram: number[] } {
  const closes = candles.map(c => c.close)
  const emaFast = calcEMA(closes, fast)
  const emaSlow = calcEMA(closes, slow)

  const macd = closes.map((_, i) => emaFast[i] - emaSlow[i])
  const signal = calcEMA(macd, sig)
  const histogram = macd.map((v, i) => v - signal[i])

  return { macd, signal, histogram }
}

/** 볼린저 밴드 */
export function calcBollinger(
  candles: CandleData[],
  period = 20, mult = 2,
): { upper: number[]; middle: number[]; lower: number[] } {
  const sma = calcSMA(candles, period)
  const upper: number[] = []
  const lower: number[] = []

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) { upper.push(NaN); lower.push(NaN); continue }
    let variance = 0
    for (let j = i - period + 1; j <= i; j++) {
      variance += (candles[j].close - sma[i]) ** 2
    }
    const std = Math.sqrt(variance / period)
    upper.push(sma[i] + mult * std)
    lower.push(sma[i] - mult * std)
  }
  return { upper, middle: sma, lower }
}

/** 거래량 이동평균 */
export function calcVolumeSMA(candles: CandleData[], period = 20): number[] {
  const result: number[] = []
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) { result.push(NaN); continue }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].volume
    result.push(sum / period)
  }
  return result
}

// --- 내부 유틸 ---

function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = new Array(data.length).fill(NaN)
  // 첫 EMA = 첫 period 구간의 SMA
  let sum = 0
  for (let i = 0; i < period && i < data.length; i++) sum += data[i]
  if (data.length >= period) {
    result[period - 1] = sum / period
    for (let i = period; i < data.length; i++) {
      result[i] = data[i] * k + result[i - 1] * (1 - k)
    }
  }
  return result
}
