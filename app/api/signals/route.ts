import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const revalidate = 60 // 1분 캐시

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const botType = searchParams.get('bot_type') // QUANT / DAYTRADING / null(전체)
  const status = searchParams.get('status') // OPEN / CLOSED / STOPPED / null(전체)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('signals')
      .select('*')
      .order('signal_date', { ascending: false })
      .limit(limit)

    if (botType) query = query.eq('bot_type', botType)
    if (status) query = query.eq('status', status)

    // FREE 유저: grade A+ / score 65+ 만 노출 (FLOWX 표시용 필터)
    query = query.gte('score', 65)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      signals: data ?? [],
      count: data?.length ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Signals unavailable' }, { status: 503 })
  }
}
