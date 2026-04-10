import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const market = searchParams.get('market') ?? 'KOSPI'

    const supabase = getSupabaseAdmin()

    // 최근 20일 프로그램 매매 + 오늘 투자자별
    const [tradingRes, investorRes] = await Promise.all([
      supabase
        .from('program_trading')
        .select('*')
        .eq('market', market)
        .order('date', { ascending: false })
        .limit(20),
      supabase
        .from('program_trading_investor')
        .select('*')
        .eq('market', market)
        .order('date', { ascending: false })
        .limit(22), // 최대 11 투자자유형 x 최근 2일
    ])

    if (tradingRes.error) throw tradingRes.error

    // 투자자별: 가장 최근 날짜만 필터
    const investors = investorRes.data ?? []
    const latestDate = investors[0]?.date
    const todayInvestors = latestDate
      ? investors.filter((r: { date: string }) => r.date === latestDate)
      : []

    return NextResponse.json({
      trading: tradingRes.data ?? [],
      investors: todayInvestors,
    })
  } catch {
    return NextResponse.json({ trading: [], investors: [] }, { status: 500 })
  }
}
