import { NextResponse } from 'next/server'
import { readJsonFile } from '@/shared/lib/dataReader'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = readJsonFile('tomorrow_picks.json')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'picks data not found' }, { status: 500 })
  }
}
