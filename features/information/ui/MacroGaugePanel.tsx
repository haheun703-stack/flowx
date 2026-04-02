'use client'

import { useMacroDaily } from '@/features/macro/api/useMacroDashboard'

// ─── 채워진 도넛형 각도 게이지 (Filled Annular Gauge) ───

const CX = 100
const CY = 95
const R_OUT = 80    // 바깥 반지름
const R_IN = 56     // 안쪽 반지름 (밴드 두께 = 24)

/** 5색 구간 */
const ZONES = [
  { from: 0,   to: 20,  color: '#ef4444' },
  { from: 20,  to: 40,  color: '#f97316' },
  { from: 40,  to: 60,  color: '#eab308' },
  { from: 60,  to: 80,  color: '#22c55e' },
  { from: 80,  to: 100, color: '#16a34a' },
]

/** pct(0~100) → radian. 0%=왼쪽(π), 100%=오른쪽(0) */
function pctToRad(pct: number) {
  return Math.PI * (1 - pct / 100)
}

/** polar → SVG 좌표 */
function toXY(rad: number, r: number) {
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) }
}

/** 채워진 도넛 섹터 path (면 기반, stroke 없음) */
function sectorPath(fromPct: number, toPct: number): string {
  const a1 = pctToRad(fromPct)
  const a2 = pctToRad(toPct)
  const o1 = toXY(a1, R_OUT)
  const o2 = toXY(a2, R_OUT)
  const i2 = toXY(a2, R_IN)
  const i1 = toXY(a1, R_IN)
  return [
    `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
    `A ${R_OUT} ${R_OUT} 0 0 0 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)}`,
    `L ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,
    `A ${R_IN} ${R_IN} 0 0 1 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

/** Normalize raw value to 0-100 */
function normalize(symbol: string, raw: number): number {
  let v: number
  switch (symbol) {
    case 'FNG': v = raw; break
    case 'VIX': v = ((50 - raw) / 40) * 100; break
    case 'USDKRW': v = ((1600 - raw) / 500) * 100; break
    case 'BASE_RATE': v = ((5 - raw) / 4) * 100; break
    default: v = 50
  }
  return Math.max(0, Math.min(100, v))
}

function getStatus(value: number): { text: string; color: string } {
  if (value <= 20) return { text: '극단', color: '#dc2626' }
  if (value <= 40) return { text: '경고', color: '#f97316' }
  if (value <= 60) return { text: '보통', color: '#6B7280' }
  if (value <= 80) return { text: '안정', color: '#2563eb' }
  return { text: '매우안정', color: '#16a34a' }
}

/** 눈금 틱 (0%, 50%, 100% 위치에 작은 선) */
function Ticks() {
  const pcts = [0, 25, 50, 75, 100]
  return (
    <>
      {pcts.map(pct => {
        const rad = pctToRad(pct)
        const p1 = toXY(rad, R_OUT + 2)
        const p2 = toXY(rad, R_OUT - 4)
        return (
          <line
            key={pct}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke="#9CA3AF" strokeWidth={1.2}
          />
        )
      })}
    </>
  )
}

function AngularGauge({ label, value, raw }: { label: string; value: number; raw: string }) {
  const status = getStatus(value)
  const needleRad = pctToRad(value)

  // 바늘 끝 (안쪽 반지름 안까지)
  const tipR = R_IN - 3
  const tip = toXY(needleRad, tipR)

  // 바늘 밑변 (중심 근처)
  const baseR = 8
  const base = toXY(needleRad, baseR)
  const perpRad = needleRad + Math.PI / 2
  const hw = 3.5
  const bL = { x: base.x + hw * Math.cos(perpRad), y: base.y - hw * Math.sin(perpRad) }
  const bR = { x: base.x - hw * Math.cos(perpRad), y: base.y + hw * Math.sin(perpRad) }

  return (
    <div className="flex flex-col items-center">
      <div className="text-[13px] font-bold text-[#1A1A2E] mb-0.5">{label}</div>
      <svg viewBox="0 0 200 130" className="w-full" style={{ maxWidth: 190 }}>
        {/* 배경 반원 (살짝 밝은 회색) */}
        <path
          d={sectorPath(0, 100)}
          fill="#F3F4F6"
        />

        {/* 5색 도넛 섹터 */}
        {ZONES.map((z, i) => (
          <path key={i} d={sectorPath(z.from, z.to)} fill={z.color} />
        ))}

        {/* 눈금 */}
        <Ticks />

        {/* 왼쪽/오른쪽 라벨 */}
        <text x={CX - R_OUT - 2} y={CY + 12} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="system-ui">위험</text>
        <text x={CX + R_OUT + 2} y={CY + 12} textAnchor="start" fontSize="9" fill="#9CA3AF" fontFamily="system-ui">안전</text>

        {/* 바늘 그림자 */}
        <polygon
          points={`${(tip.x + 1).toFixed(1)},${(tip.y + 1).toFixed(1)} ${(bL.x + 1).toFixed(1)},${(bL.y + 1).toFixed(1)} ${(bR.x + 1).toFixed(1)},${(bR.y + 1).toFixed(1)}`}
          fill="rgba(0,0,0,0.12)"
        />

        {/* 바늘 */}
        <polygon
          points={`${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${bL.x.toFixed(1)},${bL.y.toFixed(1)} ${bR.x.toFixed(1)},${bR.y.toFixed(1)}`}
          fill="#1F2937"
        />

        {/* 중심 원 */}
        <circle cx={CX} cy={CY} r="6" fill="#1F2937" />
        <circle cx={CX} cy={CY} r="2.5" fill="white" />

        {/* 값 텍스트 */}
        <text
          x={CX} y={CY + 22}
          textAnchor="middle"
          fontWeight="800"
          fontSize="17"
          fill={status.color}
          fontFamily="system-ui, sans-serif"
        >
          {raw}
        </text>
      </svg>
      <div className="text-[11px] font-bold -mt-3" style={{ color: status.color }}>{status.text}</div>
    </div>
  )
}

// ─── 메인 패널 ───

export function MacroGaugePanel() {
  const { data, isLoading } = useMacroDaily()

  const sentimentItems = data?.categories?.sentiment ?? data?.items ?? []
  const forexItems = data?.categories?.forex ?? data?.items ?? []
  const rateItems = data?.categories?.rate ?? data?.items ?? []

  const fng = sentimentItems.find(i => i.symbol === 'FNG' || i.symbol === 'FEAR_GREED')
  const vix = sentimentItems.find(i => i.symbol === 'VIX') ?? data?.items?.find(i => i.symbol === 'VIX')
  const usdkrw = forexItems.find(i => i.symbol === 'USDKRW') ?? data?.items?.find(i => i.symbol === 'USDKRW')
  const baseRate = rateItems.find(i => i.symbol === 'BASE_RATE') ?? data?.items?.find(i => i.symbol === 'BASE_RATE')

  const gauges = [
    { label: '공포·탐욕', symbol: 'FNG', item: fng },
    { label: 'VIX', symbol: 'VIX', item: vix },
    { label: '환율', symbol: 'USDKRW', item: usdkrw },
    { label: '기준금리', symbol: 'BASE_RATE', item: baseRate },
  ]

  if (isLoading) {
    return (
      <div className="fx-card-green">
        <div className="fx-card-title">매크로 게이지</div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">매크로 게이지</div>
      <div className="grid grid-cols-2 gap-1">
        {gauges.map(g => {
          if (!g.item) {
            return (
              <div key={g.symbol} className="flex flex-col items-center justify-center h-28">
                <div className="text-[13px] font-bold text-[#1A1A2E] mb-1">{g.label}</div>
                <div className="text-[12px] text-[var(--fx-text-muted)]">데이터 대기중</div>
              </div>
            )
          }
          const normalized = normalize(g.symbol, g.item.value)
          const rawStr = g.symbol === 'USDKRW'
            ? g.item.value.toFixed(0)
            : g.symbol === 'BASE_RATE'
              ? g.item.value.toFixed(2) + '%'
              : g.item.value.toFixed(1)
          return <AngularGauge key={g.symbol} label={g.label} value={normalized} raw={rawStr} />
        })}
      </div>
      <div className="fx-card-tip">
        바늘 왼쪽=위험 · 가운데=보통 · 오른쪽=안전
      </div>
    </div>
  )
}
