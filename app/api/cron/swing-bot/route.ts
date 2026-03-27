// 단타봇 Cron Route
// 08:55 KST → 장전 스캔 (preMarketScan)
// 15:40 KST → 장후 리뷰 (postMarketReview)

import { NextResponse } from 'next/server'
import { verifyCronAuth } from '@/shared/lib/cron-auth'
import { botTimer, checkEnvVars } from '@/shared/lib/botLogger'
import { preMarketScan } from '@/features/bots/swing/preMarketScan'
import { postMarketReview } from '@/features/bots/swing/postMarketReview'

export const dynamic = 'force-dynamic'
export const maxDuration = 55

export async function GET(req: Request) {
  const timer = botTimer('swing-bot')

  if (!verifyCronAuth(req)) {
    await timer.end('error', { error: 'Unauthorized — CRON_SECRET 불일치 또는 미설정' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const missing = checkEnvVars()
  if (missing.length > 0) {
    const msg = `환경변수 누락: ${missing.join(', ')}`
    await timer.end('error', { error: msg })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }

  // KST 시간 기준으로 장전/장후 판별
  const kstHour = new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCHours()

  try {
    if (kstHour < 12) {
      // 오전: 장전 스캔
      const result = await preMarketScan()
      const res = {
        ok: true,
        mode: 'PRE_MARKET',
        regime: result.regime,
        candidates: result.candidates.length,
        top: result.candidates.slice(0, 5).map(c => `${c.name}(${c.score}점, ${c.position})`),
        updated_at: new Date().toISOString(),
      }
      await timer.end('ok', { summary: { mode: 'PRE_MARKET', candidates: result.candidates.length } })
      return NextResponse.json(res)
    } else {
      // 오후: 장후 리뷰
      const result = await postMarketReview()
      const alerts = result.results.filter(r => r.alert)
      const res = {
        ok: true,
        mode: 'POST_MARKET',
        reviewed: result.results.length,
        alerts: alerts.map(a => `${a.name}: ${a.alert}`),
        pnl_summary: result.results.map(r => `${r.name}: ${r.pnl > 0 ? '+' : ''}${r.pnl}%`),
        updated_at: new Date().toISOString(),
      }
      await timer.end('ok', { summary: { mode: 'POST_MARKET', reviewed: result.results.length, alerts: alerts.length } })
      return NextResponse.json(res)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await timer.end('error', { error: msg })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
