import { NextResponse } from 'next/server'
import { readLatestSnapshot } from '@/shared/lib/dataReader'

export const revalidate = 300

export async function GET() {
  try {
    const data = readLatestSnapshot('integrated_report.json')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'market report not found' }, { status: 500 })
  }
}
