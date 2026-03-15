export interface WorldIndex {
  symbol: string      // "SPX"
  name: string        // "S&P 500"
  price: number
  change: number      // 절대값
  changePercent: number
  currency: string    // "USD"
  category: 'index' | 'commodity' | 'forex' | 'crypto' | 'bond'
  icon?: string       // 국기코드 또는 카테고리 아이콘
}

export interface KoreanTicker {
  code: string        // "005930"
  name: string        // "삼성전자"
  price: number
  change: number
  changePercent: number
  isIndex?: boolean   // KOSPI/KOSDAQ 구분
}
