'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'

const TABS = [
  { href: '/information', label: '시그널', badge: 'SIGNAL', badgeColor: '#00ff88' },
  { href: '/information/dart', label: 'DART 공시', dot: '#00ff88' },
  { href: '/information/edgar', label: 'EDGAR 공시', dot: '#a855f7' },
] as const

export default function InformationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className={PAGE}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-wider uppercase text-white">Information</h1>
            {/* 서브탭 */}
            <div className="flex items-center gap-2">
              {TABS.map(tab => {
                const active = pathname === tab.href
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                      active
                        ? 'bg-[#1a2535] text-white border border-gray-700'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#131722] border border-transparent'
                    }`}
                  >
                    {'dot' in tab && (
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tab.dot }} />
                    )}
                    {tab.label}
                    {'badge' in tab && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#00ff88]/40 text-[#00ff88] font-bold leading-tight">
                        {tab.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
          <span className="text-sm text-gray-500 hidden sm:block">3초 안에 오늘의 시장 판단</span>
        </div>
      </div>
      {children}
    </div>
  )
}
