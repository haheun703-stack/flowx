import Link from 'next/link'
import { TickerSearch } from './TickerSearch'
import { TickerBanner } from '@/features/market-ticker/ui/TickerBanner'
import { FlowxLogo } from './logo'
import { NavbarAuth } from './NavbarAuth'

export function Navbar() {
  return (
    <>
      <nav aria-label="메인 내비게이션" className="border-b border-[var(--border)] bg-white px-3 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 gap-2 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" aria-label="FLOWX 홈으로 이동">
            <FlowxLogo variant="small" />
          </Link>
          <span className="text-xs text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-full hidden sm:inline">
            BETA
          </span>
          <Link href="/dashboard" className="text-xs text-gray-600 hover:text-[var(--blue)] transition-colors ml-1 sm:ml-2">
            대시보드
          </Link>
          <Link href="/market" className="text-xs text-gray-600 hover:text-[var(--blue)] transition-colors ml-1 sm:ml-2">
            시장
          </Link>
          <Link href="/macro" className="text-xs text-gray-600 hover:text-[var(--yellow)] transition-colors ml-1 sm:ml-2 flex items-center gap-1">
            매크로
            <span className="text-[8px] px-1 py-px rounded bg-red-500 text-white font-bold leading-tight animate-pulse">NEW</span>
          </Link>
          <Link href="/market/treemap" className="text-xs text-gray-600 hover:text-[var(--blue)] transition-colors ml-1 sm:ml-2">
            트리맵
          </Link>
          <Link href="/sectors" className="text-xs text-gray-600 hover:text-[var(--purple)] transition-colors ml-1 sm:ml-2 flex items-center gap-1 font-bold">
            섹터맵
            <span className="text-[8px] px-1 py-px rounded bg-red-500 text-white font-bold leading-tight animate-pulse">NEW</span>
          </Link>
          <Link href="/sectors/leaders" className="text-xs text-gray-600 hover:text-[var(--blue)] transition-colors ml-1 sm:ml-2 flex items-center gap-1 font-bold">
            글로벌대장주
            <span className="text-[8px] px-1 py-px rounded bg-red-500 text-white font-bold leading-tight animate-pulse">NEW</span>
          </Link>
          <Link href="/information" className="text-xs text-gray-600 hover:text-[var(--green)] transition-colors ml-1 sm:ml-2 flex items-center gap-1">
            인포메이션
            <span className="text-[8px] px-1 py-px rounded border border-green-300 text-green-600 font-bold leading-tight">SIGNAL</span>
          </Link>
          <Link href="/scenario" className="text-xs text-gray-600 hover:text-[var(--blue)] transition-colors ml-1 sm:ml-2 flex items-center gap-1 font-bold">
            시나리오
            <span className="text-[8px] px-1 py-px rounded bg-red-500 text-white font-bold leading-tight animate-pulse">NEW</span>
          </Link>
          <Link href="/quant" className="text-xs text-gray-600 hover:text-[var(--yellow)] transition-colors ml-1 sm:ml-2 flex items-center gap-1">
            퀀트시스템
            <span className="text-[8px] px-1 py-px rounded border border-amber-300 text-amber-600 font-bold leading-tight">PRO</span>
          </Link>
          <Link href="/swing" className="text-xs text-gray-600 hover:text-[var(--purple)] transition-colors ml-1 sm:ml-2 flex items-center gap-1">
            스윙시스템
            <span className="text-[8px] px-1 py-px rounded border border-violet-300 text-violet-600 font-bold leading-tight">VIP</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <TickerSearch />
          </div>
          <NavbarAuth />
        </div>
      </nav>

      <TickerBanner />
    </>
  )
}
