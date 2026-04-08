'use client'

import type { UsMarketDaily } from '../types'
import { YIELD_CURVE_ORDER } from '../types'

export function UsYieldCurvePanel({ data }: { data: UsMarketDaily }) {
  const yc = data.yield_curve
  if (!yc) return null

  const points = YIELD_CURVE_ORDER.map((k) => ({ label: k, value: yc[k] ?? null })).filter(
    (p) => p.value !== null
  ) as { label: string; value: number }[]

  if (points.length === 0) return null

  const min = Math.min(...points.map((p) => p.value))
  const max = Math.max(...points.map((p) => p.value))
  const range = max - min || 1

  // SVG 차트 영역
  const W = 600
  const H = 200
  const PAD_X = 40
  const PAD_Y = 20
  const chartW = W - PAD_X * 2
  const chartH = H - PAD_Y * 2

  const coords = points.map((p, i) => ({
    x: PAD_X + (i / (points.length - 1)) * chartW,
    y: PAD_Y + (1 - (p.value - min) / range) * chartH,
    ...p,
  }))

  // 역전 구간 감지 (현재 값이 이전보다 낮으면)
  const pathParts: string[] = []
  coords.forEach((c, i) => {
    pathParts.push(i === 0 ? `M${c.x},${c.y}` : `L${c.x},${c.y}`)
  })
  const pathD = pathParts.join(' ')

  // 역전 세그먼트 (값이 떨어지는 구간)
  const invertedSegments: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (let i = 1; i < coords.length; i++) {
    if (coords[i].value < coords[i - 1].value) {
      invertedSegments.push({
        x1: coords[i - 1].x, y1: coords[i - 1].y,
        x2: coords[i].x, y2: coords[i].y,
      })
    }
  }

  // Y축 눈금
  const yTicks = 5
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = min + (range / yTicks) * i
    return { val, y: PAD_Y + (1 - (val - min) / range) * chartH }
  })

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase">
          미국 국채 수익률 곡선
        </span>
        {invertedSegments.length > 0 && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-[#DC2626] border border-red-100">
            역전 감지
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
        {/* 그리드 */}
        {yLabels.map((yl, i) => (
          <g key={i}>
            <line x1={PAD_X} x2={W - PAD_X} y1={yl.y} y2={yl.y} stroke="#E8E6E0" strokeWidth="0.5" />
            <text x={PAD_X - 4} y={yl.y + 3} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="monospace">
              {yl.val.toFixed(2)}
            </text>
          </g>
        ))}

        {/* 정상 라인 */}
        <path d={pathD} fill="none" stroke="#16A34A" strokeWidth="2" />

        {/* 역전 구간 빨간선 */}
        {invertedSegments.map((seg, i) => (
          <line
            key={i}
            x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
            stroke="#DC2626" strokeWidth="2.5"
          />
        ))}

        {/* 점 + 라벨 */}
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="3.5" fill="white" stroke="#16A34A" strokeWidth="1.5" />
            <text x={c.x} y={H - 4} textAnchor="middle" fontSize="8" fill="#6B7280" fontFamily="monospace">
              {c.label}
            </text>
            <text x={c.x} y={c.y - 8} textAnchor="middle" fontSize="8" fill="#1A1A2E" fontFamily="monospace" fontWeight="600">
              {c.value.toFixed(2)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
