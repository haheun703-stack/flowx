'use client'

import { useDashboardMorning } from '../api/useDashboard'

const IMPACT_COLOR: Record<string, string> = {
  high: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  medium: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  low: 'text-[#64748b] bg-[#64748b]/10 border-[#64748b]/30',
}

export function MorningNewsPanel() {
  const { data, isLoading } = useDashboardMorning()

  const articles = data?.articles
    ?.filter(a => a.impact === 'high' || a.impact === 'medium')
    .slice(0, 20) ?? []

  return (
    <div className="flex flex-col h-full text-xs" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          <span className="text-[#e2e8f0] text-sm font-black tracking-widest uppercase">모닝 브리핑</span>
          {data && (
            <span className="text-sm text-[#64748b] font-bold">
              {data.article_count}건 · 주요 {data.high_impact}건
            </span>
          )}
        </div>
        <span className="text-sm text-[#64748b] font-bold">{data?.crawled_at ?? ''}</span>
      </div>

      {/* 뉴스 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 mx-3 my-1 bg-[#1a2535] animate-pulse rounded-sm" />
          ))
        ) : articles.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">뉴스 없음</div>
        ) : (
          articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 px-3 py-2 border-b border-[#1a2535]/30 hover:bg-[#0d1420] transition-colors"
            >
              <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-sm border font-bold mt-0.5 ${IMPACT_COLOR[article.impact] ?? IMPACT_COLOR.low}`}>
                {article.impact === 'high' ? 'HIGH' : 'MID'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[#e2e8f0] text-sm font-bold leading-tight truncate">
                  {article.title}
                </div>
                <div className="text-[#334155] text-[10px] mt-0.5">{article.source}</div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
