import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('quant_market_ranking')
      .select('date,data')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /quant/market-ranking]', error.message)
      return NextResponse.json({ error: '시장 순위 데이터 조회 오류' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ data: null })
    }

    const payload = data.data as Record<string, unknown>

    return NextResponse.json({
      data: {
        date: data.date,
        volume_rank: payload.volume_rank ?? [],
        fluctuation_rank: payload.fluctuation_rank ?? [],
        volume_power: payload.volume_power ?? [],
        foreign_institution: payload.foreign_institution ?? {},
        limit_price: payload.limit_price ?? {},
        summary: payload.summary ?? null,
      },
    })
  } catch (err) {
    console.error('[API /quant/market-ranking] error:', err)
    return NextResponse.json({ error: '시장 순위 데이터 조회 오류' }, { status: 500 })
  }
}
