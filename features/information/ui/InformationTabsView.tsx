'use client'

import { useState } from 'react'
import { CARD_INNER, GRID, CONTAINER } from '@/shared/lib/card-styles'
import { MarketVerdictHero } from './MarketVerdictHero'
import { NewsTop3Panel } from './NewsTop3Panel'
import { MacroGaugePanel } from './MacroGaugePanel'
import { ScenarioFlowPanel } from './ScenarioFlowPanel'
import { HotIssuesPanel } from './HotIssuesPanel'
import { DeepBriefingPanel } from './DeepBriefingPanel'
import { DisclosuresPanel } from './DisclosuresPanel'

const TABS = [
  { key: 'signal', label: '시그널' },
  { key: 'briefing', label: '심층 브리핑' },
  { key: 'dart', label: '다트 공시' },
  { key: 'edgar', label: '에드가 공시' },
] as const

type TabKey = (typeof TABS)[number]['key']

function SignalTab() {
  return (
    <div className="space-y-6">
      <MarketVerdictHero />
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-3">
        <NewsTop3Panel />
        <MacroGaugePanel />
      </div>
      <ScenarioFlowPanel />
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

export function InformationTabsView() {
  const [tab, setTab] = useState<TabKey>('signal')

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* 탭 바 */}
      <div className={`${CONTAINER} pt-6`}>
        <nav className="flex gap-1 bg-[#F5F4F0] rounded-xl p-1 border border-[#E8E6E0] w-fit">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 py-2.5 px-5 rounded-lg text-[15px] font-bold transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'bg-[#00FF88] text-[#1A1A2E]'
                  : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <div className={`${CONTAINER} pt-6 pb-8`}>
        {tab === 'signal' && <SignalTab />}
        {tab === 'briefing' && (
          <div className={`${CARD_INNER.M} !min-h-[600px]`}>
            <DeepBriefingPanel />
          </div>
        )}
        {tab === 'dart' && (
          <div className={`${CARD_INNER.M} !min-h-[600px]`}>
            <DisclosuresPanel source="DART" title="DART 공시" accentColor="var(--green)" />
          </div>
        )}
        {tab === 'edgar' && (
          <div className={`${CARD_INNER.M} !min-h-[600px]`}>
            <DisclosuresPanel source="EDGAR" title="EDGAR 공시" accentColor="#a855f7" />
          </div>
        )}
      </div>
    </div>
  )
}
