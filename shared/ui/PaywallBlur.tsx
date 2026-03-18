'use client'

import { type ReactNode } from 'react'

export type Tier = 'FREE' | 'SIGNAL' | 'PRO' | 'VIP'

const TIER_ORDER: Record<Tier, number> = { FREE: 0, SIGNAL: 1, PRO: 2, VIP: 3 }

const TIER_CTA: Record<Tier, { label: string; color: string }> = {
  FREE:   { label: '', color: '' },
  SIGNAL: { label: 'SIGNAL 구독으로 잠금 해제', color: '#00ff88' },
  PRO:    { label: 'PRO 구독으로 잠금 해제', color: '#f59e0b' },
  VIP:    { label: 'VIP 구독으로 잠금 해제', color: '#a78bfa' },
}

interface PaywallBlurProps {
  requiredTier: Tier
  userTier?: Tier
  children: ReactNode
  className?: string
}

export function PaywallBlur({ requiredTier, userTier = 'FREE', children, className = '' }: PaywallBlurProps) {
  const hasAccess = TIER_ORDER[userTier] >= TIER_ORDER[requiredTier]

  if (hasAccess) return <>{children}</>

  const cta = TIER_CTA[requiredTier]

  return (
    <div className={`relative ${className}`}>
      {/* 블러 처리된 콘텐츠 */}
      <div className="select-none pointer-events-none" style={{ filter: 'blur(6px)' }}>
        {children}
      </div>

      {/* 잠금 오버레이 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080b10]/60 backdrop-blur-sm">
        {/* 자물쇠 아이콘 */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="mb-2 opacity-60">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke={cta.color} strokeWidth="1.5" />
          <path d="M8 11V7a4 4 0 018 0v4" stroke={cta.color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        <span className="text-[11px] font-bold tracking-wider" style={{ color: cta.color }}>
          {cta.label}
        </span>
      </div>
    </div>
  )
}
