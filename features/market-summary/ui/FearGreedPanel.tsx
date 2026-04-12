'use client'

import { useEffect, useState } from 'react'

interface FearGreedData {
  date: string
  score: number
  label: string
  momentum_score: number
  breadth_score: number
  volatility_score: number
  safe_haven_score: number
  hy_spread_score: number
  foreign_flow_score: number
}

const LABEL_KR: Record<string, string> = {
  'Extreme Fear': '극도 공포',
  Fear: '공포',
  Neutral: '중립',
  Greed: '탐욕',
  'Extreme Greed': '극도 탐욕',
}

function scoreColor(score: number): string {
  if (score <= 20) return '#DC2626'
  if (score <= 40) return '#EF4444'
  if (score <= 60) return '#6B7280'
  if (score <= 80) return '#22C55E'
  return '#16A34A'
}

function componentBarColor(score: number): string {
  if (score <= 40) return '#EF4444'
  if (score <= 60) return '#EAB308'
  return '#22C55E'
}

const COMPONENTS = [
  { key: 'momentum_score' as const, label: '모멘텀', desc: 'KOSPI vs 125일 MA' },
  { key: 'breadth_score' as const, label: '시장폭', desc: '상승/하락 비율' },
  { key: 'volatility_score' as const, label: '변동성', desc: 'VIX 변동성' },
  { key: 'safe_haven_score' as const, label: '안전자산', desc: '주식 vs 채권' },
  { key: 'hy_spread_score' as const, label: '하이일드', desc: '하이일드 스프레드' },
  { key: 'foreign_flow_score' as const, label: '외국인', desc: '외국인 수급' },
]

/** SVG 반원 게이지 */
function SemiGauge({ score }: { score: number }) {
  const cx = 120
  const cy = 110
  const r = 90
  // 반원: 180도 → -180 ~ 0
  const startAngle = -180
  const endAngle = 0
  const scoreAngle = startAngle + (score / 100) * (endAngle - startAngle)

  function polarToXY(angle: number, radius: number) {
    const rad = (angle * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  // 5 구간 아크
  const zones = [
    { from: 0, to: 20, color: '#DC2626' },
    { from: 20, to: 40, color: '#EF4444' },
    { from: 40, to: 60, color: '#EAB308' },
    { from: 60, to: 80, color: '#22C55E' },
    { from: 80, to: 100, color: '#16A34A' },
  ]

  function arc(fromPct: number, toPct: number) {
    const a1 = startAngle + (fromPct / 100) * 180
    const a2 = startAngle + (toPct / 100) * 180
    const p1 = polarToXY(a1, r)
    const p2 = polarToXY(a2, r)
    const large = a2 - a1 > 180 ? 1 : 0
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`
  }

  // 바늘
  const needleEnd = polarToXY(scoreAngle, r - 12)

  return (
    <svg viewBox="0 0 240 130" className="w-full max-w-[240px] mx-auto">
      {/* 구간 아크 */}
      {zones.map((z) => (
        <path
          key={z.from}
          d={arc(z.from, z.to)}
          fill="none"
          stroke={z.color}
          strokeWidth={14}
          strokeLinecap="round"
          opacity={0.3}
        />
      ))}
      {/* 활성 아크 (0 ~ score) */}
      {score > 0 && (
        <path
          d={arc(0, Math.min(score, 100))}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth={14}
          strokeLinecap="round"
        />
      )}
      {/* 바늘 */}
      <line
        x1={cx}
        y1={cy}
        x2={needleEnd.x}
        y2={needleEnd.y}
        stroke="#1A1A2E"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill="#1A1A2E" />
      {/* 라벨 */}
      <text x={10} y={125} fontSize={10} fill="#9CA3AF" fontWeight={600}>0</text>
      <text x={112} y={20} fontSize={10} fill="#9CA3AF" fontWeight={600} textAnchor="middle">50</text>
      <text x={222} y={125} fontSize={10} fill="#9CA3AF" fontWeight={600} textAnchor="end">100</text>
    </svg>
  )
}

export default function FearGreedPanel() {
  const [latest, setLatest] = useState<FearGreedData | null>(null)
  const [history, setHistory] = useState<{ date: string; score: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/market/fear-greed', { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        setLatest(json.latest)
        setHistory(json.history ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="fx-card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!latest) return null

  const color = scoreColor(latest.score)
  const labelKr = LABEL_KR[latest.label] ?? latest.label
  const prev = history.length >= 2 ? history[1].score : null
  const diff = prev != null ? latest.score - prev : null

  return (
    <div className="fx-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
        <span className="fx-card-title">공포/탐욕 지수</span>
        <span className="text-[13px] text-[#9CA3AF]">{latest.date}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-6">
        {/* 좌: 게이지 */}
        <div className="flex-1 flex flex-col items-center">
          <SemiGauge score={latest.score} />
          <div className="text-center -mt-2">
            <span className="text-[28px] md:text-[36px] font-extrabold tabular-nums" style={{ color }}>
              {latest.score.toFixed(0)}
            </span>
            <span className="text-[15px] md:text-[18px] font-bold ml-2" style={{ color }}>
              {labelKr}
            </span>
          </div>
          {diff != null && (
            <span className={`text-[13px] font-bold mt-1 ${diff >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              전일 대비 {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
            </span>
          )}
        </div>

        {/* 우: 컴포넌트 바 */}
        <div className="flex-1 space-y-1.5">
          {COMPONENTS.map(({ key, label, desc }) => {
            const val = latest[key] ?? 0
            return (
              <div key={key} className="flex items-center gap-2" title={desc}>
                <span className="text-[12px] text-[#6B7280] w-[72px] shrink-0">{label}</span>
                <div className="flex-1 h-3 bg-[#F5F4F0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(val, 100)}%`, backgroundColor: componentBarColor(val) }}
                  />
                </div>
                <span className="text-[12px] font-bold tabular-nums w-[28px] text-right" style={{ color: componentBarColor(val) }}>
                  {val.toFixed(0)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
