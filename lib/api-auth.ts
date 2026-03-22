import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API Route에서 Supabase 세션 추출.
 * Step 2에서 @supabase/ssr 기반으로 업그레이드 예정.
 */
export async function getSessionFromRequest(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      const cookieHeader = req.headers.get('cookie') ?? ''
      const match = cookieHeader.match(/sb-[^-]+-auth-token[^=]*=([^;]+)/)
      if (match) {
        try {
          const decoded = decodeURIComponent(match[1])
          const parsed = JSON.parse(decoded)
          token = parsed?.access_token ?? parsed?.[0]?.access_token
        } catch { /* ignore */ }
      }
    }

    if (!token) return null

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null

    return { id: user.id, email: user.email }
  } catch {
    return null
  }
}

export function unauthorized(message = '로그인이 필요합니다') {
  return NextResponse.json({ error: message }, { status: 401 })
}
