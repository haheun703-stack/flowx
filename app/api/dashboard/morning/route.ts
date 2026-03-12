import { NextResponse } from 'next/server'
import { readLatestSnapshot } from '@/shared/lib/dataReader'

export const revalidate = 600

export async function GET() {
  try {
    const data = readLatestSnapshot('market_news.json')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'no data' }, { status: 500 })
  }
}
