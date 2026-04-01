'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseBrowser()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다'
          : authError.message
      )
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div
      className="min-h-screen bg-[var(--landing-bg)] flex items-center justify-center px-4"
      style={{ fontFamily: 'var(--landing-font)' }}
    >
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold">
            <span className="text-[var(--landing-text)]">FLOW</span>
            <span className="text-[var(--flowx-green)]">X</span>
          </Link>
          <h1 className="text-xl font-bold text-[var(--landing-text)] mt-6 mb-2">로그인</h1>
          <p className="text-sm text-[var(--landing-text-dim)]">계정에 로그인하세요</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--landing-text-sub)] block mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-[var(--landing-border)] rounded-lg text-[var(--landing-text)] text-sm
                         focus:outline-none focus:border-[var(--landing-accent)]/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--landing-text-sub)] block mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-[var(--landing-border)] rounded-lg text-[var(--landing-text)] text-sm
                         focus:outline-none focus:border-[var(--landing-accent)]/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-xs text-[#dc2626] bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--landing-accent)] text-white font-semibold text-sm rounded-lg
                       hover:bg-[var(--landing-accent-hover)] transition-all disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--landing-text-dim)] mt-6">
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="text-[var(--landing-accent)] hover:underline">
            무료로 시작하기
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--landing-bg)]" />}>
      <LoginForm />
    </Suspense>
  )
}
