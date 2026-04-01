'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TickerSearch } from './TickerSearch'
import { NavbarAuth } from './NavbarAuth'
import { TickerBanner } from '@/features/market-ticker/ui/TickerBanner'

const NAV_TABS = [
  {
    label: '대시보드',
    href: '/dashboard',
    match: (p: string) => p.startsWith('/dashboard'),
  },
  {
    label: '시장',
    href: '/market',
    match: (p: string) => p === '/market' || p.startsWith('/macro'),
    sub: [
      { label: '시장 개요', href: '/market' },
      { label: '매크로 지표', href: '/macro' },
    ],
  },
  {
    label: '섹터',
    href: '/sectors',
    match: (p: string) => p.startsWith('/sectors') || p.startsWith('/market/treemap'),
    sub: [
      { label: '섹터맵', href: '/sectors' },
      { label: '트리맵', href: '/market/treemap' },
      { label: '글로벌 대장주', href: '/sectors/leaders' },
    ],
  },
  {
    label: '인텔리전스',
    href: '/information',
    match: (p: string) => p.startsWith('/information') || p.startsWith('/scenario'),
    sub: [
      { label: '인포메이션', href: '/information' },
      { label: '시나리오', href: '/scenario' },
    ],
  },
  {
    label: '시스템',
    href: '/quant',
    match: (p: string) => p.startsWith('/quant') || p.startsWith('/swing'),
    sub: [
      { label: '퀀트 시스템', href: '/quant' },
      { label: '스윙 시스템', href: '/swing' },
    ],
  },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-40">
      <TickerBanner />
      <nav
        aria-label="메인 내비게이션"
        className="flex items-center h-11 px-4 bg-[var(--bg-base,#FAFAF8)] border-b border-[#E8E6E0]"
      >
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 mr-6 shrink-0" aria-label="FLOWX 홈">
          <span className="text-[15px] font-bold leading-none">
            <span className="text-[#1A1A2E]">FLOW</span>
            <span className="text-[#00FF88]">X</span>
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#00CC6A]">BETA</span>
        </Link>

        {/* 5개 탭 */}
        <div className="flex items-center h-full">
          {NAV_TABS.map((tab) => {
            const active = tab.match(pathname)
            return (
              <div key={tab.label} className="relative h-full flex items-center group">
                <Link
                  href={tab.href}
                  className={`text-[11px] h-full flex items-center px-3 transition-colors ${
                    active
                      ? 'text-[#1A1A2E] font-semibold border-b-2 border-[#00FF88]'
                      : 'text-[#9CA3AF] hover:text-[#1A1A2E]'
                  }`}
                >
                  {tab.label}
                </Link>
                {tab.sub && (
                  <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                    <div className="bg-white border border-[#E8E6E0] rounded-lg shadow-lg py-1 min-w-[140px]">
                      {tab.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className={`block px-3 py-1.5 text-[11px] hover:bg-[#F0EDE8] transition-colors ${
                            pathname === s.href || pathname.startsWith(s.href + '/')
                              ? 'text-[#1A1A2E] font-semibold'
                              : 'text-[#6B7280]'
                          }`}
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex-1" />

        {/* 우측: 검색 + 인증 */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <TickerSearch />
          </div>
          <NavbarAuth />
        </div>
      </nav>
    </div>
  )
}
