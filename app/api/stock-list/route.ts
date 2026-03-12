import { NextResponse } from 'next/server'
import { fetchStockList } from '@/features/stock-search/api/fetchStockList'

// 서버 메모리 캐시 (24시간)
let cache: { data: any[]; cachedAt: number } | null = null
const CACHE_TTL = 1000 * 60 * 60 * 24

export async function GET() {
  const now = Date.now()

  if (cache && now - cache.cachedAt < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  try {
    const data = await fetchStockList()
    cache = { data, cachedAt: now }
    return NextResponse.json(data)
  } catch {
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json([], { status: 500 })
  }
}
