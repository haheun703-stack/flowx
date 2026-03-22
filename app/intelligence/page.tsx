'use client'

import { MarketVerdictHero } from '@/features/intelligence/ui/MarketVerdictHero'
import { SupplyDemandPanel } from '@/features/intelligence/ui/SupplyDemandPanel'
import { ScenarioAnalysisPanel } from '@/features/intelligence/ui/ScenarioAnalysisPanel'
import { HotIssuesPanel } from '@/features/intelligence/ui/HotIssuesPanel'
import { DisclosuresPanel } from '@/features/intelligence/ui/DisclosuresPanel'

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-[#080b10] text-[#e2e8f0] pb-8">
      {/* 페이지 헤더 */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-wider uppercase">Intelligence</h1>
          <span className="text-[10px] px-2 py-0.5 rounded border border-[#00ff88]/40 text-[#00ff88] font-bold">
            SIGNAL
          </span>
          <span className="text-xs text-[#8a8a8a]">3초 안에 오늘의 시장 판단</span>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-7xl mx-auto">
        {/* 1. 오늘의 한 줄 판정 (히어로) — 가장 크게, 가장 먼저 */}
        <MarketVerdictHero />

        {/* 2. 수급 온도계 + 시나리오 확률 (2열) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden min-h-[400px]">
            <SupplyDemandPanel />
          </div>
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden min-h-[400px]">
            <ScenarioAnalysisPanel />
          </div>
        </div>

        {/* 3. 핫이슈 — 글로벌/국내 (2열) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden" style={{ minHeight: 360 }}>
            <HotIssuesPanel scope="GLOBAL" title="글로벌 핫이슈" accentColor="#0ea5e9" />
          </div>
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden" style={{ minHeight: 360 }}>
            <HotIssuesPanel scope="DOMESTIC" title="국내 핫이슈" accentColor="#ff3b5c" />
          </div>
        </div>

        {/* 4. 공시 — DART/EDGAR (2열), 중요 공시 상단 하이라이트 + 나머지 접기 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden min-h-[280px]">
            <DisclosuresPanel source="DART" title="DART 공시" accentColor="#00ff88" />
          </div>
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden min-h-[280px]">
            <DisclosuresPanel source="EDGAR" title="EDGAR 공시" accentColor="#a855f7" />
          </div>
        </div>
      </div>
    </div>
  )
}
