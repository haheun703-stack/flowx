'use client'

import { useId } from 'react'
import { useMacroDaily } from '../api/useMacroDashboard'

/** 0~100 값을 공포/탐욕 라벨로 */
function getLabel(value: number): { text: string; color: string } {
  if (value <= 20) return { text: '극단적 공포', color: '#ef4444' }
  if (value <= 40) return { text: '공포', color: '#f97316' }
  if (value <= 60) return { text: '중립', color: '#eab308' }
  if (value <= 80) return { text: '탐욕', color: '#84cc16' }
  return { text: '극단적 탐욕', color: '#22c55e' }
}

/** 반원 SVG 게이지 */
function SemiCircleGauge({ value, size = 220 }: { value: number; size?: number }) {
  const gradId = useId()
  const cx = size / 2
  const cy = size / 2 + 10
  const r = size / 2 - 20
  const startAngle = Math.PI       // 180° (왼쪽)
  const endAngle = 0               // 0° (오른쪽)
  const valueAngle = startAngle - (value / 100) * Math.PI // 0~100 → 180°~0°

  // 배경 호 경로
  const bgArc = describeArc(cx, cy, r, startAngle, endAngle)
  // 값 호 경로
  const valArc = describeArc(cx, cy, r, startAngle, valueAngle)
  // 바늘 좌표
  const needleX = cx + (r - 15) * Math.cos(valueAngle)
  const needleY = cy - (r - 15) * Math.sin(valueAngle)

  const label = getLabel(value)

  return (
    <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`} className="mx-auto">
      {/* 배경 그라데이션 정의 */}
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="25%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="75%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* 배경 호 (회색) */}
      <path d={bgArc} fill="none" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" />

      {/* 값 호 (그라데이션) */}
      <path d={valArc} fill="none" stroke={`url(#${gradId})`} strokeWidth="16" strokeLinecap="round" />

      {/* 바늘 */}
      <circle cx={needleX} cy={needleY} r="6" fill={label.color} stroke="white" strokeWidth="2" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={label.color} strokeWidth="2" opacity="0.6" />

      {/* 중앙 원 */}
      <circle cx={cx} cy={cy} r="8" fill="white" stroke="#d1d5db" strokeWidth="2" />

      {/* 라벨: 0, 50, 100 */}
      <text x={20} y={cy + 20} fill="#64748b" fontSize="11" textAnchor="middle">0</text>
      <text x={cx} y={cy - r - 8} fill="#64748b" fontSize="11" textAnchor="middle">50</text>
      <text x={size - 20} y={cy + 20} fill="#64748b" fontSize="11" textAnchor="middle">100</text>

      {/* 큰 숫자 */}
      <text x={cx} y={cy - 20} fill={label.color} fontSize="36" fontWeight="900" textAnchor="middle">{Math.round(value)}</text>
      <text x={cx} y={cy + 4} fill={label.color} fontSize="14" fontWeight="700" textAnchor="middle">{label.text}</text>
    </svg>
  )
}

/** SVG 호 경로 생성 (시계 방향 위에서 그림) */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy - r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy - r * Math.sin(endAngle)
  const largeArc = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0
  // 반시계 방향 (sweep=0) → 위쪽 반원
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`
}

export function FearGreedGauge() {
  const { data, isLoading, isError } = useMacroDaily()

  // F&G 값 찾기 (sentiment 카테고리에서 우선 검색)
  const sentimentItems = data?.categories?.sentiment ?? data?.items
  const fgItem = sentimentItems?.find(i => i.symbol === 'FNG' || i.symbol === 'FEAR_GREED')
  const vixItem = sentimentItems?.find(i => i.symbol === 'VIX') ?? data?.items?.find(i => i.symbol === 'VIX')

  if (isLoading) {
    return <div className="h-48 bg-white border border-[var(--border)] rounded-lg animate-pulse" />
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl p-6 min-h-[200px] flex items-center justify-center text-[var(--up)]/70 text-sm">
        데이터 로드 실패
      </div>
    )
  }

  const fgValue = fgItem?.value ?? 50
  const vixValue = vixItem?.value ?? 0
  const vixAlert = vixValue >= 25

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* CategoryCard 동일 헤더 스타일 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]/50">
        <span className="text-lg">😱</span>
        <span className="text-lg font-bold" style={{ color: '#ef4444' }}>공포 & 탐욕</span>
      </div>

      <div className="p-3">
        {fgItem ? (
          <SemiCircleGauge value={fgValue} size={200} />
        ) : (
          <div className="flex items-center justify-center h-24 text-[var(--text-muted)] text-sm">
            F&G 데이터 없음
          </div>
        )}

        {/* VIX */}
        {vixItem && (
          <div className={`flex items-center justify-between py-2.5 px-3 rounded transition-colors ${
            vixAlert ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-primary)] font-medium">VIX</span>
              {vixAlert && <span className="text-xs text-[var(--up)] font-bold animate-pulse">!</span>}
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-base text-[var(--text-primary)] font-bold tabular-nums">{vixValue.toFixed(1)}</span>
              {vixItem.change_pct != null && (
                <span className={`text-sm font-bold tabular-nums w-16 text-right`}
                  style={{ color: vixItem.change_pct >= 0 ? '#dc2626' : '#2563eb' }}>
                  {vixItem.change_pct >= 0 ? '+' : ''}{vixItem.change_pct.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
