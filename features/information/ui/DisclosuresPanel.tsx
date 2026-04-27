'use client'

import { useState } from 'react'
import { useInformationDisclosures, type DisclosureItem } from '../api/useInformation'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const SENTIMENT_STYLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  POSITIVE: { label: '호재', color: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  CAUTION: { label: '주의', color: '#dc2626', bg: 'bg-red-50', border: 'border-red-200' },
  NEUTRAL: { label: '중립', color: '#6b7280', bg: 'bg-gray-50', border: 'border-gray-200' },
}

/** 중요 공시 (POSITIVE/CAUTION) — 하이라이트 */
function HighlightRow({ item }: { item: DisclosureItem }) {
  const s = SENTIMENT_STYLE[item.sentiment] ?? SENTIMENT_STYLE.NEUTRAL
  return (
    <div className="px-4 py-3 border-b border-[var(--border)] hover:bg-gray-50 transition-colors"
      style={{ borderLeft: `3px solid ${s.color}` }}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${s.bg} ${s.border} border`}
          style={{ color: s.color }}>
          {s.label}
        </span>
        {item.ticker_name && (
          <span className="text-sm text-[var(--text-primary)] font-bold">{item.ticker_name}</span>
        )}
        {item.category && (
          <span className="text-[10px] text-[var(--text-dim)] ml-auto">{item.category}</span>
        )}
      </div>
      <div className="text-[14px] text-[var(--text-primary)] font-medium leading-snug">{item.title}</div>
      {item.ai_summary && (
        <div className="text-xs text-[var(--text-dim)] mt-1 leading-relaxed">{item.ai_summary}</div>
      )}
      {item.tags?.length > 0 && (
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {item.tags.map(tag => (
            <span key={tag} className="text-[10px] text-[var(--purple)] border border-[var(--purple)]/20 px-1.5 py-0.5 rounded bg-purple-50">{tag}</span>
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
    <div className="px-4 py-1.5 border-b border-[var(--border)]/20 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${s.bg} ${s.border} border`}
          style={{ color: s.color }}>
          {s.label}
        </span>
        {item.ticker_name && (
          <span className="text-xs text-[var(--text-dim)] font-medium">{item.ticker_name}</span>
        )}
        <span className="text-xs text-[var(--text-primary)] truncate flex-1">{item.title}</span>
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
  const { data, isLoading } = useInformationDisclosures(source)
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-base font-bold text-[var(--text-primary)] tracking-wider">{title}</span>
          <span className="text-xs text-[var(--text-muted)] font-bold">{items.length}건</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-xs font-bold ${rel.daysAgo === 0 ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>{rel.label}</span>}
          <span className="text-xs text-[var(--text-muted)]">{dateStr}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">데이터 없음</div>
        ) : (
          <>
            {/* 중요 공시 하이라이트 */}
            {important.map(item => <HighlightRow key={item.id} item={item} />)}

            {/* 나머지 공시 접기/펼치기 */}
            {neutral.length > 0 && (
              <>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full px-4 py-2 text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors border-b border-[var(--border)]/30 text-left flex items-center gap-1"
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
