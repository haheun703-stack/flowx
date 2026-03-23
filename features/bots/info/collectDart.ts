// 정보봇 — DART 공시 수집
// DART OpenAPI → Supabase intelligence_disclosures

import { getSupabaseAdmin } from '@/lib/supabase'
import { todayKST, todayKSTCompact } from '@/shared/lib/cron-auth'

interface DartItem {
  corp_name: string
  corp_code: string
  stock_code: string
  report_nm: string
  rcept_no: string
  flr_nm: string
  rcept_dt: string
  rm: string
}

export async function collectDart(): Promise<{ ok: boolean; count: number }> {
  const apiKey = process.env.DART_API_KEY
  if (!apiKey) throw new Error('DART_API_KEY 미설정')

  const bgn = todayKSTCompact()
  const url = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${apiKey}&bgn_de=${bgn}&page_count=30&sort=date&sort_meth=desc`

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`DART API ${res.status}`)

  const json = await res.json()

  // status "000" = 정상, "013" = 조회 결과 없음
  if (json.status === '013') return { ok: true, count: 0 }
  if (json.status !== '000') throw new Error(`DART status: ${json.status} ${json.message}`)

  const items: DartItem[] = json.list ?? []
  const date = todayKST()
  const supabase = getSupabaseAdmin()

  // 주요 공시만 필터 (유상증자, 분할합병, 주요사항보고, 감사보고서 등)
  const important = items.filter(item => {
    const nm = item.report_nm
    return nm.includes('유상증자') || nm.includes('분할') || nm.includes('합병')
      || nm.includes('주요사항') || nm.includes('감사보고서')
      || nm.includes('사업보고서') || nm.includes('분기보고서')
      || nm.includes('반기보고서') || nm.includes('자기주식')
      || nm.includes('대량보유') || item.rm === '유'  // 주요보고
  })

  // 필터 결과 없으면 전체 중 상위 20건
  const toInsert = (important.length > 0 ? important : items).slice(0, 20)

  const rows = toInsert.map(item => ({
    date,
    source: 'DART',
    ticker: item.stock_code || null,
    ticker_name: item.corp_name,
    title: item.report_nm,
    category: classifyDart(item.report_nm),
    sentiment: 'NEUTRAL',
    tags: [item.flr_nm],
    original_url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`,
    created_at: new Date().toISOString(),
  }))

  if (rows.length > 0) {
    const { error } = await supabase.from('intelligence_disclosures').insert(rows)
    if (error) throw new Error(`disclosures insert: ${error.message}`)
  }

  return { ok: true, count: rows.length }
}

function classifyDart(reportName: string): string {
  if (reportName.includes('유상증자')) return '유상증자'
  if (reportName.includes('분할') || reportName.includes('합병')) return '분할합병'
  if (reportName.includes('사업보고서') || reportName.includes('분기보고서')) return '정기공시'
  if (reportName.includes('대량보유')) return '대량보유'
  if (reportName.includes('자기주식')) return '자사주'
  if (reportName.includes('주요사항')) return '주요사항'
  return '기타'
}
