import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const signal = req.nextUrl.searchParams.get('signal')
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 50, 200)

  try {
    const sb = getSupabaseAdmin()

    let q = sb
      .from('stock_valuations')
      .select('*')
      .order('safety_margin', { ascending: false })
      .limit(limit)

    if (signal) {
      q = q.eq('valuation_signal', signal)
    }

    const { data, error } = await q

    if (error) {
      console.error('[stock-valuations] DB error:', error.message)
      return NextResponse.json({ data: [], signals: [] }, { status: 500 })
    }

    // 사용 가능한 시그널 목록
    const { data: signalList } = await sb
      .from('stock_valuations')
      .select('valuation_signal')
      .neq('valuation_signal', '')
      .limit(1000)

    const signals = [...new Set((signalList ?? []).map(r => r.valuation_signal))].sort()

    return NextResponse.json({ data: data ?? [], signals })
  } catch (e) {
    console.error('[stock-valuations] error:', e)
    return NextResponse.json({ data: [], signals: [] }, { status: 500 })
  }
}
