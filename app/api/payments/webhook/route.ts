import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createHmac } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/webhook
 * Toss Payments 웹훅 수신 (결제 실패/취소 등)
 *
 * Toss 웹훅 설정:
 *   URL: https://flowx.kr/api/payments/webhook
 *   이벤트: BILLING_STATUS_CHANGED, PAYMENT_STATUS_CHANGED
 */
export async function POST(request: NextRequest) {
  try {
  // Toss 웹훅 서명 검증
  const secret = process.env.TOSS_WEBHOOK_SECRET
  let body: { eventType: string; data: Record<string, unknown> }

  if (!secret) {
    console.error('TOSS_WEBHOOK_SECRET not configured — rejecting webhook')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('toss-signature') ?? ''
  const expected = createHmac('sha256', secret).update(rawBody).digest('base64')
  if (signature !== expected) {
    console.error('webhook signature mismatch')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }
  body = JSON.parse(rawBody)

  const { eventType, data } = body
  const supabase = getSupabaseAdmin()

  switch (eventType) {
    case 'BILLING_STATUS_CHANGED': {
      const customerKey = typeof data.customerKey === 'string' ? data.customerKey : ''
      const status = String(data.status ?? '')
      if (status === 'EXPIRED' || status === 'STOPPED') {
        const userId = customerKey.replace('flowx_', '')
        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'FAILED', failure_reason: '카드 빌링키 만료' })
            .eq('user_id', userId)
            .eq('status', 'ACTIVE')

          await supabase
            .from('profiles')
            .update({ tier: 'FREE', subscription_end: null })
            .eq('id', userId)
        }
      }
      break
    }

    case 'PAYMENT_STATUS_CHANGED': {
      const orderId = typeof data.orderId === 'string' ? data.orderId : ''
      const paymentStatus = String(data.status ?? '')
      const failReason = typeof data.failReason === 'string' ? data.failReason : ''
      if (paymentStatus === 'ABORTED' || paymentStatus === 'EXPIRED') {
        const parts = orderId.split('_')
        const userId = parts?.[2]
        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'FAILED', failure_reason: failReason || '결제 실패' })
            .eq('user_id', userId)
            .eq('status', 'ACTIVE')

          await supabase
            .from('profiles')
            .update({ tier: 'FREE', subscription_end: null })
            .eq('id', userId)
        }
      }
      break
    }
  }

  return NextResponse.json({ success: true })
  } catch (err) {
    console.error('webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
