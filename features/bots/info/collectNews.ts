// 정보봇 — 뉴스/핫이슈 수집
// Finnhub general news → Supabase intelligence_news

import { getSupabaseAdmin } from '@/lib/supabase'
import { todayKST } from '@/shared/lib/cron-auth'

interface FinnhubNews {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

export async function collectNews(): Promise<{ ok: boolean; count: number }> {
  const token = process.env.FINNHUB_API_KEY
  if (!token) throw new Error('FINNHUB_API_KEY 미설정')

  const headers = { 'X-Finnhub-Token': token }

  // 글로벌 뉴스
  const globalRes = await fetch('https://finnhub.io/api/v1/news?category=general', { headers, signal: AbortSignal.timeout(10000) })
  const globalNews: FinnhubNews[] = globalRes.ok ? await globalRes.json() : []

  // 한국 관련 뉴스 (Finnhub에서 한국 시장 뉴스)
  const krRes = await fetch('https://finnhub.io/api/v1/news?category=forex', { headers, signal: AbortSignal.timeout(10000) })
  const krNews: FinnhubNews[] = krRes.ok ? await krRes.json() : []

  const date = todayKST()
  const supabase = getSupabaseAdmin()

  const rows: Record<string, unknown>[] = []

  // 글로벌 핫이슈 상위 10건
  globalNews.slice(0, 10).forEach((item, i) => {
    rows.push({
      date,
      category: 'GLOBAL',
      rank: i + 1,
      title: item.headline,
      summary: item.summary?.slice(0, 200) || null,
      impact_level: estimateImpact(item.headline),
      impact_score: 3,
      source: item.source,
      published_at: new Date(item.datetime * 1000).toISOString(),
      related_tickers: item.related ? item.related.split(',').slice(0, 5) : [],
      impact_sectors: [],
      created_at: new Date().toISOString(),
    })
  })

  // 국내 핫이슈 상위 10건
  krNews.slice(0, 10).forEach((item, i) => {
    rows.push({
      date,
      category: 'DOMESTIC',
      rank: i + 1,
      title: item.headline,
      summary: item.summary?.slice(0, 200) || null,
      impact_level: estimateImpact(item.headline),
      impact_score: 3,
      source: item.source,
      published_at: new Date(item.datetime * 1000).toISOString(),
      related_tickers: item.related ? item.related.split(',').slice(0, 5) : [],
      impact_sectors: [],
      created_at: new Date().toISOString(),
    })
  })

  if (rows.length > 0) {
    // insert 먼저 → 성공 시 이전 데이터 삭제 (데이터 유실 방지)
    const { error } = await supabase.from('intelligence_news').insert(rows)
    if (error) throw new Error(`news insert: ${error.message}`)
    // 방금 넣은 row는 created_at이 현재 시각 → 이전 것만 삭제
    await supabase.from('intelligence_news').delete().eq('date', date).lt('created_at', rows[0].created_at)
  }

  return { ok: true, count: rows.length }
}

function estimateImpact(headline: string): string {
  const h = headline.toLowerCase()
  if (h.includes('crash') || h.includes('crisis') || h.includes('war') || h.includes('tariff')) return 'HIGH'
  if (h.includes('rate') || h.includes('fed') || h.includes('inflation') || h.includes('gdp')) return 'MEDIUM'
  return 'LOW'
}
