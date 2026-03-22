import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 공개 경로 — 인증 불필요
const PUBLIC_PATHS = [
  '/',
  '/pricing',
  '/auth',
  '/api/cron',
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API 라우트는 개별적으로 인증 처리 (middleware에서 차단 안 함)
  if (pathname.startsWith('/api/')) return NextResponse.next()

  // 공개 경로 허용
  if (isPublic(pathname)) return NextResponse.next()

  // Supabase 세션 쿠키 존재 확인
  // @supabase/ssr 설치 후 Step 2에서 proper JWT 검증으로 업그레이드
  const hasSession = request.cookies.getAll().some(
    c => c.name.startsWith('sb-') && c.name.includes('auth-token')
  )

  if (!hasSession) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|logo\\.svg|robots\\.txt|sitemap\\.xml).*)',
  ],
}
