'use client'

import { useState, useEffect } from 'react'
import { useMarketSummary } from '../model/useMarketSummary'
import { HeroChart } from '@/features/dashboard/ui/HeroChart'
import { useDashboardDaily, useDashboardDailyKosdaq, useInvestorFlow, useInvestorFlowKosdaq } from '@/features/dashboard/api/useDashboard'
import { SectorHeatmap } from './SectorHeatmap'
import { SupplyRankPanel } from './SupplyRankPanel'

interface MarketOverviewData {
  date: string
  kospi_close: number
  kospi_change_pct: number
  kosdaq_close: number
  kosdaq_change_pct: number
  sp500_close: number
  sp500_change_pct: number
  nasdaq_close: number
  nasdaq_change_pct: number
  stocks_up: number
  stocks_down: number
  stocks_flat: number
  breadth: number
  foreign_net: number
  inst_net: number
  individual_net: number
  foreign_trend: string
}

function formatBil(n: number) {
  const bil = n / 1_0000
  if (Math.abs(bil) >= 10000) return `${bil >= 0 ? '+' : ''}${(bil / 10000).toFixed(1)}조`
  if (Math.abs(bil) >= 1) return `${bil >= 0 ? '+' : ''}${bil.toFixed(0)}억`
  return `${bil >= 0 ? '+' : ''}${bil.toFixed(1)}억`
}

function tempLabel(pct: number) {
  if (pct <= 20) return { text: '매우 차가움', color: '#2563eb' }
  if (pct <= 40) return { text: '차가움', color: '#D97706' }
  if (pct <= 60) return { text: '보통', color: '#9CA3AF' }
  if (pct <= 80) return { text: '따뜻함', color: '#dc2626' }
  return { text: '매우 뜨거움', color: '#16A34A' }
}

export function MarketSummaryView() {
  const { indices, sectors, supplyForeign } = useMarketSummary()
  const [activeIndex, setActiveIndex] = useState<'KOSPI' | 'KOSDAQ'>('KOSPI')

  // Chart data from dashboard hooks
  const { data: kospiData } = useDashboardDaily()
  const { data: kosdaqData } = useDashboardDailyKosdaq()
  const { data: investorFlow } = useInvestorFlow()
  const { data: investorFlowKosdaq } = useInvestorFlowKosdaq()

  const chartData = activeIndex === 'KOSPI' ? kospiData : kosdaqData
  const flowData = activeIndex === 'KOSPI' ? investorFlow : investorFlowKosdaq

  // Market overview data
  const [overview, setOverview] = useState<{ latest: MarketOverviewData | null; history: MarketOverviewData[] } | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/market-overview', { signal: controller.signal })
      .then(r => r.json())
      .then(json => setOverview(json))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  const latest = overview?.latest
  const history = overview?.history?.slice(0, 3) ?? []
  const totalStocks = (latest?.stocks_up ?? 0) + (latest?.stocks_down ?? 0) + (latest?.stocks_flat ?? 0)
  const breadthPct = (latest?.breadth ?? 0) * 100
  const temp = tempLabel(breadthPct)

  // Mini index cards data (6 cards)
  const miniIndices = [
    { name: 'KOSPI', price: latest?.kospi_close ?? 0, change: latest?.kospi_change_pct ?? 0 },
    { name: 'KOSDAQ', price: latest?.kosdaq_close ?? 0, change: latest?.kosdaq_change_pct ?? 0 },
    { name: 'S&P 500', price: latest?.sp500_close ?? 0, change: latest?.sp500_change_pct ?? 0 },
    { name: '나스닥', price: latest?.nasdaq_close ?? 0, change: latest?.nasdaq_change_pct ?? 0 },
    ...(indices.length >= 5 ? [
      { name: '다우', price: indices[4]?.price ?? 0, change: indices[4]?.changePercent ?? 0 },
      { name: '닛케이', price: indices[5]?.price ?? 0, change: indices[5]?.changePercent ?? 0 },
    ] : [
      { name: '다우', price: 0, change: 0 },
      { name: '닛케이', price: 0, change: 0 },
    ]),
  ]

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex relative">
      <main className={`${sidebarOpen ? 'w-3/4' : 'w-full'} transition-[width] duration-300`}>
        <div className="p-4 space-y-[14px] max-w-[1400px] mx-auto">

          {/* ── 1행: KOSPI/KOSDAQ 30일 차트 (풀너비, 녹색 라인) ── */}
          <div className="fx-card-green">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1.5">
                {(['KOSPI', 'KOSDAQ'] as const).map(idx => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`px-3 py-1 text-[15px] font-bold rounded transition-colors ${
                      activeIndex === idx
                        ? 'bg-[#00FF88] text-[#0A3D23]'
                        : 'bg-[#F0EDE8] text-[#9CA3AF] hover:text-[#6B7280]'
                    }`}
                  >
                    {idx}
                  </button>
                ))}
              </div>
              <span className="text-[14px] font-semibold text-[#B0ADA6]">
                30일 차트 | {chartData?.lastDate ?? ''} 종가 기준
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-[40px] font-extrabold text-[#1A1A2E] tabular-nums">
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
                    chartData.changePercent >= 0 ? 'text-[var(--up)]/70' : 'text-[var(--down)]/70'
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
              const l = flowData[flowData.length - 1]
              const toEok = (v: number) => Math.round(v / 100)
              const fmt = (v: number) => `${v >= 0 ? '+' : ''}${v.toLocaleString()}억`
              return (
                <div className="mt-2 text-[14px] font-semibold text-[#B0ADA6] flex gap-3">
                  <span>외국인 <span className={toEok(l.foreign_net) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>{fmt(toEok(l.foreign_net))}</span></span>
                  <span>기관 <span className={toEok(l.inst_net) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>{fmt(toEok(l.inst_net))}</span></span>
                  <span>개인 <span className={toEok(l.indiv_net) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>{fmt(toEok(l.indiv_net))}</span></span>
                </div>
              )
            })()}
          </div>

          {/* ── 2행: 미니 지수 카드 6개 (3x2 그리드) ── */}
          <div className="grid grid-cols-3 gap-2">
            {miniIndices.map((idx) => (
              <div key={idx.name} className="bg-[#F5F4F0] rounded-lg p-[10px]">
                <div className="text-[14px] font-semibold text-[#9CA3AF] mb-1">{idx.name}</div>
                <div className="text-[24px] font-bold text-[#1A1A2E] tabular-nums">
                  {idx.price > 0 ? idx.price.toLocaleString(undefined, { maximumFractionDigits: idx.price >= 100 ? 0 : 2 }) : '—'}
                </div>
                <div className={`text-[16px] font-bold tabular-nums ${
                  idx.change >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
                }`}>
                  {idx.change >= 0 ? '+' : ''}{Number(idx.change).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>

          {/* ── 3행: 시장 체온(1/2) + 투자자 순매수(1/2) ── */}
          <div className="flex gap-3">
            {/* 시장 체온 */}
            <div className="flex-1 fx-card">
              <span className="fx-card-title">시장 체온 (전체 종목 등락 비율)</span>
              {latest ? (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[36px] font-extrabold tabular-nums" style={{ color: temp.color }}>
                      {breadthPct.toFixed(1)}%
                    </span>
                    <span className="text-[18px] font-bold" style={{ color: temp.color }}>
                      {temp.text}
                    </span>
                  </div>
                  <div className="text-[15px] font-semibold text-[#9CA3AF] mb-2">
                    전체 {totalStocks.toLocaleString()} 종목 중 상승 종목 비율
                  </div>
                  {/* 온도 바 */}
                  <div className="flex h-[10px] rounded-[5px] overflow-hidden mb-2">
                    {totalStocks > 0 && (
                      <>
                        <div className="bg-[var(--down)]" style={{ width: `${(latest.stocks_down / totalStocks) * 100}%` }} />
                        <div className="bg-[#D1D5DB]" style={{ width: `${(latest.stocks_flat / totalStocks) * 100}%` }} />
                        <div className="bg-[var(--up)]" style={{ width: `${(latest.stocks_up / totalStocks) * 100}%` }} />
                      </>
                    )}
                  </div>
                  <div className="text-[14px] font-semibold text-[#B0ADA6] flex gap-3">
                    <span>상승 {latest.stocks_up?.toLocaleString()}개</span>
                    <span>보합 {latest.stocks_flat?.toLocaleString()}개</span>
                    <span>하락 {latest.stocks_down?.toLocaleString()}개</span>
                  </div>
                  <div className="fx-card-tip">
                    수치가 낮을수록 시장이 차갑고, 높을수록 뜨거워요. 50% 이상이면 상승장
                  </div>
                </>
              ) : (
                <div className="text-[15px] font-semibold text-[#C4C1BA] text-center py-6">데이터 로딩 중...</div>
              )}
            </div>

            {/* 투자자 순매수 */}
            <div className="flex-1 fx-card">
              <span className="fx-card-title">누가 사고 누가 팔았나 (투자자 순매수)</span>
              {latest ? (
                <>
                  {[
                    { name: '외국인', value: latest.foreign_net, dotColor: '#1A1A2E' },
                    { name: '기관', value: latest.inst_net, dotColor: '#EAB308' },
                    { name: '개인', value: latest.individual_net, dotColor: '#00FF88' },
                  ].map((inv) => (
                    <div key={inv.name} className="flex items-center justify-between py-2.5 border-b border-[#F5F4F0] last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: inv.dotColor }} />
                        <span className="text-[16px] font-semibold text-[#1A1A2E]">{inv.name}</span>
                      </div>
                      <span className={`text-[22px] font-bold tabular-nums ${
                        inv.value >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
                      }`}>
                        {formatBil(inv.value)}
                      </span>
                    </div>
                  ))}
                  <div className="fx-card-tip">
                    외국인이 팔고 개인이 사면 조심! 외국인이 사고 개인이 팔면 기회일 수 있어요
                  </div>
                </>
              ) : (
                <div className="text-[15px] font-semibold text-[#C4C1BA] text-center py-6">데이터 로딩 중...</div>
              )}
            </div>
          </div>

          {/* ── 4행: 최근 3일 추이 (풀너비 테이블) ── */}
          {history.length > 0 && (
            <div className="fx-card">
              <span className="fx-card-title">최근 3일 추이</span>
              <div className="overflow-x-auto">
                <table className="w-full text-[15px] font-semibold">
                  <thead>
                    <tr className="text-[#9CA3AF] text-[14px] font-bold border-b border-[#F0EDE8]">
                      <th className="text-left py-2 px-2 font-bold">날짜</th>
                      <th className="text-right py-2 px-2 font-bold">KOSPI</th>
                      <th className="text-right py-2 px-2 font-bold">KOSDAQ</th>
                      <th className="text-right py-2 px-2 font-bold">S&P 500</th>
                      <th className="text-right py-2 px-2 font-bold">나스닥</th>
                      <th className="text-right py-2 px-2 font-bold">시장체온</th>
                      <th className="text-right py-2 px-2 font-bold">외국인</th>
                      <th className="text-right py-2 px-2 font-bold">기관</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(row => (
                      <tr key={row.date} className="border-b border-[#F5F4F0] h-[44px] hover:bg-[#F0EDE8] transition-colors">
                        <td className="py-2 px-2 text-[16px] font-bold text-[#1A1A2E]">{row.date.slice(5)}</td>
                        <td className={`text-right py-2 px-2 tabular-nums ${row.kospi_change_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                          {row.kospi_change_pct >= 0 ? '+' : ''}{row.kospi_change_pct.toFixed(2)}%
                        </td>
                        <td className={`text-right py-2 px-2 tabular-nums ${row.kosdaq_change_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                          {row.kosdaq_change_pct >= 0 ? '+' : ''}{row.kosdaq_change_pct.toFixed(2)}%
                        </td>
                        <td className={`text-right py-2 px-2 tabular-nums ${row.sp500_change_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                          {row.sp500_change_pct >= 0 ? '+' : ''}{row.sp500_change_pct.toFixed(2)}%
                        </td>
                        <td className={`text-right py-2 px-2 tabular-nums ${row.nasdaq_change_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                          {row.nasdaq_change_pct >= 0 ? '+' : ''}{row.nasdaq_change_pct.toFixed(2)}%
                        </td>
                        <td className="text-right py-2 px-2 tabular-nums text-[#6B7280]">
                          {(row.breadth * 100).toFixed(1)}%
                        </td>
                        <td className={`text-right py-2 px-2 tabular-nums ${row.foreign_net >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                          {formatBil(row.foreign_net)}
                        </td>
                        <td className={`text-right py-2 px-2 tabular-nums ${row.inst_net >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                          {formatBil(row.inst_net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── 5행: 섹터 히트맵(1/2) + 외국인 순매수 TOP 5(1/2) ── */}
          <div className="flex gap-3">
            <div className="flex-1 fx-card">
              <SectorHeatmap sectors={sectors} />
            </div>
            <div className="flex-1 fx-card">
              <SupplyRankPanel stocks={supplyForeign} type="외인" />
            </div>
          </div>

        </div>
      </main>

      {/* 관심종목 사이드바 (접이식) */}
      {sidebarOpen && (
        <aside className="w-1/4 border-l border-[#E8E6E0] bg-white p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[16px] font-bold text-[#1A1A2E]">관심 종목</span>
            <button onClick={() => setSidebarOpen(false)} className="text-[14px] font-semibold text-[#9CA3AF] hover:text-[#1A1A2E]">▶</button>
          </div>
          <div className="text-[14px] font-semibold text-[#9CA3AF] text-center py-10">준비 중</div>
        </aside>
      )}

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-r-0 border-[#E8E6E0] rounded-l-lg px-1.5 py-4 text-[14px] font-semibold text-[#9CA3AF] hover:text-[#1A1A2E] hover:bg-[#F0EDE8] transition-colors shadow-sm"
          style={{ writingMode: 'vertical-rl' }}
        >
          ◀ 관심종목
        </button>
      )}
    </div>
  )
}
