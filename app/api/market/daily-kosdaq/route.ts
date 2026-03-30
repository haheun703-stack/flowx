import { NextResponse } from 'next/server'
import { formatKRXDate } from '@/shared/lib/formatters'

export const dynamic = 'force-dynamic'

interface NaverPriceInfo {
  localDate: string
  closePrice: number
}

export async function GET() {
  try {
    const url = 'https://api.stock.naver.com/chart/domestic/index/KOSDAQ?periodType=dayCandle&count=30'
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 },
    })

    if (!res.ok) throw new Error(`Naver API error: ${res.status}`)

    const json = await res.json()
    const daily = (json.priceInfos as NaverPriceInfo[])
      .map(item => ({ date: formatKRXDate(item.localDate), close: item.closePrice }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)

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

    return NextResponse.json({ points, currentPrice, change, changePercent, marketOpen: false, mode: 'daily', lastDate })
  } catch (e) {
    console.error('market/daily-kosdaq error:', e)
    return NextResponse.json({ points: [], currentPrice: 0, change: 0, changePercent: 0, marketOpen: false, mode: 'daily', lastDate: '' }, { status: 500 })
  }
}
