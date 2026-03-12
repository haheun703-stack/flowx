import { NextRequest, NextResponse } from 'next/server'
import { fetchSupply } from '@/features/supply-xray/api/fetchSupply'

export const revalidate = 300 // 5분 캐시

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker') || '005930'
  try {
    const data = await fetchSupply(ticker)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
