import { NextResponse } from 'next/server'
import { readJsonFile } from '@/shared/lib/dataReader'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = readJsonFile('whale_detect.json')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'whale data not found' }, { status: 500 })
  }
}
