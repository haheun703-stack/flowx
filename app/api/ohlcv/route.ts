import { NextRequest, NextResponse } from 'next/server'
import { fetchOHLCV } from '@/features/supply-xray/api/fetchOHLCV'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker') || '005930'
  try {
    return NextResponse.json(await fetchOHLCV(ticker))
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
