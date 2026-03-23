// 정보봇 — EDGAR 공시 수집
// SEC EDGAR EFTS Full-Text Search → Supabase intelligence_disclosures

import { getSupabaseAdmin } from '@/lib/supabase'
import { todayKST } from '@/shared/lib/cron-auth'

interface EdgarFiling {
  file_num: string
  form_type: string
  entity_name: string
  file_date: string
  period_of_report: string
  file_description: string
  tickers: string[]
}

export async function collectEdgar(): Promise<{ ok: boolean; count: number }> {
  const date = todayKST()

  // SEC EDGAR EFTS (무료, API 키 불필요, User-Agent 필수)
  // 10-K, 10-Q, 8-K 주요 양식만 검색
  const formTypes = ['10-K', '10-Q', '8-K']
  const allFilings: EdgarFiling[] = []

  for (const form of formTypes) {
    try {
      const url = `https://efts.sec.gov/LATEST/search-index?q=%22${form}%22&dateRange=custom&startdt=${date}&enddt=${date}&forms=${form}`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'FlowX Bot contact@flowx.kr',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!res.ok) continue
      const json = await res.json()
      const hits = json?.hits?.hits ?? []

      for (const hit of hits.slice(0, 5)) {
        const src = hit._source ?? {}
        allFilings.push({
          file_num: src.file_num ?? '',
          form_type: form,
          entity_name: src.entity_name ?? src.display_names?.[0] ?? 'Unknown',
          file_date: src.file_date ?? date,
          period_of_report: src.period_of_report ?? '',
          file_description: src.file_description ?? src.form_type ?? form,
          tickers: Array.isArray(src.tickers) ? src.tickers : [],
        })
      }
    } catch {
      // 개별 양식 실패 시 skip
    }
  }

  if (allFilings.length === 0) return { ok: true, count: 0 }

  const supabase = getSupabaseAdmin()

  const rows = allFilings.map(f => ({
    date,
    source: 'EDGAR',
    ticker: f.tickers[0] ?? null,
    ticker_name: f.entity_name,
    title: `[${f.form_type}] ${f.entity_name} — ${f.file_description}`,
    category: f.form_type,
    sentiment: 'NEUTRAL',
    tags: [f.form_type, ...f.tickers],
    original_url: f.file_num
      ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&filenum=${f.file_num}&type=${f.form_type}`
      : null,
    created_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('intelligence_disclosures').insert(rows)
  if (error) throw new Error(`edgar insert: ${error.message}`)

  return { ok: true, count: rows.length }
}
