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
      .select('*')
      .gte('date', thirtyDaysAgo.toISOString().slice(0, 10))
      .order('date', { ascending: true })
      .limit(300)

    if (error) throw error

    return NextResponse.json({ flows: data ?? [] })
  } catch (err) {
    console.error('[us-market/investor-flow]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
