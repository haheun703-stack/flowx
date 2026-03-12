import { IntradayPoint } from '../types'
import { getKISToken } from '@/shared/lib/kisAuth'

/**
 * 한투 API — KOSPI 지수 시세 (당일 분봉)
 * TR: FHPUP02110000
 */
export async function fetchIntradayKOSPI(): Promise<IntradayPoint[]> {
  const token = await getKISToken()

  const res = await fetch(
    'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-index-timeprice?fid_cond_mrkt_div_code=U&fid_input_iscd=0001&fid_hour_cls_code=0',
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`,
        'appkey': process.env.KIS_APP_KEY!,
        'appsecret': process.env.KIS_APP_SECRET!,
        'tr_id': 'FHPUP02110000',
        'custtype': 'P',
      },
      next: { revalidate: 0 },
    }
  )

  if (!res.ok) return []

  const json = await res.json()
  const rows = json?.output2 ?? []

  return rows
    .map((row: Record<string, string>) => ({
      time: row.bsop_hour?.replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2') ?? '',
      value: Number(row.bstp_nmix_prpr ?? 0),
    }))
    .filter((p: IntradayPoint) => p.value > 0)
    .reverse()
}
