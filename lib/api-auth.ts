import { NextResponse } from 'next/server'
import { createSupabaseServer } from './supabase-server'

/**
 * API Route에서 현재 로그인한 유저 정보 추출.
 */
export async function getSessionFromRequest() {
  const supabase = await createSupabaseServer()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return { id: user.id, email: user.email }
}

/**
 * 현재 유저의 tier 조회.
 */
export async function getUserTier(): Promise<'FREE' | 'SIGNAL' | 'PRO' | 'VIP'> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'FREE'

  const { data } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  return (data?.tier as 'FREE' | 'SIGNAL' | 'PRO' | 'VIP') ?? 'FREE'
}

export function unauthorized(message = '로그인이 필요합니다') {
  return NextResponse.json({ error: message }, { status: 401 })
}
