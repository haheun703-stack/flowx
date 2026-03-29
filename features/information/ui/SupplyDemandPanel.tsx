'use client'

import { useId } from 'react'
import { useInformationSupplyDemand } from '../api/useInformation'
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
// ════════════════════════════════════════════════════════

function SupplyPictogram({
  label, amount, ratio, streak,
}: {
  label: string; amount: number; ratio: number; streak: number
}) {
  const isSell = amount < 0
  const fillColor = isSell ? '#2563eb' : '#dc2626'  // 한국식: 매도=파랑, 매수=빨강
  const fillPct = Math.min(Math.max(Math.abs(ratio), 5), 100)
  const uid = useId()
  const clipId = `fill-${uid}`
  const bodyH = 170
  const clipY = 200 - (fillPct / 100 * bodyH)
  const clipH = fillPct / 100 * bodyH + 30

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-[var(--text-dim)] font-bold">{label}</span>

      {streak !== 0 && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          streak > 0 ? 'bg-[var(--up-bg)] text-[var(--up)]' : 'bg-[var(--down-bg)] text-[var(--down)]'
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
        <circle cx="55" cy="24" r="16" fill="#d1d5db" />
        <path d="M25,50 L36,50 L36,110 L25,110 Z" fill="#d1d5db" />
        <path d="M74,50 L85,50 L85,110 L74,110 Z" fill="#d1d5db" />
        <path d="M36,46 L74,46 L74,125 L36,125 Z" fill="#d1d5db" />
        <path d="M36,125 L50,125 L50,192 L36,192 Z" fill="#d1d5db" />
        <path d="M60,125 L74,125 L74,192 L60,192 Z" fill="#d1d5db" />

        {/* 색칠된 사람 (아래서부터 채움) */}
        <g clipPath={`url(#${clipId})`}>
          <circle cx="55" cy="24" r="16" fill={fillColor} />
          <path d="M25,50 L36,50 L36,110 L25,110 Z" fill={fillColor} />
          <path d="M74,50 L85,50 L85,110 L74,110 Z" fill={fillColor} />
          <path d="M36,46 L74,46 L74,125 L36,125 Z" fill={fillColor} />
          <path d="M36,125 L50,125 L50,192 L36,192 Z" fill={fillColor} />
          <path d="M60,125 L74,125 L74,192 L60,192 Z" fill={fillColor} />
        </g>

        {/* 비율 경계선 */}
        <line
          x1="15" y1={clipY} x2="95" y2={clipY}
          stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"
        />
      </svg>

      {/* 금액 */}
      <div className={`text-xl font-black tabular-nums ${isSell ? 'text-[var(--down)]' : 'text-[var(--up)]'}`}>
        {formatKrNumber(amount)}
      </div>
      {/* 비율 */}
      <div className="text-xs text-[var(--text-dim)]">
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

  interface WaterfallDatum {
    name: string; value: number; invisible: number; visible: number; isTotal?: boolean
  }

  const data: WaterfallDatum[] = [
    { name: '외국인', value: fEok, invisible: Math.min(0, afterF), visible: Math.abs(fEok) },
    { name: '기관', value: iEok, invisible: Math.min(afterF, afterI), visible: Math.abs(iEok) },
    { name: '개인', value: pEok, invisible: Math.min(afterI, total), visible: Math.abs(pEok) },
    { name: '순합계', value: total, invisible: Math.min(0, total), visible: Math.abs(total), isTotal: true },
  ]

  const colors = data.map(d =>
    d.isTotal ? '#9ca3af' : d.value >= 0 ? '#dc2626' : '#2563eb'
  )

  return (
    <div>
      <div className="text-sm text-[var(--text-dim)] font-bold mb-3">수급 누적 흐름 (억원)</div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barCategoryGap="20%" margin={{ top: 30, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v.toLocaleString()}`}
            axisLine={false}
            tickLine={false}
            domain={[
              (min: number) => Math.floor(min * 1.3),
              (max: number) => Math.ceil(max * 1.3),
            ] as const}
          />
          <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />

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
              style={{ fill: '#111827', fontSize: 14, fontWeight: 700 }}
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

function PictogramSection({ data }: { data: { foreign_net: number; inst_net: number; individual_net: number; foreign_streak: number; inst_streak: number } }) {
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
}

export function SupplyDemandPanel() {
  const { data, isLoading } = useInformationSupplyDemand()
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full ${isStale ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌡️</span>
          <span className="text-base font-bold text-[var(--text-primary)] tracking-wider">수급 흐름</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-xs font-bold ${rel.daysAgo === 0 ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>{rel.label}</span>}
          <span className="text-xs text-[var(--text-muted)]">{dateStr}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-[180px] bg-gray-200 animate-pulse rounded" />
            <div className="h-[200px] bg-gray-200 animate-pulse rounded" />
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">데이터 없음</div>
        ) : (
          <>
            {/* 그림 백분율 차트: 3명 가로 배치 */}
            <PictogramSection data={data} />

            {/* 구분선 */}
            <div className="border-t border-[var(--border)]" />

            {/* 폭포 차트: 누적 흐름 */}
            <SupplyWaterfall
              foreign={data.foreign_net}
              institution={data.inst_net}
              individual={data.individual_net}
            />

            {/* AI 요약 */}
            {data.summary && (
              <div className="p-3 bg-gray-50 rounded-lg border border-[var(--border)]">
                <div className="text-xs text-[var(--text-dim)] font-bold mb-1">AI 한 줄 요약</div>
                <div className="text-sm text-[var(--text-primary)] leading-relaxed">{data.summary}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
