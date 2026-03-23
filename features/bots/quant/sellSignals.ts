// 퀀트봇 — 매도 시그널 생성
// SMA 데드크로스, RSI 과매수, 목표가 도달, 손절선 이탈

import { fetchOHLCV } from '@/features/supply-xray/api/fetchOHLCV'
import { calcSMA, calcRSI } from '@/shared/lib/ta'
import { getSupabaseAdmin } from '@/lib/supabase'

export interface SellSignal {
  ticker: string
  name: string
  reason: string
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
  currentPrice: number
}

export async function checkSellSignals(): Promise<SellSignal[]> {
  const supabase = getSupabaseAdmin()

  // 현재 보유 중인 QUANT 시그널 가져오기 (최근 30일 이내 매수 시그널)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: rawHoldings } = await supabase
    .from('short_signals')
    .select('*')
    .eq('signal_type', 'BUY')
    .gte('date', thirtyDaysAgo)

  if (!rawHoldings || rawHoldings.length === 0) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const holdings = rawHoldings.map((r: any) => ({
    code: (r['\uCF54\uB4DC'] ?? '') as string,
    name: (r.name ?? '') as string,
    entry_price: r.entry_price as number | null,
    stop_loss: r.stop_loss as number | null,
    target_price: r.target_price as number | null,
  }))

  const signals: SellSignal[] = []

  const results = await Promise.allSettled(
    holdings.map(async (h) => {
      const candles = await fetchOHLCV(h.code, 30)
      if (candles.length < 5) return null

      const last = candles.length - 1
      const currentPrice = candles[last].close
      const name = h.name ?? h.code

      // 1. 손절선 이탈
      if (h.stop_loss && currentPrice < h.stop_loss) {
        signals.push({
          ticker: h.code, name,
          reason: `손절선 이탈 (현재가 ${currentPrice.toLocaleString()} < 손절 ${h.stop_loss.toLocaleString()})`,
          urgency: 'HIGH', currentPrice,
        })
        return
      }

      // 2. 목표가 도달
      if (h.target_price && currentPrice >= h.target_price) {
        signals.push({
          ticker: h.code, name,
          reason: `목표가 도달 (현재가 ${currentPrice.toLocaleString()} ≥ 목표 ${h.target_price.toLocaleString()})`,
          urgency: 'MEDIUM', currentPrice,
        })
        return
      }

      // 3. SMA5 < SMA20 (데드크로스)
      const sma5 = calcSMA(candles, 5)
      const sma20 = calcSMA(candles, 20)
      if (!isNaN(sma5[last]) && !isNaN(sma20[last]) && sma5[last] < sma20[last]) {
        const prev = last - 1
        if (!isNaN(sma5[prev]) && !isNaN(sma20[prev]) && sma5[prev] >= sma20[prev]) {
          signals.push({
            ticker: h.code, name,
            reason: 'SMA5/SMA20 데드크로스 발생',
            urgency: 'MEDIUM', currentPrice,
          })
          return
        }
      }

      // 4. RSI > 80 (과매수)
      const rsi = calcRSI(candles)
      const rsiVal = rsi[last]
      if (!isNaN(rsiVal) && rsiVal > 80) {
        signals.push({
          ticker: h.code, name,
          reason: `RSI 과매수 (${rsiVal.toFixed(0)})`,
          urgency: 'LOW', currentPrice,
        })
      }
    })
  )

  // 에러 무시 (개별 종목 실패 시)
  void results

  return signals
}
