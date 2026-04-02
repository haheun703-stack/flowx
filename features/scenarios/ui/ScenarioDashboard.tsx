'use client'

import { useEffect, useState } from 'react'
import type { ScenarioDashboard, DeepAnalysis } from '../types'
import MarketStatusBar from './MarketStatusBar'
import ScenarioCard from './ScenarioCard'
import LogicChainPanel from './LogicChainPanel'
import FanChartPanel from './FanChartPanel'
import DeepAnalysisPanel from './DeepAnalysisPanel'
import CommodityTable from './CommodityTable'
import ScenarioStockCard from './ScenarioStockCard'
import ScenarioETFMap from './ScenarioETFMap'
import StopConditionCards from './StopConditionCards'
import ScenarioGuide from './ScenarioGuide'

export default function ScenarioDashboardView() {
  const [data, setData] = useState<ScenarioDashboard | null>(null)
  const [loading, setLoading] = useState(true)

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
          // 퀀트봇이 key_numbers/beneficiaries/oil_scenarios/scenario_id를
          // deep_analyses 안이 아닌 최상위에 넣는 경우 병합
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
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="h-48 bg-gray-200 rounded-lg" />
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-[var(--text-muted)]">시나리오 데이터가 아직 없습니다.</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">매일 장마감 후 업데이트됩니다.</p>
      </div>
    )
  }

  // 첫 번째 시나리오 + 첫 번째 심층 분석 (Logic Chain, Fan Chart, Stop Conditions에 사용)
  const firstScenario = data.active_scenarios?.[0]
  const firstAnalysis = data.deep_analyses?.[0]

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">
      {/* 1. 시장 상태 */}
      <section>
        <MarketStatusBar status={data.market_status} />
      </section>

      {/* 2. 활성 시나리오 (헤더 + Phase 프로그레스 바) */}
      <section>
        <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">활성 시나리오</h2>
        <ScenarioCard scenarios={data.active_scenarios} conflicts={data.conflicts} />
      </section>

      {/* 3. 보이지 않는 손의 논리 (Logic Chain) */}
      {firstScenario && (
        <section>
          <LogicChainPanel scenario={firstScenario} analysis={firstAnalysis} />
        </section>
      )}

      {/* 4. 시나리오 전망 팬 차트 */}
      {firstAnalysis?.oil_scenarios?.length ? (
        <section>
          <FanChartPanel
            oilScenarios={firstAnalysis.oil_scenarios}
            keyNumbers={firstAnalysis.key_numbers}
          />
        </section>
      ) : null}

      {/* 5. 심층 분석 (수혜자 바 차트 포함) */}
      {(data.deep_analyses?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">심층 분석</h2>
          <DeepAnalysisPanel analyses={data.deep_analyses!} />
        </section>
      )}

      {/* 6. 원자재 온도 게이지 */}
      <section>
        <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">원자재 원가갭 분석</h2>
        <CommodityTable commodities={data.commodities} />
      </section>

      {/* 7. 시나리오 연동 종목 (색상 라인) */}
      {(data.scenario_stocks?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">투자 유니버스</h2>
          <ScenarioStockCard stocks={data.scenario_stocks} />
        </section>
      )}

      {/* 8. ETF 매핑 */}
      {(data.etf_map?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">시나리오별 ETF 매핑</h2>
          <ScenarioETFMap etfMap={data.etf_map} />
        </section>
      )}

      {/* 9. 멈출 조건 카드 */}
      {firstAnalysis?.beneficiaries?.length ? (
        <section>
          <StopConditionCards beneficiaries={firstAnalysis.beneficiaries} />
        </section>
      ) : null}

      {/* 10. 초보자 가이드 */}
      <section>
        <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">초보자 가이드</h2>
        <ScenarioGuide />
      </section>
    </div>
  )
}
