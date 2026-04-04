import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const ALLOWED_DAYS = [1, 5, 30] as const

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawDays = Number(searchParams.get('days') ?? 30)
    const days = ALLOWED_DAYS.includes(rawDays as 1 | 5 | 30) ? rawDays : 30

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('market_investor_trend')
      .select('date, foreign_net, inst_net, individual_net')
      .eq('market', 'KOSPI')
      .order('date', { ascending: false })
      .limit(days)

    if (error) throw error

    // 최신 N일 → 날짜순 정렬 + individual_net → indiv_net 매핑
    const mapped = (data ?? []).reverse().map(row => ({
      date: row.date,
      foreign_net: row.foreign_net,
      inst_net: row.inst_net,
      indiv_net: row.individual_net,
    }))

    return NextResponse.json(mapped)
  } catch (e) {
    console.error('investor-flow error:', e)
    return NextResponse.json([], { status: 500 })
  }
}
