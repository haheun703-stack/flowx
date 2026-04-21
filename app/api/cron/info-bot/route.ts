// 정보봇 Cron Route — 매일 18:00 KST
// Step 1: 매크로 + 수급 + DART + EDGAR + 뉴스 (병렬)
// Step 2: 시나리오 + 브리핑 (수집 데이터 기반, 순차)

import { NextResponse } from 'next/server'
import { verifyCronAuth } from '@/shared/lib/cron-auth'
import { botTimer, checkEnvVars } from '@/shared/lib/botLogger'
import { collectMacro } from '@/features/bots/info/collectMacro'
import { collectSupplyDemand } from '@/features/bots/info/collectSupplyDemand'
import { collectDart } from '@/features/bots/info/collectDart'
import { collectEdgar } from '@/features/bots/info/collectEdgar'
import { collectNews } from '@/features/bots/info/collectNews'
import { generateScenarios } from '@/features/bots/info/generateScenarios'
import { generateBriefing } from '@/features/bots/info/generateBriefing'

export const dynamic = 'force-dynamic'
export const maxDuration = 55 // Vercel Pro: 최대 60초

export async function GET(req: Request) {
  const timer = botTimer('info-bot')
  try {
    if (!verifyCronAuth(req)) {
      await timer.end('error', { error: 'Unauthorized — CRON_SECRET 불일치 또는 미설정' })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const missing = checkEnvVars(['DART_API_KEY', 'FINNHUB_API_KEY'])
    if (missing.length > 0) {
      const msg = `환경변수 누락: ${missing.join(', ')}`
      await timer.end('error', { error: msg })
      return NextResponse.json({ ok: false, error: msg }, { status: 500 })
    }

    // Step 1: 데이터 수집 (병렬)
    const collectResults = await Promise.allSettled([
      collectMacro(),
      collectSupplyDemand(),
      collectDart(),
      collectEdgar(),
      collectNews(),
    ])

    // Step 2: AI 생성 (briefing은 scenarios 데이터를 읽으므로 순차 실행)
    const scenarioResult = await Promise.allSettled([generateScenarios()])
    const briefingResult = await Promise.allSettled([generateBriefing()])
    const aiResults = [...scenarioResult, ...briefingResult]

    const summary = {
      macro: fmt(collectResults[0]),
      supply_demand: fmt(collectResults[1]),
      dart: fmt(collectResults[2]),
      edgar: fmt(collectResults[3]),
      news: fmt(collectResults[4]),
      scenarios: fmt(aiResults[0]),
      briefing: fmt(aiResults[1]),
      updated_at: new Date().toISOString(),
    }

    const allResults = [...collectResults, ...aiResults]
    const allOk = allResults.every(r => r.status === 'fulfilled')
    const failCount = allResults.filter(r => r.status === 'rejected').length

    const status: 'ok' | 'partial' | 'error' = allOk ? 'ok' : failCount === allResults.length ? 'error' : 'partial'
    await timer.end(status, {
      error: !allOk ? `${failCount}/${allResults.length} tasks failed` : undefined,
      summary: { allOk, failCount, totalTasks: allResults.length },
    })

    return NextResponse.json({ ok: allOk, ...summary }, { status: allOk ? 200 : 207 })
  } catch (err) {
    console.error('info-bot cron error:', err)
    await timer.end('error', { error: String(err) }).catch(() => {})
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

function fmt(r: PromiseSettledResult<unknown>) {
  if (r.status === 'fulfilled') return { ok: true, data: r.value }
  return { ok: false, error: r.reason?.message ?? String(r.reason) }
}
