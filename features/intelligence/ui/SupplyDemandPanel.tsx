'use client'

import { useIntelligenceSupplyDemand } from '../api/useIntelligence'
import { getRelativeDate } from '@/shared/lib/dateUtils'

function formatKrNumber(v: number): string {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  if (abs >= 1_0000_0000) return `${sign}${(abs / 1_0000_0000).toFixed(1)}조`
  if (abs >= 1_0000) return `${sign}${Math.round(abs / 1_0000).toLocaleString()}억`
  return `${sign}${abs.toLocaleString()}`
}

/** 인체 픽토그램 아이콘 (SVG) */
function PersonIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg width="20" height="28" viewBox="0 0 20 28" className="shrink-0">
      {/* 머리 */}
      <circle cx="10" cy="5" r="4" fill={filled ? color : '#1e293b'} stroke={filled ? color : '#334155'} strokeWidth="1" />
      {/* 몸 */}
      <path
        d="M10 10 C4 10 2 14 2 18 L2 22 C2 23 3 24 4 24 L16 24 C17 24 18 23 18 22 L18 18 C18 14 16 10 10 10Z"
        fill={filled ? color : '#1e293b'}
        stroke={filled ? color : '#334155'}
        strokeWidth="1"
      />
    </svg>
  )
}

/** 10명 픽토그램 행 */
function PictogramRow({
  label,
  value,
  total,
  color,
  streak,
}: {
  label: string
  value: number
  total: number
  color: string
  streak: number
}) {
  const isBuying = value > 0
  // 10명 중 몇 명을 채울지 (최소 1, 최대 10)
  const filledCount = total > 0
    ? Math.max(1, Math.min(10, Math.round((Math.abs(value) / total) * 10)))
    : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#e2e8f0]">{label}</span>
          {streak !== 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              streak > 0 ? 'bg-[#ff3b5c]/10 text-[#ff3b5c]' : 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
            }`}>
              {streak > 0 ? '매수' : '매도'} {Math.abs(streak)}일째
            </span>
          )}
        </div>
        <span className="text-base font-black tabular-nums" style={{ color: isBuying ? color : '#64748b' }}>
          {formatKrNumber(value)}
        </span>
      </div>
      {/* 10명 픽토그램 */}
      <div className="flex items-end gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <PersonIcon key={i} filled={i < filledCount} color={isBuying ? color : '#475569'} />
        ))}
        <span className="text-xs text-[#64748b] ml-2 self-center">
          {filledCount}/10
        </span>
      </div>
    </div>
  )
}

/** 폭포 차트 바 */
function WaterfallBar({ label, value, maxAbs, color }: { label: string; value: number; maxAbs: number; color: string }) {
  const pct = maxAbs > 0 ? (Math.abs(value) / maxAbs) * 100 : 0
  const isBuying = value >= 0

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#8a8a8a] font-bold w-16 shrink-0 truncate">{label}</span>
      <div className="flex-1 flex items-center h-5 relative">
        {/* 중앙선 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#334155]" />
        {/* 바 */}
        <div
          className="h-full rounded-sm absolute transition-all"
          style={{
            width: `${pct / 2}%`,
            backgroundColor: isBuying ? color : '#475569',
            ...(isBuying
              ? { left: '50%' }
              : { right: '50%' }),
          }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-14 text-right"
        style={{ color: isBuying ? color : '#64748b' }}>
        {value >= 0 ? '+' : ''}{value}억
      </span>
    </div>
  )
}

export function SupplyDemandPanel() {
  const { data, isLoading } = useIntelligenceSupplyDemand()
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full ${isStale ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="text-base">🌡️</span>
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider">수급 온도계</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[#00ff88]' : 'text-[#555]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[#8a8a8a]">{dateStr}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[60px] bg-[#1a2535] animate-pulse rounded" />
          ))
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          <>
            {/* 3대 수급 주체 픽토그램 */}
            {(() => {
              const total = Math.abs(data.foreign_net) + Math.abs(data.inst_net) + Math.abs(data.individual_net)
              return (
                <div className="space-y-4">
                  <PictogramRow label="외국인" value={data.foreign_net} total={total} color="#ff3b5c" streak={data.foreign_streak} />
                  <PictogramRow label="기관" value={data.inst_net} total={total} color="#0ea5e9" streak={data.inst_streak} />
                  <PictogramRow label="개인" value={data.individual_net} total={total} color="#f59e0b" streak={0} />
                </div>
              )
            })()}

            {/* AI 요약 */}
            {data.summary && (
              <div className="p-3 bg-[#0d1420] rounded-lg border border-[#2a2a3a]">
                <div className="text-xs text-[#8a8a8a] font-bold mb-1">AI 한 줄 요약</div>
                <div className="text-sm text-[#e2e8f0] leading-relaxed">{data.summary}</div>
              </div>
            )}

            {/* 업종별 폭포 차트 */}
            {data.sector_flows && data.sector_flows.length > 0 && (
              <div>
                <div className="text-xs text-[#8a8a8a] font-bold mb-2">업종별 외국인 수급 (폭포 차트)</div>
                <div className="space-y-1">
                  {(() => {
                    const maxAbs = Math.max(...data.sector_flows.map(s => Math.abs(s.foreign_net)), 1)
                    return data.sector_flows.map((sf) => (
                      <WaterfallBar
                        key={sf.sector}
                        label={sf.sector}
                        value={sf.foreign_net}
                        maxAbs={maxAbs}
                        color="#ff3b5c"
                      />
                    ))
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
