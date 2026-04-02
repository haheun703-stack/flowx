'use client'

import { useMacroDaily } from '@/features/macro/api/useMacroDashboard'

// ─── 각도 게이지 (Angular Gauge) ───

const CX = 100      // 중심 X
const CY = 90       // 중심 Y
const R = 75        // 반지름
const ARC_W = 18    // 호 두께
const VIEW = '0 0 200 120'

/** 5색 구간 (위험→안전): 빨강→주황→노랑→연두→녹색 */
const ZONES = [
  { from: 180, to: 144, color: '#ef4444' },  // 극단 위험
  { from: 144, to: 108, color: '#f97316' },  // 경고
  { from: 108, to: 72,  color: '#eab308' },  // 보통
  { from: 72,  to: 36,  color: '#22c55e' },  // 안정
  { from: 36,  to: 0,   color: '#16a34a' },  // 매우 안정
]

function degToRad(deg: number) { return (deg * Math.PI) / 180 }

function arcPath(startDeg: number, endDeg: number): string {
  const s = degToRad(startDeg)
  const e = degToRad(endDeg)
  const x1 = CX - R * Math.cos(s)
  const y1 = CY - R * Math.sin(s)
  const x2 = CX - R * Math.cos(e)
  const y2 = CY - R * Math.sin(e)
  const large = Math.abs(startDeg - endDeg) > 180 ? 1 : 0
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

/** Normalize raw value to 0-100 (0=danger/left, 100=safe/right) */
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

function AngularGauge({ label, value, raw }: { label: string; value: number; raw: string }) {
  // 바늘 각도: 180°(왼쪽, 0%) → 0°(오른쪽, 100%)
  const needleDeg = 180 - (value / 100) * 180
  const needleRad = degToRad(needleDeg)
  const needleLen = R - 8

  // 바늘 끝 삼각형 (화살촉)
  const tipLen = needleLen + 2
  const tipX = CX - tipLen * Math.cos(needleRad)
  const tipY = CY - tipLen * Math.sin(needleRad)
  const perpRad = needleRad + Math.PI / 2
  const bw = 4  // 화살촉 너비 절반
  const baseX = CX - (needleLen - 16) * Math.cos(needleRad)
  const baseY = CY - (needleLen - 16) * Math.sin(needleRad)
  const lx = baseX + bw * Math.cos(perpRad)
  const ly = baseY + bw * Math.sin(perpRad)
  const rx = baseX - bw * Math.cos(perpRad)
  const ry = baseY - bw * Math.sin(perpRad)

  const status = getStatus(value)

  return (
    <div className="flex flex-col items-center">
      <div className="text-[13px] font-bold text-[#1A1A2E] mb-0.5">{label}</div>
      <svg viewBox={VIEW} className="w-full" style={{ maxWidth: 200 }}>
        {/* 5색 호 구간 */}
        {ZONES.map((z, i) => (
          <path
            key={i}
            d={arcPath(z.from, z.to)}
            fill="none"
            stroke={z.color}
            strokeWidth={ARC_W}
            strokeLinecap={i === 0 ? 'round' : i === ZONES.length - 1 ? 'round' : 'butt'}
            opacity={0.85}
          />
        ))}

        {/* 바늘 (삼각형) */}
        <polygon
          points={`${tipX.toFixed(1)},${tipY.toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)} ${rx.toFixed(1)},${ry.toFixed(1)}`}
          fill="#1A1A2E"
          opacity={0.9}
        />

        {/* 바늘 중심 원 */}
        <circle cx={CX} cy={CY} r="7" fill="#1A1A2E" />
        <circle cx={CX} cy={CY} r="3.5" fill="white" />

        {/* 값 텍스트 (바늘 아래) */}
        <text
          x={CX} y={CY + 22}
          textAnchor="middle"
          fontWeight="900"
          fontSize="18"
          fill={status.color}
          fontFamily="system-ui, sans-serif"
        >
          {raw}
        </text>
      </svg>
      <div className="text-[12px] font-bold -mt-2" style={{ color: status.color }}>{status.text}</div>
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
      <div className="fx-card-title">🌐 매크로 게이지</div>
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
        💡 바늘 왼쪽=위험 가운데=보통 오른쪽=안전
      </div>
    </div>
  )
}
