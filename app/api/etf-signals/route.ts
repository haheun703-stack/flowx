import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 최신 날짜 기준 전체 ETF, 점수 내림차순
    const { data, error } = await supabase
      .from('dashboard_etf_signals')
      .select('*')
      .order('date', { ascending: false })
      .order('score', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[API /etf-signals] Supabase error:', error.message)
      return NextResponse.json({ error: 'ETF 시그널 조회 오류' }, { status: 500 })
    }

    if (!data?.length) return NextResponse.json({ items: [], date: null })

    const latestDate = data[0].date
    const filtered = data.filter((d) => d.date === latestDate)

    // Supabase 컬럼 → 프론트엔드 필드 매핑
    const items = filtered.map((row: Record<string, unknown>) => ({
      date: row.date,
      sector: (row.sector as string) ?? '',
      etf_code: (row.ticker as string) ?? '',
      etf_name: (row.name as string) ?? '',
      close: (row.close as number) ?? 0,
      ret_1: 0,
      ret_5: (row.change_pct as number) ?? 0,
      ret_20: 0,
      rsi: 0,
      score: (row.score as number) ?? 0,
      grade: (row.signal_type as string) ?? '',
      sector_rotation_rank: 0,
      reasons: [],
    }))

    return NextResponse.json({ items, date: latestDate })
  } catch (err) {
    console.error('[API /etf-signals] error:', err)
    return NextResponse.json({ error: 'ETF 시그널 조회 오류' }, { status: 500 })
  }
}
