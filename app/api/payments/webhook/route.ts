import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/payments/webhook
 * Toss Payments 웹훅 수신 (결제 실패/취소 등)
 *
 * Toss 웹훅 설정:
 *   URL: https://flowx.kr/api/payments/webhook
 *   이벤트: BILLING_STATUS_CHANGED, PAYMENT_STATUS_CHANGED
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { eventType, data } = body

  const supabase = getSupabaseAdmin()

  switch (eventType) {
    case 'BILLING_STATUS_CHANGED': {
      // 빌링키 상태 변경 (카드 만료 등)
      const { customerKey, status } = data
      if (status === 'EXPIRED' || status === 'STOPPED') {
        // 빌링키 만료 → 구독 실패 처리
        const userId = customerKey?.replace('flowx_', '')
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
      // 결제 상태 변경 (자동결제 실패 등)
      const { orderId, status: paymentStatus, failReason } = data
      if (paymentStatus === 'ABORTED' || paymentStatus === 'EXPIRED') {
        // orderId에서 user_id 추출: flowx_{tier}_{userId}_{timestamp}
        const parts = orderId?.split('_')
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
}
