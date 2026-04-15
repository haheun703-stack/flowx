import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, unauthorized } from '@/lib/api-auth'
import { issueBillingKey, isTossConfigured } from '@/lib/toss'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/billing-key
 * 카드 등록 위젯에서 받은 authKey → billingKey 교환
 * Body: { authKey: string }
 */
export async function POST(request: NextRequest) {
  if (!isTossConfigured()) {
    return NextResponse.json({ error: '결제 시스템 준비 중입니다' }, { status: 503 })
  }

  const session = await getSessionFromRequest()
  if (!session) return unauthorized()

  const body = await request.json()
  const { authKey } = body

  if (!authKey) {
    return NextResponse.json({ error: 'authKey가 필요합니다' }, { status: 400 })
  }

  const customerKey = `flowx_${session.id}`

  try {
    const result = await issueBillingKey(authKey, customerKey)
    return NextResponse.json({
      billingKey: result.billingKey,
      cardCompany: result.cardCompany,
      cardNumber: result.cardNumber,
    })
  } catch (err) {
    console.error('[billing-key] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: '빌링키 발급 실패' }, { status: 500 })
  }
}
