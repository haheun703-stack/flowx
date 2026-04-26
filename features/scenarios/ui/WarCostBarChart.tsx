'use client'

/* ── 금액 포맷 ── */
function fmtBil(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`
  if (v >= 1) return `$${v.toFixed(0)}B`
  if (v > 0) return `$${(v * 1000).toFixed(0)}M`
  return '$0'
}

/* ── key_numbers → 전쟁 비용/피해 항목 매핑 ── */
interface CostItem {
  key: string
  label: string
  color: string
  legendGroup: string
}

const COST_ITEMS: CostItem[] = [
  { key: 'total_war_cost_bil_high', label: '미국 전쟁\n직접비용', color: '#DC2626', legendGroup: '미국 전쟁 비용' },
  { key: 'gulf_infra_damage_bil', label: '걸프국 에너지\n인프라 피해', color: '#F59E0B', legendGroup: '걸프국 에너지 손실' },
  { key: 'global_gdp_loss_bil', label: '글로벌 GDP\n손실 추정', color: '#6366F1', legendGroup: '글로벌 경제 피해' },
  { key: 'iran_damage_bil', label: '이란 피해\n(추정)', color: '#EF4444', legendGroup: '미국 전쟁 비용' },
  { key: 'us_consumer_fuel_cost_annual_bil', label: '미국 소비자\n유류비 증가', color: '#F97316', legendGroup: '미국 전쟁 비용' },
]

/* ── Y축 눈금 계산 ── */
function getAxisTicks(maxVal: number): number[] {
  if (maxVal <= 0) return [0]
  const raw = maxVal / 4
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const nice = [1, 2, 5, 10].find(n => n * mag >= raw) ?? 10
  const step = nice * mag
  const ticks: number[] = []
  for (let v = 0; v <= maxVal * 1.15; v += step) {
    ticks.push(Math.round(v))
  }
  return ticks
}

const CHART_H = 260

export default function WarCostBarChart({ keyNumbers }: { keyNumbers: Record<string, number> }) {
  if (!keyNumbers) return null

  // 데이터가 있는 항목만 필터
  const items = COST_ITEMS
    .filter(ci => keyNumbers[ci.key] != null && keyNumbers[ci.key] > 0)
    .map(ci => ({
      ...ci,
      value: keyNumbers[ci.key],
    }))

  if (items.length === 0) return null

  const maxVal = Math.max(...items.map(i => i.value), 0.01)
  const ticks = getAxisTicks(maxVal)
  const axisMax = ticks[ticks.length - 1] || maxVal

  // 범례 (중복 제거)
  const legendSeen = new Map<string, string>()
  items.forEach(i => {
    if (!legendSeen.has(i.legendGroup)) legendSeen.set(i.legendGroup, i.color)
  })
  const legend = Array.from(legendSeen.entries()).map(([label, color]) => ({ label, color }))

  return (
    <div>
      <h3 className="text-[17px] font-bold text-[#1A1A2E] mb-5">
        전쟁 비용 / 피해 (단위: 10억 달러, $B)
      </h3>

      {/* 세로 막대 차트 */}
      <div className="flex">
        {/* Y축 라벨 */}
        <div className="shrink-0 flex flex-col justify-between pr-2" style={{ height: CHART_H }}>
          {[...ticks].reverse().map((t) => (
            <span key={t} className="text-[11px] text-[#9CA3AF] font-bold tabular-nums text-right w-[48px] leading-none">
              {fmtBil(t)}
            </span>
          ))}
        </div>

        {/* 차트 영역 */}
        <div className="flex-1 relative" style={{ height: CHART_H }}>
          {/* 그리드 라인 */}
          {ticks.map((t) => {
            const bottomPct = axisMax > 0 ? (t / axisMax) * 100 : 0
            return (
              <div
                key={t}
                className="absolute left-0 right-0 border-t border-[#E2E5EA]"
                style={{ bottom: `${bottomPct}%` }}
              />
            )
          })}

          {/* 막대들 — 픽셀 기반 높이 (% 해소 안 되는 버그 수정) */}
          <div className="absolute inset-0 flex items-end justify-around px-3 gap-2">
            {items.map((item) => {
              const barPx = axisMax > 0 ? Math.max((item.value / axisMax) * CHART_H, 6) : 6

              return (
                <div
                  key={item.key}
                  className="flex flex-col items-center flex-1"
                  style={{ maxWidth: 80 }}
                >
                  {/* 금액 (막대 위) */}
                  <span
                    className="text-[13px] font-bold tabular-nums mb-1"
                    style={{ color: item.color }}
                  >
                    {fmtBil(item.value)}
                  </span>

                  {/* 막대 */}
                  <div
                    className="w-full rounded-t-lg"
                    style={{
                      height: barPx,
                      backgroundColor: item.color,
                      opacity: 0.85,
                      transition: 'height 0.5s ease-out',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* X축 라벨 */}
      <div className="flex ml-[56px]">
        <div className="flex-1 flex justify-around px-3 gap-2">
          {items.map((item) => (
            <div key={item.key} className="flex-1 text-center" style={{ maxWidth: 80 }}>
              <p className="text-[11px] font-bold text-[#1A1A2E] mt-1.5 whitespace-pre-line leading-tight">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-5">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-[12px] font-medium text-[#6B7280]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
