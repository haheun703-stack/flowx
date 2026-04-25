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

const TABLE_CONFIG = [
  // 정보봇
  { table: 'market_investor_trend', bot: '정보봇', schedule: '16:47', dateCol: 'date', orderCol: 'date' },
  { table: 'stock_technicals', bot: '정보봇', schedule: '17:00', dateCol: 'date', orderCol: 'updated_at' },
  { table: 'stock_valuations', bot: '정보봇', schedule: '17:08', dateCol: 'date', orderCol: 'updated_at' },
  { table: 'ml_predictions', bot: '정보봇', schedule: '18:35', dateCol: 'date', orderCol: 'updated_at' },
  { table: 'market_fear_greed', bot: '정보봇', schedule: '17:22', dateCol: 'date', orderCol: 'date' },
  { table: 'market_52w_highs_lows', bot: '정보봇', schedule: '17:06', dateCol: 'date', orderCol: 'date' },
  { table: 'program_trading', bot: '정보봇', schedule: '16:23', dateCol: 'date', orderCol: 'date' },
  { table: 'deep_briefing', bot: '정보봇', schedule: '16:08', dateCol: 'date', orderCol: 'date' },
  { table: 'blog_stock_analysis', bot: '정보봇', schedule: '장후', dateCol: 'date', orderCol: 'date' },
  { table: 'us_kr_theme_signals', bot: '정보봇', schedule: '08:03', dateCol: 'date', orderCol: 'date' },
  { table: 'nationality_charts', bot: '정보봇', schedule: '16:57', dateCol: 'date', orderCol: 'date' },
  // 퀀트봇
  { table: 'quant_jarvis', bot: '퀀트봇', schedule: '17:15', dateCol: 'date', orderCol: 'date' },
  { table: 'quant_fib_scanner', bot: '퀀트봇', schedule: '17:10', dateCol: 'date', orderCol: 'date' },
  { table: 'quant_market_ranking', bot: '퀀트봇', schedule: '17:10', dateCol: 'date', orderCol: 'date' },
  { table: 'quant_bluechip_checkup', bot: '퀀트봇', schedule: '17:10', dateCol: 'date', orderCol: 'date' },
  { table: 'quant_scenario_dashboard', bot: '퀀트봇', schedule: '17:30', dateCol: 'date', orderCol: 'date' },
  { table: 'dashboard_swing', bot: '단타봇', schedule: '16:40', dateCol: 'date', orderCol: 'date' },
  { table: 'dashboard_smart_money', bot: '정보봇', schedule: '16:25', dateCol: 'date', orderCol: 'date' },
  { table: 'short_signals', bot: '퀀트봇', schedule: '17:15', dateCol: 'date', orderCol: 'date' },
  { table: 'quant_supply_surge', bot: '퀀트봇', schedule: '17:10', dateCol: 'date', orderCol: 'date' },
  // 단타봇
  { table: 'intelligence_daytrading_picks', bot: '단타봇', schedule: '07:35/16:45', dateCol: 'date', orderCol: 'date' },
  { table: 'intelligence_cycle_scan', bot: '단타봇', schedule: '16:40', dateCol: 'date', orderCol: 'date' },
  { table: 'intelligence_oneshot_stealth', bot: '단타봇', schedule: '16:45', dateCol: 'date', orderCol: 'date' },
  { table: 'intelligence_flow_intensity', bot: '단타봇', schedule: '16:35', dateCol: 'date', orderCol: 'date' },
  { table: 'intelligence_foreign_flow', bot: '단타봇', schedule: '16:45', dateCol: 'date', orderCol: 'date' },
  { table: 'intelligence_nxt_performance', bot: '단타봇', schedule: '16:45', dateCol: 'pick_date', orderCol: 'pick_date' },
  { table: 'scoreboard', bot: '단타봇', schedule: '16:10', dateCol: 'updated_at', orderCol: 'updated_at' },
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

      const isToday = latestDate === todayStr
      results.push({
        table: cfg.table,
        bot: cfg.bot,
        schedule: cfg.schedule,
        latest_date: latestDate,
        is_today: isToday,
        status: isToday ? 'OK' : 'STALE',
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
