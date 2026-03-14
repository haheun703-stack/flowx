'use client'

import { useMarketSummary } from '../model/useMarketSummary'
import { IntradayChart } from './IntradayChart'
import { IndexCards } from './IndexCards'
import { SectorHeatmap } from './SectorHeatmap'
import { SupplyRankPanel } from './SupplyRankPanel'
import { WatchlistPanel } from './WatchlistPanel'

export function MarketSummaryView() {
  const { intraday, indices, sectors, supplyForeign, supplyInst, watchlist } = useMarketSummary()

  const kospi = indices.find(i => i.name === 'KOSPI')

  return (
    <div className="flex h-[calc(100vh/1.25-88px)] overflow-hidden" style={{ background: '#131722' }}>
      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* KOSPI 인트라데이 차트 */}
        <IntradayChart
          data={intraday}
          currentPrice={kospi?.price ?? 0}
          changePercent={kospi?.changePercent ?? 0}
        />

        {/* 주요 지수 카드 6개 */}
        <IndexCards indices={indices} />

        {/* 섹터 히트맵 + 수급 TOP 5 */}
        <div className="grid grid-cols-2 gap-px border-t border-[#1a2535]">
          <SectorHeatmap sectors={sectors} />
          <div className="flex flex-col gap-px">
            <SupplyRankPanel stocks={supplyForeign} type="외인" />
            <SupplyRankPanel stocks={supplyInst} type="기관" />
          </div>
        </div>
      </div>

      {/* 우측 워치리스트 */}
      <WatchlistPanel items={watchlist} />
    </div>
  )
}
