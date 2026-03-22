'use client'

import { useState } from 'react'
import { useIntelligenceDisclosures, type DisclosureItem } from '../api/useIntelligence'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const SENTIMENT_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  POSITIVE: { label: '호재', color: '#10b981', bg: 'bg-[#10b981]/10', border: 'border-[#10b981]/30' },
  CAUTION: { label: '주의', color: '#ef4444', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30' },
  NEUTRAL: { label: '중립', color: '#64748b', bg: 'bg-[#64748b]/10', border: 'border-[#64748b]/30' },
}

/** 중요 공시 (POSITIVE/CAUTION) — 하이라이트 */
function HighlightRow({ item }: { item: DisclosureItem }) {
  const s = SENTIMENT_STYLE[item.sentiment] ?? SENTIMENT_STYLE.NEUTRAL
  return (
    <div className="px-4 py-3 border-b border-[#2a2a3a] hover:bg-[#0d1420]/30 transition-colors"
      style={{ borderLeft: `3px solid ${s.color}` }}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${s.bg} ${s.border} border`}
          style={{ color: s.color }}>
          {s.label}
        </span>
        {item.ticker_name && (
          <span className="text-sm text-[#e2e8f0] font-bold">{item.ticker_name}</span>
        )}
        {item.category && (
          <span className="text-[10px] text-[#8a8a8a] ml-auto">{item.category}</span>
        )}
      </div>
      <div className="text-[14px] text-[#e2e8f0] font-medium leading-snug">{item.title}</div>
      {item.ai_summary && (
        <div className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{item.ai_summary}</div>
      )}
      {item.tags.length > 0 && (
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {item.tags.map(tag => (
            <span key={tag} className="text-[10px] text-[#a855f7] border border-[#a855f7]/20 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

/** 일반 공시 — 접힌 상태에서는 제목만 */
function CompactRow({ item }: { item: DisclosureItem }) {
  const s = SENTIMENT_STYLE[item.sentiment] ?? SENTIMENT_STYLE.NEUTRAL
  return (
    <div className="px-4 py-1.5 border-b border-[#2a2a3a]/20 hover:bg-[#0d1420]/20 transition-colors">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${s.bg} ${s.border} border`}
          style={{ color: s.color }}>
          {s.label}
        </span>
        {item.ticker_name && (
          <span className="text-xs text-[#8a8a8a] font-medium">{item.ticker_name}</span>
        )}
        <span className="text-xs text-[#cbd5e1] truncate flex-1">{item.title}</span>
      </div>
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
  const [showAll, setShowAll] = useState(false)
  const items = data?.items ?? []
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  // 중요 공시 = POSITIVE or CAUTION
  const important = items.filter(d => d.sentiment !== 'NEUTRAL')
  const neutral = items.filter(d => d.sentiment === 'NEUTRAL')

  return (
    <div className={`flex flex-col h-full ${isStale ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-base font-bold text-white tracking-wider">{title}</span>
          <span className="text-xs text-gray-500 font-bold">{items.length}건</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-xs font-bold ${rel.daysAgo === 0 ? 'text-[#00ff88]' : 'text-gray-500'}`}>{rel.label}</span>}
          <span className="text-xs text-gray-500">{dateStr}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-[#1a2535] animate-pulse rounded" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          <>
            {/* 중요 공시 하이라이트 */}
            {important.map(item => <HighlightRow key={item.id} item={item} />)}

            {/* 나머지 공시 접기/펼치기 */}
            {neutral.length > 0 && (
              <>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full px-4 py-2 text-xs font-bold text-[#8a8a8a] hover:text-[#e2e8f0] transition-colors border-b border-[#2a2a3a]/30 text-left flex items-center gap-1"
                >
                  <span className="transition-transform" style={{ transform: showAll ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                  기타 공시 {neutral.length}건 {showAll ? '접기' : '펼치기'}
                </button>
                {showAll && neutral.map(item => <CompactRow key={item.id} item={item} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
