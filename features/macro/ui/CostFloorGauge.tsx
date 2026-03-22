'use client'

import { useCostFloor, type CostFloorItem } from '../api/useMacroDashboard'

/** 위치% → 색상 */
function getPositionColor(pct: number): string {
  if (pct >= 80) return '#ef4444' // 천장 근접 → 빨강 (과열)
  if (pct >= 60) return '#f97316' // 주의
  if (pct >= 40) return '#eab308' // 중립
  if (pct >= 20) return '#84cc16' // 양호
  return '#22c55e' // 바닥 근접 → 초록 (매수 기회)
}

function getPositionLabel(pct: number): string {
  if (pct >= 80) return '천장 근접'
  if (pct >= 60) return '상단'
  if (pct >= 40) return '중간'
  if (pct >= 20) return '하단'
  return '바닥 근접'
}

/** 불릿 차트 한 줄 */
function BulletRow({ item }: { item: CostFloorItem }) {
  const pct = item.position_pct ?? 0
  const color = getPositionColor(pct)
  const label = getPositionLabel(pct)

  return (
    <div className="py-2 px-1">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#e2e8f0]">{item.name_ko}</span>
          <span className="text-[10px] text-[#555]">{item.unit}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.current_price !== null && (
            <span className="text-sm font-bold text-[#e2e8f0] tabular-nums">
              {item.current_price.toLocaleString()}
            </span>
          )}
          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color, backgroundColor: color + '15' }}>
            {label} {pct.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* 불릿 차트 바 */}
      <div className="relative h-5 bg-[#1a2535] rounded-full overflow-hidden">
        {/* 배경 구간: 바닥~천장 */}
        <div className="absolute inset-0 flex">
          <div className="h-full bg-[#22c55e]/8" style={{ width: '20%' }} />
          <div className="h-full bg-[#84cc16]/8" style={{ width: '20%' }} />
          <div className="h-full bg-[#eab308]/8" style={{ width: '20%' }} />
          <div className="h-full bg-[#f97316]/8" style={{ width: '20%' }} />
          <div className="h-full bg-[#ef4444]/8" style={{ width: '20%' }} />
        </div>

        {/* 현재 위치 마커 */}
        <div
          className="absolute top-0 h-full w-1 rounded-full transition-all duration-500"
          style={{ left: `${Math.min(Math.max(pct, 1), 99)}%`, backgroundColor: color }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-500"
          style={{
            left: `calc(${Math.min(Math.max(pct, 2), 98)}% - 6px)`,
            backgroundColor: color,
            borderColor: '#080b10',
          }}
        />

        {/* 바닥/천장 라벨 */}
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-[#555]">
          {item.floor_price.toLocaleString()}
        </span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-[#555]">
          {item.ceiling_price.toLocaleString()}
        </span>
      </div>

      {/* 메모 */}
      {item.note && (
        <div className="text-[10px] text-[#555] mt-0.5 truncate">{item.note}</div>
      )}
    </div>
  )
}

export function CostFloorGauge() {
  const { data, isLoading } = useCostFloor()
  const items = data?.items ?? []

  if (isLoading) {
    return <div className="h-64 bg-[#0a0f18] border border-[#2a2a3a] rounded-lg animate-pulse" />
  }

  return (
    <div className="bg-[#0a0f18] border border-[#2a2a3a] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📏</span>
        <span className="text-sm font-bold text-[#e2e8f0]">원가 바닥 / 천장 게이지</span>
        <span className="text-[10px] text-[#555] ml-auto">
          🟢바닥(매수기회) → 🔴천장(과열)
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-[#334155] text-sm">
          원가 데이터 없음 — current_price 업데이트 필요
        </div>
      ) : (
        <div className="divide-y divide-[#2a2a3a]/30">
          {items.map(item => <BulletRow key={item.symbol} item={item} />)}
        </div>
      )}
    </div>
  )
}
