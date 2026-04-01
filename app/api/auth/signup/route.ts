import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/auth/signup
 * 회원가입 + profiles 폴백 INSERT
 * 트리거 실패해도 회원가입이 진행되도록 서버사이드에서 처리
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password, name, phone, marketingAgreed, investmentAgreed, ageVerified } = body

  if (!email || !password || !name) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  // 1. Supabase Auth 회원가입 (service_role로 생성하면 이메일 확인 스킵)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, investmentAgreed: !!investmentAgreed, ageVerified: !!ageVerified },
  })

  if (authError) {
    // 이미 가입된 이메일
    if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
      return NextResponse.json({ error: '이미 가입된 이메일입니다' }, { status: 409 })
    }
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: '회원가입 처리 중 오류가 발생했습니다' }, { status: 500 })
  }

  // 2. profiles 폴백 upsert (트리거 실패 대비)
  await supabaseAdmin.from('profiles').upsert({
    id: authData.user.id,
    email,
    name,
    phone: phone || null,
    tier: 'FREE',
    marketing_agreed: !!marketingAgreed,
  }, { onConflict: 'id' })

  return NextResponse.json({
    success: true,
    message: '회원가입이 완료되었습니다',
    userId: authData.user.id,
  })
}
