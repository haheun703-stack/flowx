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

type FlowPeriod = '1D' | '5D' | '30D'
const PERIOD_DAYS: Record<FlowPeriod, number> = { '1D': 1, '5D': 5, '30D': 30 }
const PERIOD_LABELS: Record<FlowPeriod, string> = { '1D': '1일', '5D': '5일', '30D': '30일' }

export function BloombergDashboard() {
  const [activeIndex, setActiveIndex] = useState<'KOSPI' | 'KOSDAQ'>('KOSPI')
  const [flowPeriod, setFlowPeriod] = useState<FlowPeriod>('30D')
  const days = PERIOD_DAYS[flowPeriod]

  const { data: kospiData } = useDashboardDaily()
  const { data: kosdaqData } = useDashboardDailyKosdaq()
  const { data: investorFlow } = useInvestorFlow(days)
  const { data: investorFlowKosdaq } = useInvestorFlowKosdaq(days)

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
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {(['1D', '5D', '30D'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setFlowPeriod(p)}
                        className={`px-2 py-0.5 text-[13px] font-bold rounded transition-colors ${
                          flowPeriod === p
                            ? 'text-[#1A1A2E] bg-[#F0EDE8]'
                            : 'text-[#B0ADA6] hover:text-[#6B7280]'
                        }`}
                      >
                        {PERIOD_LABELS[p]}
                      </button>
                    ))}
                  </div>
                  <span className="text-[13px] font-medium text-[#9CA3AF]">
                    {days}일 수급 | {chartData?.lastDate ?? ''} 종가 기준
                  </span>
                </div>
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
                investorFlow={flowPeriod !== '1D' ? flowData : undefined}
                indexLabel={activeIndex}
              />

              {/* 1일 바 차트 */}
              {flowPeriod === '1D' && (() => {
                if (!flowData || flowData.length === 0) {
                  return (
                    <div className="mt-4 bg-[#FAFAF8] rounded-xl p-6 flex items-center justify-center" style={{ height: 200 }}>
                      <span className="text-[14px] text-[#9CA3AF]">수급 데이터 로딩 중...</span>
                    </div>
                  )
                }
                const latest = flowData[flowData.length - 1]
                const toEok = (v: number) => Math.round(v / 100)
                const items = [
                  { label: '외국인', value: toEok(latest.foreign_net), color: '#1A1A2E' },
                  { label: '기관', value: toEok(latest.inst_net), color: '#EAB308' },
                  { label: '개인', value: toEok(latest.indiv_net), color: '#00FF88' },
                ]
                const maxAbs = Math.max(...items.map(i => Math.abs(i.value)), 1)
                return (
                  <div className="mt-4 bg-[#FAFAF8] rounded-xl p-5">
                    <div className="text-[13px] font-bold text-[#6B7280] mb-3">
                      {latest.date} 투자자 순매수
                    </div>
                    <div className="flex justify-center gap-12" style={{ height: 180 }}>
                      {items.map(item => {
                        const pct = Math.abs(item.value) / maxAbs * 100
                        const isPos = item.value >= 0
                        return (
                          <div key={item.label} className="flex flex-col items-center" style={{ height: '100%' }}>
                            {/* 값 */}
                            <span className="text-[16px] font-black tabular-nums mb-2" style={{ color: item.color }}>
                              {item.value >= 0 ? '+' : ''}{item.value.toLocaleString()}억
                            </span>
                            {/* 바 컨테이너 */}
                            <div className="flex-1 w-16 relative">
                              {/* 0 기준선 */}
                              <div className="absolute left-0 right-0 top-1/2 h-px bg-[#D1D5DB]" />
                              {isPos ? (
                                <div className="absolute left-0 right-0 bottom-1/2 flex flex-col justify-end items-center">
                                  <div className="w-12 rounded-t-md" style={{ height: `${pct * 0.8}px`, minHeight: 6, maxHeight: 60, backgroundColor: item.color, opacity: 0.85 }} />
                                </div>
                              ) : (
                                <div className="absolute left-0 right-0 top-1/2 flex flex-col justify-start items-center">
                                  <div className="w-12 rounded-b-md" style={{ height: `${pct * 0.8}px`, minHeight: 6, maxHeight: 60, backgroundColor: item.color, opacity: 0.85 }} />
                                </div>
                              )}
                            </div>
                            {/* 라벨 */}
                            <span className="text-[13px] font-bold mt-2" style={{ color: item.color }}>{item.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* 수급 요약 (5일/30일) */}
              {flowPeriod !== '1D' && flowData && flowData.length > 0 && (() => {
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
