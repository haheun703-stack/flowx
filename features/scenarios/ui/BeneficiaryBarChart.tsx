'use client'

import type { Beneficiary } from '../types'

/* ── 금액 포맷 ── */
function fmtBil(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`
  if (v >= 1) return `$${v.toFixed(0)}B`
  if (v > 0) return `$${(v * 1000).toFixed(0)}M`
  return '$0'
}

/* ── type 기반 색상 매핑 ── */
const TYPE_COLORS: Record<string, { bar: string; label: string }> = {
  방산: { bar: '#DC2626', label: '방산업체 시총 증가' },
  군수: { bar: '#DC2626', label: '방산업체 시총 증가' },
  defense: { bar: '#DC2626', label: '방산업체 시총 증가' },
  무기: { bar: '#F59E0B', label: '무기 판매/계약' },
  arms: { bar: '#F59E0B', label: '무기 판매/계약' },
  정치: { bar: '#6366F1', label: '트럼프 주변 인물' },
  트럼프: { bar: '#6366F1', label: '트럼프 주변 인물' },
  trump: { bar: '#6366F1', label: '트럼프 주변 인물' },
  석유: { bar: '#16A34A', label: '러시아 석유 수입 증가' },
  에너지: { bar: '#16A34A', label: '러시아 석유 수입 증가' },
  oil: { bar: '#16A34A', label: '러시아 석유 수입 증가' },
  russia: { bar: '#16A34A', label: '러시아 석유 수입 증가' },
  예산: { bar: '#F97316', label: '펜타곤 추가예산' },
  pentagon: { bar: '#F97316', label: '펜타곤 추가예산' },
}

const RANK_COLORS = ['#DC2626', '#F59E0B', '#F97316', '#6366F1', '#16A34A', '#9CA3AF']

function getColor(type: string, rank: number): string {
  const key = Object.keys(TYPE_COLORS).find(k => type.toLowerCase().includes(k))
  if (key) return TYPE_COLORS[key].bar
  return RANK_COLORS[Math.min(rank, RANK_COLORS.length - 1)]
}

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

/* ── 범례 추출 ── */
function getLegend(beneficiaries: Beneficiary[]): { color: string; label: string }[] {
  const seen = new Map<string, string>()
  beneficiaries.forEach((b, i) => {
    const color = getColor(b.type, i)
    if (!seen.has(color)) {
      const key = Object.keys(TYPE_COLORS).find(k => b.type.toLowerCase().includes(k))
      seen.set(color, key ? TYPE_COLORS[key].label : b.type)
    }
  })
  return Array.from(seen.entries()).map(([color, label]) => ({ color, label }))
}

const CHART_H = 220

/* ── 메인 컴포넌트 ── */
export default function BeneficiaryVerticalBarChart({ beneficiaries }: { beneficiaries: Beneficiary[] }) {
  if (!beneficiaries?.length) return null

  const sorted = [...beneficiaries].sort((a, b) => b.earned_bil - a.earned_bil)
  const maxEarned = Math.max(...sorted.map(b => b.earned_bil), 0.01)
  const ticks = getAxisTicks(maxEarned)
  const axisMax = ticks[ticks.length - 1] || maxEarned
  const legend = getLegend(sorted)

  const noStopCount = sorted
    .filter(b => b.earned_bil > 0)
    .slice(0, 3)
    .filter(b => !b.stop_condition || b.stop_condition === '없음' || b.stop_condition === '-')
    .length

  return (
    <div>
      <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-4">
        수혜자별 이익 (단위: 10억 달러, $B)
      </h3>

      {/* 세로 막대 차트 */}
      <div className="flex">
        {/* Y축 라벨 */}
        <div className="shrink-0 flex flex-col justify-between pr-2" style={{ height: CHART_H }}>
          {[...ticks].reverse().map((t) => (
            <span key={t} className="text-[9px] text-[#9CA3AF] tabular-nums text-right w-[40px] leading-none">
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
                className="absolute left-0 right-0 border-t border-[#E8E6E0]"
                style={{ bottom: `${bottomPct}%` }}
              />
            )
          })}

          {/* 막대들 */}
          <div className="absolute inset-0 flex items-end justify-around px-2 gap-1">
            {sorted.map((b, i) => {
              const heightPct = axisMax > 0 ? Math.max((b.earned_bil / axisMax) * 100, 1) : 1
              const color = getColor(b.type, i)

              return (
                <div
                  key={b.name}
                  className="flex flex-col items-center flex-1"
                  style={{ maxWidth: 64 }}
                >
                  {/* 금액 (막대 위) */}
                  <span
                    className="text-[10px] font-bold tabular-nums mb-0.5"
                    style={{ color }}
                  >
                    {fmtBil(b.earned_bil)}
                  </span>

                  {/* 막대 */}
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: color,
                      opacity: 0.85,
                      minHeight: 4,
                      transition: 'height 0.5s ease-out',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* X축 라벨 (카테고리명) */}
      <div className="flex ml-[48px]">
        <div className="flex-1 flex justify-around px-2 gap-1">
          {sorted.map((b) => (
            <div key={b.name} className="flex-1 text-center" style={{ maxWidth: 64 }}>
              <p className="text-[9px] font-bold text-[#1A1A2E] mt-1 truncate">{b.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-[#6B7280]">{l.label}</span>
          </div>
        ))}
      </div>

      {/* 핵심 인사이트 박스 */}
      {noStopCount >= 2 && (
        <div className="mt-4 rounded-lg p-3 text-center" style={{ backgroundColor: '#FEF2F2' }}>
          <p className="text-[12px] font-bold" style={{ color: '#991B1B' }}>
            전쟁을 끝낼 수 있는 자들이 전쟁에서 가장 큰 이익을 본다 → 전쟁 장기화 가능성 높음
          </p>
        </div>
      )}
    </div>
  )
}
