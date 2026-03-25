import { NextRequest, NextResponse } from 'next/server'
import { fetchSupply } from '@/features/supply-xray/api/fetchSupply'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker') || '005930'
  try {
    const data = await fetchSupply(ticker)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  } catch (e) {
    console.error('supply error:', e)
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
