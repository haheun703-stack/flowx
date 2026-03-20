'use client'

import { useIntelligenceSupplyDemand } from '../api/useIntelligence'
import { getRelativeDate } from '@/shared/lib/dateUtils'

/** 큰 숫자를 한국식 단위로 포맷 (억/만) */
function formatKrNumber(v: number): string {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  if (abs >= 1_0000_0000) return `${sign}${(abs / 1_0000_0000).toFixed(1)}조`
  if (abs >= 1_0000) return `${sign}${Math.round(abs / 1_0000).toLocaleString()}억`
  return `${sign}${abs.toLocaleString()}`
}

function FlowBar({ label, value, maxBar, streak, color }: { label: string; value: number; maxBar: number; streak: number; color: string }) {
  const absVal = Math.abs(value)
  const pct = maxBar > 0 ? Math.min((absVal / maxBar) * 100, 100) : 0
  const isPositive = value >= 0

  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-[11px] text-[#8a8a8a] font-bold w-12 shrink-0">{label}</span>
      <div className="flex-1 h-4 bg-[#1a2535] rounded-sm relative overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: isPositive ? color : '#334155',
            opacity: isPositive ? 1 : 0.6,
          }}
        />
      </div>
      <span className="text-[13px] font-bold tabular-nums w-20 text-right"
        style={{ color: isPositive ? color : '#64748b' }}>
        {formatKrNumber(value)}
      </span>
      {streak !== 0 && (
        <span className={`text-[10px] font-bold w-8 text-right ${streak > 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
          {streak > 0 ? '+' : ''}{streak}일
        </span>
      )}
    </div>
  )
}

export function SupplyDemandPanel() {
  const { data, isLoading } = useIntelligenceSupplyDemand()
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full text-xs ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">수급 흐름</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[#00ff88]' : 'text-[#555]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[#8a8a8a] font-bold">{dateStr}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[28px] bg-[#1a2535] animate-pulse rounded-sm mb-1" />
          ))
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          <>
            {(() => {
              const dynamicMax = Math.max(
                Math.abs(data.foreign_net),
                Math.abs(data.inst_net),
                Math.abs(data.individual_net),
                1
              )
              return (
                <>
                  <FlowBar label="외국인" value={data.foreign_net} maxBar={dynamicMax} streak={data.foreign_streak} color="#ff3b5c" />
                  <FlowBar label="기관" value={data.inst_net} maxBar={dynamicMax} streak={data.inst_streak} color="#0ea5e9" />
                  <FlowBar label="개인" value={data.individual_net} maxBar={dynamicMax} streak={0} color="#f59e0b" />
                </>
              )
            })()}

            {data.summary && (
              <div className="mt-3 p-2 bg-[#0d1420] rounded border border-[#2a2a3a]">
                <div className="text-[10px] text-[#8a8a8a] font-bold mb-1">AI 요약</div>
                <div className="text-[12px] text-[#cbd5e1] leading-relaxed">{data.summary}</div>
              </div>
            )}

            {data.sector_flows && data.sector_flows.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] text-[#8a8a8a] font-bold mb-1">업종별 외국인 수급</div>
                <div className="space-y-0.5">
                  {data.sector_flows.map((sf) => (
                    <div key={sf.sector} className="flex items-center gap-2 py-0.5">
                      <span className="text-[11px] text-[#e2e8f0] w-20 truncate">{sf.sector}</span>
                      <span className={`text-[12px] font-bold tabular-nums ${sf.foreign_net >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                        {sf.foreign_net >= 0 ? '+' : ''}{sf.foreign_net}억
                      </span>
                      {sf.streak !== 0 && (
                        <span className={`text-[10px] ${sf.streak > 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                          {sf.streak > 0 ? '▲' : '▼'}{Math.abs(sf.streak)}일
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
