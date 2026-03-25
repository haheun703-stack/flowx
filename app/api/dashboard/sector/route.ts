import { NextResponse } from 'next/server'
import { readJsonFile } from '@/shared/lib/dataReader'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = readJsonFile(path.join('sector_rotation', 'sector_momentum.json'))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'sector data not found' }, { status: 500 })
  }
}
