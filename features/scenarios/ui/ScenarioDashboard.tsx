'use client'

import { useEffect, useState } from 'react'
import type { ScenarioDashboard, DeepAnalysis } from '../types'
import HeroCard from './HeroCard'
import ScenarioStockCard from './ScenarioStockCard'
import LogicChainPanel from './LogicChainPanel'
import FanChartPanel from './FanChartPanel'
import CommodityIconGrid from './CommodityIconGrid'
import BeneficiaryVerticalBarChart from './BeneficiaryBarChart'
import KeyNumbersGrid from './KeyNumbersGrid'
import WarCostBarChart from './WarCostBarChart'
import StopConditionCards from './StopConditionCards'

// ─── 아코디언 공통 컴포넌트 ───

function Accordion({
  id,
  title,
  openSection,
  onToggle,
  children,
}: {
  id: string
  title: string
  openSection: string | null
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  const isOpen = openSection === id

  return (
    <div className="mb-1">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between rounded-lg px-4 py-3 transition-colors"
        style={{
          background: isOpen ? '#ECEAE4' : '#F5F4F0',
          cursor: 'pointer',
        }}
      >
        <span className="text-[13px] font-bold text-[#1A1A2E]">{title}</span>
        <span className="text-[11px] font-semibold text-[#00CC6A]">
          {isOpen ? '접기 ▲' : '펼치기 ▼'}
        </span>
      </button>

      {isOpen && (
        <div
          className="rounded-xl mt-1 p-4 overflow-hidden"
          style={{
            background: '#FFF',
            border: '1px solid #E8E6E0',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// ─── 메인 대시보드 ───

export default function ScenarioDashboardView() {
  const [data, setData] = useState<ScenarioDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [openSection, setOpenSection] = useState<string | null>(null)

  function toggleSection(id: string) {
    setOpenSection(openSection === id ? null : id)
  }

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/scenarios', { signal: controller.signal })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        if (!json || !json.market_status) {
          setData(null)
        } else {
          if (json.deep_analyses?.length) {
            json.deep_analyses = json.deep_analyses.map((da: Partial<DeepAnalysis>) => ({
              ...da,
              scenario_id: da.scenario_id ?? json.scenario_id ?? da.title ?? '',
              key_numbers: da.key_numbers ?? json.key_numbers ?? {},
              beneficiaries: da.beneficiaries ?? json.beneficiaries ?? [],
              oil_scenarios: da.oil_scenarios ?? json.oil_scenarios ?? [],
            }))
          }
          setData(json)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setData(null)
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-4">
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg" />)}
        </div>
        {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-200 rounded-lg" />)}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-[#9CA3AF]">시나리오 데이터가 아직 없습니다.</p>
        <p className="text-[#9CA3AF] text-sm mt-1">매일 장마감 후 업데이트됩니다.</p>
      </div>
    )
  }

  const firstScenario = data.active_scenarios?.[0]
  const firstAnalysis = data.deep_analyses?.[0]

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-4">

      {/* ═══ Row 1: 30초 요약 히어로 ═══ */}
      {firstScenario && (
        <section>
          <HeroCard scenario={firstScenario} analysis={firstAnalysis} />
        </section>
      )}

      {/* ═══ Row 2: 투자 유니버스 ═══ */}
      {(data.scenario_stocks?.length ?? 0) > 0 && (
        <section>
          <ScenarioStockCard stocks={data.scenario_stocks} />
        </section>
      )}

      {/* ═══ Row 3~9: 아코디언 섹션들 ═══ */}
      <div className="space-y-1">
        {/* Row 3: 보이지 않는 손의 논리 */}
        {firstScenario && (
          <Accordion id="logic" title="보이지 않는 손의 논리" openSection={openSection} onToggle={toggleSection}>
            <LogicChainPanel scenario={firstScenario} analysis={firstAnalysis} />
          </Accordion>
        )}

        {/* Row 4: 시나리오 전망 팬차트 */}
        {firstAnalysis?.oil_scenarios?.length ? (
          <Accordion id="fanchart" title="시나리오 전망 — 유가 팬차트" openSection={openSection} onToggle={toggleSection}>
            <FanChartPanel
              oilScenarios={firstAnalysis.oil_scenarios}
              keyNumbers={firstAnalysis.key_numbers}
            />
          </Accordion>
        ) : null}

        {/* Row 5: 원자재 원가갭 */}
        {data.commodities?.length > 0 && (
          <Accordion id="commodity" title="원자재 원가갭 — 지금 얼마나 올랐나?" openSection={openSection} onToggle={toggleSection}>
            <CommodityIconGrid commodities={data.commodities} />
          </Accordion>
        )}

        {/* Row 6: 수혜자별 이익 구조 */}
        {firstAnalysis?.beneficiaries?.length ? (
          <Accordion id="beneficiary" title="수혜자별 이익 구조 — 누가 돈을 벌고 있나?" openSection={openSection} onToggle={toggleSection}>
            <BeneficiaryVerticalBarChart beneficiaries={firstAnalysis.beneficiaries} />
          </Accordion>
        ) : null}

        {/* Row 7: 전쟁 비용/피해 */}
        {firstAnalysis?.key_numbers && Object.keys(firstAnalysis.key_numbers).length > 0 && (
          <Accordion id="warcost" title="전쟁 비용 / 피해 — 얼마를 쓰고 있나?" openSection={openSection} onToggle={toggleSection}>
            <WarCostBarChart keyNumbers={firstAnalysis.key_numbers} />
          </Accordion>
        )}

        {/* Row 8: 핵심 숫자 */}
        {firstAnalysis?.key_numbers && Object.keys(firstAnalysis.key_numbers).length > 0 && (
          <Accordion id="keynumbers" title="핵심 숫자 — 전쟁 전 vs 지금" openSection={openSection} onToggle={toggleSection}>
            <KeyNumbersGrid keyNumbers={firstAnalysis.key_numbers} />
          </Accordion>
        )}

        {/* Row 8: 멈출 조건 */}
        {firstAnalysis?.beneficiaries?.length ? (
          <Accordion id="stopconditions" title="멈출 조건" openSection={openSection} onToggle={toggleSection}>
            <StopConditionCards beneficiaries={firstAnalysis.beneficiaries} />
          </Accordion>
        ) : null}

        {/* Row 9: 다음 Phase 프리뷰 */}
        {firstScenario?.next_phase_name && (
          <Accordion id="nextphase" title="다음 Phase 프리뷰" openSection={openSection} onToggle={toggleSection}>
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-[#1A1A2E]">
                Phase {firstScenario.current_phase + 1}: {firstScenario.next_phase_name}
              </p>
              {firstScenario.next_hot?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {firstScenario.next_hot.map(s => (
                    <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#DC2626] border border-red-200">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-[#6B7280]">
                Phase 전환 시 관련 섹터와 종목이 자동으로 업데이트됩니다.
              </p>
            </div>
          </Accordion>
        )}
      </div>
    </div>
  )
}
