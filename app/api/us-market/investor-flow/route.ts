import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    // 최근 30일 전체 ETF 데이터
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 45) // 여유분

    const { data, error } = await sb
      .from('us_investor_flow')
      .select('date,etf_ticker,flow_mil,aum_bil')
      .gte('date', thirtyDaysAgo.toISOString().slice(0, 10))
      .order('date', { ascending: true })
      .limit(300)

    if (error) throw error

    // DB 필드명 → UI FlowRow 필드명 매핑
    const flows = (data ?? []).map((r: Record<string, unknown>) => ({
      date: r.date as string,
      etf: r.etf_ticker as string,
      net_flow: ((r.flow_mil as number) ?? 0) * 1e6,   // 백만 USD → USD
      aum: ((r.aum_bil as number) ?? 0) * 1e9,          // 십억 USD → USD
      flow_pct: (r.aum_bil as number) > 0
        ? ((r.flow_mil as number) / ((r.aum_bil as number) * 1000)) * 100
        : null,
    }))

    return NextResponse.json({ flows })
  } catch (err) {
    console.error('[us-market/investor-flow]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
