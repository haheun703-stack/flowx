'use client'

import { useMacroDaily } from '@/features/macro/api/useMacroDashboard'

// ─── 카드형 세그먼트 게이지 (매크로 요약 스타일) ───

const CX = 60
const CY = 55
const R = 42

/** 4색 세그먼트 (gap 포함) */
const SEGMENTS = [
  { startDeg: 180, endDeg: 138, color: '#ef4444' },  // 빨강
  { startDeg: 135, endDeg: 93,  color: '#f97316' },   // 주황
  { startDeg: 90,  endDeg: 48,  color: '#eab308' },   // 노랑
  { startDeg: 45,  endDeg: 0,   color: '#22c55e' },   // 초록
]

function degToRad(deg: number) { return (deg * Math.PI) / 180 }
function polarToXY(deg: number, r: number) {
  const rad = degToRad(deg)
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) }
}

/** 세그먼트 arc path */
function arcPath(startDeg: number, endDeg: number, r: number): string {
  const s = polarToXY(startDeg, r)
  const e = polarToXY(endDeg, r)
  const sweep = startDeg - endDeg > 180 ? 1 : 0
  return `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} A ${r} ${r} 0 ${sweep} 0 ${e.x.toFixed(1)} ${e.y.toFixed(1)}`
}

/** 0~100 → 180~0도 */
function pctToDeg(pct: number) { return 180 - (pct / 100) * 180 }

/** Normalize raw value to 0~100 */
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

function getStatus(symbol: string, value: number, raw: number): { text: string; color: string } {
  switch (symbol) {
    case 'FNG':
      if (raw <= 20) return { text: '극도의 공포', color: '#dc2626' }
      if (raw <= 40) return { text: '공포', color: '#f97316' }
      if (raw <= 60) return { text: '중립', color: '#6B7280' }
      if (raw <= 80) return { text: '탐욕', color: '#2563eb' }
      return { text: '극도의 탐욕', color: '#16a34a' }
    case 'VIX':
      if (raw >= 35) return { text: '극단적 변동성', color: '#dc2626' }
      if (raw >= 25) return { text: '높은 변동성', color: '#f97316' }
      if (raw >= 15) return { text: '보통', color: '#6B7280' }
      return { text: '안정', color: '#16a34a' }
    case 'USDKRW':
      if (raw >= 1450) return { text: '위험', color: '#dc2626' }
      if (raw >= 1350) return { text: '경계', color: '#f97316' }
      if (raw >= 1250) return { text: '보합', color: '#6B7280' }
      return { text: '안정', color: '#16a34a' }
    case 'BASE_RATE':
      if (raw >= 4) return { text: '긴축', color: '#dc2626' }
      if (raw >= 3) return { text: '동결', color: '#f97316' }
      if (raw >= 2) return { text: '중립', color: '#6B7280' }
      return { text: '완화', color: '#16a34a' }
    default:
      if (value <= 20) return { text: '극단', color: '#dc2626' }
      if (value <= 40) return { text: '경고', color: '#f97316' }
      if (value <= 60) return { text: '보통', color: '#6B7280' }
      return { text: '안정', color: '#16a34a' }
  }
}

function GaugeCard({ label, subtitle, symbol, value, raw }: {
  label: string; subtitle: string; symbol: string; value: number; raw: string
}) {
  const normalized = normalize(symbol, value)
  const status = getStatus(symbol, normalized, value)
  const needleDeg = pctToDeg(normalized)
  const needleTip = polarToXY(needleDeg, R - 4)
  const needleBase = polarToXY(needleDeg, 8)

  return (
    <div className="bg-[#F9FAFB] rounded-xl p-3 flex flex-col items-center">
      <svg viewBox="0 0 120 68" className="w-full" style={{ maxWidth: 150 }}>
        {/* 4색 세그먼트 아크 (gap 3도) */}
        {SEGMENTS.map((seg, i) => (
          <path
            key={i}
            d={arcPath(seg.startDeg, seg.endDeg, R)}
            fill="none"
            stroke={seg.color}
            strokeWidth="10"
            strokeLinecap="round"
          />
        ))}

        {/* 바늘 */}
        <line
          x1={needleBase.x} y1={needleBase.y}
          x2={needleTip.x} y2={needleTip.y}
          stroke="#374151" strokeWidth="2.5" strokeLinecap="round"
        />
        {/* 중심점 */}
        <circle cx={CX} cy={CY} r="4" fill="#374151" />
        <circle cx={CX} cy={CY} r="1.8" fill="white" />
      </svg>

      {/* 상태 텍스트 */}
      <div className="text-[13px] font-bold mt-0.5" style={{ color: status.color }}>
        {status.text}
      </div>
      {/* 값 */}
      <div className="text-[22px] font-black text-[#1A1A2E] leading-tight">
        {raw}
      </div>
      {/* 부제 */}
      <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>
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
    { label: '공포·탐욕', subtitle: '시장 심리', symbol: 'FNG', item: fng },
    { label: 'VIX', subtitle: 'VIX', symbol: 'VIX', item: vix },
    { label: '환율', subtitle: '환율', symbol: 'USDKRW', item: usdkrw },
    { label: '기준금리', subtitle: '기준금리', symbol: 'BASE_RATE', item: baseRate },
  ]

  if (isLoading) {
    return (
      <div className="fx-card-green">
        <div className="fx-card-title">매크로 요약</div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">매크로 요약</div>
      <div className="grid grid-cols-2 gap-2">
        {gauges.map(g => {
          if (!g.item) {
            return (
              <div key={g.symbol} className="bg-[#F9FAFB] rounded-xl p-4 flex flex-col items-center justify-center h-[180px]">
                <div className="text-[13px] font-bold text-[#1A1A2E] mb-1">{g.label}</div>
                <div className="text-[12px] text-gray-400">데이터 대기중</div>
              </div>
            )
          }
          const rawStr = g.symbol === 'USDKRW'
            ? g.item.value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
            : g.symbol === 'BASE_RATE'
              ? g.item.value.toFixed(2) + '%'
              : g.item.value.toFixed(g.symbol === 'VIX' ? 2 : 1)
          return (
            <GaugeCard
              key={g.symbol}
              label={g.label}
              subtitle={g.subtitle}
              symbol={g.symbol}
              value={g.item.value}
              raw={rawStr}
            />
          )
        })}
      </div>
    </div>
  )
}
