import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// short_signals 테이블에서 읽어 signals API 형식으로 변환
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const botType = searchParams.get('bot_type') // QUANT / DAYTRADING / null(전체)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('short_signals')
      .select('id, code, name, signal_type, grade, total_score, volume_ratio, entry_price, target_price, stop_loss, current_price, holding_days, date, signals')
      .order('date', { ascending: false })
      .limit(limit)

    // bot_type 필터 → signal_type 매핑
    if (botType === 'QUANT') {
      query = query.in('signal_type', ['BUY', 'QUANT_SELL'])
    } else if (botType === 'DAYTRADING') {
      query = query.in('signal_type', ['FORCE_BUY', 'WATCH'])
    }

    // FREE 유저: score 65+ 만 노출
    query = query.gte('total_score', 65)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // short_signals → signals 형식으로 매핑
    const signals = (data ?? []).map(row => ({
      id: row.id,
      bot_type: ['BUY', 'QUANT_SELL'].includes(row.signal_type) ? 'QUANT' : 'DAYTRADING',
      ticker: row.code,
      ticker_name: row.name,
      signal_type: row.signal_type,
      grade: row.grade,
      score: row.total_score,
      multiplier: row.volume_ratio,
      entry_price: row.entry_price,
      target_price: row.target_price,
      stop_price: row.stop_loss,
      current_price: row.current_price,
      return_pct: null,
      max_return_pct: null,
      status: 'OPEN',
      memo: Array.isArray(row.signals) ? row.signals.join(', ') : null,
      signal_date: row.date,
      close_date: null,
      close_reason: null,
    }))

    return NextResponse.json({
      signals,
      count: signals.length,
    })
  } catch {
    return NextResponse.json({ error: 'Signals unavailable' }, { status: 503 })
  }
}
