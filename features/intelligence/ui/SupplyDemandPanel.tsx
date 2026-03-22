'use client'

import { useIntelligenceSupplyDemand } from '../api/useIntelligence'
import { getRelativeDate } from '@/shared/lib/dateUtils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  ReferenceLine, LabelList, ResponsiveContainer,
} from 'recharts'

function formatKrNumber(v: number): string {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  if (abs >= 1_0000_0000) return `${sign}${(abs / 1_0000_0000).toFixed(1)}조`
  if (abs >= 1_0000) return `${sign}${Math.round(abs / 1_0000).toLocaleString()}억`
  return `${sign}${abs.toLocaleString()}`
}

// ── 억 단위 변환 (API가 원 단위일 때) ──
function toEok(v: number): number {
  if (Math.abs(v) >= 1_0000) return Math.round(v / 1_0000)
  return v
}

// ════════════════════════════════════════════════════════
// 1. 그림 백분율 차트 (Pictorial Fraction Chart)
//    큰 사람 1명, clipPath로 아래서부터 비율만큼 채움
// ════════════════════════════════════════════════════════

function SupplyPictogram({
  label, amount, ratio, streak,
}: {
  label: string; amount: number; ratio: number; streak: number
}) {
  const isSell = amount < 0
  const fillColor = isSell ? '#378ADD' : '#E24B4A'  // 한국식: 매도=파랑, 매수=빨강
  const fillPct = Math.min(Math.max(Math.abs(ratio), 5), 100)
  const clipId = `fill-${label}`
  // clipPath y: 전체 높이 200 중 아래서 비율만큼
  const bodyH = 170
  const clipY = 200 - (fillPct / 100 * bodyH)
  const clipH = fillPct / 100 * bodyH + 30

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-[#94a3b8] font-bold">{label}</span>

      {streak !== 0 && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          streak > 0 ? 'bg-[#E24B4A]/10 text-[#E24B4A]' : 'bg-[#378ADD]/10 text-[#378ADD]'
        }`}>
          {streak > 0 ? '매수' : '매도'} {Math.abs(streak)}일째
        </span>
      )}

      <svg width="110" height="200" viewBox="0 0 110 200">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y={clipY} width="110" height={clipH} />
          </clipPath>
        </defs>

        {/* 회색 배경 사람 */}
        <circle cx="55" cy="24" r="16" fill="#333" />
        <path d="M25,50 L36,50 L36,110 L25,110 Z" fill="#333" />
        <path d="M74,50 L85,50 L85,110 L74,110 Z" fill="#333" />
        <path d="M36,46 L74,46 L74,125 L36,125 Z" fill="#333" />
        <path d="M36,125 L50,125 L50,192 L36,192 Z" fill="#333" />
        <path d="M60,125 L74,125 L74,192 L60,192 Z" fill="#333" />

        {/* 색칠된 사람 (아래서부터 채움) */}
        <g clipPath={`url(#${clipId})`}>
          <circle cx="55" cy="24" r="16" fill={fillColor} />
          <path d="M25,50 L36,50 L36,110 L25,110 Z" fill={fillColor} />
          <path d="M74,50 L85,50 L85,110 L74,110 Z" fill={fillColor} />
          <path d="M36,46 L74,46 L74,125 L36,125 Z" fill={fillColor} />
          <path d="M36,125 L50,125 L50,192 L36,192 Z" fill={fillColor} />
          <path d="M60,125 L74,125 L74,192 L60,192 Z" fill={fillColor} />
        </g>

        {/* 비율 경계선 (흰 점선) */}
        <line
          x1="15" y1={clipY} x2="95" y2={clipY}
          stroke="#fff" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"
        />
      </svg>

      {/* 금액 */}
      <div className={`text-xl font-black tabular-nums ${isSell ? 'text-[#378ADD]' : 'text-[#E24B4A]'}`}>
        {formatKrNumber(amount)}
      </div>
      {/* 비율 — "매도 강도 50%" 형식 */}
      <div className="text-xs text-[#8a8a8a]">
        {isSell ? '매도' : '매수'} 강도 {fillPct.toFixed(0)}%
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// 2. 폭포 차트 (Waterfall Chart) — Recharts
// ════════════════════════════════════════════════════════

function SupplyWaterfall({
  foreign, institution, individual,
}: {
  foreign: number; institution: number; individual: number
}) {
  const fEok = toEok(foreign)
  const iEok = toEok(institution)
  const pEok = toEok(individual)

  const afterF = fEok
  const afterI = afterF + iEok
  const total = afterI + pEok

  const data = [
    {
      name: '외국인', value: fEok,
      invisible: Math.min(0, afterF),
      visible: Math.abs(fEok),
    },
    {
      name: '기관', value: iEok,
      invisible: Math.min(afterF, afterI),
      visible: Math.abs(iEok),
    },
    {
      name: '개인', value: pEok,
      invisible: Math.min(afterI, total),
      visible: Math.abs(pEok),
    },
    {
      name: '순합계', value: total,
      invisible: Math.min(0, total),
      visible: Math.abs(total),
      isTotal: true,
    },
  ]

  const colors = data.map(d =>
    (d as { isTotal?: boolean }).isTotal ? '#666' : d.value >= 0 ? '#E24B4A' : '#378ADD'
  )

  return (
    <div>
      <div className="text-sm text-[#94a3b8] font-bold mb-3">수급 누적 흐름 (억원)</div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barCategoryGap="20%" margin={{ top: 30, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v.toLocaleString()}`}
            axisLine={false}
            tickLine={false}
            domain={[(min: number) => Math.floor(min * 1.3), (max: number) => Math.ceil(max * 1.3)]}
          />
          <ReferenceLine y={0} stroke="#555" strokeWidth={1} />

          {/* 투명 스택 (누적 시작점) */}
          <Bar dataKey="invisible" stackId="stack" fill="transparent" />

          {/* 실제 보이는 바 */}
          <Bar dataKey="visible" stackId="stack" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v) => { const n = Number(v); return `${n >= 0 ? '+' : ''}${n.toLocaleString()}` }}
              style={{ fill: '#fff', fontSize: 14, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// 3. 메인 패널
// ════════════════════════════════════════════════════════

export function SupplyDemandPanel() {
  const { data, isLoading } = useIntelligenceSupplyDemand()
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full ${isStale ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌡️</span>
          <span className="text-base font-bold text-white tracking-wider">수급 흐름</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-xs font-bold ${rel.daysAgo === 0 ? 'text-[#00ff88]' : 'text-gray-500'}`}>{rel.label}</span>}
          <span className="text-xs text-gray-500">{dateStr}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-[180px] bg-[#1a2535] animate-pulse rounded" />
            <div className="h-[200px] bg-[#1a2535] animate-pulse rounded" />
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          <>
            {/* 그림 백분율 차트: 3명 가로 배치 */}
            {(() => {
              const total = Math.abs(data.foreign_net) + Math.abs(data.inst_net) + Math.abs(data.individual_net)
              const fRatio = total > 0 ? (Math.abs(data.foreign_net) / total) * 100 : 33
              const iRatio = total > 0 ? (Math.abs(data.inst_net) / total) * 100 : 33
              const pRatio = total > 0 ? (Math.abs(data.individual_net) / total) * 100 : 33
              return (
                <div className="flex justify-center gap-8 sm:gap-14">
                  <SupplyPictogram label="외국인" amount={data.foreign_net} ratio={fRatio} streak={data.foreign_streak} />
                  <SupplyPictogram label="기관" amount={data.inst_net} ratio={iRatio} streak={data.inst_streak} />
                  <SupplyPictogram label="개인" amount={data.individual_net} ratio={pRatio} streak={0} />
                </div>
              )
            })()}

            {/* 구분선 */}
            <div className="border-t border-[#2a2a3a]" />

            {/* 폭포 차트: 누적 흐름 */}
            <SupplyWaterfall
              foreign={data.foreign_net}
              institution={data.inst_net}
              individual={data.individual_net}
            />

            {/* AI 요약 */}
            {data.summary && (
              <div className="p-3 bg-[#0d1420] rounded-lg border border-[#2a2a3a]">
                <div className="text-xs text-[#8a8a8a] font-bold mb-1">AI 한 줄 요약</div>
                <div className="text-sm text-[#e2e8f0] leading-relaxed">{data.summary}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
