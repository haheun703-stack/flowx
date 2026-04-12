import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, unauthorized } from '@/lib/api-auth'
import { requestBilling, TIER_PRICES, isTossConfigured } from '@/lib/toss'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/subscribe
 * 구독 생성 + 첫 결제
 * Body: { tier: 'SIGNAL' | 'PRO' | 'VIP', billingKey: string }
 */
export async function POST(request: NextRequest) {
  if (!isTossConfigured()) {
    return NextResponse.json({ error: '결제 시스템 준비 중입니다' }, { status: 503 })
  }

  const session = await getSessionFromRequest()
  if (!session) return unauthorized()

  const body = await request.json()
  const { tier, billingKey } = body

  if (!tier || !TIER_PRICES[tier]) {
    return NextResponse.json({ error: '유효하지 않은 플랜입니다' }, { status: 400 })
  }
  if (!billingKey) {
    return NextResponse.json({ error: 'billingKey가 필요합니다' }, { status: 400 })
  }

  const plan = TIER_PRICES[tier]
  const customerKey = `flowx_${session.id}`
  const orderId = `flowx_${tier}_${session.id}_${Date.now()}`
  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  try {
    // 1. Toss 결제 요청
    const payment = await requestBilling({
      billingKey,
      customerKey,
      amount: plan.amount,
      orderName: `FlowX ${plan.label} 월간 구독`,
      orderId,
    })

    const supabase = getSupabaseAdmin()

    // 2. 기존 활성 구독 만료 처리
    await supabase
      .from('subscriptions')
      .update({ status: 'EXPIRED', updated_at: now.toISOString() })
      .eq('user_id', session.id)
      .eq('status', 'ACTIVE')

    // 3. 새 구독 레코드 생성
    await supabase.from('subscriptions').insert({
      user_id: session.id,
      tier,
      billing_key: billingKey,
      customer_key: customerKey,
      amount: plan.amount,
      status: 'ACTIVE',
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
      last_payment_at: now.toISOString(),
    })

    // 4. profiles.tier 업데이트
    await supabase
      .from('profiles')
      .update({ tier, subscription_end: periodEnd.toISOString() })
      .eq('id', session.id)

    return NextResponse.json({
      success: true,
      paymentKey: payment.paymentKey,
      tier,
      periodEnd: periodEnd.toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '결제 처리 실패'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
