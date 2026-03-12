import { NextResponse } from 'next/server'
import { readLatestSupplySnapshot } from '@/shared/lib/dataReader'

export const revalidate = 60

export async function GET() {
  try {
    const data = readLatestSupplySnapshot()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'supply snapshot not found' }, { status: 500 })
  }
}
