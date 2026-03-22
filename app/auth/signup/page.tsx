'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { FlowxLogo } from '@/shared/ui/logo'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다')
      setLoading(false)
      return
    }

    const supabase = getSupabaseBrowser()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#080b10] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <Link href="/">
            <FlowxLogo variant="small" />
          </Link>
          <h1 className="text-xl font-bold text-white mt-6 mb-4">확인 이메일 전송 완료</h1>
          <p className="text-sm text-gray-400 mb-6">
            <span className="text-[#00ff88] font-bold">{email}</span>
            <br />으로 확인 이메일을 보냈습니다.
            <br />이메일을 확인해주세요.
          </p>
          <Link href="/auth/login" className="text-[#00ff88] text-sm hover:underline">
            로그인으로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080b10] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <FlowxLogo variant="small" />
          </Link>
          <h1 className="text-xl font-bold text-white mt-6 mb-2">회원가입</h1>
          <p className="text-sm text-gray-500">무료로 시작하세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0a0f18] border border-[#1a2535] rounded-lg text-white text-sm
                         focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0a0f18] border border-[#1a2535] rounded-lg text-white text-sm
                         focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-[#0a0f18] border border-[#1a2535] rounded-lg text-white text-sm
                         focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              placeholder="6자 이상"
            />
          </div>

          {error && (
            <div className="text-xs text-[#ff3b5c] bg-[#ff3b5c]/10 border border-[#ff3b5c]/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00ff88] text-black font-bold text-sm rounded-lg
                       hover:bg-[#00ff88]/90 transition-all disabled:opacity-50 font-mono"
          >
            {loading ? '가입 중...' : '무료로 시작하기'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-[#00ff88] hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
