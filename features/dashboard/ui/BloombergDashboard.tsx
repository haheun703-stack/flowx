'use client'

import { useState } from 'react'
import { SignalScoreboard } from './SignalScoreboard'
import { AIRecommendPanel } from './AIRecommendPanel'
import { SectorMomentumTable } from './SectorMomentumTable'
import { HeroChart } from './HeroChart'
import { ChinaMoneyPanel } from './ChinaMoneyPanel'
import { EtfSignalPanel } from './EtfSignalPanel'
import { MorningNewsPanel } from './MorningNewsPanel'
import { MarketJudgmentCard } from './MarketJudgmentCard'
import { useDashboardDaily, useDashboardDailyKosdaq, useInvestorFlow, useInvestorFlowKosdaq } from '../api/useDashboard'

export function BloombergDashboard() {
  const [activeIndex, setActiveIndex] = useState<'KOSPI' | 'KOSDAQ'>('KOSPI')
  const { data: kospiData } = useDashboardDaily()
  const { data: kosdaqData } = useDashboardDailyKosdaq()
  const { data: investorFlow } = useInvestorFlow()
  const { data: investorFlowKosdaq } = useInvestorFlowKosdaq()

  const chartData = activeIndex === 'KOSPI' ? kospiData : kosdaqData
  const flowData = activeIndex === 'KOSPI' ? investorFlow : investorFlowKosdaq

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex relative">
      <main className={`${sidebarOpen ? 'w-3/4' : 'w-full'} transition-[width] duration-300`}>
        <div className="p-4 space-y-[14px] max-w-[1400px] mx-auto">

          {/* ── 1행: 차트(70%) + 장세판단(30%) ── */}
          <div className="flex gap-3">
            <div className="w-[70%] fx-card-green">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5">
                  {(['KOSPI', 'KOSDAQ'] as const).map(idx => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`px-4 py-1.5 text-[15px] font-bold rounded transition-colors ${
                        activeIndex === idx
                          ? 'bg-[#00FF88] text-[#0A3D23]'
                          : 'bg-[#F0EDE8] text-[#9CA3AF] hover:text-[#6B7280]'
                      }`}
                    >
                      {idx}
                    </button>
                  ))}
                </div>
                <span className="text-[13px] font-medium text-[#9CA3AF]">
                  30일 차트 | {chartData?.lastDate ?? ''} 종가 기준
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-[36px] font-extrabold text-[#1A1A2E] tabular-nums">
                  {chartData?.currentPrice ? chartData.currentPrice.toLocaleString() : '---'}
                </span>
                {chartData && chartData.currentPrice > 0 && (
                  <>
                    <span className={`text-[22px] font-bold tabular-nums ${
                      chartData.changePercent >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
                    }`}>
                      {chartData.changePercent >= 0 ? '+' : ''}{chartData.changePercent.toFixed(2)}%
                    </span>
                    <span className={`text-[16px] font-semibold tabular-nums ${
                      chartData.changePercent >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
                    }`}>
                      ({chartData.change >= 0 ? '+' : ''}{chartData.change.toFixed(2)})
                    </span>
                  </>
                )}
              </div>

              <HeroChart
                data={chartData?.points ?? []}
                currentPrice={chartData?.currentPrice ?? 0}
                change={chartData?.change ?? 0}
                changePercent={chartData?.changePercent ?? 0}
                marketOpen={chartData?.marketOpen ?? false}
                mode={(chartData?.mode as 'intraday' | 'daily' | 'empty') ?? 'empty'}
                lastDate={chartData?.lastDate}
                investorFlow={flowData}
                indexLabel={activeIndex}
              />

              {flowData && flowData.length > 0 && (() => {
                const latest = flowData[flowData.length - 1]
                const toEok = (v: number) => Math.round(v / 100)
                const fmt = (v: number) => `${v >= 0 ? '+' : ''}${v.toLocaleString()}억`
                return (
                  <div className="mt-3 text-[14px] font-semibold text-[#6B7280] flex gap-4">
                    <span>외국인 <span className={toEok(latest.foreign_net) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>{fmt(toEok(latest.foreign_net))}</span></span>
                    <span>기관 <span className={toEok(latest.inst_net) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>{fmt(toEok(latest.inst_net))}</span></span>
                    <span>개인 <span className={toEok(latest.indiv_net) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>{fmt(toEok(latest.indiv_net))}</span></span>
                  </div>
                )
              })()}
            </div>

            <div className="w-[30%]">
              <MarketJudgmentCard />
            </div>
          </div>

          {/* ── 2행: AI 시그널 성적표 (풀너비, 녹색 라인) ── */}
          <div className="fx-card-green">
            <SignalScoreboard />
          </div>

          {/* ── 3행: AI 추천(2/3) + 오늘의 브리핑(1/3) ── */}
          <div className="flex gap-3">
            <div className="w-2/3 fx-card-green min-h-[360px]">
              <AIRecommendPanel />
            </div>
            <div className="w-1/3 fx-card min-h-[360px]">
              <MorningNewsPanel />
            </div>
          </div>

          {/* ── 4행: 섹터 + 외국인 + ETF (3등분, 기본 카드) ── */}
          <div className="flex gap-3">
            <div className="flex-1 fx-card min-h-[320px]">
              <SectorMomentumTable />
            </div>
            <div className="flex-1 fx-card min-h-[320px]">
              <ChinaMoneyPanel />
            </div>
            <div className="flex-1 fx-card min-h-[320px]">
              <EtfSignalPanel />
            </div>
          </div>

        </div>
      </main>

      {sidebarOpen && (
        <aside className="w-1/4 border-l border-[#E8E6E0] bg-white p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[16px] font-bold text-[#1A1A2E]">관심 종목</span>
            <button onClick={() => setSidebarOpen(false)} className="text-[14px] text-[#9CA3AF] hover:text-[#1A1A2E]">▶</button>
          </div>
          <div className="text-[14px] text-[#9CA3AF] text-center py-10">준비 중</div>
        </aside>
      )}

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-r-0 border-[#E8E6E0] rounded-l-lg px-2 py-5 text-[13px] font-bold text-[#9CA3AF] hover:text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors shadow-sm"
          style={{ writingMode: 'vertical-rl' }}
        >
          ◀ 관심종목
        </button>
      )}
    </div>
  )
}
