// 정보봇 Cron Route — 매일 18:00 KST
// Step 1: 매크로 + 수급 + DART + EDGAR + 뉴스 (병렬)
// Step 2: 시나리오 + 브리핑 (수집 데이터 기반, 순차)

import { NextResponse } from 'next/server'
import { verifyCronAuth } from '@/shared/lib/cron-auth'
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
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Step 1: 데이터 수집 (병렬)
  const collectResults = await Promise.allSettled([
    collectMacro(),
    collectSupplyDemand(),
    collectDart(),
    collectEdgar(),
    collectNews(),
  ])

  // Step 2: AI 생성 (수집 데이터 필요 → 순차)
  const aiResults = await Promise.allSettled([
    generateScenarios(),
    generateBriefing(),
  ])

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

  const allOk = [...collectResults, ...aiResults].every(r => r.status === 'fulfilled')
  return NextResponse.json({ ok: allOk, ...summary }, { status: allOk ? 200 : 207 })
}

function fmt(r: PromiseSettledResult<unknown>) {
  if (r.status === 'fulfilled') return { ok: true, data: r.value }
  return { ok: false, error: r.reason?.message ?? String(r.reason) }
}
