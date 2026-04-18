'use client'

import { useState } from 'react'
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
    match: (p: string) => p === '/market' || p.startsWith('/market/us') || p.startsWith('/macro') || p.startsWith('/global-economy'),
    sub: [
      { label: '한국 시장', href: '/market' },
      { label: '미국 시장', href: '/market/us' },
      { label: '매크로 지표', href: '/macro' },
      { label: '한국 거시경제', href: '/global-economy' },
    ],
  },
  {
    label: '섹터',
    href: '/sectors',
    match: (p: string) => p.startsWith('/sectors') || p.startsWith('/market/treemap'),
    sub: [
      { label: '트리맵', href: '/market/treemap' },
      { label: '섹터맵', href: '/sectors' },
      { label: '글로벌 대장주', href: '/sectors/leaders' },
    ],
  },
  {
    label: '인텔리전스',
    href: '/information',
    match: (p: string) => p.startsWith('/information') || p.startsWith('/scenario') || p.startsWith('/mega-theme'),
    sub: [
      { label: '인포메이션', href: '/information' },
      { label: '시나리오', href: '/scenario' },
      { label: '메가테마', href: '/mega-theme' },
    ],
  },
  {
    label: '시스템',
    href: '/quant',
    match: (p: string) => p.startsWith('/quant') || p.startsWith('/swing') || p.startsWith('/discovery') || p.startsWith('/nationality-xray'),
    sub: [
      { label: '종목 발굴', href: '/discovery' },
      { label: '국적별 수급 X-ray', href: '/nationality-xray' },
      { label: '한국 퀀트', href: '/quant' },
      { label: '한국 스윙', href: '/swing' },
    ],
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="sticky top-0 z-40">
      <TickerBanner />
      <nav
        aria-label="메인 내비게이션"
        className="flex items-center h-14 px-4 bg-[var(--bg-base,#FAFAF8)] border-b border-[#E8E6E0]"
      >
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 mr-6 shrink-0" aria-label="FLOWX 홈">
          <span className="text-[20px] font-extrabold leading-none">
            <span className="text-[#1A1A2E]">FLOW</span>
            <span className="text-[#00FF88]">X</span>
          </span>
          <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#00CC6A]">BETA</span>
        </Link>

        {/* 데스크톱: 5개 탭 (md 이상에서만 표시) */}
        <div className="hidden md:flex items-center h-full">
          {NAV_TABS.map((tab) => {
            const active = tab.match(pathname)
            return (
              <div key={tab.label} className="relative h-full flex items-center group">
                <Link
                  href={tab.href}
                  className={`text-[15px] h-full flex items-center px-4 transition-colors ${
                    active
                      ? 'text-[#1A1A2E] font-bold border-b-2 border-[#00FF88]'
                      : 'text-[#6B7280] font-semibold hover:text-[#1A1A2E]'
                  }`}
                >
                  {tab.label}
                </Link>
                {tab.sub && (
                  <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                    <div className="bg-white border border-[#E8E6E0] rounded-lg shadow-lg py-1.5 min-w-[160px]">
                      {tab.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className={`block px-4 py-2 text-[14px] hover:bg-[#F0EDE8] transition-colors ${
                            pathname === s.href || pathname.startsWith(s.href + '/')
                              ? 'text-[#1A1A2E] font-bold'
                              : 'text-[#6B7280] font-semibold'
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
          <div className="hidden md:block">
            <TickerSearch />
          </div>
          <NavbarAuth />
        </div>

        {/* 모바일: 햄버거 버튼 (md 미만에서만 표시) */}
        <button
          className="md:hidden ml-2 p-2 text-[#1A1A2E]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
            {menuOpen ? (
              <path d="M5 5l12 12M5 17L17 5" />
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* 모바일: 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E6E0] shadow-lg z-50 relative max-h-[calc(100dvh-3.5rem)] overflow-y-auto pb-20">
          {NAV_TABS.map((tab) => {
            const active = tab.match(pathname)
            return (
              <div key={tab.label}>
                <Link
                  href={tab.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-5 py-3.5 text-[15px] border-b border-[#F0EDE8] ${
                    active
                      ? 'text-[#1A1A2E] font-bold bg-[#F5F4F0]'
                      : 'text-[#6B7280] font-semibold'
                  }`}
                >
                  {tab.label}
                </Link>
                {tab.sub && (
                  <div className="bg-[#FAFAF8]">
                    {tab.sub.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        onClick={() => setMenuOpen(false)}
                        className={`block pl-10 pr-5 py-2.5 text-[14px] border-b border-[#F0EDE8] ${
                          pathname === s.href || pathname.startsWith(s.href + '/')
                            ? 'text-[#1A1A2E] font-bold'
                            : 'text-[#9CA3AF] font-medium'
                        }`}
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {/* 모바일 검색 */}
          <div className="px-5 py-3">
            <TickerSearch />
          </div>
        </div>
      )}
    </div>
  )
}
