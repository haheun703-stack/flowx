'use client'

import { useBriefing } from '../api/useDashboard'

const DIR_COLOR: Record<string, string> = {
  BULL: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  BEAR: 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/30',
  NEUTRAL: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
}

export function MorningNewsPanel() {
  const { data, isLoading } = useBriefing()

  return (
    <div className="flex flex-col h-full text-xs" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          <span className="text-[#e2e8f0] text-sm font-black tracking-widest uppercase">모닝 브리핑</span>
          {data && (
            <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-bold ${DIR_COLOR[data.direction] ?? DIR_COLOR.NEUTRAL}`}>
              {data.direction}
            </span>
          )}
        </div>
        <span className="text-sm text-[#64748b] font-bold">{data?.date ?? ''}</span>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 mx-3 my-1 bg-[#1a2535] animate-pulse rounded-sm" />
          ))
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          <div className="px-3 py-2 space-y-3">
            {/* 지수 */}
            <div className="flex gap-4 text-sm">
              <span className="text-[#64748b]">KOSPI</span>
              <span className="text-[#e2e8f0] font-bold">{data.kospi_close?.toLocaleString()}</span>
              <span className="text-[#64748b]">시장</span>
              <span className="text-[#f59e0b] font-bold">{data.market_phase}</span>
            </div>

            {/* 미국 */}
            <div className="border-l-2 border-[#0ea5e9]/30 pl-2">
              <div className="text-[10px] text-[#0ea5e9] font-bold mb-0.5">US</div>
              <div className="text-[#cbd5e1] text-sm leading-relaxed">{data.us_summary}</div>
            </div>

            {/* 한국 */}
            <div className="border-l-2 border-[#ff3b5c]/30 pl-2">
              <div className="text-[10px] text-[#ff3b5c] font-bold mb-0.5">KR</div>
              <div className="text-[#cbd5e1] text-sm leading-relaxed">{data.kr_summary}</div>
            </div>

            {/* 뉴스 종목 */}
            {data.news_picks && data.news_picks.length > 0 && (
              <div className="border-t border-[#1a2535] pt-2">
                <div className="text-[10px] text-[#64748b] font-bold mb-1.5">NEWS PICKS</div>
                {data.news_picks.map((pick: { code: string; name: string; reason: string }) => (
                  <div key={pick.code} className="flex items-center gap-2 py-1 border-b border-[#1a2535]/30">
                    <span className="text-[#e2e8f0] text-sm font-bold shrink-0">{pick.name}</span>
                    <span className="text-[#334155] text-[10px] shrink-0">{pick.code}</span>
                    <span className="text-[#64748b] text-sm truncate">{pick.reason}</span>
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
