import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('quant_nxt_picks')
      .select('*')
      .order('date', { ascending: false })
      .order('final_score', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[API /quant/nxt-picks] Supabase error:', error.message)
      return NextResponse.json({ error: 'NXT 주목 종목 조회 오류' }, { status: 500 })
    }

    if (!data?.length) return NextResponse.json({ items: [], date: null })

    const latestDate = data[0].date
    const items = data.filter((d) => d.date === latestDate)

    return NextResponse.json({ items, date: latestDate })
  } catch (err) {
    console.error('[API /quant/nxt-picks] error:', err)
    return NextResponse.json({ error: 'NXT 주목 종목 조회 오류' }, { status: 500 })
  }
}
