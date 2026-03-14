import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

const DATA_ROOT = path.resolve(process.cwd(), '..', '_SPECS', 'data')

export async function GET() {
  try {
    const csv = readFileSync(path.join(DATA_ROOT, 'kospi_index.csv'), 'utf-8')
    const lines = csv.trim().split('\n').slice(1) // skip header
    const recent = lines.slice(-30)

    const points = recent.map(line => {
      const [date, close] = line.split(',')
      return {
        time: Math.floor(new Date(`${date}T09:00:00+09:00`).getTime() / 1000),
        value: parseFloat(close),
      }
    }).filter(p => !isNaN(p.value))

    if (points.length < 2) {
      return NextResponse.json({ points: [], currentPrice: 0, change: 0, changePercent: 0, mode: 'daily' })
    }

    let currentPrice = points[points.length - 1].value
    const prevPrice = points[points.length - 2].value
    let change = currentPrice - prevPrice
    let changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0

    // kospi_regime.json이 있으면 더 정확한 종가/등락 사용
    try {
      const regime = JSON.parse(readFileSync(path.join(DATA_ROOT, 'kospi_regime.json'), 'utf-8'))
      if (regime.close) {
        currentPrice = regime.close
        change = regime.change ?? change
        changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : changePercent
      }
    } catch { /* ignore */ }

    return NextResponse.json({
      points,
      currentPrice,
      change,
      changePercent,
      marketOpen: false,
      mode: 'daily',
    })
  } catch {
    return NextResponse.json(
      { points: [], currentPrice: 0, change: 0, changePercent: 0, marketOpen: false, mode: 'daily' },
      { status: 500 },
    )
  }
}
