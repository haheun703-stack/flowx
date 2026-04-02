import { NextResponse } from 'next/server'
import { fetchSectorHeatmap } from '@/features/market-summary/api/fetchSectorHeatmap'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await fetchSectorHeatmap()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
