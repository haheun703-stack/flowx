'use client'

import { MarketStatusCard } from './MarketStatusCard'
import { TopPicksCard } from './TopPicksCard'
import { WhaleDetectCard } from './WhaleDetectCard'
import { SectorMomentumCard } from './SectorMomentumCard'

export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Row 1: 장세 판단 (1칸) + AI 추천 (2칸) */}
      <MarketStatusCard />
      <TopPicksCard />

      {/* Row 2: 세력 포착 (1칸) + 섹터 모멘텀 (2칸) */}
      <WhaleDetectCard />
      <SectorMomentumCard />
    </div>
  )
}
