// 봇 상태 조회 API (프론트엔드용) — 인증 불필요
// 데이터 신선도 + 최근 실행 이력 반환

import { NextResponse } from 'next/server'
import { checkDataFreshness, getRecentBotRuns } from '@/shared/lib/botLogger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [freshness, recentRuns] = await Promise.all([
      checkDataFreshness(),
      getRecentBotRuns(15),
    ])

    // 봇별 마지막 실행 상태 집계
    const botNames = ['update-market', 'info-bot', 'quant-bot', 'swing-bot', 'health'] as const
    const lastRuns: Record<string, { status: string; time: string; error?: string } | null> = {}
    for (const name of botNames) {
      const run = recentRuns.find(r => r.bot_name === name)
      lastRuns[name] = run
        ? { status: run.status as string, time: run.created_at as string, error: run.error_message as string | undefined }
        : null
    }

    const criticalCount = freshness.filter(f => f.status === 'critical' || f.status === 'no_data').length
    const staleCount = freshness.filter(f => f.status === 'stale').length

    const overallStatus =
      criticalCount > 0 ? 'critical' :
      staleCount > 0 ? 'warning' :
      'healthy'

    return NextResponse.json({
      status: overallStatus,
      data_freshness: freshness,
      last_runs: lastRuns,
      recent_history: recentRuns.slice(0, 10),
      checked_at: new Date().toISOString(),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'bot-status error'
    return NextResponse.json({
      status: 'error',
      error: msg,
      data_freshness: [],
      last_runs: {},
      recent_history: [],
      checked_at: new Date().toISOString(),
    }, { status: 500 })
  }
}
