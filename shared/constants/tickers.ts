import { StockInfo } from '@/entities/stock/types'

export const POPULAR_TICKERS: StockInfo[] = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '035420', name: 'NAVER' },
  { code: '051910', name: 'LG화학' },
  { code: '006400', name: '삼성SDI' },
  { code: '068270', name: '셀트리온' },
  { code: '207940', name: '삼성바이오로직스' },
  { code: '005380', name: '현대차' },
  { code: '000270', name: '기아' },
  { code: '012330', name: '현대모비스' },
]

export const TICKER_NAME_MAP: Record<string, string> =
  Object.fromEntries(POPULAR_TICKERS.map(t => [t.code, t.name]))
