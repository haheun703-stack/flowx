'use client'

import { useInformationNews, type NewsItem } from '../api/useInformation'
import { getRelativeDate } from '@/shared/lib/dateUtils'

/** 영향 방향 뱃지 */
function ImpactBadge({ impact, score }: { impact: string; score: number }) {
  if (score >= 4) {
    return (
      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#ff3b5c]/10 text-[#ff3b5c] border border-[#ff3b5c]/20">
        ▲ 상승요인
      </span>
    )
  }
  if (impact === 'HIGH') {
    return (
      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
        ▼ 하락요인
      </span>
    )
  }
  return (
    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#64748b]/10 text-[#64748b] border border-[#64748b]/20">
      ─ 중립
    </span>
  )
}

/** 1번 뉴스: 크게 (20px) */
function HeroNews({ item }: { item: NewsItem }) {
  return (
    <div className="px-4 py-3 border-b border-[#2a2a3a] bg-[#0d1420]/50">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg font-black text-[#f59e0b]">1</span>
        <ImpactBadge impact={item.impact} score={item.impact_score} />
        {item.sectors.length > 0 && (
          <div className="flex gap-1 ml-auto">
            {item.sectors.slice(0, 2).map(s => (
              <span key={s} className="text-[10px] text-[#0ea5e9] border border-[#0ea5e9]/20 px-1.5 py-0.5 rounded">{s}</span>
            ))}
          </div>
        )}
      </div>
      <div className="text-[18px] sm:text-[20px] text-[#e2e8f0] font-bold leading-snug">{item.title}</div>
      {item.kr_impact && (
        <div className="text-sm text-[#94a3b8] mt-1">{item.kr_impact}</div>
      )}
    </div>
  )
}

/** 2-3번 뉴스: 중간 (16px) */
function SubNews({ item }: { item: NewsItem }) {
  return (
    <div className="px-4 py-2.5 border-b border-[#2a2a3a]/50 hover:bg-[#0d1420]/30 transition-colors">
      <div className="flex items-start gap-2">
        <span className="text-sm font-bold text-[#555] w-5 shrink-0 text-right">{item.rank}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <ImpactBadge impact={item.impact} score={item.impact_score} />
          </div>
          <div className="text-[15px] sm:text-[16px] text-[#e2e8f0] font-semibold leading-snug">{item.title}</div>
          {item.kr_impact && (
            <div className="text-xs text-[#8a8a8a] mt-0.5">{item.kr_impact}</div>
          )}
        </div>
      </div>
    </div>
  )
}

/** 4번 이후: 작게 (13px) */
function SmallNews({ item }: { item: NewsItem }) {
  return (
    <div className="px-4 py-1.5 border-b border-[#2a2a3a]/20 hover:bg-[#0d1420]/20 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#444] w-4 shrink-0 text-right tabular-nums">{item.rank}</span>
        <ImpactBadge impact={item.impact} score={item.impact_score} />
        <span className="text-[13px] text-[#cbd5e1] truncate flex-1">{item.title}</span>
      </div>
    </div>
  )
}

interface HotIssuesPanelProps {
  scope: 'GLOBAL' | 'DOMESTIC'
  title: string
  accentColor: string
}

export function HotIssuesPanel({ scope, title, accentColor }: HotIssuesPanelProps) {
  const { data, isLoading } = useInformationNews(scope)
  const items = data?.items ?? []
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  const hero = items[0]
  const sub = items.slice(1, 3)
  const rest = items.slice(3)

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
            <div className="h-16 bg-[#1a2535] animate-pulse rounded" />
            <div className="h-10 bg-[#1a2535] animate-pulse rounded" />
            <div className="h-10 bg-[#1a2535] animate-pulse rounded" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          <>
            {hero && <HeroNews item={hero} />}
            {sub.map(item => <SubNews key={item.id} item={item} />)}
            {rest.map(item => <SmallNews key={item.id} item={item} />)}
          </>
        )}
      </div>
    </div>
  )
}
