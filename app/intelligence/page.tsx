'use client'

import { CARD_INNER, GRID, CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { MarketVerdictHero } from '@/features/intelligence/ui/MarketVerdictHero'
import { SupplyDemandPanel } from '@/features/intelligence/ui/SupplyDemandPanel'
import { ScenarioAnalysisPanel } from '@/features/intelligence/ui/ScenarioAnalysisPanel'
import { HotIssuesPanel } from '@/features/intelligence/ui/HotIssuesPanel'

export default function IntelligencePage() {
  return (
    <div className={PAGE}>
      {/* 페이지 헤더 */}
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">Intelligence</h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#00ff88]/40 text-[#00ff88] font-bold">
            SIGNAL
          </span>
          <span className="text-sm text-gray-500">3초 안에 오늘의 시장 판단</span>
        </div>
      </div>

      <div className={`${CONTAINER} pt-6 space-y-6`}>
        {/* 1. 오늘의 한 줄 판정 (L카드 — 히어로) */}
        <MarketVerdictHero />

        {/* 2. 수급 흐름 + 시나리오 확률 (M카드 2열) */}
        <div className={GRID.col2}>
          <div className={CARD_INNER.M}>
            <SupplyDemandPanel />
          </div>
          <div className={CARD_INNER.M}>
            <ScenarioAnalysisPanel />
          </div>
        </div>

        {/* 3. 글로벌 + 국내 핫이슈 (M카드 2열) */}
        <div className={GRID.col2}>
          <div className={CARD_INNER.M}>
            <HotIssuesPanel scope="GLOBAL" title="글로벌 핫이슈" accentColor="#0ea5e9" />
          </div>
          <div className={CARD_INNER.M}>
            <HotIssuesPanel scope="DOMESTIC" title="국내 핫이슈" accentColor="#ff3b5c" />
          </div>
        </div>

      </div>
    </div>
  )
}
