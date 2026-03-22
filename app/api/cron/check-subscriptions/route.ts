import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { requestBilling, TIER_PRICES } from '@/lib/toss'

/**
 * GET /api/cron/check-subscriptions
 * 매일 자정 실행: 만료 구독 갱신 or 다운그레이드
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  // 1. 만료된 ACTIVE 구독 조회
  const { data: expired } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'ACTIVE')
    .lt('period_end', now)

  if (!expired?.length) {
    return NextResponse.json({ message: '만료된 구독 없음', processed: 0 })
  }

  let renewed = 0
  let downgraded = 0

  for (const sub of expired) {
    const plan = TIER_PRICES[sub.tier]
    if (!plan || !sub.billing_key) {
      // 빌링키 없으면 다운그레이드
      await supabase
        .from('subscriptions')
        .update({ status: 'EXPIRED' })
        .eq('id', sub.id)
      await supabase
        .from('profiles')
        .update({ tier: 'FREE', subscription_end: null })
        .eq('id', sub.user_id)
      downgraded++
      continue
    }

    try {
      // 자동 갱신 결제
      const newPeriodEnd = new Date()
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)
      const orderId = `flowx_${sub.tier}_${sub.user_id}_${Date.now()}`

      await requestBilling({
        billingKey: sub.billing_key,
        customerKey: sub.customer_key,
        amount: plan.amount,
        orderName: `FlowX ${plan.label} 월간 구독 갱신`,
        orderId,
      })

      await supabase
        .from('subscriptions')
        .update({
          period_start: now,
          period_end: newPeriodEnd.toISOString(),
          last_payment_at: now,
        })
        .eq('id', sub.id)

      await supabase
        .from('profiles')
        .update({ subscription_end: newPeriodEnd.toISOString() })
        .eq('id', sub.user_id)

      renewed++
    } catch {
      // 갱신 결제 실패 → 다운그레이드
      await supabase
        .from('subscriptions')
        .update({ status: 'FAILED', failure_reason: '자동 갱신 결제 실패' })
        .eq('id', sub.id)
      await supabase
        .from('profiles')
        .update({ tier: 'FREE', subscription_end: null })
        .eq('id', sub.user_id)
      downgraded++
    }
  }

  // 2. CANCELLED 구독 중 기간 만료된 것 → FREE 다운그레이드
  const { data: cancelledExpired } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('status', 'CANCELLED')
    .lt('period_end', now)

  if (cancelledExpired?.length) {
    for (const sub of cancelledExpired) {
      await supabase
        .from('subscriptions')
        .update({ status: 'EXPIRED' })
        .eq('id', sub.id)
      await supabase
        .from('profiles')
        .update({ tier: 'FREE', subscription_end: null })
        .eq('id', sub.user_id)
      downgraded++
    }
  }

  return NextResponse.json({
    message: '구독 체크 완료',
    total: expired.length + (cancelledExpired?.length ?? 0),
    renewed,
    downgraded,
  })
}
