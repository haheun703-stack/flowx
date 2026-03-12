import { NextResponse } from 'next/server'
import { fetchSectorHeatmap } from '@/features/market-summary/api/fetchSectorHeatmap'

export const revalidate = 300

export async function GET() {
  try {
    const data = fetchSectorHeatmap()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
