import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const ticker = searchParams.get('ticker')
    const date = searchParams.get('date')

    // 특정 종목+날짜: 상세 조회 (blog_content 포함)
    if (ticker && date) {
      const { data, error } = await supabase
        .from('blog_stock_analysis')
        .select('*')
        .eq('ticker', ticker)
        .eq('date', date)
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    // 특정 종목: 해당 종목의 전체 분석 목록
    if (ticker) {
      const { data, error } = await supabase
        .from('blog_stock_analysis')
        .select('date, ticker, name, sector, current_price, fair_price_avg, gap_pct, verdict')
        .eq('ticker', ticker)
        .order('date', { ascending: false })
        .limit(30)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ items: data ?? [] })
    }

    // 기본: 최신 분석 목록 (본문 제외, 가볍게)
    const { data, error } = await supabase
      .from('blog_stock_analysis')
      .select('date, ticker, name, sector, current_price, fair_price_avg, gap_pct, verdict')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
