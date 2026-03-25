import { NextResponse } from 'next/server'
import { readLatestSupplySnapshot } from '@/shared/lib/dataReader'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = readLatestSupplySnapshot()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'supply snapshot not found' }, { status: 500 })
  }
}
