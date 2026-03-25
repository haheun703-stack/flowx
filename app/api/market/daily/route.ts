import { NextResponse } from 'next/server'
import { fetchDailyKOSPI } from '@/features/market-summary/api/fetchDailyKOSPI'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const daily = await fetchDailyKOSPI(30)

    if (daily.length < 2) {
      return NextResponse.json({ points: [], currentPrice: 0, change: 0, changePercent: 0, marketOpen: false, mode: 'daily', lastDate: '' })
    }

    const points = daily.map(d => ({
      time: Math.floor(new Date(`${d.date}T09:00:00+09:00`).getTime() / 1000),
      value: d.close,
    }))

    const currentPrice = daily[daily.length - 1].close
    const prevPrice = daily[daily.length - 2].close
    const change = currentPrice - prevPrice
    const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0
    const lastDate = daily[daily.length - 1].date

    return NextResponse.json({
      points,
      currentPrice,
      change,
      changePercent,
      marketOpen: false,
      mode: 'daily',
      lastDate,
    })
  } catch (e) {
    console.error('market/daily error:', e)
    return NextResponse.json(
      { points: [], currentPrice: 0, change: 0, changePercent: 0, marketOpen: false, mode: 'daily', lastDate: '' },
      { status: 500 },
    )
  }
}
