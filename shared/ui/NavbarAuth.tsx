'use client'

import Link from 'next/link'
import { useAuth } from '@/shared/lib/AuthProvider'
import { useUserProfile } from '@/shared/lib/useUserProfile'

const TIER_COLORS: Record<string, string> = {
  FREE: '#64748b',
  SIGNAL: '#00ff88',
  PRO: '#f59e0b',
  VIP: '#a855f7',
}

export function NavbarAuth() {
  const { user, isLoading, signOut } = useAuth()
  const { data: profile } = useUserProfile()

  if (isLoading) return null

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="px-3 py-1.5 text-xs font-bold rounded border border-[#00ff88]/40 text-[#00ff88]
                   hover:bg-[#00ff88]/10 transition-colors font-mono"
      >
        로그인
      </Link>
    )
  }

  const tier = profile?.tier ?? 'FREE'
  const initial = (profile?.name ?? user.email ?? '?')[0].toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
        style={{
          color: TIER_COLORS[tier],
          borderColor: `${TIER_COLORS[tier]}40`,
          backgroundColor: `${TIER_COLORS[tier]}10`,
        }}
      >
        {tier}
      </span>
      <button
        onClick={() => signOut()}
        className="w-7 h-7 rounded-full bg-[#1a2535] flex items-center justify-center
                   text-xs font-bold text-[#e2e8f0] hover:bg-[#253548] transition-colors"
        title="로그아웃"
      >
        {initial}
      </button>
    </div>
  )
}
