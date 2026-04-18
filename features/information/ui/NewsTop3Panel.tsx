'use client'

import { useState } from 'react'
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

/** 뉴스 상세 모달 */
function NewsDetailModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const info = getImpactInfo(item.impact, item.impact_score)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 모달 본체 */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-[600px] w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 text-lg"
        >
          ✕
        </button>

        <div className="p-6">
          {/* 뱃지 행 */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="text-[13px] font-bold px-2.5 py-1 rounded"
              style={{
                backgroundColor: info.bg,
                color: info.color,
                border: `1px solid ${info.color}30`,
              }}
            >
              {info.label}
            </span>
            <span className="text-[13px] font-semibold text-gray-500">
              영향도 {item.impact_score}/5
            </span>
            {(Array.isArray(item.sectors) ? item.sectors : []).map(s => (
              <span key={s} className="text-[12px] text-[var(--fx-text-muted)] border border-[var(--fx-border-default)] px-2 py-0.5 rounded">
                {s}
              </span>
            ))}
          </div>

          {/* 제목 */}
          <h2 className="text-[18px] font-bold text-[#1A1A2E] leading-snug mb-4">
            {item.title}
          </h2>

          {/* 한국 시장 영향 */}
          {item.kr_impact && (
            <div className="mb-4">
              <div className="text-[12px] font-bold text-gray-400 uppercase mb-1">한국 시장 영향</div>
              <div className="text-[14px] text-[#374151] leading-relaxed">
                {item.kr_impact}
              </div>
            </div>
          )}

          {/* 상세 분석 */}
          {item.impact_description && (
            <div className="mb-4">
              <div className="text-[12px] font-bold text-gray-400 uppercase mb-1">상세 분석</div>
              <div className="text-[14px] text-[#374151] leading-relaxed whitespace-pre-line">
                {item.impact_description}
              </div>
            </div>
          )}

          {/* 관련 종목 */}
          {item.related_tickers?.length > 0 && (
            <div className="mb-4">
              <div className="text-[12px] font-bold text-gray-400 uppercase mb-2">관련 종목</div>
              <div className="flex flex-wrap gap-2">
                {item.related_tickers.map(t => (
                  <div
                    key={t.code}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <span className="text-[13px] font-semibold text-[#1A1A2E]">{t.name}</span>
                    <span className={`text-[13px] font-bold ${t.change_pct >= 0 ? 'text-[var(--fx-up)]' : 'text-[var(--fx-down)]'}`}>
                      {t.change_pct >= 0 ? '+' : ''}{t.change_pct?.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 출처 + 날짜 */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100 text-[12px] text-gray-400">
            {item.source && <span>출처: {item.source}</span>}
            {item.published_at && (
              <span>{new Date(item.published_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function NewsTop3Panel() {
  const { data, isLoading } = useInformationNews()
  const [selected, setSelected] = useState<NewsItem | null>(null)

  const allItems = data?.items ?? []
  const top3 = [...allItems].sort((a, b) => b.impact_score - a.impact_score).slice(0, 3)
  const totalCount = allItems.length

  if (isLoading) {
    return (
      <div className="fx-card-green">
        <div className="fx-card-title">오늘 꼭 알아야 할 뉴스 TOP 3</div>
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
        <div className="fx-card-title">오늘 꼭 알아야 할 뉴스 TOP 3</div>
        <div className="flex items-center justify-center h-32 text-[var(--fx-text-muted)] text-sm">
          뉴스 데이터 없음
        </div>
      </div>
    )
  }

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">뉴스 TOP 3</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {top3.map((item, idx) => {
          const info = getImpactInfo(item.impact, item.impact_score)
          return (
            <div
              key={item.id}
              className="p-3 bg-white rounded-lg border border-[var(--fx-border-default)] hover:border-[var(--fx-green)] transition-colors cursor-pointer"
              onClick={() => setSelected(item)}
            >
              {/* 순위 + 뱃지 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#1A1A2E] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span
                  className="text-[12px] font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: info.bg,
                    color: info.color,
                    border: `1px solid ${info.color}30`,
                  }}
                >
                  {info.label}
                </span>
                {item.sectors.slice(0, 1).map(s => (
                  <span key={s} className="text-[11px] text-[var(--fx-text-muted)] border border-[var(--fx-border-default)] px-1.5 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>

              {/* 제목 */}
              <div className="text-[15px] font-bold text-[#1A1A2E] leading-snug line-clamp-2 mb-1.5">
                {item.title}
              </div>

              {/* 요약 */}
              {item.kr_impact && (
                <div className="text-[13px] text-[var(--fx-text-secondary)] leading-relaxed line-clamp-2 mb-2">
                  {item.kr_impact}
                </div>
              )}

              {/* 관련 종목 */}
              {item.related_tickers?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.related_tickers.slice(0, 3).map(t => (
                    <span key={t.code} className="text-[12px] font-semibold text-[var(--fx-text-muted)]">
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
        AI가 오늘 {totalCount}건의 뉴스 중 시장 영향도가 가장 큰 3건을 선별했어요
      </div>

      {/* 뉴스 상세 모달 */}
      {selected && (
        <NewsDetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
