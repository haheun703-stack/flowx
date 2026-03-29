'use client'

import { useInformationNews, type NewsItem } from '../api/useInformation'
import { getRelativeDate } from '@/shared/lib/dateUtils'

/** 영향 방향 뱃지 */
function ImpactBadge({ impact, score }: { impact: string; score: number }) {
  if (score >= 4) {
    return (
      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--up)]/10 text-[var(--up)] border border-[var(--up)]/20">
        ▲ 상승요인
      </span>
    )
  }
  if (impact === 'HIGH') {
    return (
      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--down)]/10 text-[var(--down)] border border-[var(--down)]/20">
        ▼ 하락요인
      </span>
    )
  }
  return (
    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-100 text-[var(--text-dim)] border border-[var(--border)]">
      ─ 중립
    </span>
  )
}

/** 1번 뉴스: 크게 (20px) */
function HeroNews({ item }: { item: NewsItem }) {
  return (
    <div className="px-4 py-3 border-b border-[var(--border)] bg-gray-50/50">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg font-black text-[var(--yellow)]">1</span>
        <ImpactBadge impact={item.impact} score={item.impact_score} />
        {item.sectors.length > 0 && (
          <div className="flex gap-1 ml-auto">
            {item.sectors.slice(0, 2).map(s => (
              <span key={s} className="text-[10px] text-[var(--blue)] border border-[var(--blue)]/20 px-1.5 py-0.5 rounded">{s}</span>
            ))}
          </div>
        )}
      </div>
      <div className="text-[18px] sm:text-[20px] text-[var(--text-primary)] font-bold leading-snug">{item.title}</div>
      {item.kr_impact && (
        <div className="text-sm text-[var(--text-dim)] mt-1">{item.kr_impact}</div>
      )}
    </div>
  )
}

/** 2-3번 뉴스: 중간 (16px) */
function SubNews({ item }: { item: NewsItem }) {
  return (
    <div className="px-4 py-2.5 border-b border-[var(--border)]/50 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-2">
        <span className="text-sm font-bold text-[var(--text-muted)] w-5 shrink-0 text-right">{item.rank}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <ImpactBadge impact={item.impact} score={item.impact_score} />
          </div>
          <div className="text-[15px] sm:text-[16px] text-[var(--text-primary)] font-semibold leading-snug">{item.title}</div>
          {item.kr_impact && (
            <div className="text-xs text-[var(--text-dim)] mt-0.5">{item.kr_impact}</div>
          )}
        </div>
      </div>
    </div>
  )
}

/** 4번 이후: 작게 (13px) */
function SmallNews({ item }: { item: NewsItem }) {
  return (
    <div className="px-4 py-1.5 border-b border-[var(--border)]/20 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[var(--text-muted)] w-4 shrink-0 text-right tabular-nums">{item.rank}</span>
        <ImpactBadge impact={item.impact} score={item.impact_score} />
        <span className="text-[13px] text-[var(--text-primary)] truncate flex-1">{item.title}</span>
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
            <div className="h-16 bg-gray-200 animate-pulse rounded" />
            <div className="h-10 bg-gray-200 animate-pulse rounded" />
            <div className="h-10 bg-gray-200 animate-pulse rounded" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">데이터 없음</div>
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
