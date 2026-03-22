'use client'

import { MacroRadarPanel } from '@/features/macro/ui/MacroRadarPanel'
import { FearGreedGauge } from '@/features/macro/ui/FearGreedGauge'
import { CostFloorGauge } from '@/features/macro/ui/CostFloorGauge'

export default function MacroDashboardPage() {
  return (
    <div className="min-h-screen bg-[#080b10] text-[#e2e8f0] pb-8">
      {/* 페이지 헤더 */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-wider uppercase">Macro Dashboard</h1>
          <span className="text-[10px] px-2 py-0.5 rounded border border-[#f59e0b]/40 text-[#f59e0b] font-bold">
            SIGNAL
          </span>
          <span className="text-xs text-[#8a8a8a]">원자재 · 환율 · 금리 · 센티먼트 · 크립토 한눈에</span>
        </div>
      </div>

      <div className="px-3 sm:px-5 py-4 space-y-5 max-w-[1400px] mx-auto">
        {/* 1. 매크로 레이더 4분할 */}
        <MacroRadarPanel />

        {/* 2. 공포탐욕 게이지 + 원가 바닥/천장 */}
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
