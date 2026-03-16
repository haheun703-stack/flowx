import { NextResponse } from 'next/server'
import { fetchKoreanTickers } from '@/features/market-ticker/api/fetchKoreanTickers'

export async function GET() {
  try {
    return NextResponse.json(await fetchKoreanTickers())
  } catch (e) {
    console.error('korean-tickers error:', e)
    return NextResponse.json([], { status: 500 })
  }
}
