'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'

const TABS = [
  { href: '/information', label: '시그널', badge: 'SIGNAL', badgeColor: 'var(--green)' },
  { href: '/information/dart', label: 'DART 공시', dot: 'var(--green)' },
  { href: '/information/edgar', label: 'EDGAR 공시', dot: 'var(--purple)' },
] as const

export function InformationTabs({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className={PAGE}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-wider uppercase text-[var(--text-primary)]">Information</h1>
            <div className="flex items-center gap-2">
              {TABS.map(tab => {
                const active = pathname === tab.href
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                      active
                        ? 'bg-white text-[var(--text-primary)] border border-[var(--border)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    {'dot' in tab && (
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tab.dot }} />
                    )}
                    {tab.label}
                    {'badge' in tab && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--green)]/40 text-[var(--green)] font-bold leading-tight">
                        {tab.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
          <span className="text-sm text-[var(--text-muted)] hidden sm:block">3초 안에 오늘의 시장 판단</span>
        </div>
      </div>
      {children}
    </div>
  )
}
