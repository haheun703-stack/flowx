'use client'

import { CARD_INNER, GRID, CONTAINER } from '@/shared/lib/card-styles'
import { MarketVerdictHero } from '@/features/information/ui/MarketVerdictHero'
import { SupplyDemandPanel } from '@/features/information/ui/SupplyDemandPanel'
import { ScenarioAnalysisPanel } from '@/features/information/ui/ScenarioAnalysisPanel'
import { HotIssuesPanel } from '@/features/information/ui/HotIssuesPanel'

export default function InformationPage() {
  return (
    <div className={`${CONTAINER} pt-6 space-y-6`}>
      {/* 1. 오늘의 한 줄 판정 (L카드 — 히어로) */}
      <MarketVerdictHero />

      {/* 2. 시나리오 확률 (전체 너비 — 가로 카드) */}
      <div className={CARD_INNER.M}>
        <ScenarioAnalysisPanel />
      </div>

      {/* 3. 수급 흐름 (전체 너비 — 좌우 2분할) */}
      <div className={CARD_INNER.M}>
        <SupplyDemandPanel />
      </div>

      {/* 4. 글로벌 + 국내 핫이슈 (M카드 2열) */}
      <div className={GRID.col2}>
        <div className={CARD_INNER.M}>
          <HotIssuesPanel scope="GLOBAL" title="글로벌 핫이슈" accentColor="var(--blue)" />
        </div>
        <div className={CARD_INNER.M}>
          <HotIssuesPanel scope="DOMESTIC" title="국내 핫이슈" accentColor="var(--red)" />
        </div>
      </div>
    </div>
  )
}
