'use client'

import { useIntelligenceDisclosures, type DisclosureItem } from '../api/useIntelligence'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const SENTIMENT_COLOR: Record<string, string> = {
  POSITIVE: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  CAUTION: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  NEUTRAL: 'text-[#64748b] bg-[#64748b]/10 border-[#64748b]/30',
}

const SENTIMENT_LABEL: Record<string, string> = {
  POSITIVE: '호재',
  CAUTION: '주의',
  NEUTRAL: '중립',
}

function DisclosureRow({ item, idx }: { item: DisclosureItem; idx: number }) {
  return (
    <div className={`px-3 py-2 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] ${idx % 2 === 1 ? 'bg-[#0d1117]' : ''}`}>
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`text-[9px] px-1 py-0.5 rounded-sm border font-bold ${SENTIMENT_COLOR[item.sentiment]}`}>
          {SENTIMENT_LABEL[item.sentiment] ?? item.sentiment}
        </span>
        {item.ticker_name && (
          <span className="text-[12px] text-[#e2e8f0] font-medium">{item.ticker_name}</span>
        )}
        {item.ticker && (
          <span className="text-[10px] text-[#555]">{item.ticker}</span>
        )}
        {item.category && (
          <span className="text-[10px] text-[#8a8a8a] ml-auto">{item.category}</span>
        )}
      </div>
      <div className="text-[12px] text-[#cbd5e1] leading-snug">{item.title}</div>
      {item.ai_summary && (
        <div className="text-[11px] text-[#8a8a8a] mt-1 leading-relaxed border-l-2 border-[#2a2a3a] pl-2">
          {item.ai_summary}
        </div>
      )}
      {item.tags.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {item.tags.map((tag: string) => (
            <span key={tag} className="text-[9px] text-[#a855f7] border border-[#a855f7]/20 px-1 rounded-sm">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

interface DisclosuresPanelProps {
  source: 'DART' | 'EDGAR'
  title: string
  accentColor: string
}

export function DisclosuresPanel({ source, title, accentColor }: DisclosuresPanelProps) {
  const { data, isLoading } = useIntelligenceDisclosures(source)
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
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[48px] mx-2 my-px bg-[#1a2535] animate-pulse rounded-sm" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          items.map((item, i) => <DisclosureRow key={item.id} item={item} idx={i} />)
        )}
      </div>
    </div>
  )
}
