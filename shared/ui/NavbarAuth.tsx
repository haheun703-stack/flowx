'use client'

import Link from 'next/link'
import { useAuth } from '@/shared/lib/AuthProvider'
import { useUserProfile } from '@/shared/lib/useUserProfile'

export function NavbarAuth() {
  const { user, isLoading, signOut } = useAuth()
  const { data: profile } = useUserProfile()

  if (isLoading) return null

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="px-3 py-1 text-[9px] font-bold rounded border border-[#00FF88] text-[#00CC6A]
                   hover:bg-[#E8F5E9] transition-colors"
      >
        로그인
      </Link>
    )
  }

  const tier = profile?.tier ?? 'FREE'
  const initial = (profile?.name ?? user.email ?? '?')[0].toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#00FF88] text-[#00CC6A]">
        {tier}
      </span>
      <button
        onClick={() => signOut()}
        className="w-[26px] h-[26px] rounded-full bg-[#E2E5EA] flex items-center justify-center
                   text-[10px] font-bold text-[#1A1A2E] hover:bg-[#D1D5DB] transition-colors"
        title="로그아웃"
      >
        {initial}
      </button>
    </div>
  )
}
