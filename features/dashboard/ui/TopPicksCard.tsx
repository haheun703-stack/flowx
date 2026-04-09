'use client'

import Link from 'next/link'
import { useDashboardPicks } from '../api/useDashboard'
import { DashboardCard, CardSkeleton } from './DashboardCard'
import {
  GRADE_STRONG_PICK,
  GRADE_PICK,
  GRADE_WATCH,
  GRADE_OBSERVE,
  GRADE_LEGACY_FORCE_BUY,
  GRADE_LEGACY_BUY,
  GRADE_LEGACY_WATCH_BUY,
  BUYABLE_GRADES,
} from '@/shared/constants/grades'

const GRADE_COLORS: Record<string, string> = {
  [GRADE_LEGACY_FORCE_BUY]: 'bg-[var(--up-bg)] text-[var(--up)] border-[var(--up)]/30',
  [GRADE_STRONG_PICK]: 'bg-[var(--up-bg)] text-[var(--up)] border-[var(--up)]/30',
  [GRADE_LEGACY_BUY]: 'bg-amber-50 text-[var(--yellow)] border-[var(--yellow)]/30',
  [GRADE_PICK]: 'bg-amber-50 text-[var(--yellow)] border-[var(--yellow)]/30',
  [GRADE_LEGACY_WATCH_BUY]: 'bg-amber-50/70 text-[var(--yellow)] border-[var(--yellow)]/30',
  [GRADE_WATCH]: 'bg-amber-50/70 text-[var(--yellow)] border-[var(--yellow)]/30',
  [GRADE_OBSERVE]: 'bg-[var(--bg-row)] text-[var(--text-dim)] border-[var(--border)]',
}

function formatPrice(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}만`
  return v.toLocaleString()
}

function formatBil(v: number) {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}조`
  if (abs >= 1e8) return `${sign}${(abs / 1e8).toFixed(0)}억`
  return `${sign}${abs.toLocaleString()}`
}

export function TopPicksCard() {
  const { data, isLoading } = useDashboardPicks()

  if (isLoading || !data) return <CardSkeleton className="col-span-2" />

  const topPicks = data.picks
    .filter(p => (BUYABLE_GRADES as readonly string[]).includes(p.grade))
    .slice(0, 8)

  return (
    <DashboardCard
      title={`AI 인사이트 — ${data.target_date_label}`}
      icon="🎯"
      updatedAt={data.generated_at}
      className="col-span-2"
    >
      {/* AI 대형주 분석 */}
      {data.ai_largecap?.length > 0 && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-[10px] text-[var(--green)] mb-1 font-semibold">AI 대형주 분석</p>
          {data.ai_largecap.slice(0, 2).map(item => (
            <div key={item.ticker} className="text-xs text-[var(--text-primary)] mb-1">
              <span className="text-[var(--text-primary)] font-medium">{item.name}</span>
              <span className="text-[var(--green)] ml-1">({Math.round(item.confidence * 100)}%)</span>
              <span className="text-[var(--text-muted)] ml-1">— {item.reasoning.slice(0, 50)}...</span>
            </div>
          ))}
        </div>
      )}

      {/* 통계 바 */}
      <div className="flex gap-2 mb-3 text-[10px]">
        {Object.entries(data.stats).filter(([, v]) => v > 0).map(([grade, count]) => (
          <span key={grade} className="text-[var(--text-muted)]">
            {grade} <span className="text-[var(--text-primary)]">{count}</span>
          </span>
        ))}
      </div>

      {/* 종목 리스트 */}
      <div className="space-y-1">
        {topPicks.map(pick => (
          <Link
            key={pick.ticker}
            href={`/chart/${pick.ticker}`}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[var(--bg-row)] transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${GRADE_COLORS[pick.grade] ?? 'bg-[var(--bg-row)] text-[var(--text-dim)]'}`}>
                {pick.grade}
              </span>
              <span className="text-xs text-[var(--text-primary)] font-medium truncate">{pick.name}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{pick.ticker}</span>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              <span className="text-[var(--text-dim)]">{formatPrice(pick.close)}원</span>
              <span className={pick.price_change >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>
                {pick.price_change >= 0 ? '+' : ''}{pick.price_change.toFixed(1)}%
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                외{formatBil(pick.foreign_5d)} 기{formatBil(pick.inst_5d)}
              </span>
              <span className="text-[var(--green)] font-mono font-bold">{pick.total_score.toFixed(0)}점</span>
            </div>
          </Link>
        ))}
      </div>
    </DashboardCard>
  )
}
