/* ── Mag7 ── */
export interface Mag7Stock {
  close: number
  change: number
}

/* ── 선물 / 암호화폐 / 환율 ── */
export interface QuoteItem {
  close: number
  change: number
}

/* ── 뉴스 ── */
export interface UsNewsItem {
  title: string
  impact: 'positive' | 'negative' | 'neutral'
  sector: string
  summary: string
}

/* ── 메인 ── */
export interface UsMarketDaily {
  date: string

  // 지수
  sp500_close: number | null
  sp500_change: number | null
  nasdaq_close: number | null
  nasdaq_change: number | null
  dow_close: number | null
  dow_change: number | null

  // 공포
  vix: number | null
  fear_greed: number | null
  fear_greed_label: string | null

  // 금리
  us_3y_yield: number | null
  us_2y_yield: number | null
  us_10y_yield: number | null
  spread_3y_10y: number | null
  spread_2y_10y: number | null

  // 달러/원자재
  dxy: number | null
  wti: number | null
  gold: number | null

  // 반도체
  soxx_close: number | null
  soxx_change: number | null

  // JSONB — 섹터 ETF { XLK: 1.2, ... }
  sector_etf: Record<string, number>

  // JSONB — Magnificent 7
  mag7: Record<string, Mag7Stock> | null

  // JSONB — 선물
  futures: Record<string, QuoteItem> | null

  // JSONB — 암호화폐
  crypto: Record<string, QuoteItem> | null

  // JSONB — 환율
  forex: Record<string, QuoteItem> | null

  // JSONB — 수익률 곡선 { "1M": 3.72, "3M": 3.72, ... }
  yield_curve: Record<string, number> | null

  // JSONB — 뉴스
  us_news: UsNewsItem[] | null

  // 한국 영향
  kr_impact: string | null
  risk_flags: string[]
}

/* ── 라벨 매핑 ── */
export const SECTOR_ETF_LABELS: Record<string, string> = {
  XLK: '기술',
  XLF: '금융',
  XLE: '에너지',
  XLV: '헬스케어',
  XLI: '산업재',
  XLY: '경기소비재',
  XLP: '필수소비재',
  XLU: '유틸리티',
  XLB: '소재',
  XLRE: '부동산',
  XLC: '커뮤니케이션',
}

export const MAG7_LABELS: Record<string, { name: string; icon: string }> = {
  AAPL:  { name: '애플', icon: '🍎' },
  MSFT:  { name: '마이크로소프트', icon: '🪟' },
  GOOGL: { name: '구글', icon: '🔍' },
  AMZN:  { name: '아마존', icon: '📦' },
  NVDA:  { name: '엔비디아', icon: '🟢' },
  META:  { name: '메타', icon: '🔵' },
  TSLA:  { name: '테슬라', icon: '⚡' },
}

export const FUTURES_LABELS: Record<string, string> = {
  'ES=F': 'S&P 500 선물',
  'NQ=F': '나스닥 선물',
  'YM=F': '다우 선물',
  'RTY=F': '러셀2000 선물',
}

export const CRYPTO_LABELS: Record<string, string> = {
  'BTC-USD': '비트코인',
  'ETH-USD': '이더리움',
}

export const FOREX_LABELS: Record<string, string> = {
  'KRW=X': '원/달러',
  'JPY=X': '엔/달러',
  'EURUSD=X': '유로/달러',
}

export const YIELD_CURVE_ORDER = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y']
