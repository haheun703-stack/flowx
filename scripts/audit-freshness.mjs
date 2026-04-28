#!/usr/bin/env node
/**
 * FLOWX 데이터 검수 에이전트
 * 27테이블 Supabase 직접 쿼리 → 갱신 상태 점검
 *
 * 사용법: node scripts/audit-freshness.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// .env.local 파싱
function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env.local')
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  const env = {}
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

const env = loadEnv()
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
)

// ── 테이블 설정 (health/route.ts 와 동일) ──────────────────────
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
  { table: 'intelligence_pension_scan', bot: '단타봇', schedule: '16:40', dateCol: 'date', orderCol: 'date', staleDays: 0 },
  { table: 'intelligence_nxt_performance', bot: '단타봇', schedule: '16:45', dateCol: 'pick_date', orderCol: 'pick_date', staleDays: 3 },
  { table: 'scoreboard', bot: '단타봇', schedule: '16:10', dateCol: 'updated_at', orderCol: 'updated_at', staleDays: 0 },
]

// ── KST 오늘 날짜 ──────────────────────────────────────────────
const now = new Date()
const kstOffset = 9 * 60 * 60 * 1000
const kstDate = new Date(now.getTime() + kstOffset)
const todayStr = kstDate.toISOString().slice(0, 10)
const kstTimeStr = kstDate.toISOString().slice(11, 16)

console.log(`\n${'═'.repeat(70)}`)
console.log(`  FLOWX 데이터 검수 에이전트`)
console.log(`  점검 시각: ${todayStr} ${kstTimeStr} KST`)
console.log(`${'═'.repeat(70)}\n`)

// ── 병렬 쿼리 실행 ─────────────────────────────────────────────
const results = await Promise.all(
  TABLE_CONFIG.map(async (cfg) => {
    try {
      const { data, error } = await supabase
        .from(cfg.table)
        .select(cfg.dateCol)
        .order(cfg.orderCol, { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      const raw = data ? data[cfg.dateCol] : null
      const latestDate = raw ? String(raw).slice(0, 10) : null

      let status = 'STALE'
      if (latestDate === todayStr) {
        status = 'OK'
      } else if (latestDate && cfg.staleDays > 0) {
        const diff = (kstDate.getTime() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)
        if (diff <= cfg.staleDays) status = 'OK'
      }

      return { ...cfg, latestDate, status }
    } catch (e) {
      return { ...cfg, latestDate: null, status: 'ERROR', error: e.message }
    }
  })
)

// ── 결과 출력 ───────────────────────────────────────────────────
const STATUS_ICON = { OK: '✅', STALE: '🔴', ERROR: '❌' }
const bots = ['정보봇', '퀀트봇', '단타봇']

for (const bot of bots) {
  const items = results.filter(r => r.bot === bot)
  const okCnt = items.filter(r => r.status === 'OK').length
  console.log(`── ${bot} (${okCnt}/${items.length} OK) ${'─'.repeat(45)}`)
  for (const r of items) {
    const icon = STATUS_ICON[r.status]
    const date = r.latestDate || 'NULL'
    const age = r.latestDate && r.latestDate !== todayStr
      ? ` (${Math.floor((kstDate.getTime() - new Date(r.latestDate).getTime()) / 86400000)}일 전)`
      : ''
    const errMsg = r.error ? ` — ${r.error}` : ''
    console.log(`  ${icon} ${r.table.padEnd(35)} ${r.schedule.padEnd(12)} ${date}${age}${errMsg}`)
  }
  console.log()
}

// ── 요약 ────────────────────────────────────────────────────────
const okCount = results.filter(r => r.status === 'OK').length
const staleCount = results.filter(r => r.status === 'STALE').length
const errorCount = results.filter(r => r.status === 'ERROR').length

console.log(`${'═'.repeat(70)}`)
console.log(`  총 ${results.length}개 | ✅ OK ${okCount} | 🔴 STALE ${staleCount} | ❌ ERROR ${errorCount}`)

if (staleCount > 0 || errorCount > 0) {
  console.log(`\n  ⚠️  문제 테이블:`)
  for (const r of results.filter(r => r.status !== 'OK')) {
    console.log(`     ${STATUS_ICON[r.status]} ${r.bot} > ${r.table} — latest: ${r.latestDate || 'NULL'}${r.error ? ' — ' + r.error : ''}`)
  }
}

console.log(`${'═'.repeat(70)}\n`)

// exit code: STALE/ERROR 있으면 1
process.exit(staleCount + errorCount > 0 ? 1 : 0)
