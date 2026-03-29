'use client'

import { useBriefing } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const DIR_COLOR: Record<string, string> = {
  BULL: 'text-[var(--up)] bg-[var(--up)]/10 border-[var(--up)]/30',
  BEAR: 'text-[var(--down)] bg-[var(--down)]/10 border-[var(--down)]/30',
  NEUTRAL: 'text-[var(--yellow)] bg-[var(--yellow)]/10 border-[var(--yellow)]/30',
  CAUTION: 'text-orange-600 bg-orange-500/10 border-orange-500/30',
}

export function MorningNewsPanel() {
  const { data, isLoading } = useBriefing()

  const rel = data ? getRelativeDate(data.date) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full text-xs bg-white ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">모닝 브리핑</span>
          {data && (
            <span className={`text-[10px] px-1 py-0.5 rounded-sm border font-bold ${DIR_COLOR[data.direction] ?? DIR_COLOR.NEUTRAL}`}>
              {data.direction}
            </span>
          )}
          {rel && rel.daysAgo === 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--green)]" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rel && (
            <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[var(--green)]' : rel.daysAgo <= 1 ? 'text-[var(--text-dim)]' : 'text-[var(--text-muted)]'}`}>
              {rel.label}
            </span>
          )}
          <span className="text-[11px] text-[var(--text-dim)] font-bold">{data?.date ?? ''}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[32px] mx-2 my-px bg-gray-100 animate-pulse rounded-sm" />
          ))
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">데이터 없음</div>
        ) : (
          <div className="px-3 py-2 space-y-2">
            <div className="flex gap-4 text-xs">
              <span className="text-[var(--text-dim)]">KOSPI</span>
              <span className="text-[13px] text-[var(--text-primary)] font-bold tabular-nums">{data.kospi_close?.toLocaleString()}</span>
              <span className="text-[var(--text-dim)]">시장</span>
              <span className="text-[13px] text-[var(--yellow)] font-bold">{data.market_phase}</span>
            </div>
            <div className="border-l-2 border-[var(--blue)]/30 pl-2">
              <div className="text-[10px] text-[var(--blue)] font-bold mb-0.5">US</div>
              <div className="text-[var(--text-primary)] text-xs leading-relaxed">{data.us_summary}</div>
            </div>
            <div className="border-l-2 border-[var(--up)]/30 pl-2">
              <div className="text-[10px] text-[var(--up)] font-bold mb-0.5">KR</div>
              <div className="text-[var(--text-primary)] text-xs leading-relaxed">{data.kr_summary}</div>
            </div>
            {data.news_picks && data.news_picks.length > 0 && (
              <div className="border-t border-[var(--border)] pt-2">
                <div className="text-[10px] text-[var(--text-dim)] font-bold mb-1">NEWS PICKS</div>
                {data.news_picks.map((pick: { code: string; name: string; reason: string }, i: number) => (
                  <div key={pick.code} className={`flex items-center gap-2 py-1 border-b border-[var(--border)]/30 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <span className="text-[13px] text-[var(--text-primary)] font-medium shrink-0">{pick.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">{pick.code}</span>
                    <span className="text-[var(--text-dim)] text-xs truncate">{pick.reason}</span>
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
