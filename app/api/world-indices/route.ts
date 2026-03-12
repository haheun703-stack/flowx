import { NextResponse } from 'next/server'
import { fetchWorldIndices } from '@/features/market-ticker/api/fetchWorldIndices'

export async function GET() {
  try {
    return NextResponse.json(await fetchWorldIndices())
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
