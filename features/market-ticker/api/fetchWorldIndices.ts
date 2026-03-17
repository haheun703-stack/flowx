import { WorldIndex } from '../types'

/**
 * 글로벌 자산 데이터 (22개, 5개 카테고리)
 * 1) 지수 9개 — Yahoo Finance chart API (무료, User-Agent 필요)
 * 2) 원자재 4개 — Finnhub /quote
 * 3) 환율 4개 — Finnhub /forex/rates
 * 4) 암호화폐 3개 — CoinGecko simple API
 * 5) 채권 2개 — Yahoo Finance (US10Y, US2Y)
 * 각 소스 실패 시 시뮬레이션 폴백
 */

// ── 1. 지수 메타 ──
const INDICES_META = [
  { symbol: 'SPX',   name: 'S&P 500',  currency: 'USD', yahoo: '%5EGSPC',     icon: 'us' },
  { symbol: 'IXIC',  name: '나스닥',   currency: 'USD', yahoo: '%5EIXIC',     icon: 'us' },
  { symbol: 'DJI',   name: '다우',     currency: 'USD', yahoo: '%5EDJI',      icon: 'us' },
  { symbol: 'N225',  name: '닛케이',   currency: 'JPY', yahoo: '%5EN225',     icon: 'jp' },
  { symbol: 'HSI',   name: '항셍',     currency: 'HKD', yahoo: '%5EHSI',      icon: 'hk' },
  { symbol: 'GDAXI', name: 'DAX',      currency: 'EUR', yahoo: '%5EGDAXI',    icon: 'de' },
  { symbol: 'SSEC',  name: '상해종합', currency: 'CNY', yahoo: '000001.SS',   icon: 'cn' },
  { symbol: 'FTSE',  name: 'FTSE 100', currency: 'GBP', yahoo: '%5EFTSE',     icon: 'gb' },
  { symbol: 'VIX',   name: 'VIX',      currency: 'USD', yahoo: '%5EVIX',      icon: 'vix' },
]

// ── 2. 원자재 메타 ──
const COMMODITY_META = [
  { symbol: 'WTI',    name: 'WTI 원유', currency: 'USD', finnhub: 'CL',  icon: 'oil' },
  { symbol: 'GOLD',   name: '금',       currency: 'USD', finnhub: 'GC',  icon: 'gold' },
  { symbol: 'SILVER', name: '은',       currency: 'USD', finnhub: 'SI',  icon: 'silver' },
  { symbol: 'COPPER', name: '구리',     currency: 'USD', finnhub: 'HG',  icon: 'copper' },
]

// ── 3. 환율 메타 ──
const FOREX_META = [
  { symbol: 'USDKRW', name: 'USD/KRW', currency: 'KRW', pair: 'KRW', icon: 'kr' },
  { symbol: 'DXY',    name: 'DXY',     currency: 'USD', pair: '',    icon: 'us' },
  { symbol: 'USDJPY', name: 'USD/JPY', currency: 'JPY', pair: 'JPY', icon: 'jp' },
  { symbol: 'EURUSD', name: 'EUR/USD', currency: 'USD', pair: 'EUR', icon: 'eu' },
]

// ── 4. 암호화폐 메타 ──
const CRYPTO_META = [
  { symbol: 'BTC', name: '비트코인',  currency: 'USD', geckoId: 'bitcoin',  icon: 'btc' },
  { symbol: 'ETH', name: '이더리움',  currency: 'USD', geckoId: 'ethereum', icon: 'eth' },
  { symbol: 'XRP', name: '리플',      currency: 'USD', geckoId: 'ripple',   icon: 'xrp' },
]

// ── 5. 채권 메타 ──
const BOND_META = [
  { symbol: 'US10Y', name: 'US 10Y', currency: 'USD', yahoo: '%5ETNX', icon: 'bond' },
  { symbol: 'US2Y',  name: 'US 2Y',  currency: 'USD', yahoo: '%5ETWO', icon: 'bond' },
]

// ── 기준가 (폴백용, 2026-03-14 기준) ──
const BASE_PRICES: Record<string, number> = {
  SPX: 6700, IXIC: 22374, DJI: 46946, N225: 54034, HSI: 26066,
  GDAXI: 23564, SSEC: 4085, FTSE: 10317, VIX: 23.5,
  WTI: 67, GOLD: 2990, SILVER: 33.7, COPPER: 4.9,
  USDKRW: 1450, DXY: 103.5, USDJPY: 148.6, EURUSD: 1.088,
  BTC: 84000, ETH: 1900, XRP: 2.3,
  US10Y: 4.31, US2Y: 3.99,
}

function simulatePrice(symbol: string): { price: number; change: number; changePercent: number } {
  const base = BASE_PRICES[symbol] ?? 100
  const seed = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1) + new Date().getDate()
  const noise = (Math.sin(seed * 127.1) * 43758.5453) % 1
  const pct = (noise - 0.5) * 3
  const chg = base * pct / 100
  return {
    price: Math.round((base + chg) * 100) / 100,
    change: Math.round(chg * 100) / 100,
    changePercent: Math.round(pct * 100) / 100,
  }
}

// ── 지수: Yahoo Finance chart API ──
async function fetchIndicesFromYahoo(): Promise<WorldIndex[]> {
  const results = await Promise.allSettled(
    INDICES_META.map(async (meta) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${meta.yahoo}?interval=1d&range=1d`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 120 },
      })
      const json = await res.json()
      const m = json?.chart?.result?.[0]?.meta
      if (!m?.regularMarketPrice) throw new Error('no data')

      const price = m.regularMarketPrice
      const prevClose = m.chartPreviousClose ?? price
      const change = Math.round((price - prevClose) * 100) / 100
      const changePercent = prevClose > 0 ? Math.round(((price - prevClose) / prevClose) * 10000) / 100 : 0

      return {
        symbol: meta.symbol, name: meta.name, currency: meta.currency,
        price, change, changePercent,
        category: 'index' as const, icon: meta.icon,
      }
    })
  )

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    const meta = INDICES_META[i]
    const sim = simulatePrice(meta.symbol)
    return { symbol: meta.symbol, name: meta.name, currency: meta.currency, ...sim, category: 'index' as const, icon: meta.icon }
  })
}

// ── 원자재: Finnhub /quote ──
async function fetchCommodities(): Promise<WorldIndex[]> {
  const token = process.env.FINNHUB_API_KEY
  if (!token) throw new Error('No FINNHUB_API_KEY')

  const results: WorldIndex[] = []
  for (const meta of COMMODITY_META) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${meta.finnhub}`,
        { headers: { 'X-Finnhub-Token': token }, next: { revalidate: 120 } }
      )
      const q = await res.json()
      if (q.c && q.c > 0) {
        results.push({
          symbol: meta.symbol, name: meta.name, currency: meta.currency,
          price: q.c, change: q.d ?? 0, changePercent: q.dp ?? 0,
          category: 'commodity', icon: meta.icon,
        })
        continue
      }
    } catch { /* 폴백 */ }
    const sim = simulatePrice(meta.symbol)
    results.push({ symbol: meta.symbol, name: meta.name, currency: meta.currency, ...sim, category: 'commodity', icon: meta.icon })
  }
  return results
}

// ── 환율: Finnhub /forex/rates ──
async function fetchForex(): Promise<WorldIndex[]> {
  const token = process.env.FINNHUB_API_KEY
  if (!token) throw new Error('No FINNHUB_API_KEY')

  let rates: Record<string, number> = {}
  try {
    const res = await fetch(
      'https://finnhub.io/api/v1/forex/rates?base=USD',
      { headers: { 'X-Finnhub-Token': token }, next: { revalidate: 120 } }
    )
    const json = await res.json()
    rates = json?.quote ?? {}
  } catch { /* 폴백 */ }

  return FOREX_META.map(meta => {
    if (meta.symbol === 'USDKRW' && rates.KRW) {
      return { symbol: meta.symbol, name: meta.name, currency: meta.currency, price: Math.round(rates.KRW * 100) / 100, change: 0, changePercent: 0, category: 'forex' as const, icon: meta.icon }
    }
    if (meta.symbol === 'USDJPY' && rates.JPY) {
      return { symbol: meta.symbol, name: meta.name, currency: meta.currency, price: Math.round(rates.JPY * 100) / 100, change: 0, changePercent: 0, category: 'forex' as const, icon: meta.icon }
    }
    if (meta.symbol === 'EURUSD' && rates.EUR) {
      return { symbol: meta.symbol, name: meta.name, currency: meta.currency, price: Math.round((1 / rates.EUR) * 10000) / 10000, change: 0, changePercent: 0, category: 'forex' as const, icon: meta.icon }
    }
    // DXY, 기타 — 시뮬레이션
    const sim = simulatePrice(meta.symbol)
    return { symbol: meta.symbol, name: meta.name, currency: meta.currency, ...sim, category: 'forex' as const, icon: meta.icon }
  })
}

// ── 암호화폐: CoinGecko ──
async function fetchCrypto(): Promise<WorldIndex[]> {
  const ids = CRYPTO_META.map(m => m.geckoId).join(',')
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { next: { revalidate: 120 } }
  )
  const data = await res.json()

  return CRYPTO_META.map(meta => {
    const coin = data?.[meta.geckoId]
    if (coin?.usd) {
      const price = coin.usd
      const pct = coin.usd_24h_change ?? 0
      return {
        symbol: meta.symbol, name: meta.name, currency: meta.currency,
        price, change: price * pct / 100, changePercent: Math.round(pct * 100) / 100,
        category: 'crypto' as const, icon: meta.icon,
      }
    }
    const sim = simulatePrice(meta.symbol)
    return { symbol: meta.symbol, name: meta.name, currency: meta.currency, ...sim, category: 'crypto' as const, icon: meta.icon }
  })
}

// ── 채권: Yahoo Finance ──
async function fetchBonds(): Promise<WorldIndex[]> {
  const results = await Promise.allSettled(
    BOND_META.map(async (meta) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${meta.yahoo}?interval=1d&range=1d`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 120 },
      })
      const json = await res.json()
      const m = json?.chart?.result?.[0]?.meta
      if (!m?.regularMarketPrice) throw new Error('no data')

      const price = m.regularMarketPrice
      const prevClose = m.chartPreviousClose ?? price
      const change = Math.round((price - prevClose) * 100) / 100
      const changePercent = prevClose > 0 ? Math.round(((price - prevClose) / prevClose) * 10000) / 100 : 0

      return {
        symbol: meta.symbol, name: meta.name, currency: meta.currency,
        price, change, changePercent,
        category: 'bond' as const, icon: meta.icon,
      }
    })
  )

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    const meta = BOND_META[i]
    const sim = simulatePrice(meta.symbol)
    return { symbol: meta.symbol, name: meta.name, currency: meta.currency, ...sim, category: 'bond' as const, icon: meta.icon }
  })
}

// ── 메인 export ──
export async function fetchWorldIndices(): Promise<WorldIndex[]> {
  const [indices, commodities, forex, crypto, bonds] = await Promise.allSettled([
    fetchIndicesFromYahoo(),
    fetchCommodities(),
    fetchForex(),
    fetchCrypto(),
    fetchBonds(),
  ])

  const resolve = <T>(r: PromiseSettledResult<T[]>, fallback: () => T[]): T[] =>
    r.status === 'fulfilled' ? r.value : fallback()

  return [
    ...resolve(indices, () => INDICES_META.map(m => {
      const sim = simulatePrice(m.symbol)
      return { symbol: m.symbol, name: m.name, currency: m.currency, ...sim, category: 'index' as const, icon: m.icon }
    })),
    ...resolve(commodities, () => COMMODITY_META.map(m => {
      const sim = simulatePrice(m.symbol)
      return { symbol: m.symbol, name: m.name, currency: m.currency, ...sim, category: 'commodity' as const, icon: m.icon }
    })),
    ...resolve(forex, () => FOREX_META.map(m => {
      const sim = simulatePrice(m.symbol)
      return { symbol: m.symbol, name: m.name, currency: m.currency, ...sim, category: 'forex' as const, icon: m.icon }
    })),
    ...resolve(crypto, () => CRYPTO_META.map(m => {
      const sim = simulatePrice(m.symbol)
      return { symbol: m.symbol, name: m.name, currency: m.currency, ...sim, category: 'crypto' as const, icon: m.icon }
    })),
    ...resolve(bonds, () => BOND_META.map(m => {
      const sim = simulatePrice(m.symbol)
      return { symbol: m.symbol, name: m.name, currency: m.currency, ...sim, category: 'bond' as const, icon: m.icon }
    })),
  ]
}
