import { NextResponse } from 'next/server'
import { readJsonFile } from '@/shared/lib/dataReader'

export const revalidate = 300

export async function GET() {
  try {
    const data = readJsonFile('china_money/china_money_signal.json')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'no data' }, { status: 500 })
  }
}
