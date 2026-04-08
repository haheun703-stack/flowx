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

  // 섹터 ETF 등락률 { XLK: 1.2, XLF: -0.3, ... }
  sector_etf: Record<string, number>

  // 한국 영향
  kr_impact: string | null
  risk_flags: string[]
}

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
