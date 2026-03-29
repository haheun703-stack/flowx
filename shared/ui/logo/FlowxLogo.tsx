'use client'

import { useId } from 'react'

interface Props {
  variant?: 'small' | 'default' | 'large' | 'hero'
  showTagline?: boolean
  className?: string
}

const SIZES = {
  small:   { icon: 32,  fontSize: 18, tagSize: 7,  gap: 8  },
  default: { icon: 40,  fontSize: 24, tagSize: 8,  gap: 10 },
  large:   { icon: 56,  fontSize: 32, tagSize: 10, gap: 14 },
  hero:    { icon: 160, fontSize: 96, tagSize: 28, gap: 28 },
}

export function FlowxLogo({
  variant = 'default',
  showTagline = false,
  className,
}: Props) {
  const s = SIZES[variant]

  return (
    <div
      className={`flex items-center ${className ?? ''}`}
      style={{ gap: s.gap }}
    >
      {/* 아이콘 */}
      <FlowxIconInline size={s.icon} />

      {/* 텍스트 영역 */}
      <div className="flex flex-col justify-center">
        <div
          className="font-black tracking-wider leading-none flex items-baseline"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: s.fontSize,
          }}
        >
          <span className="text-[var(--text-primary)]">FLOW</span>
          <span style={{ color: '#00ff88' }}>X</span>
        </div>
        {showTagline && (
          <div
            className="font-mono tracking-widest uppercase mt-0.5"
            style={{ fontSize: s.tagSize, color: '#4a5568' }}
          >
            수급 레이더 시스템
          </div>
        )}
      </div>
    </div>
  )
}

function FlowxIconInline({ size }: { size: number }) {
  const id = useId()
  const rgId = `rg-${id}`
  const lgId = `lg-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={rgId} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00ff88" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0"/>
        </radialGradient>
        <filter id={lgId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#${rgId})`}/>
      <circle cx="24" cy="24" r="21" stroke="#00ff88" strokeWidth="0.6" opacity="0.25"/>
      <circle cx="24" cy="24" r="14" stroke="#00ff88" strokeWidth="0.6" opacity="0.18"/>
      <circle cx="24" cy="24" r="7"  stroke="#00ff88" strokeWidth="0.6" opacity="0.12"/>
      <line x1="24" y1="3"  x2="24" y2="45" stroke="#00ff88" strokeWidth="0.5" opacity="0.2"/>
      <line x1="3"  y1="24" x2="45" y2="24" stroke="#00ff88" strokeWidth="0.5" opacity="0.2"/>
      <g filter={`url(#${lgId})`}>
        <line x1="11" y1="11" x2="37" y2="37" stroke="#00ff88" strokeWidth="3" strokeLinecap="round"/>
        <line x1="37" y1="11" x2="11" y2="37" stroke="#00ff88" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="2.5" fill="#00ff88"/>
      </g>
      <line x1="24" y1="24" x2="39" y2="9" stroke="#00ff88" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      <circle cx="39" cy="9" r="1.8" fill="#00ff88" opacity="0.9"/>
    </svg>
  )
}
