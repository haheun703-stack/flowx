'use client'

import type { CommodityInfo } from '../types'

// ─── 원자재 온도 게이지 (스펙 §5) ───
// 세로 온도계: 높이로 "어디까지 올라왔는지" 시각적 표현

const ZONE_LABEL: Record<string, { label: string; color: string }> = {
  buy: { label: '매수구간', color: '#16a34a' },
  watch: { label: '관찰', color: '#F59E0B' },
  hold: { label: '보유', color: '#EA580C' },
  overheated: { label: '과열', color: '#dc2626' },
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function Thermometer({ commodity }: { commodity: CommodityInfo }) {
  const BAR_H = 100
  // gap_pct를 0~200 범위로 정규화하여 높이 계산
  const fillPct = clamp(commodity.gap_pct / 200 * 100, 2, 98)
  const zone = ZONE_LABEL[commodity.zone] ?? { label: commodity.zone, color: '#6B7280' }

  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      {/* 원자재명 */}
      <p className="text-xs font-bold text-[var(--text-primary)] text-center truncate w-full">
        {commodity.name}
      </p>

      {/* 온도계 */}
      <div className="relative" style={{ width: 24, height: BAR_H }}>
        {/* 배경 그라데이션 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(0deg, #2563EB 0%, #F59E0B 50%, #EF4444 100%)',
            opacity: 0.15,
          }}
        />
        {/* 채워진 부분 */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-b-full"
          style={{
            height: `${fillPct}%`,
            background: 'linear-gradient(0deg, #2563EB 0%, #F59E0B 50%, #EF4444 100%)',
            borderRadius: fillPct >= 98 ? 12 : undefined,
            borderTopLeftRadius: fillPct >= 98 ? 12 : 0,
            borderTopRightRadius: fillPct >= 98 ? 12 : 0,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        />
        {/* 현재 위치 마커 */}
        <div
          className="absolute left-[26px]"
          style={{ bottom: `${fillPct}%`, transform: 'translateY(50%)' }}
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-[3px] bg-[#1A1A2E]" />
            <span className="text-[8px] font-bold text-[#1A1A2E] whitespace-nowrap">
              {commodity.gap_pct.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* 현재가 */}
      <p className="text-[10px] text-[var(--text-primary)] font-mono tabular-nums">
        {commodity.price.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        <span className="text-[var(--text-muted)] ml-0.5">{commodity.unit}</span>
      </p>

      {/* zone 뱃지 */}
      <span
        className="text-[9px] font-bold px-2 py-0.5 rounded-full"
        style={{ color: zone.color, backgroundColor: `${zone.color}15`, border: `1px solid ${zone.color}30` }}
      >
        {zone.label}
      </span>
    </div>
  )
}

export default function CommodityTable({ commodities }: { commodities: CommodityInfo[] }) {
  if (!commodities.length) {
    return <p className="text-[var(--text-muted)] text-sm">원자재 데이터가 없습니다.</p>
  }

  return (
    <div>
      {/* 온도계 그리드 */}
      <div className="flex flex-wrap justify-center gap-6 py-4">
        {commodities.map((c) => (
          <Thermometer key={c.key} commodity={c} />
        ))}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center text-xs text-[var(--text-muted)]">
        <span><span className="text-[#16a34a]">{'\u25CF'}</span> 매수구간 (&lt;20%)</span>
        <span><span className="text-[#F59E0B]">{'\u25CF'}</span> 관찰 (20~40%)</span>
        <span><span className="text-[#EA580C]">{'\u25CF'}</span> 보유 (40~80%)</span>
        <span><span className="text-[#dc2626]">{'\u25CF'}</span> 과열 (80%+)</span>
      </div>
    </div>
  )
}
