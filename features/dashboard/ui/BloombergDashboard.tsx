'use client'

import { SignalScoreboard } from './SignalScoreboard'
import { RecentClosedSignals } from './RecentClosedSignals'
import { StatusBar } from './StatusBar'
import { SidePanel } from './SidePanel'
import { AIRecommendPanel } from './AIRecommendPanel'
import { SmartMoneyPanel } from './SmartMoneyPanel'
import { SectorMomentumTable } from './SectorMomentumTable'
import { HeroChart } from './HeroChart'
import { ChinaMoneyPanel } from './ChinaMoneyPanel'
import { EtfSignalPanel } from './EtfSignalPanel'
import { SniperWatchPanel } from './SniperWatchPanel'
import { MorningNewsPanel } from './MorningNewsPanel'
import { PaywallBlur } from '@/shared/ui/PaywallBlur'
import { useDashboardDaily } from '../api/useDashboard'

// TODO: Toss Payments 연동 후 실제 유저 tier로 교체
const USER_TIER = 'FREE' as const

export function BloombergDashboard() {
  const { data: intraday } = useDashboardDaily()

  return (
    <div className="flex flex-col h-[calc(100vh/1.25-88px)]" style={{ background: '#131722' }}>
      {/* 상단 상태바 */}
      <StatusBar />

      {/* 스크롤 가능 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 시그널 성적표 배너 */}
        <SignalScoreboard />

        {/* 최근 청산 시그널 (가로 스크롤) */}
        <RecentClosedSignals />

        {/* KOSPI 히어로 차트 — 풀 width */}
        <HeroChart
          data={intraday?.points ?? []}
          currentPrice={intraday?.currentPrice ?? 0}
          change={intraday?.change ?? 0}
          changePercent={intraday?.changePercent ?? 0}
          marketOpen={intraday?.marketOpen ?? false}
          mode={(intraday?.mode as 'intraday' | 'daily' | 'empty') ?? 'empty'}
          lastDate={intraday?.lastDate}
        />

        {/* 메인 그리드 */}
        <div className="flex min-h-[400px]">
          {/* 좌측 사이드패널 */}
          <SidePanel />

          {/* 우측 컨텐츠 */}
          <div className="flex-1 flex flex-col">
            {/* 중간: AI 추천 + 세력 포착 (반반) */}
            <div className="flex h-[360px] border-b border-[#2a2a3a]">
              <div className="flex-1 overflow-hidden border-r border-[#2a2a3a]">
                <AIRecommendPanel />
              </div>
              <div className="flex-1 overflow-hidden">
                <PaywallBlur requiredTier="PRO" userTier={USER_TIER}>
                  <SmartMoneyPanel />
                </PaywallBlur>
              </div>
            </div>

            {/* 섹터 모멘텀 */}
            <div className="h-[280px] shrink-0">
              <SectorMomentumTable />
            </div>
          </div>
        </div>

        {/* ── 하단 확장 패널 ── */}
        <div className="border-t border-[#2a2a3a]">
          {/* 외국인 자본 흐름 + ETF 시그널 */}
          <div className="flex h-[360px] border-b border-[#2a2a3a]">
            <div className="flex-1 overflow-hidden border-r border-[#2a2a3a]">
              <ChinaMoneyPanel />
            </div>
            <div className="flex-1 overflow-hidden">
              <EtfSignalPanel />
            </div>
          </div>

          {/* 스나이퍼 워치 + 모닝 브리핑 */}
          <div className="flex h-[360px]">
            <div className="flex-1 overflow-hidden border-r border-[#2a2a3a]">
              <PaywallBlur requiredTier="PRO" userTier={USER_TIER}>
                <SniperWatchPanel />
              </PaywallBlur>
            </div>
            <div className="flex-1 overflow-hidden">
              <MorningNewsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
