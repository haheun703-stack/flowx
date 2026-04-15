import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('paper_trades')
      .select('*')
      .order('trade_date', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[paper-trades] DB error:', error.message)
      return NextResponse.json({ error: '모의투자 조회 오류' }, { status: 500 })
    }

    const latest = data?.[0]
    return NextResponse.json({
      trades: data,
      cumulative: {
        pf: latest?.cumulative_pf ?? 0,
        mdd: latest?.cumulative_mdd ?? 0,
        win_rate: latest?.win_rate ?? 0,
        total_trades: data?.length ?? 0,
      },
    })
  } catch (e) {
    console.error('paper-trades error:', e)
    return NextResponse.json({ trades: [], cumulative: { pf: 0, mdd: 0, win_rate: 0, total_trades: 0 } })
  }
}
