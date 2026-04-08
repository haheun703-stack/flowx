'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { href: '/market/us',       label: '\uD83C\uDDFA\uD83C\uDDF8 전체 개요',    sub: '지수\u00B7ETF\u00B7체온' },
  { href: '/market/us/swing', label: '\u26A1 스윙시스템',    sub: '단기 1~3일' },
  { href: '/market/us/quant', label: '\uD83D\uDCCA 퀀트시스템',    sub: '중기 5~10일' },
]

export default function UsMarketLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      <div className="sticky top-0 z-10 bg-[#F5F4F0] border-b border-[#E8E6E0]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex gap-1 py-2">
            {TABS.map(tab => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                  style={{
                    background: isActive ? '#1A1A2E' : 'transparent',
                    color:      isActive ? '#fff'    : '#888',
                  }}
                >
                  <span className="text-[13px] font-black">{tab.label}</span>
                  <span className="text-[10px] opacity-70">{tab.sub}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
