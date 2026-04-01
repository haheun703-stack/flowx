'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LandingLogo } from './LandingLogo'

const NAV_LINKS = [
  { label: '주요 기능', href: '#features' },
  { label: '대시보드', href: '#showcase' },
  { label: '요금제', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[var(--landing-border)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <LandingLogo />

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--landing-text-sub)] hover:text-[var(--landing-text)] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/auth/login"
            className="text-sm text-[var(--landing-text-sub)] hover:text-[var(--landing-text)] transition-colors"
          >
            로그인
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2 bg-[var(--landing-accent)] text-[#1A1A2E] text-sm font-semibold rounded-lg hover:bg-[var(--landing-accent-hover)] transition-colors"
          >
            무료 시작
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[var(--landing-text)]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[var(--landing-border)] px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-[var(--landing-text-sub)] py-2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/auth/login" className="text-sm text-[var(--landing-text-sub)] py-2">
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 bg-[var(--landing-accent)] text-[#1A1A2E] text-sm font-semibold rounded-lg"
            >
              무료 시작
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
