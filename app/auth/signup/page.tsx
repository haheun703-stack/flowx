'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

const INPUT_CLASS =
  'w-full px-4 py-3 bg-white border border-[var(--landing-border)] rounded-lg text-[var(--landing-text)] text-sm focus:outline-none focus:border-[var(--landing-accent)]/50 transition-colors'

function formatPhone(value: string): string {
  const nums = value.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 3) return nums
  if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`
  return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`
}

function ValidationIcon({ valid }: { valid: boolean | null }) {
  if (valid === null) return null
  return (
    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${valid ? 'text-[var(--landing-accent)]' : 'text-[#dc2626]'}`}>
      {valid ? '✓' : '✕'}
    </span>
  )
}

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeInvestment, setAgreeInvestment] = useState(false)
  const [agreeAge, setAgreeAge] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 유효성 검사
  const nameValid = name.length >= 2 ? true : name.length > 0 ? false : null
  const emailValid = email.includes('@') && email.includes('.') ? true : email.length > 0 ? false : null
  const phoneValid = phone.replace(/\D/g, '').length >= 10 ? true : phone.length > 0 ? false : null
  const passwordValid = password.length >= 8 ? true : password.length > 0 ? false : null
  const confirmValid = confirmPassword.length > 0 ? (password === confirmPassword ? true : false) : null

  const allRequired = agreeTerms && agreePrivacy && agreeInvestment && agreeAge
  const allChecked = allRequired && agreeMarketing

  const canSubmit =
    nameValid === true &&
    emailValid === true &&
    passwordValid === true &&
    confirmValid === true &&
    allRequired &&
    !loading

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!canSubmit) return

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          phone: phone.replace(/\D/g, '') || null,
          marketingAgreed: agreeMarketing,
          investmentAgreed: agreeInvestment,
          ageVerified: agreeAge,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '회원가입에 실패했습니다')
        setLoading(false)
        return
      }

      // 가입 성공 → 자동 로그인
      const supabase = getSupabaseBrowser()
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        setSuccess(true)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen bg-[var(--landing-bg)] flex items-center justify-center px-4"
        style={{ fontFamily: 'var(--landing-font)' }}
      >
        <div className="max-w-sm w-full text-center">
          <Link href="/" className="inline-block text-2xl font-bold">
            <span className="text-[var(--landing-text)]">FLOW</span>
            <span className="text-[var(--landing-accent)]">X</span>
          </Link>
          <h1 className="text-xl font-bold text-[var(--landing-text)] mt-6 mb-4">회원가입 완료!</h1>
          <p className="text-sm text-[var(--landing-text-sub)] mb-6">
            <span className="text-[var(--landing-accent)] font-bold">{name}</span>님, 환영합니다.
            <br />로그인하여 서비스를 이용해주세요.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-[var(--landing-accent)] text-white font-semibold text-sm rounded-lg hover:bg-[var(--landing-accent-hover)] transition-all"
          >
            로그인하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[var(--landing-bg)] flex items-center justify-center px-4 py-12"
      style={{ fontFamily: 'var(--landing-font)' }}
    >
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold">
            <span className="text-[var(--landing-text)]">FLOW</span>
            <span className="text-[var(--landing-accent)]">X</span>
          </Link>
          <h1 className="text-xl font-bold text-[var(--landing-text)] mt-6 mb-2">회원가입</h1>
          <p className="text-sm text-[var(--landing-text-dim)]">무료로 시작하세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="text-xs text-[var(--landing-text-sub)] block mb-1">이름 <span className="text-[#dc2626]">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={INPUT_CLASS}
                placeholder="홍길동"
              />
              <ValidationIcon valid={nameValid} />
            </div>
          </div>

          {/* 이메일 */}
          <div>
            <label className="text-xs text-[var(--landing-text-sub)] block mb-1">이메일 <span className="text-[#dc2626]">*</span></label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={INPUT_CLASS}
                placeholder="you@example.com"
              />
              <ValidationIcon valid={emailValid} />
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label className="text-xs text-[var(--landing-text-sub)] block mb-1">전화번호</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className={INPUT_CLASS}
                placeholder="010-0000-0000"
              />
              <ValidationIcon valid={phoneValid} />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="text-xs text-[var(--landing-text-sub)] block mb-1">비밀번호 <span className="text-[#dc2626]">*</span></label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={INPUT_CLASS}
                placeholder="8자 이상"
              />
              <ValidationIcon valid={passwordValid} />
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="text-xs text-[var(--landing-text-sub)] block mb-1">비밀번호 확인 <span className="text-[#dc2626]">*</span></label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={INPUT_CLASS}
                placeholder="비밀번호를 다시 입력하세요"
              />
              <ValidationIcon valid={confirmValid} />
            </div>
            {confirmValid === false && (
              <p className="text-xs text-[#dc2626] mt-1">비밀번호가 일치하지 않습니다</p>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="space-y-3 pt-2 border-t border-[var(--landing-border)]">
            {/* 전체 동의 */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => {
                  const v = e.target.checked
                  setAgreeTerms(v)
                  setAgreePrivacy(v)
                  setAgreeInvestment(v)
                  setAgreeAge(v)
                  setAgreeMarketing(v)
                }}
                className="w-4 h-4 rounded border-[var(--landing-border)] bg-white accent-[var(--landing-accent)]"
              />
              <span className="text-sm text-[var(--landing-text)] font-bold">전체 동의</span>
            </label>

            <div className="ml-6 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[var(--landing-border)] bg-white accent-[var(--landing-accent)]"
                />
                <span className="text-xs text-[var(--landing-text-sub)]">
                  <span className="text-[#dc2626]">[필수]</span>{' '}
                  <Link href="/terms" className="underline hover:text-[var(--landing-text)]" target="_blank">
                    이용약관
                  </Link>
                  에 동의합니다
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[var(--landing-border)] bg-white accent-[var(--landing-accent)]"
                />
                <span className="text-xs text-[var(--landing-text-sub)]">
                  <span className="text-[#dc2626]">[필수]</span>{' '}
                  <Link href="/privacy" className="underline hover:text-[var(--landing-text)]" target="_blank">
                    개인정보 처리방침
                  </Link>
                  에 동의합니다
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeInvestment}
                  onChange={(e) => setAgreeInvestment(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[var(--landing-border)] bg-white accent-[var(--landing-accent)]"
                />
                <span className="text-xs text-[var(--landing-text-sub)]">
                  <span className="text-[#dc2626]">[필수]</span>{' '}
                  <Link href="/policies/investment" className="underline hover:text-[var(--landing-text)]" target="_blank">
                    투자 유의사항
                  </Link>
                  에 동의합니다
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeAge}
                  onChange={(e) => setAgreeAge(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[var(--landing-border)] bg-white accent-[var(--landing-accent)]"
                />
                <span className="text-xs text-[var(--landing-text-sub)]">
                  <span className="text-[#dc2626]">[필수]</span> 만 19세 이상임을 확인합니다
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[var(--landing-border)] bg-white accent-[var(--landing-accent)]"
                />
                <span className="text-xs text-[var(--landing-text-sub)]">
                  [선택] 마케팅 수신에 동의합니다
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-xs text-[#dc2626] bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-[var(--landing-accent)] text-white font-semibold text-sm rounded-lg
                       hover:bg-[var(--landing-accent-hover)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? '가입 중...' : '무료로 시작하기'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--landing-text-dim)] mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-[var(--landing-accent)] hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
