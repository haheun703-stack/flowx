import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('market_investor_trend')
      .select('date, foreign_net, inst_net, individual_net')
      .eq('market', 'KOSDAQ')
      .order('date', { ascending: true })
      .limit(30)

    if (error) throw error

    // individual_net → indiv_net 매핑 (프론트엔드 호환)
    const mapped = (data ?? []).map(row => ({
      date: row.date,
      foreign_net: row.foreign_net,
      inst_net: row.inst_net,
      indiv_net: row.individual_net,
    }))

    return NextResponse.json(mapped)
  } catch (e) {
    console.error('investor-flow-kosdaq error:', e)
    return NextResponse.json([], { status: 500 })
  }
}
