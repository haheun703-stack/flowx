'use client'

import { useMacroDaily } from '@/features/macro/api/useMacroDashboard'

/** SVG arc path (from FearGreedGauge pattern) */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy - r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy - r * Math.sin(endAngle)
  const largeArc = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`
}

/** Normalize raw value to 0-100 (left=danger, right=safe) */
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

function getStatusText(value: number): { text: string; color: string } {
  if (value <= 25) return { text: '극단', color: '#dc2626' }
  if (value <= 45) return { text: '경고', color: '#f97316' }
  if (value <= 55) return { text: '보통', color: '#6B7280' }
  if (value <= 75) return { text: '안정', color: '#2563eb' }
  return { text: '매우안정', color: '#16a34a' }
}

function MiniGauge({ label, value, raw }: { label: string; value: number; raw: string }) {
  const cx = 60, cy = 56, r = 44
  const sw = 10
  const startAngle = Math.PI
  const endAngle = 0

  // 3-zone arcs: red (180°-120°), orange (120°-60°), blue (60°-0°)
  const zone1End = startAngle - (Math.PI / 3)
  const zone2End = startAngle - (2 * Math.PI / 3)

  const arc1 = describeArc(cx, cy, r, startAngle, zone1End)
  const arc2 = describeArc(cx, cy, r, zone1End, zone2End)
  const arc3 = describeArc(cx, cy, r, zone2End, endAngle)

  // Needle
  const needleAngle = startAngle - (value / 100) * Math.PI
  const needleLen = r - 10
  const nx = cx + needleLen * Math.cos(needleAngle)
  const ny = cy - needleLen * Math.sin(needleAngle)

  const status = getStatusText(value)

  return (
    <div className="flex flex-col items-center">
      <div className="text-[13px] font-bold text-[#1A1A2E] mb-0.5">{label}</div>
      <svg viewBox="0 0 120 64" className="w-full" style={{ maxWidth: 180 }}>
        <path d={arc1} fill="none" stroke="#FCA5A5" strokeWidth={sw} strokeLinecap="round" />
        <path d={arc2} fill="none" stroke="#FDBA74" strokeWidth={sw} strokeLinecap="round" />
        <path d={arc3} fill="none" stroke="#93C5FD" strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={status.color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4.5" fill={status.color} />
        <circle cx={cx} cy={cy} r="2" fill="white" />
      </svg>
      <div className="text-[17px] font-black tabular-nums -mt-1" style={{ color: status.color }}>{raw}</div>
      <div className="text-[11px] font-bold" style={{ color: status.color }}>{status.text}</div>
    </div>
  )
}

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
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">🌐 매크로 게이지</div>
      <div className="grid grid-cols-2 gap-3">
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
          return <MiniGauge key={g.symbol} label={g.label} value={normalized} raw={rawStr} />
        })}
      </div>
      <div className="fx-card-tip">
        💡 바늘 왼쪽=위험 가운데=보통 오른쪽=안전
      </div>
    </div>
  )
}
