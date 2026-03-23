// 단타봇 — 장전 스캔 (08:55 KST)
// 전일 거래량 상위 종목 스크리닝 + 6가지 진입 조건 + 3way 포지션

import { fetchOHLCV } from '@/features/supply-xray/api/fetchOHLCV'
import { calcSMA, calcRSI, calcVolumeSMA } from '@/shared/lib/ta'
import { detectRegime } from '@/shared/lib/regime'
import { getSupabaseAdmin } from '@/lib/supabase'
import { todayKST } from '@/shared/lib/cron-auth'
import { KOREAN_STOCKS } from '@/features/market-ticker/api/fetchKoreanTickers'

interface SwingCandidate {
  ticker: string
  name: string
  score: number
  conditions: string[]
  position: 'CORE' | 'SUB' | 'EXPLORE'
}

export async function preMarketScan(): Promise<{ candidates: SwingCandidate[]; regime: string }> {
  const regime = await detectRegime()
  const supabase = getSupabaseAdmin()
  const date = todayKST()

  // 모든 종목 OHLCV 조회
  const results = await Promise.allSettled(
    KOREAN_STOCKS.map(async (stock) => {
      const candles = await fetchOHLCV(stock.code, 60)
      return { stock, candles }
    })
  )

  const candidates: { ticker: string; name: string; score: number; conditions: string[]; volume: number }[] = []

  for (const r of results) {
    if (r.status !== 'fulfilled') continue
    const { stock, candles } = r.value
    if (candles.length < 20) continue

    const last = candles.length - 1
    const conditions: string[] = []
    let score = 0

    // 1. VIX 체크 (PANIC이면 진입 금지)
    if (regime.regime === 'PANIC') continue
    if (regime.regime !== 'NORMAL') {
      conditions.push(`레짐 ${regime.regime}`)
    }

    // 2. 릴레이 정배열 (SMA5 > SMA20)
    const sma5 = calcSMA(candles, 5)
    const sma20 = calcSMA(candles, 20)
    if (!isNaN(sma5[last]) && !isNaN(sma20[last]) && sma5[last] > sma20[last]) {
      score += 20
      conditions.push('릴레이 정배열')
    }

    // 3. 거래량 급증 (전일 거래량 > 20일 평균의 200%)
    const volMA = calcVolumeSMA(candles, 20)
    const volRatio = !isNaN(volMA[last]) && volMA[last] > 0
      ? candles[last].volume / volMA[last]
      : 0
    if (volRatio >= 2.0) {
      score += 25
      conditions.push(`거래량 ${(volRatio * 100).toFixed(0)}%`)
    }

    // 4. RSI 중립~상승 (40~70)
    const rsi = calcRSI(candles)
    const rsiVal = rsi[last]
    if (!isNaN(rsiVal) && rsiVal >= 40 && rsiVal <= 70) {
      score += 15
      conditions.push(`RSI ${rsiVal.toFixed(0)}`)
    }

    // 5. 지지선 근접 (20일 저점 대비 5% 이내)
    const low20 = Math.min(...candles.slice(Math.max(0, last - 20), last + 1).map(c => c.low))
    const distFromLow = (candles[last].close - low20) / low20
    if (distFromLow <= 0.05 && distFromLow >= 0) {
      score += 15
      conditions.push('지지선 근접')
    }

    // 6. 갭 상승 (전일 종가 대비 당일 시가 2%↑)
    if (last > 0 && candles[last].open > candles[last - 1].close * 1.02) {
      score += 10
      conditions.push('갭 상승')
    }

    // 최소 2개 이상 조건 충족
    if (conditions.length >= 2 && score >= 30) {
      candidates.push({
        ticker: stock.code,
        name: stock.name,
        score: Math.round(score * regime.multiplier),
        conditions,
        volume: candles[last].volume,
      })
    }
  }

  // 점수 내림차순 정렬
  candidates.sort((a, b) => b.score - a.score)

  // 3way 포지션 사이징
  const positioned: SwingCandidate[] = candidates.slice(0, 15).map((c, i) => ({
    ticker: c.ticker,
    name: c.name,
    score: c.score,
    conditions: c.conditions,
    position: i < 3 ? 'CORE' as const : i < 8 ? 'SUB' as const : 'EXPLORE' as const,
  }))

  // Supabase 저장
  if (positioned.length > 0) {
    const rows = positioned.map(c => ({
      date,
      signal_type: 'SWING_ENTRY',
      ticker: c.ticker,
      name: c.name,
      score: c.score,
      signals: c.conditions,
      position_type: c.position,
      holding_days: 0,
      created_at: new Date().toISOString(),
    }))

    await supabase.from('short_signals').delete().eq('date', date).eq('signal_type', 'SWING_ENTRY')
    const { error } = await supabase.from('short_signals').insert(rows)
    if (error) console.error('swing entry insert:', error.message)
  }

  return { candidates: positioned, regime: regime.regime }
}
