import { NextRequest, NextResponse } from 'next/server'
import { fetchOHLCV } from '@/features/supply-xray/api/fetchOHLCV'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker') || '005930'
  if (!/^\d{6}$/.test(ticker)) {
    return NextResponse.json({ error: 'Invalid ticker format' }, { status: 400 })
  }
  try {
    return NextResponse.json(await fetchOHLCV(ticker))
  } catch (e) {
    console.error('ohlcv error:', e)
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
