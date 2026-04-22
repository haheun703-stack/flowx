import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 최신 날짜 조회
    const { data: latest } = await supabase
      .from('intelligence_foreign_flow')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!latest) {
      return NextResponse.json({ data: { stocks: [], sectors: [], date: null } })
    }

    // 종목별 수급 (해당 날짜 전체)
    const { data: stocks, error: stockErr } = await supabase
      .from('intelligence_foreign_flow')
      .select('*')
      .eq('date', latest.date)
      .order('rank_cumul', { ascending: true })

    // 섹터별 수급
    const { data: sectors, error: sectorErr } = await supabase
      .from('intelligence_foreign_flow_sector')
      .select('*')
      .eq('date', latest.date)
      .order('rank', { ascending: true })

    if (stockErr || sectorErr) {
      console.error('[API /intelligence/foreign-flow]', stockErr?.message, sectorErr?.message)
      return NextResponse.json({ error: '외국인 수급 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        date: latest.date,
        stocks: stocks ?? [],
        sectors: sectors ?? [],
      },
    })
  } catch (err) {
    console.error('[API /intelligence/foreign-flow] error:', err)
    return NextResponse.json({ error: '외국인 수급 조회 오류' }, { status: 500 })
  }
}
