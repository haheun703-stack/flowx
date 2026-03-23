// 정보봇 — 매크로 데이터 수집
// fetchWorldIndices() → Supabase macro_data upsert

import { fetchWorldIndices } from '@/features/market-ticker/api/fetchWorldIndices'
import { getSupabaseAdmin } from '@/lib/supabase'
import { todayKST } from '@/shared/lib/cron-auth'

export async function collectMacro(): Promise<{ ok: boolean; count: number }> {
  const indices = await fetchWorldIndices()

  // 카테고리별 분류
  const categories = {
    indices: indices.filter(i => ['SPX', 'IXIC', 'DJI', 'N225', 'HSI', 'GDAXI', 'SSEC', 'FTSE'].includes(i.symbol)),
    commodities: indices.filter(i => ['WTI', 'GOLD', 'SILVER', 'COPPER'].includes(i.symbol)),
    forex: indices.filter(i => ['USDKRW', 'DXY', 'USDJPY', 'EURUSD'].includes(i.symbol)),
    crypto: indices.filter(i => ['BTC', 'ETH', 'SOL'].includes(i.symbol)),
    bonds: indices.filter(i => ['US10Y', 'US2Y'].includes(i.symbol)),
    vix: indices.find(i => i.symbol === 'VIX'),
  }

  const date = todayKST()
  const supabase = getSupabaseAdmin()

  // macro_data 테이블에 upsert (date 기준)
  const payload = {
    id: `macro-${date}`,
    date,
    indices: categories.indices.map(i => ({
      symbol: i.symbol, name: i.name, price: i.price, change: i.changePercent,
    })),
    commodities: categories.commodities.map(i => ({
      symbol: i.symbol, name: i.name, price: i.price, change: i.changePercent,
    })),
    forex: categories.forex.map(i => ({
      symbol: i.symbol, name: i.name, price: i.price, change: i.changePercent,
    })),
    crypto: categories.crypto.map(i => ({
      symbol: i.symbol, name: i.name, price: i.price, change: i.changePercent,
    })),
    bonds: categories.bonds.map(i => ({
      symbol: i.symbol, name: i.name, price: i.price, change: i.changePercent,
    })),
    vix: categories.vix ? { price: categories.vix.price, change: categories.vix.changePercent } : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('macro_data').upsert(payload)
  if (error) throw new Error(`macro_data upsert: ${error.message}`)

  return { ok: true, count: indices.length }
}
