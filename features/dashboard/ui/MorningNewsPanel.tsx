'use client'

import { useBriefing } from '../api/useDashboard'

const DIR_COLOR: Record<string, string> = {
  BULL: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  BEAR: 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/30',
  NEUTRAL: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  CAUTION: 'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/30',
}

/** 상대 시간 표시: '오늘', '어제', 'N일 전' */
function relativeDate(dateStr: string): { label: string; daysAgo: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return { label: '오늘', daysAgo: 0 }
  if (diff === 1) return { label: '어제', daysAgo: 1 }
  return { label: `${diff}일 전`, daysAgo: diff }
}

export function MorningNewsPanel() {
  const { data, isLoading } = useBriefing()

  const rel = data ? relativeDate(data.date) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full text-xs ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">모닝 브리핑</span>
          {data && (
            <span className={`text-[10px] px-1 py-0.5 rounded-sm border font-bold ${DIR_COLOR[data.direction] ?? DIR_COLOR.NEUTRAL}`}>
              {data.direction}
            </span>
          )}
          {/* 실시간 인디케이터: 오늘 데이터면 초록 점 */}
          {rel && rel.daysAgo === 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rel && (
            <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[#00ff88]' : rel.daysAgo <= 1 ? 'text-[#8a8a8a]' : 'text-[#555]'}`}>
              {rel.label}
            </span>
          )}
          <span className="text-[11px] text-[#8a8a8a] font-bold">{data?.date ?? ''}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[32px] mx-2 my-px bg-[#1a2535] animate-pulse rounded-sm" />
          ))
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          <div className="px-3 py-2 space-y-2">
            <div className="flex gap-4 text-xs">
              <span className="text-[#8a8a8a]">KOSPI</span>
              <span className="text-[13px] text-[#e2e8f0] font-bold tabular-nums">{data.kospi_close?.toLocaleString()}</span>
              <span className="text-[#8a8a8a]">시장</span>
              <span className="text-[13px] text-[#f59e0b] font-bold">{data.market_phase}</span>
            </div>
            <div className="border-l-2 border-[#0ea5e9]/30 pl-2">
              <div className="text-[10px] text-[#0ea5e9] font-bold mb-0.5">US</div>
              <div className="text-[#cbd5e1] text-xs leading-relaxed">{data.us_summary}</div>
            </div>
            <div className="border-l-2 border-[#ff3b5c]/30 pl-2">
              <div className="text-[10px] text-[#ff3b5c] font-bold mb-0.5">KR</div>
              <div className="text-[#cbd5e1] text-xs leading-relaxed">{data.kr_summary}</div>
            </div>
            {data.news_picks && data.news_picks.length > 0 && (
              <div className="border-t border-[#2a2a3a] pt-2">
                <div className="text-[10px] text-[#8a8a8a] font-bold mb-1">NEWS PICKS</div>
                {data.news_picks.map((pick: { code: string; name: string; reason: string }, i: number) => (
                  <div key={pick.code} className={`flex items-center gap-2 py-1 border-b border-[#2a2a3a]/30 ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}>
                    <span className="text-[13px] text-[#e2e8f0] font-medium shrink-0">{pick.name}</span>
                    <span className="text-[10px] text-[#555] shrink-0">{pick.code}</span>
                    <span className="text-[#8a8a8a] text-xs truncate">{pick.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
