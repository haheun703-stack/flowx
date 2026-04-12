import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/seed/investor-daily?secret=...
 * 네이버 금융 투자자별 매매동향 HTML 스크래핑 → kospi_investor_daily 테이블 시딩
 * 컬럼 순서: 개인 | 외국인 | 기관계 | 금융투자 | 보험 | 투신 | 은행 | 기타금융 | 연기금 | 기타법인
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows: { date: string; foreign_net: number; inst_net: number; indiv_net: number }[] = []

    // 4 pages ≈ 40 rows → 30일 이상 커버
    for (let page = 1; page <= 4; page++) {
      const bizdate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }).replace(/-/g, '')
      const url = `https://finance.naver.com/sise/investorDealTrendDay.nhn?bizdate=${bizdate}&sosok=&page=${page}`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue

      const buf = await res.arrayBuffer()
      const html = new TextDecoder('euc-kr').decode(buf)

      // <td class="date2">26.03.27</td> 패턴으로 행 시작 감지
      const cellRegex = /<td[^>]*class="(?:date2|rate_(?:up|down)3)"[^>]*>([\s\S]*?)<\/td>/g
      const cells: string[] = []
      let m: RegExpExecArray | null
      while ((m = cellRegex.exec(html)) !== null) {
        cells.push(m[1].trim())
      }

      // 11 cells per row: date, 개인, 외국인, 기관계, 금융투자, 보험, 투신, 은행, 기타금융, 연기금, 기타법인
      for (let i = 0; i + 10 < cells.length; i += 11) {
        const dateStr = cells[i]       // "26.03.27"
        if (!/^\d{2}\.\d{2}\.\d{2}$/.test(dateStr)) continue

        const [yy, mm, dd] = dateStr.split('.')
        const fullDate = `20${yy}-${mm}-${dd}`

        const parseNum = (s: string) => Number(s.replace(/,/g, '')) || 0

        rows.push({
          date: fullDate,
          indiv_net: parseNum(cells[i + 1]),    // 개인
          foreign_net: parseNum(cells[i + 2]),   // 외국인
          inst_net: parseNum(cells[i + 3]),      // 기관계
        })
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No data parsed from Naver' }, { status: 500 })
    }

    // 최신 30일만 유지
    rows.sort((a, b) => a.date.localeCompare(b.date))
    const last30 = rows.slice(-30)

    // Supabase upsert
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('kospi_investor_daily')
      .upsert(last30, { onConflict: 'date' })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      seeded: last30.length,
      dateRange: `${last30[0].date} ~ ${last30[last30.length - 1].date}`,
      sample: last30.slice(-3),
    })
  } catch (e) {
    console.error('seed/investor-daily error:', e)
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 })
  }
}
