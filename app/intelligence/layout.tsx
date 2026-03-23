'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'

const TABS = [
  { href: '/intelligence', label: '시그널', badge: 'SIGNAL', badgeColor: '#00ff88' },
  { href: '/intelligence/dart', label: 'DART 공시', dot: '#00ff88' },
  { href: '/intelligence/edgar', label: 'EDGAR 공시', dot: '#a855f7' },
] as const

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className={PAGE}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">Intelligence</h1>
          <span className="text-sm text-gray-500">3초 안에 오늘의 시장 판단</span>
        </div>
        <div className="flex items-center gap-1">
          {TABS.map(tab => {
            const active = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#1a2535] text-white'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#131722]'
                }`}
              >
                {'dot' in tab && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tab.dot }} />
                )}
                {tab.label}
                {'badge' in tab && (
                  <span className="text-[8px] px-1 py-px rounded border border-[#00ff88]/40 text-[#00ff88] font-bold leading-tight">
                    {tab.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
      {children}
    </div>
  )
}
