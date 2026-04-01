'use client'

import { useBriefing } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const DIR_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  BULL:    { bg: '#E8F5E9', text: '#16A34A', label: '강세장' },
  BEAR:    { bg: '#FEE2E2', text: '#DC2626', label: '약세장' },
  NEUTRAL: { bg: '#F5F4F0', text: '#9CA3AF', label: '횡보장' },
  CAUTION: { bg: '#FFFBEB', text: '#D97706', label: '관망' },
}

export function MorningNewsPanel() {
  const { data, isLoading } = useBriefing()

  const rel = data ? getRelativeDate(data.date) : null
  const isStale = rel ? rel.daysAgo >= 7 : false
  const badge = DIR_BADGE[data?.direction ?? 'NEUTRAL'] ?? DIR_BADGE.NEUTRAL

  return (
    <div className={`flex flex-col h-full ${isStale ? 'opacity-50' : ''}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="fx-card-title mb-0">오늘의 브리핑</span>
          {data && (
            <span
              className="text-[8px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: badge.bg, color: badge.text }}
            >
              {badge.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rel && (
            <span className={`text-[9px] font-bold ${rel.daysAgo === 0 ? 'text-[#00CC6A]' : 'text-[#B0ADA6]'}`}>
              {rel.label}
            </span>
          )}
          <span className="text-[8px] text-[#C4C1BA]">{data?.date ?? ''}</span>
        </div>
      </div>

      {/* 바디 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[24px] bg-[#F5F4F0] animate-pulse rounded" />
            ))}
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-[10px] text-[#C4C1BA]">
            오늘의 브리핑을 준비 중입니다. 매일 오전 8시에 업데이트됩니다.
          </div>
        ) : (
          <div className="space-y-3">
            {/* KOSPI + 시장 */}
            <div className="flex gap-4 text-[10px]">
              <span className="text-[#9CA3AF]">KOSPI</span>
              <span className="text-[#1A1A2E] font-bold tabular-nums">{data.kospi_close?.toLocaleString()}</span>
              <span className="text-[#9CA3AF]">시장</span>
              <span className="text-[#D97706] font-bold">{data.market_phase}</span>
            </div>

            {/* US 요약 */}
            <div className="border-l-2 border-[var(--up)]/30 pl-2">
              <div className="text-[12px] font-semibold text-[#1A1A2E] mb-0.5">{data.us_summary?.split('.')[0]}.</div>
              <div className="text-[10px] text-[#6B7280] leading-relaxed">{data.us_summary}</div>
            </div>

            {/* KR 요약 */}
            <div className="border-l-2 border-[var(--down)]/30 pl-2">
              <div className="text-[10px] text-[#6B7280] leading-relaxed">{data.kr_summary}</div>
            </div>

            {/* 관련 뉴스 */}
            {data.news_picks && data.news_picks.length > 0 && (
              <div className="border-t border-[#F0EDE8] pt-2">
                {data.news_picks.map((pick: { code: string; name: string; reason: string }) => (
                  <div key={pick.code} className="flex items-start gap-1.5 py-1 border-b border-[#F5F4F0] last:border-0">
                    <span className="text-[10px] text-[#2563EB] font-bold shrink-0">{pick.name}</span>
                    <span className="text-[9px] text-[#6B7280] leading-relaxed">{pick.reason}</span>
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
