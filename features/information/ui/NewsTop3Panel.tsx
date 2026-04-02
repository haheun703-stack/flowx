'use client'

import { useInformationNews, type NewsItem } from '../api/useInformation'

const IMPACT_STYLE = {
  positive: { color: '#16a34a', label: '호재', bg: '#ECFDF5' },
  negative: { color: '#dc2626', label: '악재', bg: '#FEF2F2' },
  neutral:  { color: '#6B7280', label: '중립', bg: '#F9FAFB' },
} as const

function getImpactInfo(impact: string, score: number) {
  if (score >= 4) return IMPACT_STYLE.positive
  if (impact === 'HIGH') return IMPACT_STYLE.negative
  return IMPACT_STYLE.neutral
}

export function NewsTop3Panel() {
  const { data, isLoading } = useInformationNews()
  const allItems = data?.items ?? []
  const top3 = [...allItems].sort((a, b) => b.impact_score - a.impact_score).slice(0, 3)
  const totalCount = allItems.length

  if (isLoading) {
    return (
      <div className="fx-card-green">
        <div className="fx-card-title">뉴스 TOP 3</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (top3.length === 0) {
    return (
      <div className="fx-card-green">
        <div className="fx-card-title">📰 뉴스 TOP 3</div>
        <div className="flex items-center justify-center h-32 text-[var(--fx-text-muted)] text-sm">
          뉴스 데이터 없음
        </div>
      </div>
    )
  }

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">📰 뉴스 TOP 3</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {top3.map((item, idx) => {
          const info = getImpactInfo(item.impact, item.impact_score)
          return (
            <div
              key={item.id}
              className="p-3 bg-white rounded-lg border border-[var(--fx-border-default)] hover:border-[var(--fx-green)] transition-colors"
            >
              {/* 순위 + 뱃지 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-[#1A1A2E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: info.bg,
                    color: info.color,
                    border: `1px solid ${info.color}30`,
                  }}
                >
                  {info.label}
                </span>
                {item.sectors.slice(0, 1).map(s => (
                  <span key={s} className="text-[9px] text-[var(--fx-text-muted)] border border-[var(--fx-border-default)] px-1 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>

              {/* 제목 */}
              <div className="text-[12px] font-bold text-[#1A1A2E] leading-snug line-clamp-2 mb-1">
                {item.title}
              </div>

              {/* 요약 */}
              {item.kr_impact && (
                <div className="text-[10px] text-[var(--fx-text-secondary)] leading-relaxed line-clamp-2 mb-2">
                  {item.kr_impact}
                </div>
              )}

              {/* 관련 종목 */}
              {item.related_tickers?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.related_tickers.slice(0, 3).map(t => (
                    <span key={t.code} className="text-[9px] text-[var(--fx-text-muted)]">
                      {t.name}
                      <span className={t.change_pct >= 0 ? 'text-[var(--fx-up)]' : 'text-[var(--fx-down)]'}>
                        {' '}{t.change_pct >= 0 ? '+' : ''}{t.change_pct?.toFixed(1)}%
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="fx-card-tip">
        💡 AI가 오늘 {totalCount}건의 뉴스 중 시장 영향도가 가장 큰 3건을 선별했어요
      </div>
    </div>
  )
}
