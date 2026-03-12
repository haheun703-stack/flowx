import { SupplyData } from '@/entities/stock/types'
import { getKISToken } from '@/shared/lib/kisAuth'
import { formatKRXDate } from '@/shared/lib/formatters'

interface KISInvestorRow {
  stck_bsop_date: string  // "20260312"
  frgn_ntby_qty: string   // 외국인 순매수 수량
  orgn_ntby_qty: string   // 기관 순매수 수량
  prsn_ntby_qty: string   // 개인 순매수 수량
}

/**
 * KIS API — 주식현재가 투자자별 매매동향 (FHKST01010900)
 * 최근 약 30일간의 일별 투자자별 순매수 데이터를 반환합니다.
 */
export async function fetchKISInvestorDaily(ticker: string): Promise<SupplyData[]> {
  const token = await getKISToken()

  const url = `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-investor?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${ticker}`

  const res = await fetch(url, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'authorization': `Bearer ${token}`,
      'appkey': process.env.KIS_APP_KEY!,
      'appsecret': process.env.KIS_APP_SECRET!,
      'tr_id': 'FHKST01010900',
      'custtype': 'P',
    },
    next: { revalidate: 300 },
  })

  if (!res.ok) {
    throw new Error(`KIS investor API error: ${res.status}`)
  }

  const json = await res.json()

  if (json.rt_cd !== '0' || !json.output) {
    throw new Error(`KIS investor API: ${json.msg1 || 'no data'}`)
  }

  const rows: KISInvestorRow[] = json.output

  return rows
    .filter(row => row.stck_bsop_date && row.stck_bsop_date.length === 8)
    .map(row => ({
      date: formatKRXDate(row.stck_bsop_date),
      foreign: Number(row.frgn_ntby_qty) || 0,
      institution: Number(row.orgn_ntby_qty) || 0,
      individual: Number(row.prsn_ntby_qty) || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
