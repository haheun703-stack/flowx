/**
 * Toss Payments 정기결제(빌링) 헬퍼
 *
 * 환경변수:
 *   TOSS_SECRET_KEY  — Toss 시크릿 키 (test_sk_... 또는 live_sk_...)
 *
 * 사업자등록 + Toss 가맹점 심사 완료 후 키 발급 → Vercel 환경변수에 추가
 */

const TOSS_API = 'https://api.tosspayments.com/v1/billing'

export const TIER_PRICES: Record<string, { amount: number; label: string }> = {
  SIGNAL: { amount: 9_900, label: 'SIGNAL 플랜' },
  PRO: { amount: 25_000, label: 'PRO 플랜' },
  VIP: { amount: 50_000, label: 'VIP 플랜' },
}

function getSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY
  if (!key) throw new Error('TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다')
  return key
}

function authHeader() {
  const encoded = Buffer.from(`${getSecretKey()}:`).toString('base64')
  return { Authorization: `Basic ${encoded}`, 'Content-Type': 'application/json' }
}

/**
 * authKey → billingKey 교환
 * 카드 등록 위젯에서 받은 authKey로 빌링키 발급
 */
export async function issueBillingKey(authKey: string, customerKey: string) {
  const res = await fetch(`${TOSS_API}/authorizations/issue`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ authKey, customerKey }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || '빌링키 발급 실패')
  return data as { billingKey: string; customerKey: string; cardCompany: string; cardNumber: string }
}

/**
 * 빌링키로 정기결제 실행
 */
export async function requestBilling(params: {
  billingKey: string
  customerKey: string
  amount: number
  orderName: string
  orderId: string
}) {
  const res = await fetch(`${TOSS_API}/${params.billingKey}`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({
      customerKey: params.customerKey,
      amount: params.amount,
      orderId: params.orderId,
      orderName: params.orderName,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || '결제 실패')
  return data as { paymentKey: string; orderId: string; status: string }
}

/**
 * Toss 키 설정 여부 확인
 */
export function isTossConfigured(): boolean {
  return !!process.env.TOSS_SECRET_KEY
}
