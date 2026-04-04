'use client'

function fmtBil(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`
  if (v >= 1) return `$${v.toFixed(1)}B`
  if (v > 0) return `$${(v * 1000).toFixed(0)}M`
  return '$0'
}

const KEY_MAP: Record<string, { label: string; fmt: (v: number) => string; strengthens?: boolean }> = {
  wti_pre_war: { label: 'WTI 전쟁 전', fmt: v => `$${v}` },
  wti_current: { label: 'WTI 현재', fmt: v => `$${v}`, strengthens: true },
  wti_peak: { label: 'WTI 최고', fmt: v => `$${v}` },
  wti_change_pct: { label: 'WTI 변동', fmt: v => `+${v}%`, strengthens: true },
  lpg_asia_change_pct: { label: 'LPG 아시아', fmt: v => `+${v}%`, strengthens: true },
  lpg_europe_change_pct: { label: 'LPG 유럽', fmt: v => `+${v}%`, strengthens: true },
  defense_market_cap_increase_bil: { label: '방산 시총 증가', fmt: fmtBil, strengthens: true },
  arms_contracts_bil: { label: '무기계약', fmt: fmtBil, strengthens: true },
  pentagon_budget_request_bil: { label: '펜타곤 예산', fmt: fmtBil },
  russia_extra_oil_income_annual_bil: { label: '러시아 추가수입', fmt: fmtBil, strengthens: true },
  trump_network_deals_bil: { label: '트럼프 딜', fmt: fmtBil },
  total_war_cost_bil_low: { label: '전비 (하단)', fmt: fmtBil },
  total_war_cost_bil_high: { label: '전비 (상단)', fmt: fmtBil },
  trump_approval_pct: { label: '트럼프 지지율', fmt: v => `${v}%` },
  americans_unwilling_high_gas_pct: { label: '고유가 반대', fmt: v => `${v}%` },
}

// 변동률 표시용 사전 정의 (전쟁 전 기준)
const BASELINE: Record<string, number> = {
  wti_current: 60,
  wti_change_pct: 0,
  lpg_asia_change_pct: 0,
  lpg_europe_change_pct: 0,
}

function formatChange(current: number, baseline: number, strengthens?: boolean): { text: string; color: string } | null {
  if (baseline === 0 || baseline === current) return null
  const diff = current - baseline
  const pct = ((diff / Math.abs(baseline)) * 100).toFixed(1)
  if (diff > 0) {
    return {
      text: `+${pct}% ↑`,
      color: strengthens ? '#DC2626' : '#16A34A',
    }
  }
  return {
    text: `${pct}% ↓`,
    color: strengthens ? '#16A34A' : '#DC2626',
  }
}

export default function KeyNumbersGrid({ keyNumbers }: { keyNumbers: Record<string, number> }) {
  if (!keyNumbers || Object.keys(keyNumbers).length === 0) return null

  const entries = Object.entries(keyNumbers)
    .filter(([k]) => KEY_MAP[k])
    .map(([k, v]) => {
      const meta = KEY_MAP[k]
      const baseline = BASELINE[k]
      const change = baseline != null ? formatChange(v, baseline, meta.strengthens) : null
      return {
        key: k,
        label: meta.label,
        value: meta.fmt(v),
        change,
      }
    })

  return (
    <div>
      <h3 className="text-[17px] font-black text-[#1A1A2E] mb-4">
        핵심 숫자 — 전쟁 전 vs 지금
      </h3>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
        {entries.map(e => (
          <div key={e.key} className="rounded-lg p-2.5 text-center" style={{ backgroundColor: '#F5F4F0' }}>
            <p className="text-[11px] text-[#6B7280] font-bold">{e.label}</p>
            <p className="text-[17px] font-black text-[#1A1A2E] tabular-nums">{e.value}</p>
            {e.change && (
              <p className="text-[11px] font-bold" style={{ color: e.change.color }}>
                {e.change.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
