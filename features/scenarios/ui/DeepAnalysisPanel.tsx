'use client'

import { useState } from 'react'
import type { DeepAnalysis } from '../types'

function fmtBil(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`
  if (v >= 1) return `$${v.toFixed(1)}B`
  if (v > 0) return `$${(v * 1000).toFixed(0)}M`
  return '$0'
}

function BeneficiaryTable({ beneficiaries }: { beneficiaries: DeepAnalysis['beneficiaries'] }) {
  if (!beneficiaries?.length) return null
  return (
    <div>
      <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">수혜자별 이익 구조</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">수혜자</th>
              <th className="text-right py-2 px-3 text-[var(--text-muted)] font-medium">이익</th>
              <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">유형</th>
              <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">멈출 조건</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map((b) => (
              <tr key={b.name} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-[var(--text-primary)]">{b.name}</td>
                <td className="py-2 px-3 text-right font-bold text-[#dc2626] tabular-nums">
                  {fmtBil(b.earned_bil)}
                </td>
                <td className="py-2 px-3 text-[var(--text-dim)]">{b.type}</td>
                <td className="py-2 px-3 text-[var(--text-dim)] text-xs">{b.stop_condition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OilScenarioTable({ scenarios }: { scenarios: DeepAnalysis['oil_scenarios'] }) {
  if (!scenarios?.length) return null
  return (
    <div>
      <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">유가 시나리오 전망</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {scenarios.map((s) => {
          const isHigh = s.probability >= 40
          const isMid = s.probability >= 20 && s.probability < 40
          return (
            <div
              key={s.name}
              className={`rounded-lg p-3 border ${
                isHigh
                  ? 'bg-red-50 border-red-200'
                  : isMid
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-[var(--border)]'
              }`}
            >
              <p className="text-xs text-[var(--text-dim)] mb-1">{s.name}</p>
              <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
                {s.probability}%
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                <span>Q2 ${s.wti_q2}</span>
                <span>→</span>
                <span>Q4 ${s.wti_q4}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KeyNumbers({ numbers }: { numbers: Record<string, number> }) {
  if (!numbers || Object.keys(numbers).length === 0) return null

  const LABEL: Record<string, string> = {
    wti_pre_war: 'WTI 전쟁 전',
    wti_current: 'WTI 현재',
    wti_peak: 'WTI 최고',
    wti_change_pct: 'WTI 변동',
    lpg_asia_change_pct: 'LPG 아시아',
    lpg_europe_change_pct: 'LPG 유럽',
    defense_market_cap_increase_bil: '방산 시총 증가',
    arms_contracts_bil: '무기계약',
    pentagon_budget_request_bil: '펜타곤 예산',
    russia_extra_oil_income_annual_bil: '러시아 추가수입',
    trump_network_deals_bil: '트럼프 딜',
    total_war_cost_bil_low: '전비 (하단)',
    total_war_cost_bil_high: '전비 (상단)',
    trump_approval_pct: '트럼프 지지율',
    americans_unwilling_high_gas_pct: '고유가 반대',
  }

  const FMT: Record<string, (v: number) => string> = {
    wti_pre_war: (v) => `$${v}`,
    wti_current: (v) => `$${v}`,
    wti_peak: (v) => `$${v}`,
    wti_change_pct: (v) => `+${v}%`,
    lpg_asia_change_pct: (v) => `+${v}%`,
    lpg_europe_change_pct: (v) => `+${v}%`,
    trump_approval_pct: (v) => `${v}%`,
    americans_unwilling_high_gas_pct: (v) => `${v}%`,
  }

  const entries = Object.entries(numbers)
    .filter(([k]) => LABEL[k])
    .map(([k, v]) => ({
      key: k,
      label: LABEL[k] ?? k,
      value: FMT[k] ? FMT[k](v) : (k.includes('bil') ? fmtBil(v) : String(v)),
    }))

  return (
    <div>
      <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">핵심 숫자</h4>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {entries.map((e) => (
          <div key={e.key} className="bg-gray-50 rounded p-2 text-center">
            <p className="text-xs text-[var(--text-muted)]">{e.label}</p>
            <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{e.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartViewer({ charts }: { charts: Record<string, string> }) {
  const [open, setOpen] = useState<string | null>(null)
  const entries = Object.entries(charts)
  if (!entries.length) return null

  const CHART_LABEL: Record<string, string> = {
    wti_crude_oil_price_trajectory_2026: 'WTI 가격 추이',
    lpg_propane_price_impact_2026: 'LPG 가격 영향',
    oil_price_scenario_forecast_2026: '유가 시나리오 전망',
    iran_war_profit_tracker_by_beneficiary: '수혜자별 이익 추적',
    war_stop_condition_analysis: '멈출 조건 분석',
  }

  // CSS 변수 폴백 (iframe 내부에서는 부모 CSS 변수 접근 불가)
  const cssVarFallback = `<style>
:root {
  --color-background-secondary: #f8fafc;
  --color-text-secondary: #64748b;
  --color-text-danger: #dc2626;
  --color-text-success: #16a34a;
  --border-radius-md: 8px;
}
body { margin: 0; padding: 8px; font-family: 'Noto Sans KR', sans-serif; background: #fff; }
</style>`

  return (
    <div>
      <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">인터랙티브 도표</h4>
      <div className="space-y-2">
        {entries.map(([name, html]) => (
          <div key={name} className="border border-[var(--border)] rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === name ? null : name)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {CHART_LABEL[name] ?? name}
              </span>
              <span className="text-[var(--text-muted)] text-xs">
                {open === name ? '접기' : '펼치기'}
              </span>
            </button>
            {open === name && (
              <iframe
                srcDoc={cssVarFallback + html}
                title={CHART_LABEL[name] ?? name}
                className="w-full border-none bg-white"
                style={{ minHeight: 480 }}
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DeepAnalysisPanel({ analyses }: { analyses: DeepAnalysis[] }) {
  if (!analyses?.length) return null

  return (
    <div className="space-y-6">
      {analyses.map((da) => (
        <div key={da.scenario_id} className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--border)]/50">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-[#dc2626] font-bold border border-red-200">
                DEEP
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">{da.title}</h3>
            </div>
            {da.updated && (
              <p className="text-xs text-[var(--text-muted)] mt-1">업데이트: {da.updated}</p>
            )}
          </div>

          {/* Content */}
          <div className="px-5 py-4 space-y-5">
            {/* Summary */}
            {da.summary && (
              <p className="text-sm text-[var(--text-primary)] leading-relaxed bg-gray-50 rounded-lg p-3 border-l-4 border-[#dc2626]">
                {da.summary}
              </p>
            )}

            {/* Key Numbers */}
            <KeyNumbers numbers={da.key_numbers} />

            {/* Beneficiaries */}
            <BeneficiaryTable beneficiaries={da.beneficiaries} />

            {/* Oil Scenarios */}
            <OilScenarioTable scenarios={da.oil_scenarios} />

            {/* Charts */}
            <ChartViewer charts={da.charts_html} />
          </div>
        </div>
      ))}
    </div>
  )
}
