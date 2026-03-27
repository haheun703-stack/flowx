// 정보봇 — 수급 데이터 수집
// KIS 투자자 매매동향 + 업종별 등락 → Supabase

import { getKISToken } from '@/shared/lib/kisAuth'
import { fetchInvestorTrend, fetchSectorPrices } from '@/features/market-ticker/api/fetchKoreanTickers'
import { getSupabaseAdmin } from '@/lib/supabase'
import { todayKST } from '@/shared/lib/cron-auth'

export async function collectSupplyDemand(): Promise<{ ok: boolean }> {
  const token = await getKISToken()

  const [trend, sectors] = await Promise.all([
    fetchInvestorTrend(token),
    fetchSectorPrices(token),
  ])

  const date = todayKST()
  const supabase = getSupabaseAdmin()

  const payload = {
    date,
    foreign_net: trend.foreign_net,
    inst_net: trend.inst_net,
    individual_net: trend.individual_net,
    // 연속 매수/매도 일수는 과거 데이터 비교 필요 — 일단 0
    foreign_streak: 0,
    inst_streak: 0,
    sector_flows: sectors.map((s: { name: string; changePercent: number }) => ({
      name: s.name,
      change: s.changePercent,
    })),
    summary: trend.foreign_net > 0 && trend.inst_net > 0
      ? '외국인+기관 동시매수'
      : trend.foreign_net > 0
        ? '외국인 순매수 우세'
        : trend.inst_net > 0
          ? '기관 순매수 우세'
          : '외국인+기관 순매도',
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('intelligence_supply_demand').upsert(payload, { onConflict: 'date' })
  if (error) throw new Error(`supply_demand upsert: ${error.message}`)

  return { ok: true }
}
