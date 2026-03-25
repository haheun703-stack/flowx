import { NextResponse } from 'next/server'
import { readJsonFile } from '@/shared/lib/dataReader'

export const dynamic = 'force-dynamic'

interface PickItem {
  ticker: string
  name: string
  close: number
  price_change: number
  foreign_5d: number
  inst_5d: number
}

export async function GET() {
  try {
    const picks = readJsonFile<{ picks: PickItem[] }>('tomorrow_picks.json')
    const items = picks.picks ?? []

    const foreign = items
      .filter(p => p.foreign_5d > 0)
      .sort((a, b) => b.foreign_5d - a.foreign_5d)
      .slice(0, 5)
      .map(p => ({
        code: p.ticker,
        name: p.name,
        price: p.close,
        changePercent: p.price_change,
        foreignNet: Math.round(p.foreign_5d / 1e8),
        instNet: Math.round(p.inst_5d / 1e8),
      }))

    const inst = items
      .filter(p => p.inst_5d > 0)
      .sort((a, b) => b.inst_5d - a.inst_5d)
      .slice(0, 5)
      .map(p => ({
        code: p.ticker,
        name: p.name,
        price: p.close,
        changePercent: p.price_change,
        foreignNet: Math.round(p.foreign_5d / 1e8),
        instNet: Math.round(p.inst_5d / 1e8),
      }))

    return NextResponse.json({ foreign, inst })
  } catch (e) {
    console.error('market/supply-rank error:', e)
    return NextResponse.json({ foreign: [], inst: [] }, { status: 500 })
  }
}
