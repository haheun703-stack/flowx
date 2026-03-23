// 단타봇 Cron Route
// 08:55 KST → 장전 스캔 (preMarketScan)
// 15:40 KST → 장후 리뷰 (postMarketReview)

import { NextResponse } from 'next/server'
import { verifyCronAuth } from '@/shared/lib/cron-auth'
import { preMarketScan } from '@/features/bots/swing/preMarketScan'
import { postMarketReview } from '@/features/bots/swing/postMarketReview'

export const dynamic = 'force-dynamic'
export const maxDuration = 55

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // KST 시간 기준으로 장전/장후 판별
  const kstHour = new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCHours()

  try {
    if (kstHour < 12) {
      // 오전: 장전 스캔
      const result = await preMarketScan()
      return NextResponse.json({
        ok: true,
        mode: 'PRE_MARKET',
        regime: result.regime,
        candidates: result.candidates.length,
        top: result.candidates.slice(0, 5).map(c => `${c.name}(${c.score}점, ${c.position})`),
        updated_at: new Date().toISOString(),
      })
    } else {
      // 오후: 장후 리뷰
      const result = await postMarketReview()
      const alerts = result.results.filter(r => r.alert)
      return NextResponse.json({
        ok: true,
        mode: 'POST_MARKET',
        reviewed: result.results.length,
        alerts: alerts.map(a => `${a.name}: ${a.alert}`),
        pnl_summary: result.results.map(r => `${r.name}: ${r.pnl > 0 ? '+' : ''}${r.pnl}%`),
        updated_at: new Date().toISOString(),
      })
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('swing-bot error:', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
