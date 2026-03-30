import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/update-investor
 * 네이버 금융 투자자별 매매동향 스크래핑 → kospi_investor_daily 테이블 갱신
 * KIS API 없이 동작 (Vercel IP 제한 우회)
 * Vercel Cron 또는 수동 호출 가능
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    const bizdate = today.replace(/-/g, '')

    const rows: { date: string; foreign_net: number; inst_net: number; indiv_net: number }[] = []

    // 2페이지면 ~20일, 충분
    for (let page = 1; page <= 2; page++) {
      const url = `https://finance.naver.com/sise/investorDealTrendDay.nhn?bizdate=${bizdate}&sosok=&page=${page}`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(10000),
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

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No data parsed — 장 마감 전이거나 네이버 페이지 변경' }, { status: 500 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('kospi_investor_daily')
      .upsert(rows, { onConflict: 'date' })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      updated: rows.length,
      latest: rows.sort((a, b) => b.date.localeCompare(a.date))[0],
    })
  } catch (e) {
    console.error('update-investor error:', e)
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 })
  }
}
