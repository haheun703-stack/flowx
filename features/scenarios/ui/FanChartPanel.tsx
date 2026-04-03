'use client'

import type { OilScenario } from '../types'

// ─── 시나리오 전망 팬 차트 (스펙 §3) ───
// SVG: X축=시간, Y축=가격, 현재 지점에서 4개 분기선

interface FanChartProps {
  oilScenarios: OilScenario[]
  keyNumbers: Record<string, number>
}

const W = 600
const H = 320
const PAD = { top: 36, right: 160, bottom: 50, left: 70 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom

// 색상: 확률 높은 순 빨강→주황→파랑→회색
const BRANCH_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#9CA3AF']

function sortByProbDesc(scenarios: OilScenario[]) {
  return [...scenarios].sort((a, b) => {
    const avgA = (a.wti_q2 + a.wti_q4) / 2
    const avgB = (b.wti_q2 + b.wti_q4) / 2
    return avgB - avgA
  })
}

function getActionLabel(scenario: OilScenario, rank: number): string {
  const avgPrice = (scenario.wti_q2 + scenario.wti_q4) / 2
  if (avgPrice >= 120) return '인버스 전환 필요'
  if (rank === 0 && avgPrice >= 100) return '포지션 확대'
  if (scenario.probability >= 40) return '현 포지션 유지'
  if (avgPrice <= 70) return '포지션 축소'
  return '모니터링'
}

export default function FanChartPanel({ oilScenarios, keyNumbers }: FanChartProps) {
  if (!oilScenarios?.length) return null

  const preWar = keyNumbers?.wti_pre_war ?? 60
  const current = keyNumbers?.wti_current ?? 103

  // Y축 범위 자동 계산
  const allPrices = [preWar, current, ...oilScenarios.flatMap(s => [s.wti_q2, s.wti_q4])]
  const yMin = Math.floor(Math.min(...allPrices) / 10) * 10 - 10
  const yMax = Math.ceil(Math.max(...allPrices) / 10) * 10 + 10

  const sorted = sortByProbDesc(oilScenarios)

  // 좌표 변환
  const xScale = (idx: number) => PAD.left + (idx / 3) * CHART_W  // 0=전쟁전, 1=현재, 2=Q2, 3=Q4
  const yScale = (price: number) => PAD.top + CHART_H - ((price - yMin) / (yMax - yMin)) * CHART_H

  // Y축 눈금
  const yTicks: number[] = []
  for (let v = yMin; v <= yMax; v += 20) yTicks.push(v)

  // X축 라벨
  const xLabels = ['전쟁 전', '현재', 'Q2 전망', 'Q4 전망']

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 360 }}>
        {/* 그리드 */}
        {yTicks.map(v => (
          <g key={v}>
            <line
              x1={PAD.left} y1={yScale(v)}
              x2={W - PAD.right} y2={yScale(v)}
              stroke="#E5E7EB" strokeWidth={1}
            />
            <text x={PAD.left - 8} y={yScale(v) + 3} textAnchor="end" fontSize={18} fill="#9CA3AF">
              ${v}
            </text>
          </g>
        ))}

        {/* X축 라벨 */}
        {xLabels.map((label, i) => (
          <text
            key={label}
            x={xScale(i)} y={H - 8}
            textAnchor="middle" fontSize={18} fill="#6B7280"
          >
            {label}
          </text>
        ))}

        {/* 원가 라인 (하방 지지선) + 강조 rect */}
        <rect
          x={PAD.left} y={yScale(preWar) - 8}
          width={CHART_W} height={16}
          fill="#dc2626" opacity={0.08} rx={3}
        />
        <line
          x1={PAD.left} y1={yScale(preWar)}
          x2={W - PAD.right} y2={yScale(preWar)}
          stroke="#dc2626" strokeWidth={1.5} strokeDasharray="6 3"
        />
        <rect
          x={W - PAD.right + 2} y={yScale(preWar) - 10}
          width={52} height={28} rx={4}
          fill="#dc2626" opacity={0.1}
        />
        <text
          x={W - PAD.right + 6} y={yScale(preWar) + 3}
          fontSize={16} fontWeight={700} fill="#dc2626"
        >
          원가 ${preWar}
        </text>
        <text
          x={W - PAD.right + 6} y={yScale(preWar) + 14}
          fontSize={16} fontWeight={800} fill="#dc2626"
        >
          하방 없음!
        </text>

        {/* 실선: 전쟁 전 → 현재 */}
        <line
          x1={xScale(0)} y1={yScale(preWar)}
          x2={xScale(1)} y2={yScale(current)}
          stroke="#1A1A2E" strokeWidth={2.5}
        />

        {/* 분기 점선들 */}
        {sorted.map((sc, i) => {
          const color = BRANCH_COLORS[i] ?? '#9CA3AF'
          const pathD = `M ${xScale(1)} ${yScale(current)} L ${xScale(2)} ${yScale(sc.wti_q2)} L ${xScale(3)} ${yScale(sc.wti_q4)}`

          return (
            <g key={sc.name}>
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              {/* 끝점 원 */}
              <circle cx={xScale(3)} cy={yScale(sc.wti_q4)} r={3} fill={color} />
              {/* 라벨 */}
              <text
                x={xScale(3) + 8} y={yScale(sc.wti_q4) + 3}
                fontSize={16} fontWeight={600} fill={color}
              >
                {sc.name}
              </text>
              <text
                x={xScale(3) + 8} y={yScale(sc.wti_q4) + 13}
                fontSize={14} fill={color}
              >
                {sc.probability}%
              </text>
              {/* 액션 라벨 */}
              <text
                x={xScale(3) + 8} y={yScale(sc.wti_q4) + 23}
                fontSize={14} fontWeight={600} fill={i === 0 ? '#DC2626' : '#6B7280'}
              >
                → {getActionLabel(sc, i)}
              </text>
            </g>
          )
        })}

        {/* 현재가 마커 */}
        <circle cx={xScale(1)} cy={yScale(current)} r={5} fill="#dc2626" />
        <text
          x={xScale(1)} y={yScale(current) - 10}
          textAnchor="middle" fontSize={18} fontWeight={700} fill="#dc2626"
        >
          현재 ${current}
        </text>

        {/* 전쟁 전 마커 */}
        <circle cx={xScale(0)} cy={yScale(preWar)} r={3} fill="#6B7280" />
      </svg>

      {/* 하단 범례 */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {sorted.map((sc, i) => (
          <div key={sc.name} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: BRANCH_COLORS[i] ?? '#9CA3AF' }} />
            <span className="text-[20px] text-[var(--text-muted)]">{sc.name} ({sc.probability}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
