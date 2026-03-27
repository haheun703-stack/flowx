// 헬스체크 크론 — 매시간 실행
// 1) 환경변수 검증
// 2) Supabase 연결 확인
// 3) 데이터 신선도 체크
// 4) 최근 봇 실행 이력 조회

import { NextResponse } from 'next/server'
import { verifyCronAuth } from '@/shared/lib/cron-auth'
import {
  checkEnvVars,
  checkDataFreshness,
  getRecentBotRuns,
  botTimer,
} from '@/shared/lib/botLogger'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const timer = botTimer('health')

  // 1. 환경변수 체크
  const missingEnv = checkEnvVars([
    'DART_API_KEY',
    'FINNHUB_API_KEY',
  ])

  // 2. Supabase 연결 체크
  let supabaseOk = false
  let supabaseError = ''
  try {
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('market_snapshots').select('id').limit(1)
    supabaseOk = !error
    if (error) supabaseError = error.message
  } catch (e) {
    supabaseError = e instanceof Error ? e.message : 'connection failed'
  }

  // 3. 데이터 신선도
  let freshness: Awaited<ReturnType<typeof checkDataFreshness>> = []
  if (supabaseOk) {
    freshness = await checkDataFreshness()
  }

  // 4. 최근 봇 실행 기록
  let recentRuns: Record<string, unknown>[] = []
  if (supabaseOk) {
    recentRuns = await getRecentBotRuns(10)
  }

  // 종합 판정
  const criticalData = freshness.filter(f => f.status === 'critical' || f.status === 'no_data')
  const staleData = freshness.filter(f => f.status === 'stale')

  const overallStatus =
    missingEnv.length > 0 || !supabaseOk ? 'critical' :
    criticalData.length > 0 ? 'critical' :
    staleData.length > 0 ? 'warning' :
    'healthy'

  const summary = {
    status: overallStatus,
    env: {
      ok: missingEnv.length === 0,
      missing: missingEnv,
    },
    supabase: {
      ok: supabaseOk,
      error: supabaseError || undefined,
    },
    data_freshness: freshness,
    recent_runs: recentRuns,
    checked_at: new Date().toISOString(),
  }

  // 로깅
  await timer.end(
    overallStatus === 'healthy' ? 'ok' : 'error',
    {
      error: overallStatus !== 'healthy' ? `status=${overallStatus}, missing_env=${missingEnv.join(',')}, critical_data=${criticalData.map(d => d.table).join(',')}` : undefined,
      summary: { overallStatus, missingEnv: missingEnv.length, criticalTables: criticalData.length, staleTables: staleData.length },
    },
  )

  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'warning' ? 200 : 503
  return NextResponse.json(summary, { status: httpStatus })
}
