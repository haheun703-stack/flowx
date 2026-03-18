'use client'

import { useIntelligenceNews, type NewsItem } from '../api/useIntelligence'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const IMPACT_COLOR: Record<string, string> = {
  HIGH: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  MEDIUM: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  LOW: 'text-[#64748b] bg-[#64748b]/10 border-[#64748b]/30',
}

function NewsRow({ item, idx }: { item: NewsItem; idx: number }) {
  return (
    <div className={`flex items-start gap-2 px-3 py-2 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] ${idx % 2 === 1 ? 'bg-[#0d1117]' : ''}`}>
      <span className="text-[11px] text-[#555] font-bold w-5 shrink-0 text-right tabular-nums">{item.rank}</span>
      <span className={`text-[9px] px-1 py-0.5 rounded-sm border font-bold shrink-0 ${IMPACT_COLOR[item.impact] ?? IMPACT_COLOR.MEDIUM}`}>
        {item.impact}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-[#e2e8f0] leading-snug">{item.title}</div>
        {item.kr_impact && (
          <div className="text-[11px] text-[#8a8a8a] mt-0.5">{item.kr_impact}</div>
        )}
        {item.sectors.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {item.sectors.map(s => (
              <span key={s} className="text-[9px] text-[#0ea5e9] border border-[#0ea5e9]/20 px-1 rounded-sm">{s}</span>
            ))}
          </div>
        )}
      </div>
      {item.impact_score >= 4 && (
        <span className="text-[10px] text-[#ff3b5c] font-bold shrink-0">&#9733;{item.impact_score}</span>
      )}
    </div>
  )
}

interface HotIssuesPanelProps {
  scope: 'GLOBAL' | 'DOMESTIC'
  title: string
  accentColor: string
}

export function HotIssuesPanel({ scope, title, accentColor }: HotIssuesPanelProps) {
  const { data, isLoading } = useIntelligenceNews(scope)
  const items = data?.items ?? []
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full text-xs ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">{title}</span>
          <span className="text-[11px] text-[#8a8a8a] font-bold">{items.length}건</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[#00ff88]' : 'text-[#555]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[#8a8a8a] font-bold">{dateStr}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[40px] mx-2 my-px bg-[#1a2535] animate-pulse rounded-sm" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          items.map((item, i) => <NewsRow key={item.id} item={item} idx={i} />)
        )}
      </div>
    </div>
  )
}
