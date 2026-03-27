// 퀀트봇 Cron Route — 매일 18:10 KST
// Soft Scoring → ConvictionGrade → 매도 시그널 → Supabase 저장

import { NextResponse } from 'next/server'
import { verifyCronAuth, todayKST } from '@/shared/lib/cron-auth'
import { botTimer, checkEnvVars } from '@/shared/lib/botLogger'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getKISToken } from '@/shared/lib/kisAuth'
import { fetchInvestorTrend } from '@/features/market-ticker/api/fetchKoreanTickers'
import { runScoringEngine } from '@/features/bots/quant/scoringEngine'
import { calcConvictionGrades } from '@/features/bots/quant/convictionGrade'
import { checkSellSignals } from '@/features/bots/quant/sellSignals'

export const dynamic = 'force-dynamic'
export const maxDuration = 55

export async function GET(req: Request) {
  const timer = botTimer('quant-bot')

  if (!verifyCronAuth(req)) {
    await timer.end('error', { error: 'Unauthorized — CRON_SECRET 불일치 또는 미설정' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const missing = checkEnvVars()
  if (missing.length > 0) {
    const msg = `환경변수 누락: ${missing.join(', ')}`
    await timer.end('error', { error: msg })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }

  const date = todayKST()
  const supabase = getSupabaseAdmin()

  try {
    // 1. 수급 컨텍스트 조회
    const token = await getKISToken()
    const supply = await fetchInvestorTrend(token)

    // 2. Soft Scoring
    const { stocks, regime } = await runScoringEngine(supply)

    // 3. ConvictionGrade
    const grades = calcConvictionGrades(stocks, regime)

    // 4. 매도 시그널
    const sellSignals = await checkSellSignals()

    // 5. Supabase 저장 — 상위 종목을 short_signals에 매수 시그널로
    const topStocks = stocks.filter(s => s.score >= 60).slice(0, 10)
    const buyRows = topStocks.map(s => {
      const grade = grades.find(g => g.ticker === s.ticker)
      const ep = s.lastPrice
      return {
        date,
        signal_type: 'BUY',
        '\uCF54\uB4DC': s.ticker,
        name: s.name,
        total_score: s.score,
        '\uB4F1\uAE09': grade?.grade ?? 'N/A',
        volume_ratio: s.volumeRatio,
        entry_price: ep,
        target_price: ep > 0 ? Math.round(ep * 1.1) : null,
        stop_loss: ep > 0 ? Math.round(ep * 0.95) : null,
        signals: s.signals,
        breakdown: s.breakdown,
        created_at: new Date().toISOString(),
      }
    })

    // 매도 시그널 저장
    const sellRows = sellSignals.map(s => ({
      date,
      signal_type: 'QUANT_SELL',
      '\uCF54\uB4DC': s.ticker,
      name: s.name,
      total_score: 0,
      signals: [s.reason],
      urgency: s.urgency,
      current_price: s.currentPrice,
      created_at: new Date().toISOString(),
    }))

    // insert 먼저 → 성공 시 이전 데이터 삭제 (데이터 유실 방지)
    const allRows = [...buyRows, ...sellRows]
    if (allRows.length > 0) {
      const { error } = await supabase.from('short_signals').insert(allRows)
      if (error) throw new Error(`quant signals insert: ${error.message}`)
      const cutoff = allRows[0].created_at
      await supabase.from('short_signals').delete().eq('date', date).in('signal_type', ['BUY', 'QUANT_SELL']).lt('created_at', cutoff)
    }

    const result = {
      ok: true,
      regime: regime.regime,
      vix: regime.vix,
      scored_count: stocks.length,
      top_stocks: topStocks.map(s => `${s.name}(${s.score}점)`),
      sell_signals: sellSignals.length,
      grades_sample: grades.slice(0, 5).map(g => `${g.name}: ${g.grade}(${g.totalScore})`),
      updated_at: new Date().toISOString(),
    }

    await timer.end('ok', { summary: { regime: regime.regime, scored: stocks.length, buys: buyRows.length, sells: sellRows.length } })
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await timer.end('error', { error: msg })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
