'use client'

import { CARD_INNER, GRID, CONTAINER } from '@/shared/lib/card-styles'
import { MarketVerdictHero } from '@/features/information/ui/MarketVerdictHero'
import { NewsTop3Panel } from '@/features/information/ui/NewsTop3Panel'
import { MacroGaugePanel } from '@/features/information/ui/MacroGaugePanel'
import { MoneyFlowMapPanel } from '@/features/information/ui/MoneyFlowMapPanel'
import { SupplyDemandPanel } from '@/features/information/ui/SupplyDemandPanel'
import { ScenarioAnalysisPanel } from '@/features/information/ui/ScenarioAnalysisPanel'
import { HotIssuesPanel } from '@/features/information/ui/HotIssuesPanel'

export default function InformationPage() {
  return (
    <div className={`${CONTAINER} pt-6 space-y-6`}>
      {/* 1. 오늘의 한 줄 판정 (히어로) */}
      <MarketVerdictHero />

      {/* 2. 뉴스 TOP 3 (70%) + 매크로 게이지 (30%) */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '7fr 3fr' }}>
        <NewsTop3Panel />
        <MacroGaugePanel />
      </div>

      {/* 3. 글로벌 자금 플로우 맵 */}
      <MoneyFlowMapPanel />

      {/* 4. 수급 흐름 */}
      <div className={CARD_INNER.M}>
        <SupplyDemandPanel />
      </div>

      {/* 5. 시나리오 확률 */}
      <div className={CARD_INNER.M}>
        <ScenarioAnalysisPanel />
      </div>

      {/* 6. 글로벌 + 국내 핫이슈 (미리보기 4건) */}
      <div className={GRID.col2}>
        <div className={CARD_INNER.M}>
          <HotIssuesPanel scope="GLOBAL" title="글로벌 핫이슈" accentColor="var(--blue)" maxPreview={4} />
        </div>
        <div className={CARD_INNER.M}>
          <HotIssuesPanel scope="DOMESTIC" title="국내 핫이슈" accentColor="var(--red)" maxPreview={4} />
        </div>
      </div>
    </div>
  )
}
