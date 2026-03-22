'use client'

import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { MacroRadarPanel } from '@/features/macro/ui/MacroRadarPanel'
import { FearGreedGauge } from '@/features/macro/ui/FearGreedGauge'
import { CostFloorGauge } from '@/features/macro/ui/CostFloorGauge'

export default function MacroDashboardPage() {
  return (
    <div className={PAGE}>
      {/* 페이지 헤더 */}
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">Macro Dashboard</h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#f59e0b]/40 text-[#f59e0b] font-bold">
            SIGNAL
          </span>
          <span className="text-sm text-gray-500">원자재 · 환율 · 금리 · 센티먼트 · 크립토 한눈에</span>
        </div>
      </div>

      <div className={`${CONTAINER} pt-6 space-y-6`}>
        {/* 1. 매크로 레이더 4분할 (M카드들 자체 포함) */}
        <MacroRadarPanel />

        {/* 2. 공포탐욕 게이지 (1) + 원가 바닥/천장 (2) — 1:2 비율 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <FearGreedGauge />
          </div>
          <div className="lg:col-span-2">
            <CostFloorGauge />
          </div>
        </div>
      </div>
    </div>
  )
}
