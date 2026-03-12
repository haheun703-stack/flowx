import { KoreanTicker } from '../types'
import { getKISToken } from '@/shared/lib/kisAuth'

const KOREAN_STOCKS = [
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '005380', name: '현대차' },
  { code: '035420', name: 'NAVER' },
  { code: '051910', name: 'LG화학' },
  { code: '006400', name: '삼성SDI' },
  { code: '068270', name: '셀트리온' },
  { code: '207940', name: '삼성바이오' },
  { code: '000270', name: '기아' },
  { code: '035720', name: '카카오' },
  { code: '003670', name: 'POSCO홀딩스' },
  { code: '105560', name: 'KB금융' },
]

// 장 중 여부 판단 (KST 기준 09:00 ~ 15:30)
export function isMarketOpen(): boolean {
  const now = new Date()
  // UTC → KST (+9시간)
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const hours = kst.getUTCHours()
  const minutes = kst.getUTCMinutes()
  const day = kst.getUTCDay() // 0=일, 6=토

  if (day === 0 || day === 6) return false // 주말 제외

  const timeInMin = hours * 60 + minutes
  return timeInMin >= 9 * 60 && timeInMin <= 15 * 60 + 30
}

// 한투 API — 주식 현재가 조회
async function fetchKISPrice(
  code: string,
  token: string
): Promise<{ price: number; change: number; changePercent: number }> {
  try {
    const res = await fetch(
      `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${code}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'appkey': process.env.KIS_APP_KEY!,
          'appsecret': process.env.KIS_APP_SECRET!,
          'tr_id': 'FHKST01010100', // 주식 현재가 TR
        },
        next: { revalidate: 0 },
      }
    )

    if (!res.ok) return { price: 0, change: 0, changePercent: 0 }

    const json = await res.json()
    const d = json?.output

    return {
      price:         Number(d?.stck_prpr ?? 0),  // 현재가
      change:        Number(d?.prdy_vrss ?? 0),   // 전일 대비
      changePercent: Number(d?.prdy_ctrt ?? 0),  // 등락률
    }
  } catch {
    return { price: 0, change: 0, changePercent: 0 }
  }
}

// 한투 API — KOSPI/KOSDAQ 지수 조회
async function fetchKISIndex(
  code: string, // '0001': KOSPI, '1001': KOSDAQ
  token: string
): Promise<{ price: number; changePercent: number }> {
  try {
    const res = await fetch(
      `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-index-price?fid_cond_mrkt_div_code=U&fid_input_iscd=${code}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'appkey': process.env.KIS_APP_KEY!,
          'appsecret': process.env.KIS_APP_SECRET!,
          'tr_id': 'FHPUP02100000', // 지수 현재가 TR
        },
        next: { revalidate: 0 },
      }
    )

    if (!res.ok) return { price: 0, changePercent: 0 }

    const json = await res.json()
    const d = json?.output

    return {
      price:         Number(d?.bstp_nmix_prpr ?? 0),      // 지수 현재가
      changePercent: Number(d?.bstp_nmix_prdy_ctrt ?? 0), // 전일 대비 등락률
    }
  } catch {
    return { price: 0, changePercent: 0 }
  }
}

export async function fetchKoreanTickers(): Promise<KoreanTicker[]> {
  const token = await getKISToken()

  // 모든 요청 병렬 처리
  const [kospi, kosdaq, ...stocks] = await Promise.all([
    fetchKISIndex('0001', token),
    fetchKISIndex('1001', token),
    ...KOREAN_STOCKS.map(s => fetchKISPrice(s.code, token)),
  ])

  const indices: KoreanTicker[] = [
    { code: '0001', name: 'KOSPI',  price: kospi.price,  change: 0, changePercent: kospi.changePercent,  isIndex: true },
    { code: '1001', name: 'KOSDAQ', price: kosdaq.price, change: 0, changePercent: kosdaq.changePercent, isIndex: true },
  ]

  const stockTickers: KoreanTicker[] = KOREAN_STOCKS.map((s, i) => ({
    code: s.code,
    name: s.name,
    price: stocks[i].price,
    change: stocks[i].change,
    changePercent: stocks[i].changePercent,
  }))

  return [...indices, ...stockTickers]
}
