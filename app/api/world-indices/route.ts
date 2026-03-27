import { NextResponse } from 'next/server'
import { fetchWorldIndices } from '@/features/market-ticker/api/fetchWorldIndices'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await fetchWorldIndices())
  } catch (e) {
    console.error('world-indices error:', e)
    return NextResponse.json([], { status: 500 })
  }
}
