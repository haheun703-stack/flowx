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
      .select('*')
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

    if (error) {
      console.error('[signals] DB error:', error.message)
      return NextResponse.json({ error: '시그널 조회 오류' }, { status: 500 })
    }

    // short_signals → signals 형식으로 매핑 (한글 컬럼: 코드, 등급)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signals = (data ?? []).map((row: any) => ({
      id: row.id,
      bot_type: ['BUY', 'QUANT_SELL'].includes(row.signal_type) ? 'QUANT' : 'DAYTRADING',
      ticker: row['\uCF54\uB4DC'] ?? row.code ?? '',
      ticker_name: row.name ?? '',
      signal_type: row.signal_type,
      grade: row['\uB4F1\uAE09'] ?? row.grade ?? 'N/A',
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

    // ticker_name이 비어있거나 종목코드(숫자6자리)인 경우 stock_master에서 보정
    const needsName = signals.filter(
      (s: { ticker_name: string; ticker: string }) => !s.ticker_name || /^\d{6}$/.test(s.ticker_name)
    )

    if (needsName.length > 0) {
      const codes = [...new Set(needsName.map((s: { ticker: string }) => s.ticker))]
      const { data: masters } = await supabase
        .from('stock_master')
        .select('ticker, name')
        .in('ticker', codes)

      if (masters && masters.length > 0) {
        const nameMap = new Map(masters.map((m) => [m.ticker, m.name]))
        for (const sig of signals) {
          if (!sig.ticker_name || /^\d{6}$/.test(sig.ticker_name)) {
            sig.ticker_name = nameMap.get(sig.ticker) ?? sig.ticker_name ?? sig.ticker
          }
        }
      }
    }

    return NextResponse.json({
      signals,
      count: signals.length,
    })
  } catch {
    return NextResponse.json({ error: 'Signals unavailable' }, { status: 503 })
  }
}
