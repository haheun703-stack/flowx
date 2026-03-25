import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fetchIntradayKOSPI } from '@/features/market-summary/api/fetchIntradayIndex'
import { isMarketOpen } from '@/shared/lib/marketUtils'

export const dynamic = 'force-dynamic'

const CACHE_DIR = path.resolve(process.cwd(), '.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'intraday-kospi.json')
const DATA_ROOT = path.resolve(process.cwd(), '..', '_SPECS', 'data')

function saveCache(raw: { time: string; value: number }[]) {
  try {
    mkdirSync(CACHE_DIR, { recursive: true })
    const date = new Date().toISOString().split('T')[0]
    writeFileSync(CACHE_FILE, JSON.stringify({ date, raw }), 'utf-8')
  } catch { /* ignore */ }
}

function loadCache(): { time: string; value: number }[] | null {
  try {
    const data = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'))
    if (data?.raw?.length > 0) return data.raw
  } catch { /* ignore */ }
  return null
}

function buildIntradayResponse(raw: { time: string; value: number }[], marketOpen: boolean) {
  const today = new Date().toISOString().split('T')[0]
  const points = raw.map(p => ({
    time: Math.floor(new Date(`${today}T${p.time}:00+09:00`).getTime() / 1000),
    value: p.value,
  }))

  const currentPrice = raw[raw.length - 1].value
  const openPrice = raw[0].value
  const change = currentPrice - openPrice
  const changePercent = openPrice > 0 ? (change / openPrice) * 100 : 0

  return { points, currentPrice, change, changePercent, marketOpen, mode: 'intraday' as const }
}

/** _SPECS/data/kospi_index.csv에서 최근 30일 일봉 + kospi_regime.json 종가 */
function loadDailyFallback(marketOpen: boolean) {
  try {
    // CSV: Date,close,high,low,open,volume
    const csv = readFileSync(path.join(DATA_ROOT, 'kospi_index.csv'), 'utf-8')
    const lines = csv.trim().split('\n').slice(1) // skip header
    const recent = lines.slice(-30)

    const points = recent.map(line => {
      const [date, close] = line.split(',')
      return {
        time: Math.floor(new Date(`${date}T09:00:00+09:00`).getTime() / 1000),
        value: parseFloat(close),
      }
    }).filter(p => !isNaN(p.value))

    if (points.length < 2) return null

    const currentPrice = points[points.length - 1].value
    const prevPrice = points[points.length - 2].value
    const change = currentPrice - prevPrice
    const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0

    // kospi_regime.json이 있으면 더 정확한 종가/등락 사용
    try {
      const regime = JSON.parse(readFileSync(path.join(DATA_ROOT, 'kospi_regime.json'), 'utf-8'))
      if (regime.close) {
        return {
          points,
          currentPrice: regime.close,
          change: regime.change ?? change,
          changePercent: regime.change ?? changePercent,
          marketOpen,
          mode: 'daily' as const,
        }
      }
    } catch { /* ignore */ }

    return { points, currentPrice, change, changePercent, marketOpen, mode: 'daily' as const }
  } catch {
    return null
  }
}

// --- main handler ---

export async function GET() {
  const marketOpen = isMarketOpen()

  try {
    // 1) 장중일 때만 KIS API 호출 — 장 마감 시간엔 캐시/폴백 사용
    if (marketOpen) {
      const raw = await fetchIntradayKOSPI()
      if (raw.length > 0) {
        saveCache(raw)
        return NextResponse.json(buildIntradayResponse(raw, marketOpen))
      }
    }

    // 2) 장 마감 or API 빈 응답: 오늘 캐시된 인트라데이 데이터
    const cached = loadCache()
    if (cached) {
      return NextResponse.json(buildIntradayResponse(cached, marketOpen))
    }

    // 3) 캐시 없음: _SPECS/data/ 일봉 30일 폴백
    const daily = loadDailyFallback(marketOpen)
    if (daily) {
      return NextResponse.json(daily)
    }

    return NextResponse.json({ points: [], currentPrice: 0, change: 0, changePercent: 0, marketOpen, mode: 'empty' })
  } catch {
    // 에러 시에도 캐시 → 일봉 순서로 시도
    const cached = loadCache()
    if (cached) return NextResponse.json(buildIntradayResponse(cached, marketOpen))

    const daily = loadDailyFallback(marketOpen)
    if (daily) return NextResponse.json(daily)

    return NextResponse.json({ points: [], currentPrice: 0, change: 0, changePercent: 0, marketOpen, mode: 'empty' }, { status: 500 })
  }
}
