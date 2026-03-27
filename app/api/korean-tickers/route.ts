import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { getSupabaseAdmin } from '@/lib/supabase'
import { KOREAN_STOCKS, FALLBACK_PRICES } from '@/features/market-ticker/api/fetchKoreanTickers'
import { KoreanTicker } from '@/features/market-ticker/types'

export const dynamic = 'force-dynamic'

const CACHE_FILE = '/tmp/.cache/market-snapshot.json'

/** cron이 저장한 Supabase/파일캐시에서 읽기 (KIS API 직접 호출 안 함) */
export async function GET() {
  // 1. Supabase에서 읽기
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('market_snapshots')
      .select('kospi_price, kospi_change, kosdaq_price, kosdaq_change, stocks')
      .eq('id', 'latest')
      .single()

    if (!error && data?.stocks?.length) {
      return NextResponse.json(snapshotToTickers(data))
    }
  } catch { /* Supabase 실패 → 파일 fallback */ }

  // 2. 파일 캐시 fallback
  try {
    const raw = JSON.parse(await readFile(CACHE_FILE, 'utf-8'))
    if (raw?.stocks?.length) {
      return NextResponse.json(snapshotToTickers(raw))
    }
  } catch { /* 파일도 없음 */ }

  // 3. 하드코딩 fallback (최후)
  console.warn('korean-tickers: no cache available, using hardcoded fallback')
  return NextResponse.json(buildHardcodedFallback())
}

type SnapshotData = {
  kospi_price: number
  kospi_change: number
  kosdaq_price: number
  kosdaq_change: number
  stocks: { code: string; name: string; price: number; change: number; changePercent: number }[]
}

function snapshotToTickers(data: SnapshotData): KoreanTicker[] {
  const indices: KoreanTicker[] = [
    { code: '0001', name: 'KOSPI', price: data.kospi_price, change: 0, changePercent: data.kospi_change, isIndex: true },
    { code: '1001', name: 'KOSDAQ', price: data.kosdaq_price, change: 0, changePercent: data.kosdaq_change, isIndex: true },
  ]

  const stockTickers: KoreanTicker[] = data.stocks.map(s => ({
    code: s.code,
    name: s.name,
    price: s.price,
    change: s.change ?? 0,
    changePercent: s.changePercent,
  }))

  return [...indices, ...stockTickers]
}

function buildHardcodedFallback(): KoreanTicker[] {
  return [
    { code: '0001', name: 'KOSPI', price: FALLBACK_PRICES['0001']?.price ?? 0, change: 0, changePercent: FALLBACK_PRICES['0001']?.changePercent ?? 0, isIndex: true },
    { code: '1001', name: 'KOSDAQ', price: FALLBACK_PRICES['1001']?.price ?? 0, change: 0, changePercent: FALLBACK_PRICES['1001']?.changePercent ?? 0, isIndex: true },
    ...KOREAN_STOCKS.map(s => ({
      code: s.code,
      name: s.name,
      price: FALLBACK_PRICES[s.code]?.price ?? 0,
      change: 0,
      changePercent: FALLBACK_PRICES[s.code]?.changePercent ?? 0,
    })),
  ]
}
