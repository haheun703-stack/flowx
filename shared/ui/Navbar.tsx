import Link from 'next/link'
import { TickerSearch } from './TickerSearch'
import { TickerBanner } from '@/features/market-ticker/ui/TickerBanner'
import { FlowxLogo } from './logo'
import { NavbarAuth } from './NavbarAuth'

export function Navbar() {
  return (
    <>
      {/* 기존 네비게이션 바 */}
      <nav aria-label="메인 내비게이션" className="border-b border-gray-800 bg-[#080b10] px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" aria-label="FLOWX 홈으로 이동">
            <FlowxLogo variant="small" />
          </Link>
          <span className="text-xs text-blue-400 border border-blue-400/30 bg-blue-400/10 px-2 py-0.5 rounded-full hidden sm:inline">
            BETA
          </span>
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-[#00ff88] transition-colors ml-1 sm:ml-2">
            대시보드
          </Link>
          <Link href="/market" className="text-xs text-gray-400 hover:text-[#00ff88] transition-colors ml-1 sm:ml-2">
            시장
          </Link>
          <Link href="/market/treemap" className="text-xs text-gray-400 hover:text-[#00ff88] transition-colors ml-1 sm:ml-2">
            트리맵
          </Link>
          <Link href="/sectors" className="text-xs text-gray-400 hover:text-[#7F77DD] transition-colors ml-1 sm:ml-2 flex items-center gap-1 font-bold">
            섹터맵
            <span className="text-[8px] px-1 py-px rounded bg-[#ff3b5c] text-white font-bold leading-tight animate-pulse">NEW</span>
          </Link>
          <Link href="/information" className="text-xs text-gray-400 hover:text-[#00ff88] transition-colors ml-1 sm:ml-2 flex items-center gap-1">
            인포메이션
            <span className="text-[8px] px-1 py-px rounded border border-[#00ff88]/40 text-[#00ff88] font-bold leading-tight">SIGNAL</span>
          </Link>
          <Link href="/macro" className="text-xs text-gray-400 hover:text-[#f59e0b] transition-colors ml-1 sm:ml-2 flex items-center gap-1">
            매크로
            <span className="text-[8px] px-1 py-px rounded bg-[#ff3b5c] text-white font-bold leading-tight animate-pulse">NEW</span>
          </Link>
          <Link href="/quant" className="text-xs text-gray-400 hover:text-[#f59e0b] transition-colors ml-1 sm:ml-2 flex items-center gap-1">
            퀀트시스템
            <span className="text-[8px] px-1 py-px rounded border border-[#f59e0b]/40 text-[#f59e0b] font-bold leading-tight">PRO</span>
          </Link>
          <Link href="/swing" className="text-xs text-gray-400 hover:text-[#a855f7] transition-colors ml-1 sm:ml-2 flex items-center gap-1">
            스윙시스템
            <span className="text-[8px] px-1 py-px rounded border border-[#a855f7]/40 text-[#a855f7] font-bold leading-tight">VIP</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <TickerSearch />
          </div>
          <NavbarAuth />
        </div>
      </nav>

      {/* 신규: 티커 배너 (Navbar 바로 아래 고정) */}
      <TickerBanner />
    </>
  )
}
