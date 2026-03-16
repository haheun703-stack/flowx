import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import { getSupabaseAdmin } from '@/lib/supabase'
import { KOREAN_STOCKS } from '@/features/market-ticker/api/fetchKoreanTickers'
import { KoreanTicker } from '@/features/market-ticker/types'

export const revalidate = 300 // 5분 캐시

const CACHE_FILE = path.resolve(process.cwd(), '.cache', 'market-snapshot.json')

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
    const raw = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'))
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
  const FALLBACK: Record<string, { price: number; changePercent: number }> = {
    '0001': { price: 2580, changePercent: -0.42 },
    '1001': { price: 730, changePercent: 0.31 },
    '005930': { price: 57800, changePercent: -1.20 },
    '000660': { price: 192000, changePercent: -2.30 },
    '005380': { price: 215000, changePercent: 0.47 },
    '035420': { price: 198500, changePercent: -0.75 },
    '051910': { price: 298000, changePercent: -1.33 },
    '006400': { price: 185000, changePercent: -0.54 },
    '068270': { price: 172000, changePercent: 1.18 },
    '207940': { price: 235000, changePercent: 0.86 },
    '000270': { price: 98500, changePercent: 0.51 },
    '035720': { price: 42500, changePercent: -1.62 },
    '003670': { price: 268000, changePercent: -0.37 },
    '105560': { price: 82300, changePercent: 0.24 },
    '055550': { price: 51200, changePercent: 0.59 },
    '005490': { price: 312000, changePercent: -0.96 },
    '012330': { price: 218000, changePercent: 0.23 },
    '028260': { price: 125000, changePercent: -0.40 },
    '066570': { price: 95800, changePercent: 1.05 },
    '034730': { price: 158000, changePercent: -0.63 },
    '003550': { price: 78500, changePercent: 0.13 },
    '032830': { price: 63200, changePercent: -0.31 },
  }

  return [
    { code: '0001', name: 'KOSPI', price: FALLBACK['0001'].price, change: 0, changePercent: FALLBACK['0001'].changePercent, isIndex: true },
    { code: '1001', name: 'KOSDAQ', price: FALLBACK['1001'].price, change: 0, changePercent: FALLBACK['1001'].changePercent, isIndex: true },
    ...KOREAN_STOCKS.map(s => ({
      code: s.code,
      name: s.name,
      price: FALLBACK[s.code]?.price || 0,
      change: 0,
      changePercent: FALLBACK[s.code]?.changePercent || 0,
    })),
  ]
}
