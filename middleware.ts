import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = [
  '/', '/pricing', '/auth', '/terms', '/privacy', '/policies',
  '/dashboard', '/market', '/sectors', '/information',
  '/scenario', '/scenarios', '/macro', '/quant', '/swing', '/chart',
  '/smart-money', '/etf-signals', '/relay', '/stock',
  '/global-economy',
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

/* ── 인메모리 Rate Limiter (Edge Runtime 호환) ── */
const RL_MAX_ENTRIES = 10_000
const rlStore = new Map<string, { count: number; resetAt: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): number | null {
  const now = Date.now()
  const entry = rlStore.get(ip)
  if (!entry || entry.resetAt < now) {
    // 만료된 엔트리 정리 (10,000개 초과 시)
    if (rlStore.size > RL_MAX_ENTRIES) {
      for (const [k, v] of rlStore) {
        if (v.resetAt < now) rlStore.delete(k)
      }
    }
    rlStore.set(ip, { count: 1, resetAt: now + windowMs })
    return null
  }
  entry.count++
  if (entry.count > limit) {
    return Math.ceil((entry.resetAt - now) / 1000)
  }
  return null
}

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API Rate Limiting
  if (pathname.startsWith('/api/')) {
    const ip = getIP(request)

    // 로그인/회원가입: 분당 10회
    if (pathname.startsWith('/api/auth/')) {
      const blocked = rateLimit(`auth:${ip}`, 10, 60_000)
      if (blocked) {
        return NextResponse.json(
          { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429, headers: { 'Retry-After': String(blocked) } },
        )
      }
    }

    // 결제 API: 분당 5회
    if (pathname.startsWith('/api/payments/') && !pathname.includes('webhook')) {
      const blocked = rateLimit(`pay:${ip}`, 5, 60_000)
      if (blocked) {
        return NextResponse.json(
          { error: '결제 요청 제한 초과' },
          { status: 429, headers: { 'Retry-After': String(blocked) } },
        )
      }
    }

    // 일반 API: 분당 60회
    const blocked = rateLimit(`api:${ip}`, 60, 60_000)
    if (blocked) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(blocked) } },
      )
    }

    return NextResponse.next()
  }

  // 공개 경로 허용
  if (isPublic(pathname)) return NextResponse.next()

  // Supabase 세션 검증 + 쿠키 갱신
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // getUser()는 JWT를 서버에서 검증 (getSession보다 안전)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|logo\\.svg|robots\\.txt|sitemap\\.xml).*)',
  ],
}
