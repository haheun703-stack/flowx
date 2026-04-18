import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('quant_etf_strategy')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /quant/etf-strategy] Supabase error:', error.message)
      return NextResponse.json({ error: 'ETF 전략 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? null })
  } catch (err) {
    console.error('[API /quant/etf-strategy] error:', err)
    return NextResponse.json({ error: 'ETF 전략 조회 오류' }, { status: 500 })
  }
}
