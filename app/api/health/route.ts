import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface TableCheck {
  table: string
  bot: string
  schedule: string
  latest_date: string | null
  is_today: boolean
  status: 'OK' | 'STALE' | 'ERROR'
}

// staleDays: OK 판정 허용 일수 (기본 0 = 오늘만 OK)
// - oneshot_stealth: KRX 국적별 데이터가 T+2 지연 제공 → 3일 허용
// - nxt_performance: pick_date 기준, 오늘 추천 성적은 내일 종가로 계산 → 3일 허용
const TABLE_CONFIG = [
  // 정보봇
  { table: 'market_investor_trend', bot: '정보봇', schedule: '16:47', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'stock_technicals', bot: '정보봇', schedule: '17:00', dateCol: 'date', orderCol: 'updated_at', staleDays: 0 },
  { table: 'stock_valuations', bot: '정보봇', schedule: '17:08', dateCol: 'date', orderCol: 'updated_at', staleDays: 0 },
  { table: 'ml_predictions', bot: '정보봇', schedule: '18:35', dateCol: 'date', orderCol: 'updated_at', staleDays: 0 },
  { table: 'market_fear_greed', bot: '정보봇', schedule: '17:22', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'market_52w_highs_lows', bot: '정보봇', schedule: '17:06', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'program_trading', bot: '정보봇', schedule: '16:23', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'deep_briefing', bot: '정보봇', schedule: '16:08', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'blog_stock_analysis', bot: '정보봇', schedule: '장후', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'us_kr_theme_signals', bot: '정보봇', schedule: '08:03', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'nationality_charts', bot: '정보봇', schedule: '16:57', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  // 퀀트봇
  { table: 'quant_jarvis', bot: '퀀트봇', schedule: '17:15', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'quant_fib_scanner', bot: '퀀트봇', schedule: '17:10', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'quant_market_ranking', bot: '퀀트봇', schedule: '17:10', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'quant_bluechip_checkup', bot: '퀀트봇', schedule: '17:10', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'quant_scenario_dashboard', bot: '퀀트봇', schedule: '17:30', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'quant_sector_fire', bot: '퀀트봇', schedule: '16:30', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'quant_sector_picks', bot: '퀀트봇', schedule: '16:30', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'dashboard_swing', bot: '단타봇', schedule: '16:40', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'dashboard_smart_money', bot: '정보봇', schedule: '16:25', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'short_signals', bot: '퀀트봇', schedule: '17:15', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'quant_supply_surge', bot: '퀀트봇', schedule: '17:10', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  // 단타봇
  { table: 'intelligence_daytrading_picks', bot: '단타봇', schedule: '07:35/16:45', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'intelligence_cycle_scan', bot: '단타봇', schedule: '16:40', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'intelligence_oneshot_stealth', bot: '단타봇', schedule: '16:45', dateCol: 'date', orderCol: 'date', staleDays: 3 },
  { table: 'intelligence_flow_intensity', bot: '단타봇', schedule: '16:35', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'intelligence_foreign_flow', bot: '단타봇', schedule: '16:45', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'intelligence_nxt_performance', bot: '단타봇', schedule: '16:45', dateCol: 'pick_date', orderCol: 'pick_date', staleDays: 3 },
  { table: 'scoreboard', bot: '단타봇', schedule: '16:10', dateCol: 'updated_at', orderCol: 'updated_at', staleDays: 0 },
] as const

export async function GET() {
  const supabase = getSupabaseAdmin()
  const now = new Date()
  const kstOffset = 9 * 60 * 60 * 1000
  const kstDate = new Date(now.getTime() + kstOffset)
  const todayStr = kstDate.toISOString().slice(0, 10)

  const results: TableCheck[] = []

  for (const cfg of TABLE_CONFIG) {
    try {
      const { data } = await supabase
        .from(cfg.table)
        .select(cfg.dateCol)
        .order(cfg.orderCol, { ascending: false })
        .limit(1)
        .maybeSingle()

      const raw = data ? (data as Record<string, unknown>)[cfg.dateCol] : null
      const latestDate = raw ? String(raw).slice(0, 10) : null

      let isOk = latestDate === todayStr
      if (!isOk && latestDate && cfg.staleDays > 0) {
        const diff = (kstDate.getTime() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)
        isOk = diff <= cfg.staleDays
      }
      results.push({
        table: cfg.table,
        bot: cfg.bot,
        schedule: cfg.schedule,
        latest_date: latestDate,
        is_today: latestDate === todayStr,
        status: isOk ? 'OK' : 'STALE',
      })
    } catch {
      results.push({
        table: cfg.table,
        bot: cfg.bot,
        schedule: cfg.schedule,
        latest_date: null,
        is_today: false,
        status: 'ERROR',
      })
    }
  }

  const okCount = results.filter((r) => r.status === 'OK').length
  const staleCount = results.filter((r) => r.status === 'STALE').length
  const errorCount = results.filter((r) => r.status === 'ERROR').length

  return NextResponse.json({
    checked_at: now.toISOString(),
    today: todayStr,
    summary: { total: results.length, ok: okCount, stale: staleCount, error: errorCount },
    tables: results,
  })
}
