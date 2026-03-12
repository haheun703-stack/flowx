import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface StockRow {
  code: string
  name: string
  market: 'KOSPI' | 'KOSDAQ'
}

// 서버 메모리 캐시 (24시간)
let cache: { data: StockRow[]; cachedAt: number } | null = null
const CACHE_TTL = 1000 * 60 * 60 * 24
const DATA_ROOT = path.resolve(process.cwd(), '..', '_SPECS', 'data')

async function loadStocks(): Promise<StockRow[]> {
  // 1) all_tickers.csv에서 market 매핑 테이블 만들기
  const marketMap = new Map<string, 'KOSPI' | 'KOSDAQ'>()
  try {
    const raw = await fs.readFile(path.join(DATA_ROOT, 'universe', 'all_tickers.csv'), 'utf-8')
    for (const line of raw.split('\n').slice(1)) {
      const cols = line.split(',')
      if (cols.length >= 3) {
        const code = cols[0].replace(/\uFEFF/, '').trim().padStart(6, '0')
        const market = cols[2].trim() as 'KOSPI' | 'KOSDAQ'
        if (market === 'KOSPI' || market === 'KOSDAQ') {
          marketMap.set(code, market)
        }
      }
    }
  } catch { /* all_tickers 없으면 무시 */ }

  // 2) universe.csv에서 전체 종목 읽기
  const csv = await fs.readFile(path.join(DATA_ROOT, 'universe.csv'), 'utf-8')
  const lines = csv.split('\n').slice(1) // 헤더 스킵
  const stocks: StockRow[] = []

  for (const line of lines) {
    const cols = line.split(',')
    if (cols.length < 2) continue
    const code = cols[0].replace(/\uFEFF/, '').trim().padStart(6, '0')
    const name = cols[1].trim()
    if (!code || !name) continue

    // market 구분: all_tickers에 있으면 사용, 없으면 코드 패턴으로 추정
    const market = marketMap.get(code) ?? guessMarket(code)
    stocks.push({ code, name, market })
  }

  return stocks
}

function guessMarket(code: string): 'KOSPI' | 'KOSDAQ' {
  // KOSDAQ: 1xxxxx, 2xxxxx, 3xxxxx, 4xxxxx 대가 많음
  // KOSPI: 0xxxxx 대가 많음 (정확하지 않으나 fallback)
  const first = code[0]
  if (first === '1' || first === '2' || first === '3' || first === '4') return 'KOSDAQ'
  return 'KOSPI'
}

export async function GET() {
  const now = Date.now()

  if (cache && now - cache.cachedAt < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  try {
    const data = await loadStocks()
    cache = { data, cachedAt: now }
    return NextResponse.json(data)
  } catch {
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json([], { status: 500 })
  }
}
