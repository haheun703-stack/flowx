import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  if (!ticker) {
    return NextResponse.json({ error: 'ticker 파라미터 필요' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('stock_analysis')
      .select('*')
      .eq('ticker', ticker)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /stock/analysis] Supabase error:', error.message)
      return NextResponse.json({ error: '종목 분석 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? null })
  } catch (err) {
    console.error('[API /stock/analysis] error:', err)
    return NextResponse.json({ error: '종목 분석 데이터 조회 오류' }, { status: 500 })
  }
}
