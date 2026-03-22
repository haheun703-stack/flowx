'use client'

import { useCostFloor, type CostFloorItem } from '../api/useMacroDashboard'

/* ── Gauge constants ── */
const CX = 100, CY = 100, R = 75, SW = 12

const ARCS = [
  { from: 180, to: 144, color: '#22c55e' },  // 바닥 (초록)
  { from: 144, to: 108, color: '#84cc16' },  // 양호 (연두)
  { from: 108, to: 72,  color: '#eab308' },  // 중립 (노랑)
  { from: 72,  to: 36,  color: '#f97316' },  // 주의 (주황)
  { from: 36,  to: 0,   color: '#ef4444' },  // 천장 (빨강)
]

const NAME_KO: Record<string, string> = {
  WTI: 'WTI유', Brent: '브렌트유', 'Natural Gas': '천연가스',
  Gold: '금', Silver: '은', Copper: '구리',
  Corn: '옥수수', Wheat: '밀', Soybean: '대두',
}

/** polar → cartesian (SVG y-down) */
function toXY(deg: number, r = R) {
  const rad = (deg * Math.PI) / 180
  return [CX + r * Math.cos(rad), CY - r * Math.sin(rad)] as const
}

/** SVG arc path (clockwise on screen = upper semicircle direction) */
function arcD(from: number, to: number) {
  const [x1, y1] = toXY(from)
  const [x2, y2] = toXY(to)
  const large = (from - to) > 180 ? 1 : 0
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

function posColor(pct: number) {
  if (pct >= 80) return '#ef4444'
  if (pct >= 60) return '#f97316'
  if (pct >= 40) return '#eab308'
  if (pct >= 20) return '#84cc16'
  return '#22c55e'
}

function GaugeCard({ item }: { item: CostFloorItem }) {
  const pct = Math.max(0, Math.min(100, item.position_pct ?? 0))
  const color = posColor(pct)
  const needleDeg = 180 - (pct * 180) / 100
  const [nx, ny] = toXY(needleDeg, R - SW / 2 - 8)
  const name = NAME_KO[item.name_ko] ?? item.name_ko
  const warn = pct >= 80 ? 'high' : pct <= 15 ? 'low' : null

  return (
    <div className="bg-gray-900 rounded-xl p-5 min-h-[200px] flex flex-col items-center gap-1">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-white">{name}</span>
        {item.unit && <span className="text-[10px] text-gray-500">{item.unit}</span>}
      </div>

      {/* SVG Gauge */}
      <svg viewBox="0 0 200 130" className="w-full max-w-[200px]">
        {/* Background arc */}
        <path d={arcD(180, 0.1)} fill="none" stroke="#1a2535" strokeWidth={SW + 2} strokeLinecap="round" />
        {/* Colored segments */}
        {ARCS.map((a, i) => (
          <path key={i} d={arcD(a.from, a.to)} fill="none" stroke={a.color} strokeWidth={SW} opacity={0.8} />
        ))}
        {/* Needle */}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        {/* Center dot */}
        <circle cx={CX} cy={CY} r={5} fill={color} />
        <circle cx={CX} cy={CY} r={2.5} fill="#0d1420" />
        {/* Current price */}
        <text x={CX} y={CY - 24} textAnchor="middle" fill="#e2e8f0" fontSize="15" fontWeight="bold"
          style={{ fontVariantNumeric: 'tabular-nums' }}>
          {item.current_price?.toLocaleString() ?? '—'}
        </text>
        {/* Position % */}
        <text x={CX} y={CY - 10} textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">
          {pct.toFixed(0)}%
        </text>
        {/* Floor label (left) */}
        <text x={CX - R} y={CY + 15} textAnchor="start" fill="#555" fontSize="9">
          {item.floor_name ?? '바닥'}
        </text>
        <text x={CX - R} y={CY + 27} textAnchor="start" fill="#666" fontSize="10" fontWeight="bold"
          style={{ fontVariantNumeric: 'tabular-nums' }}>
          {item.floor_price.toLocaleString()}
        </text>
        {/* Ceiling label (right) */}
        <text x={CX + R} y={CY + 15} textAnchor="end" fill="#555" fontSize="9">
          {item.ceiling_name ?? '천장'}
        </text>
        <text x={CX + R} y={CY + 27} textAnchor="end" fill="#666" fontSize="10" fontWeight="bold"
          style={{ fontVariantNumeric: 'tabular-nums' }}>
          {item.ceiling_price.toLocaleString()}
        </text>
      </svg>

      {/* Warning badge */}
      {warn === 'high' && (
        <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full animate-pulse">
          천장 근접
        </span>
      )}
      {warn === 'low' && (
        <span className="text-[10px] font-bold text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full">
          바닥 근접
        </span>
      )}
    </div>
  )
}

export function CostFloorGauge() {
  const { data, isLoading } = useCostFloor()
  const items = data?.items ?? []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 bg-[#0a0f18] border border-[#2a2a3a] rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⏱️</span>
        <span className="text-base font-bold text-[#e2e8f0]">원가 바닥 / 천장 게이지</span>
        <span className="text-xs text-[#555] ml-auto">🟢바닥(매수기회) → 🔴천장(과열)</span>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-[#334155] text-sm">
          원가 데이터 없음
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => <GaugeCard key={item.symbol} item={item} />)}
        </div>
      )}
    </div>
  )
}
