'use client'

import { useMacroDaily } from '@/features/macro/api/useMacroDashboard'

// ─── 각도 게이지 (Angular Gauge) ───

const CX = 100      // 중심 X
const CY = 92       // 중심 Y (약간 아래로 → 반원 위쪽 여백 확보)
const R = 75        // 반지름
const ARC_W = 18    // 호 두께

/** 5색 구간 (위험→안전): 빨강→주황→노랑→연두→녹색 */
const ZONES = [
  { fromPct: 0,   toPct: 20,  color: '#ef4444' },  // 극단 위험
  { fromPct: 20,  toPct: 40,  color: '#f97316' },  // 경고
  { fromPct: 40,  toPct: 60,  color: '#eab308' },  // 보통
  { fromPct: 60,  toPct: 80,  color: '#22c55e' },  // 안정
  { fromPct: 80,  toPct: 100, color: '#16a34a' },  // 매우 안정
]

/** pct(0~100) → SVG 좌표. 0%=왼쪽(180°), 50%=꼭대기(90°), 100%=오른쪽(0°) */
function gaugeXY(pct: number) {
  const rad = Math.PI * (1 - pct / 100)
  return {
    x: CX + R * Math.cos(rad),
    y: CY - R * Math.sin(rad),
  }
}

/** SVG arc path: fromPct → toPct (왼쪽에서 오른쪽, 반원 상단) */
function arcPath(fromPct: number, toPct: number): string {
  const p1 = gaugeXY(fromPct)
  const p2 = gaugeXY(toPct)
  // sweep=0: SVG 화면상 반시계 (왼→위→오 = 반원 상단 경로)
  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${R} ${R} 0 0 0 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
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
  const status = getStatus(value)

  // 바늘 좌표: value(0~100) → 반원 위 위치
  const needleRad = Math.PI * (1 - value / 100)
  const tipLen = R - 6
  const tipX = CX + tipLen * Math.cos(needleRad)
  const tipY = CY - tipLen * Math.sin(needleRad)

  // 바늘 삼각형 밑변 (중심에서 약간 떨어진 곳)
  const baseLen = 12
  const baseX = CX + baseLen * Math.cos(needleRad)
  const baseY = CY - baseLen * Math.sin(needleRad)
  const perpRad = needleRad + Math.PI / 2
  const bw = 4
  const lx = baseX + bw * Math.cos(perpRad)
  const ly = baseY - bw * Math.sin(perpRad)
  const rx = baseX - bw * Math.cos(perpRad)
  const ry = baseY + bw * Math.sin(perpRad)

  return (
    <div className="flex flex-col items-center">
      <div className="text-[13px] font-bold text-[#1A1A2E] mb-0.5">{label}</div>
      <svg viewBox="0 0 200 120" className="w-full" style={{ maxWidth: 200 }}>
        {/* 5색 호 구간 */}
        {ZONES.map((z, i) => (
          <path
            key={i}
            d={arcPath(z.fromPct, z.toPct)}
            fill="none"
            stroke={z.color}
            strokeWidth={ARC_W}
            strokeLinecap={i === 0 || i === ZONES.length - 1 ? 'round' : 'butt'}
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
        <circle cx={CX} cy={CY} r="3" fill="white" />

        {/* 값 텍스트 (바늘 아래 중앙) */}
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
