// VIX 기반 시장 레짐 판별

export type RegimeLevel = 'NORMAL' | 'CAUTION' | 'SHOCK' | 'PANIC'

export interface RegimeResult {
  regime: RegimeLevel
  vix: number
  multiplier: number
}

const REGIME_MAP: { max: number; regime: RegimeLevel; multiplier: number }[] = [
  { max: 20, regime: 'NORMAL', multiplier: 1.0 },
  { max: 25, regime: 'CAUTION', multiplier: 0.85 },
  { max: 35, regime: 'SHOCK', multiplier: 0.6 },
  { max: Infinity, regime: 'PANIC', multiplier: 0.3 },
]

/** Yahoo Finance에서 VIX 현재값 가져와 레짐 판별 */
export async function detectRegime(): Promise<RegimeResult> {
  let vix = 20 // fallback

  try {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=1d'
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (res.ok) {
      const json = await res.json()
      const close = json?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (typeof close === 'number' && close > 0) vix = close
    }
  } catch {
    // VIX 조회 실패 시 기본값(20, NORMAL) 사용
  }

  const entry = REGIME_MAP.find(r => vix <= r.max) ?? REGIME_MAP[0]
  return { regime: entry.regime, vix, multiplier: entry.multiplier }
}
