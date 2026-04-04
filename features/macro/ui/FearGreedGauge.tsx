'use client'

import { useMacroDaily } from '../api/useMacroDashboard'

/* ── Gauge constants (CostFloorGauge와 동일) ── */
const CX = 100, CY = 100, R = 75, SW = 12

/* 공포→탐욕: 왼쪽(0)=빨강, 오른쪽(100)=초록 */
const ARCS = [
  { from: 180, to: 144, color: '#ef4444' },
  { from: 144, to: 108, color: '#f97316' },
  { from: 108, to: 72,  color: '#eab308' },
  { from: 72,  to: 36,  color: '#84cc16' },
  { from: 36,  to: 0,   color: '#22c55e' },
]

function getLabel(value: number): { text: string; color: string } {
  if (value <= 20) return { text: '극단적 공포', color: '#ef4444' }
  if (value <= 40) return { text: '공포', color: '#f97316' }
  if (value <= 60) return { text: '중립', color: '#eab308' }
  if (value <= 80) return { text: '탐욕', color: '#84cc16' }
  return { text: '극단적 탐욕', color: '#22c55e' }
}

function toXY(deg: number, r = R) {
  const rad = (deg * Math.PI) / 180
  return [CX + r * Math.cos(rad), CY - r * Math.sin(rad)] as const
}

function arcD(from: number, to: number) {
  const [x1, y1] = toXY(from)
  const [x2, y2] = toXY(to)
  const large = (from - to) > 180 ? 1 : 0
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

export function FearGreedGauge() {
  const { data, isLoading, isError } = useMacroDaily()

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

  const fgValue = Math.max(0, Math.min(100, fgItem?.value ?? 50))
  const vixValue = vixItem?.value ?? 0
  const vixAlert = vixValue >= 25
  const label = getLabel(fgValue)

  const needleDeg = 180 - (fgValue * 180) / 100
  const [nx, ny] = toXY(needleDeg, R - SW / 2 - 8)

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]/50">
        <span className="text-lg">😱</span>
        <span className="text-lg font-bold" style={{ color: '#ef4444' }}>공포 & 탐욕</span>
      </div>

      <div className="p-3">
        {fgItem ? (
          <div className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 200 155" className="w-full max-w-[220px]">
              {/* 배경 호 */}
              <path d={arcD(180, 0.1)} fill="none" stroke="#e5e7eb" strokeWidth={SW + 2} strokeLinecap="round" />
              {/* 색상 세그먼트 */}
              {ARCS.map((a, i) => (
                <path key={i} d={arcD(a.from, a.to)} fill="none" stroke={a.color} strokeWidth={SW} opacity={0.8} />
              ))}
              {/* 바늘 */}
              <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={label.color} strokeWidth={2.5} strokeLinecap="round" />
              {/* 중심 점 */}
              <circle cx={CX} cy={CY} r={5} fill={label.color} />
              <circle cx={CX} cy={CY} r={2.5} fill="white" />

              {/* ── 값 + 라벨: 바늘 아래 ── */}
              <text x={CX} y={CY + 22} textAnchor="middle" fill={label.color} fontSize="28" fontWeight="900"
                style={{ fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(fgValue)}
              </text>
              <text x={CX} y={CY + 38} textAnchor="middle" fill={label.color} fontSize="12" fontWeight="800">
                {label.text}
              </text>

              {/* ── 좌: 공포 (크고 진하게) ── */}
              <text x={CX - R - 2} y={CY + 4} textAnchor="start" fill="#ef4444" fontSize="12" fontWeight="800">공포</text>
              <text x={CX - R - 2} y={CY + 18} textAnchor="start" fill="#ef4444" fontSize="13" fontWeight="900"
                style={{ fontVariantNumeric: 'tabular-nums' }}>0</text>

              {/* ── 우: 탐욕 (크고 진하게) ── */}
              <text x={CX + R + 2} y={CY + 4} textAnchor="end" fill="#22c55e" fontSize="12" fontWeight="800">탐욕</text>
              <text x={CX + R + 2} y={CY + 18} textAnchor="end" fill="#22c55e" fontSize="13" fontWeight="900"
                style={{ fontVariantNumeric: 'tabular-nums' }}>100</text>
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-[var(--text-muted)] text-sm">
            F&G 데이터 없음
          </div>
        )}

        {/* VIX */}
        {vixItem && (
          <div className={`flex items-center justify-between py-2.5 px-3 rounded transition-colors ${
            vixAlert ? 'bg-red-50 border border-red-200' : 'hover:bg-[var(--bg-row)]'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-primary)] font-medium">VIX</span>
              {vixAlert && <span className="text-xs text-[var(--up)] font-bold animate-pulse">!</span>}
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-base text-[var(--text-primary)] font-bold tabular-nums">{vixValue.toFixed(1)}</span>
              {vixItem.change_pct != null && (
                <span className="text-sm font-bold tabular-nums w-16 text-right"
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
