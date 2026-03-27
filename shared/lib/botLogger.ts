// 봇 실행 로깅 + 환경변수 검증 + 데이터 신선도 체크
// Supabase bot_run_logs 테이블에 기록

import { getSupabaseAdmin } from '@/lib/supabase'

// ── 타입 ──

export type BotName = 'update-market' | 'info-bot' | 'quant-bot' | 'swing-bot' | 'health'

export interface BotRunLog {
  bot_name: BotName
  status: 'ok' | 'partial' | 'error'
  duration_ms: number
  error_message?: string
  summary?: Record<string, unknown>
}

export interface DataFreshness {
  table: string
  label: string
  last_updated: string | null
  age_hours: number | null
  status: 'fresh' | 'stale' | 'critical' | 'no_data'
}

// ── 환경변수 검증 ──

const REQUIRED_ENV: Record<string, string> = {
  CRON_SECRET: '크론 인증 토큰',
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase URL',
  SUPABASE_SERVICE_KEY: 'Supabase 서비스 키',
  KIS_APP_KEY: '한투 앱 키',
  KIS_APP_SECRET: '한투 시크릿',
}

/** 필수 환경변수 누락 체크. 누락 시 변수명 배열 반환 */
export function checkEnvVars(extra?: string[]): string[] {
  const all = { ...REQUIRED_ENV }
  for (const key of extra ?? []) all[key] = key
  return Object.keys(all).filter(k => !process.env[k])
}

// ── 봇 실행 로깅 ──

/** 봇 실행 결과를 Supabase에 기록 (테이블 없으면 무시) */
export async function logBotRun(log: BotRunLog): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    await supabase.from('bot_run_logs').insert({
      ...log,
      created_at: new Date().toISOString(),
    })
  } catch {
    // 테이블 미생성 시 console만 — 봇 실행 자체를 막으면 안 됨
    console.warn(`[botLogger] bot_run_logs insert failed for ${log.bot_name}`)
  }
}

/** 봇 실행 타이머 — start()로 시작, end()로 로그 기록 */
export function botTimer(botName: BotName) {
  const start = Date.now()
  return {
    async end(status: BotRunLog['status'], opts?: { error?: string; summary?: Record<string, unknown> }) {
      const duration_ms = Date.now() - start
      const log: BotRunLog = {
        bot_name: botName,
        status,
        duration_ms,
        error_message: opts?.error,
        summary: opts?.summary,
      }
      // 콘솔에도 남김 (Vercel Logs에서 확인 가능)
      if (status === 'error') {
        console.error(`[${botName}] FAILED (${duration_ms}ms): ${opts?.error}`)
      } else {
        console.log(`[${botName}] ${status.toUpperCase()} (${duration_ms}ms)`)
      }
      await logBotRun(log)
      return log
    },
  }
}

// ── 데이터 신선도 체크 ──

/** 주말(토·일)이면 true — KIS API 비활성 기간 */
function isWeekend(): boolean {
  const kstDay = new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCDay()
  return kstDay === 0 || kstDay === 6
}

const FRESHNESS_CHECKS: { table: string; label: string; field: string; maxHours: number; weekendExtra?: number }[] = [
  { table: 'market_snapshots', label: '시장 데이터', field: 'updated_at', maxHours: 6, weekendExtra: 60 },
  { table: 'macro_data', label: '매크로 데이터', field: 'updated_at', maxHours: 26 },
  { table: 'short_signals', label: '매매 시그널', field: 'created_at', maxHours: 26, weekendExtra: 60 },
  { table: 'intelligence_news', label: '뉴스', field: 'created_at', maxHours: 26 },
  { table: 'intelligence_supply_demand', label: '수급 흐름', field: 'updated_at', maxHours: 26, weekendExtra: 60 },
]

/** Supabase 각 테이블의 최신 데이터 시간 조회 */
export async function checkDataFreshness(): Promise<DataFreshness[]> {
  const supabase = getSupabaseAdmin()
  const now = Date.now()
  const weekend = isWeekend()
  const results: DataFreshness[] = []

  for (const check of FRESHNESS_CHECKS) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select(check.field)
        .order(check.field, { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        results.push({ table: check.table, label: check.label, last_updated: null, age_hours: null, status: 'no_data' })
        continue
      }

      const ts = String((data as unknown as Record<string, unknown>)[check.field] ?? '')
      const age_hours = Math.round((now - new Date(ts).getTime()) / (1000 * 60 * 60) * 10) / 10

      const limit = weekend && check.weekendExtra ? check.weekendExtra : check.maxHours
      let status: DataFreshness['status'] = 'fresh'
      if (age_hours > limit * 3) status = 'critical'
      else if (age_hours > limit) status = 'stale'

      results.push({ table: check.table, label: check.label, last_updated: ts, age_hours, status })
    } catch {
      results.push({ table: check.table, label: check.label, last_updated: null, age_hours: null, status: 'no_data' })
    }
  }

  return results
}

/** 최근 봇 실행 기록 조회 (최대 20건) */
export async function getRecentBotRuns(limit = 20): Promise<Record<string, unknown>[]> {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('bot_run_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
