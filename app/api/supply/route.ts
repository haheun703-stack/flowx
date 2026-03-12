import { NextRequest, NextResponse } from 'next/server'
import { fetchSupply } from '@/features/supply-xray/api/fetchSupply'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker') || '005930'
  try {
    return NextResponse.json(await fetchSupply(ticker))
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }
}
