import Link from 'next/link'
import { TickerSearch } from './TickerSearch'
import { TickerBanner } from '@/features/market-ticker/ui/TickerBanner'
import { FlowxLogo } from './logo'

export function Navbar() {
  return (
    <>
      {/* 기존 네비게이션 바 */}
      <nav className="border-b border-gray-800 bg-[#080b10] px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/">
            <FlowxLogo variant="small" />
          </Link>
          <span className="text-xs text-blue-400 border border-blue-400/30 bg-blue-400/10 px-2 py-0.5 rounded-full">
            BETA
          </span>
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-[#00ff88] transition-colors ml-2">
            대시보드
          </Link>
          <Link href="/market" className="text-xs text-gray-400 hover:text-[#00ff88] transition-colors ml-2">
            시장
          </Link>
        </div>
        <TickerSearch />
      </nav>

      {/* 신규: 티커 배너 (Navbar 바로 아래 고정) */}
      <TickerBanner />
    </>
  )
}
