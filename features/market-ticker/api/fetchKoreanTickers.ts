import { KoreanTicker } from '../types'
import { getKISToken } from '@/shared/lib/kisAuth'

export const KOREAN_STOCKS = [
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
export async function fetchKISPrice(
  code: string,
  token: string
): Promise<{ price: number; change: number; changePercent: number; volume: number }> {
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

    if (!res.ok) return { price: 0, change: 0, changePercent: 0, volume: 0 }

    const json = await res.json()
    const d = json?.output

    return {
      price:         Number(d?.stck_prpr ?? 0),  // 현재가
      change:        Number(d?.prdy_vrss ?? 0),   // 전일 대비
      changePercent: Number(d?.prdy_ctrt ?? 0),  // 등락률
      volume:        Number(d?.acml_vol ?? 0),    // 누적 거래량
    }
  } catch {
    return { price: 0, change: 0, changePercent: 0, volume: 0 }
  }
}

// 한투 API — KOSPI/KOSDAQ 지수 조회
export async function fetchKISIndex(
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

// 한투 API — 투자자별 매매동향 (KOSPI 종합)
export async function fetchInvestorTrend(
  token: string
): Promise<{ foreign_net: number; inst_net: number; individual_net: number }> {
  try {
    const res = await fetch(
      'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-investor?fid_cond_mrkt_div_code=V&fid_input_iscd=0001',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'appkey': process.env.KIS_APP_KEY!,
          'appsecret': process.env.KIS_APP_SECRET!,
          'tr_id': 'FHPTJ04400000', // 투자자별 매매동향
        },
        next: { revalidate: 0 },
      }
    )

    if (!res.ok) return { foreign_net: 0, inst_net: 0, individual_net: 0 }

    const json = await res.json()
    const rows = json?.output ?? []
    // 첫 번째 row = 당일 데이터
    const today = rows[0]

    return {
      foreign_net:    Number(today?.frgn_ntby_qty ?? 0),  // 외국인 순매수
      inst_net:       Number(today?.orgn_ntby_qty ?? 0),  // 기관 순매수
      individual_net: Number(today?.prsn_ntby_qty ?? 0),  // 개인 순매수
    }
  } catch {
    return { foreign_net: 0, inst_net: 0, individual_net: 0 }
  }
}

// 한투 API — 업종별 등락률 (KOSPI 업종)
export async function fetchSectorPrices(
  token: string
): Promise<{ name: string; changePercent: number }[]> {
  // 주요 업종 코드
  const SECTORS = [
    { code: '0001', name: '종합' },
    { code: '0002', name: '대형주' },
    { code: '0003', name: '중형주' },
    { code: '0004', name: '소형주' },
    { code: '0005', name: '음식료품' },
    { code: '0006', name: '섬유의복' },
    { code: '0007', name: '종이목재' },
    { code: '0008', name: '화학' },
    { code: '0009', name: '의약품' },
    { code: '0010', name: '비금속광물' },
    { code: '0011', name: '철강금속' },
    { code: '0012', name: '기계' },
    { code: '0013', name: '전기전자' },
    { code: '0015', name: '운수장비' },
    { code: '0017', name: '통신업' },
    { code: '0019', name: '전기가스업' },
    { code: '0020', name: '건설업' },
    { code: '0024', name: '유통업' },
    { code: '0025', name: '금융업' },
    { code: '0028', name: '서비스업' },
  ]

  try {
    const results = await Promise.all(
      SECTORS.slice(4).map(async (s) => { // 종합/대형/중형/소형 제외
        try {
          const res = await fetch(
            `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-index-price?fid_cond_mrkt_div_code=U&fid_input_iscd=${s.code}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'appkey': process.env.KIS_APP_KEY!,
                'appsecret': process.env.KIS_APP_SECRET!,
                'tr_id': 'FHPUP02100000',
              },
              next: { revalidate: 0 },
            }
          )
          if (!res.ok) return { name: s.name, changePercent: 0 }
          const json = await res.json()
          const d = json?.output
          return {
            name: s.name,
            changePercent: Number(d?.bstp_nmix_prdy_ctrt ?? 0),
          }
        } catch {
          return { name: s.name, changePercent: 0 }
        }
      })
    )
    return results
  } catch {
    return []
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
