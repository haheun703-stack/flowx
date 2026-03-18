'use client'

import { HotIssuesPanel } from '@/features/intelligence/ui/HotIssuesPanel'
import { DisclosuresPanel } from '@/features/intelligence/ui/DisclosuresPanel'
import { SupplyDemandPanel } from '@/features/intelligence/ui/SupplyDemandPanel'
import { ScenarioAnalysisPanel } from '@/features/intelligence/ui/ScenarioAnalysisPanel'

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-[#080b10] text-[#e2e8f0] pb-8">
      {/* 페이지 헤더 */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-wider uppercase" style={{ fontFamily: 'var(--font-terminal)' }}>
            Intelligence
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded border border-[#00ff88]/40 text-[#00ff88] font-bold">
            SIGNAL
          </span>
          <span className="text-xs text-[#8a8a8a]">시장 인텔리전스 종합 분석</span>
        </div>
      </div>

      <div className="px-2 sm:px-4 py-4 space-y-4">
        {/* ROW 1: 글로벌/국내 핫이슈 (2열) — FREE 일부 공개 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden" style={{ minHeight: 360 }}>
            <HotIssuesPanel scope="GLOBAL" title="글로벌 핫이슈" accentColor="#0ea5e9" />
          </div>
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden" style={{ minHeight: 360 }}>
            <HotIssuesPanel scope="DOMESTIC" title="국내 핫이슈" accentColor="#ff3b5c" />
          </div>
        </div>

        {/* ROW 2: DART/EDGAR 공시 (2열) — SIGNAL ONLY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden min-h-[320px]">
              <DisclosuresPanel source="DART" title="DART 공시" accentColor="#00ff88" />
          </div>
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden min-h-[320px]">
              <DisclosuresPanel source="EDGAR" title="EDGAR 공시" accentColor="#a855f7" />
          </div>
        </div>

        {/* ROW 3: 수급 흐름 + CHAIN MAP (2열) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden min-h-[300px]">
            <SupplyDemandPanel />
          </div>
          <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg overflow-hidden min-h-[400px]">
              <ScenarioAnalysisPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
