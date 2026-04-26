'use client'

import { useMacroDaily } from '@/features/macro/api/useMacroDashboard'

// ─── CSS conic-gradient 기반 스무스 반원 게이지 ───

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

function getStatus(symbol: string, _normalized: number, raw: number): { text: string; color: string } {
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
      if (_normalized <= 25) return { text: '극단', color: '#dc2626' }
      if (_normalized <= 50) return { text: '경고', color: '#f97316' }
      return { text: '안정', color: '#16a34a' }
  }
}

/** 게이지 크기 상수 */
const SZ = 120        // 원 지름
const RING = 16       // 링 두께
const CENTER = SZ / 2 // 60

function GaugeCard({ subtitle, symbol, value, raw }: {
  subtitle: string; symbol: string; value: number; raw: string
}) {
  const normalized = normalize(symbol, value)
  const status = getStatus(symbol, normalized, value)
  const needleAngle = -90 + (normalized / 100) * 180

  return (
    <div className="bg-[#F9FAFB] rounded-xl p-3 pb-4 flex flex-col items-center justify-center min-h-[200px]">
      {/* 게이지 영역 */}
      <div className="relative mx-auto" style={{ width: SZ, height: 68 }}>
        {/* 반원 클리핑 (위쪽 절반만 표시) */}
        <div style={{ width: SZ, height: 64, overflow: 'hidden' }}>
          {/* conic-gradient 원: 왼쪽(270°)=빨강 → 위(0°)=노랑 → 오른쪽(90°)=초록 */}
          <div
            className="relative rounded-full"
            style={{
              width: SZ,
              height: SZ,
              background: 'conic-gradient(from 270deg, #ef4444 0deg, #f97316 45deg, #eab308 90deg, #22c55e 135deg, #16a34a 180deg, transparent 180.5deg)',
            }}
          >
            {/* 안쪽 흰 원 → 링 모양 만들기 */}
            <div
              className="absolute rounded-full"
              style={{
                inset: RING,
                backgroundColor: '#F9FAFB',
              }}
            />
          </div>
        </div>

        {/* 바늘 (SVG — 정밀한 회전) */}
        <svg
          className="absolute top-0 left-0"
          width={SZ} height={68}
          viewBox={`0 0 ${SZ} 68`}
        >
          <g transform={`rotate(${needleAngle}, ${CENTER}, ${CENTER})`}>
            <line
              x1={CENTER} y1={CENTER}
              x2={CENTER} y2={RING + 3}
              stroke="#374151" strokeWidth="2.5" strokeLinecap="round"
            />
          </g>
          <circle cx={CENTER} cy={CENTER} r="5" fill="#374151" />
          <circle cx={CENTER} cy={CENTER} r="2" fill="#F9FAFB" />
        </svg>
      </div>

      {/* 텍스트 영역 */}
      <div className="text-center">
        <div className="text-[13px] font-bold mt-1" style={{ color: status.color }}>
          {status.text}
        </div>
        <div className="text-[22px] font-bold text-[#1A1A2E] leading-tight">{raw}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>
      </div>
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
  const baseRate = rateItems.find(i => i.symbol === 'BOK_RATE') ?? rateItems.find(i => i.symbol === 'BASE_RATE') ?? data?.items?.find(i => i.symbol === 'BOK_RATE') ?? data?.items?.find(i => i.symbol === 'BASE_RATE')

  const gauges = [
    { subtitle: '시장 심리', symbol: 'FNG', item: fng },
    { subtitle: 'VIX', symbol: 'VIX', item: vix },
    { subtitle: '환율', symbol: 'USDKRW', item: usdkrw },
    { subtitle: '기준금리', symbol: 'BASE_RATE', item: baseRate },
  ]

  if (isLoading) {
    return (
      <div className="fx-card-green">
        <div className="fx-card-title">매크로 요약</div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[200px] bg-gray-100 animate-pulse rounded-xl" />
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
              <div key={g.symbol} className="bg-[#F9FAFB] rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="text-[13px] font-bold text-[#1A1A2E] mb-1">{g.subtitle}</div>
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
