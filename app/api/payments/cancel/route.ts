import { NextResponse } from 'next/server'
import { getSessionFromRequest, unauthorized } from '@/lib/api-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/cancel
 * 구독 해지 (현재 기간 끝까지 유지, 갱신 안 함)
 */
export async function POST() {
  const session = await getSessionFromRequest()
  if (!session) return unauthorized()

  try {
    const supabase = getSupabaseAdmin()

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, period_end')
      .eq('user_id', session.id)
      .eq('status', 'ACTIVE')
      .single()

    if (!sub) {
      return NextResponse.json({ error: '활성 구독이 없습니다' }, { status: 404 })
    }

    // 구독 상태만 CANCELLED로 변경 (period_end까지 서비스 유지)
    await supabase
      .from('subscriptions')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', sub.id)

    return NextResponse.json({
      success: true,
      message: `구독이 해지되었습니다. ${new Date(sub.period_end).toLocaleDateString('ko-KR')}까지 이용 가능합니다.`,
      periodEnd: sub.period_end,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '구독 해지 처리 실패'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
