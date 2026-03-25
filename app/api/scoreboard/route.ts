import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VALID_PERIODS = ['30D', '60D', '90D', 'ALL'] as const

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const botType = searchParams.get('bot_type') ?? 'QUANT'
  const rawPeriod = searchParams.get('period') ?? '30D'
  // 하위호환: 숫자(30/60/90) → 문자('30D'/'60D'/'90D')로 변환
  const period = /^\d+$/.test(rawPeriod) ? `${rawPeriod}D` : rawPeriod
  if (!VALID_PERIODS.includes(period as typeof VALID_PERIODS[number])) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()

    // 1. 성적표 집계 데이터
    const { data: board } = await supabase
      .from('scoreboard')
      .select('*')
      .eq('bot_type', botType)
      .eq('period', period)
      .single()

    // 2. 최근 청산 시그널 (최신 5개)
    const { data: recentClosed } = await supabase
      .from('signals')
      .select('ticker_name, return_pct, close_date, signal_type')
      .eq('bot_type', botType)
      .eq('status', 'CLOSED')
      .order('close_date', { ascending: false })
      .limit(5)

    // 3. 현재 OPEN 시그널 수
    const { count: openCount } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .eq('bot_type', botType)
      .eq('status', 'OPEN')

    return NextResponse.json({
      bot_type: botType,
      period,
      win_rate: board?.win_rate ?? 0,
      avg_return: board?.avg_return ?? 0,
      avg_win_pct: board?.avg_win_pct ?? 0,
      avg_lose_pct: board?.avg_lose_pct ?? 0,
      total_signals: board?.total_signals ?? 0,
      win_count: board?.win_count ?? 0,
      loss_count: board?.loss_count ?? 0,
      best_return: board?.best_return ?? 0,
      worst_return: board?.worst_return ?? 0,
      best_signal: board?.best_signal ?? null,
      worst_signal: board?.worst_signal ?? null,
      open_positions: openCount ?? 0,
      recent_closed: recentClosed ?? [],
      updated_at: board?.updated_at ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Scoreboard unavailable' }, { status: 503 })
  }
}
