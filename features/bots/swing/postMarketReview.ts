// 단타봇 — 장후 리뷰 (15:40 KST)
// 보유 종목 실적 평가 + holding_days 업데이트 + 변곡점 알림

import { fetchOHLCV } from '@/features/supply-xray/api/fetchOHLCV'
import { getSupabaseAdmin } from '@/lib/supabase'
import { todayKST } from '@/shared/lib/cron-auth'

interface ReviewResult {
  ticker: string
  name: string
  pnl: number
  holdingDays: number
  alert: string | null
}

export async function postMarketReview(): Promise<{ results: ReviewResult[] }> {
  const supabase = getSupabaseAdmin()
  const date = todayKST()

  // 최근 7일 이내 SWING_ENTRY 시그널 가져오기
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: entries } = await supabase
    .from('short_signals')
    .select('*')
    .eq('signal_type', 'SWING_ENTRY')
    .gte('date', sevenDaysAgo)
    .order('date', { ascending: false })

  if (!entries || entries.length === 0) return { results: [] }

  // 종목별 최신 시그널만 (중복 제거)
  const uniqueMap = new Map<string, typeof entries[0]>()
  for (const e of entries) {
    if (!uniqueMap.has(e.ticker)) uniqueMap.set(e.ticker, e)
  }
  const holdings = Array.from(uniqueMap.values())

  const results: ReviewResult[] = []

  const fetched = await Promise.allSettled(
    holdings.map(async (h) => {
      const candles = await fetchOHLCV(h.ticker, 10)
      if (candles.length === 0) return null

      const currentPrice = candles[candles.length - 1].close
      const entryDate = new Date(h.date)
      const today = new Date(date)
      const holdingDays = Math.max(1, Math.ceil((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)))

      // 수익률 계산 (entry_price가 있으면 사용, 없으면 skip)
      const entryPrice = h.entry_price ?? candles[0]?.close
      const pnl = entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0

      // 변곡점 알림
      let alert: string | null = null
      if (h.stop_loss && currentPrice < h.stop_loss) {
        alert = `손절선 이탈 (${currentPrice.toLocaleString()} < ${h.stop_loss.toLocaleString()})`
      } else if (pnl <= -5) {
        alert = `-5% 이상 하락 주의 (${pnl.toFixed(1)}%)`
      } else if (pnl >= 10) {
        alert = `+10% 이상 수익 — 익절 고려 (${pnl.toFixed(1)}%)`
      } else if (holdingDays >= 5 && pnl < 2) {
        alert = `5일 보유 미소수익 — 포지션 재검토`
      }

      results.push({
        ticker: h.ticker,
        name: h.name ?? h.ticker,
        pnl: Math.round(pnl * 100) / 100,
        holdingDays,
        alert,
      })

      // holding_days 업데이트
      await supabase
        .from('short_signals')
        .update({ holding_days: holdingDays })
        .eq('id', h.id)

      return null
    })
  )

  void fetched

  // 변곡점 알림이 있는 종목 → SWING_ALERT로 저장
  const alerts = results.filter(r => r.alert)
  if (alerts.length > 0) {
    const alertRows = alerts.map(a => ({
      date,
      signal_type: 'SWING_ALERT',
      ticker: a.ticker,
      name: a.name,
      score: 0,
      signals: [a.alert!],
      holding_days: a.holdingDays,
      created_at: new Date().toISOString(),
    }))

    await supabase.from('short_signals').delete().eq('date', date).eq('signal_type', 'SWING_ALERT')
    const { error } = await supabase.from('short_signals').insert(alertRows)
    if (error) console.error('swing alert insert:', error.message)
  }

  return { results }
}
