import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { MarketOverviewPanel } from '@/features/market-overview/ui/MarketOverviewPanel'

export const metadata = {
  title: 'FLOWX — 시장 개요',
  description: '주요 지수, 시장 체온(Breadth), 투자자 동향 일간 요약',
}

export default function MarketOverviewPage() {
  return (
    <div className={PAGE}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">Market Overview</h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#00ff88]/40 text-[#00ff88] font-bold">
            DAILY
          </span>
          <span className="text-sm text-gray-500">지수 · 체온 · 투자자 동향</span>
        </div>
      </div>
      <div className={`${CONTAINER} pt-6`}>
        <MarketOverviewPanel />
      </div>
    </div>
  )
}
