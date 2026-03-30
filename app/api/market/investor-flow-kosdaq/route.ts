import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface InvestorRow {
  date: string
  foreign_net: number
  inst_net: number
  indiv_net: number
}

/**
 * GET /api/market/investor-flow-kosdaq
 * 네이버 금융 스크래핑으로 KOSDAQ 투자자별 매매동향 반환 (최근 30일)
 * 서버측 캐시: 10분 (Vercel revalidate)
 */
export async function GET() {
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    const bizdate = today.replace(/-/g, '')

    const rows: InvestorRow[] = []

    for (let page = 1; page <= 4; page++) {
      const url = `https://finance.naver.com/sise/investorDealTrendDay.nhn?bizdate=${bizdate}&sosok=02&page=${page}`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue

      const buf = await res.arrayBuffer()
      const html = new TextDecoder('euc-kr').decode(new Uint8Array(buf))

      const cellRegex = /<td[^>]*class="(?:date2|rate_(?:up|down)3)"[^>]*>([\s\S]*?)<\/td>/g
      const cells: string[] = []
      let m: RegExpExecArray | null
      while ((m = cellRegex.exec(html)) !== null) {
        cells.push(m[1].trim())
      }

      for (let i = 0; i + 10 < cells.length; i += 11) {
        const dateStr = cells[i]
        if (!/^\d{2}\.\d{2}\.\d{2}$/.test(dateStr)) continue

        const [yy, mm, dd] = dateStr.split('.')
        const parseNum = (s: string) => Number(s.replace(/,/g, '')) || 0

        rows.push({
          date: `20${yy}-${mm}-${dd}`,
          indiv_net: parseNum(cells[i + 1]),
          foreign_net: parseNum(cells[i + 2]),
          inst_net: parseNum(cells[i + 3]),
        })
      }
    }

    rows.sort((a, b) => a.date.localeCompare(b.date))
    return NextResponse.json(rows.slice(-30))
  } catch (e) {
    console.error('investor-flow-kosdaq error:', e)
    return NextResponse.json([], { status: 500 })
  }
}
