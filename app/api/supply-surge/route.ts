import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('quant_supply_surge')
      .select('*')
      .order('date', { ascending: false })
      .order('final_score', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[API /supply-surge] Supabase error:', error.message)
      return NextResponse.json({ error: '스마트 수급 포착 조회 오류' }, { status: 500 })
    }

    if (!data?.length) return NextResponse.json({ buys: [], sells: [], date: null })

    const latestDate = data[0].date
    const latest = data.filter((d) => d.date === latestDate)

    const buys = latest
      .filter((d) => d.signal === 'BUY')
      .sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0))

    const sells = latest
      .filter((d) => d.signal === 'SELL')
      .sort((a, b) => (b.retail ?? 0) - (a.retail ?? 0))

    return NextResponse.json({ buys, sells, date: latestDate })
  } catch (err) {
    console.error('[API /supply-surge] error:', err)
    return NextResponse.json({ error: '스마트 수급 포착 조회 오류' }, { status: 500 })
  }
}
