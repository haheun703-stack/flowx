'use client'

import { CARD_INNER, GRID, CONTAINER } from '@/shared/lib/card-styles'
import { MarketVerdictHero } from '@/features/intelligence/ui/MarketVerdictHero'
import { SupplyDemandPanel } from '@/features/intelligence/ui/SupplyDemandPanel'
import { ScenarioAnalysisPanel } from '@/features/intelligence/ui/ScenarioAnalysisPanel'
import { HotIssuesPanel } from '@/features/intelligence/ui/HotIssuesPanel'

export default function IntelligencePage() {
  return (
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
  )
}
