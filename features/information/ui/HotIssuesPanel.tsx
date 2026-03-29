'use client'

import { useState } from 'react'
import { useInformationNews, type NewsItem } from '../api/useInformation'
import { getRelativeDate } from '@/shared/lib/dateUtils'

// ─── impact 스타일 ───

const IMPACT_STYLE = {
  positive: { icon: '🟢', color: '#EF4444', label: '호재' },
  negative: { icon: '🔴', color: '#3B82F6', label: '악재' },
  neutral:  { icon: '⚪', color: '#6B7280', label: '중립' },
} as const

function getImpactInfo(impact: string, score: number): { icon: string; color: string; label: string } {
  if (score >= 4) return IMPACT_STYLE.positive
  if (impact === 'HIGH') return IMPACT_STYLE.negative
  return IMPACT_STYLE.neutral
}

function renderStars(score: number): string {
  return '★'.repeat(Math.min(score, 5)) + '☆'.repeat(Math.max(5 - score, 0))
}

// ─── 뉴스 상세 모달 ───

function NewsDetailModal({ news, onClose }: { news: NewsItem; onClose: () => void }) {
  const info = getImpactInfo(news.impact, news.impact_score)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-xl shadow-2xl border border-[var(--border)] w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg z-10"
        >
          ✕
        </button>

        <div className="p-5 space-y-4">
          {/* 제목 + impact */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{info.icon}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{
                backgroundColor: info.color + '15',
                color: info.color,
                border: `1px solid ${info.color}30`,
              }}>
                {info.label}
              </span>
              <span className="text-xs text-[var(--text-muted)] ml-auto tabular-nums">
                {renderStars(news.impact_score)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] leading-snug">{news.title}</h2>
          </div>

          {/* AI 분석 요약 */}
          {news.kr_impact && (
            <div className="p-3 bg-gray-50 rounded-lg border border-[var(--border)]">
              <div className="text-xs text-[var(--text-dim)] font-bold mb-1">📋 AI 분석 요약</div>
              <div className="text-sm text-[var(--text-primary)] leading-relaxed">{news.kr_impact}</div>
            </div>
          )}

          {/* 한국 시장 영향 */}
          {news.impact_description && (
            <div className="p-3 rounded-lg border" style={{
              backgroundColor: info.color + '06',
              borderColor: info.color + '20',
            }}>
              <div className="text-xs font-bold mb-1" style={{ color: info.color }}>💥 한국 시장 영향</div>
              <div className="text-sm text-[var(--text-primary)] leading-relaxed">{news.impact_description}</div>
            </div>
          )}

          {/* 영향 섹터 */}
          {news.sectors.length > 0 && (
            <div>
              <div className="text-xs text-[var(--text-dim)] font-bold mb-2">📊 영향 섹터</div>
              <div className="flex flex-wrap gap-1.5">
                {news.sectors.map(s => (
                  <span key={s} className="text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 관련 종목 */}
          {news.related_tickers?.length > 0 && (
            <div>
              <div className="text-xs text-[var(--text-dim)] font-bold mb-2">📌 관련 종목</div>
              <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                {news.related_tickers.map((t, i) => (
                  <div key={t.code ?? i} className={`flex items-center justify-between px-3 py-2 text-sm ${
                    i > 0 ? 'border-t border-[var(--border)]' : ''
                  }`}>
                    <span className="text-[var(--text-primary)] font-medium">{t.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">{t.code}</span>
                      <span className={`text-xs font-bold tabular-nums ${
                        t.change_pct > 0 ? 'text-[var(--up)]' : t.change_pct < 0 ? 'text-[var(--down)]' : 'text-[var(--text-dim)]'
                      }`}>
                        {t.change_pct > 0 ? '+' : ''}{t.change_pct?.toFixed(1) ?? '0.0'}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 하단: 출처 + 영향도 */}
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
            <span>출처: {news.source ?? '—'}</span>
            <span>영향도: {renderStars(news.impact_score)} ({news.impact_score}/5)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 뉴스 아이템 ───

function HeroNews({ item, onClick }: { item: NewsItem; onClick: () => void }) {
  const info = getImpactInfo(item.impact, item.impact_score)
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 border-b border-[var(--border)] bg-gray-50/50 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg font-black text-[var(--yellow)]">1</span>
        <span>{info.icon}</span>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{
          backgroundColor: info.color + '10', color: info.color,
        }}>{info.label}</span>
        <span className="text-[10px] text-[var(--text-muted)] tabular-nums ml-auto">{renderStars(item.impact_score)}</span>
        {item.sectors.length > 0 && (
          <div className="flex gap-1">
            {item.sectors.slice(0, 2).map(s => (
              <span key={s} className="text-[10px] text-[var(--blue)] border border-[var(--blue)]/20 px-1.5 py-0.5 rounded">{s}</span>
            ))}
          </div>
        )}
      </div>
      <div className="text-[18px] sm:text-[20px] text-[var(--text-primary)] font-bold leading-snug">{item.title}</div>
      {item.kr_impact && (
        <div className="text-sm text-[var(--text-dim)] mt-1 line-clamp-2">{item.kr_impact}</div>
      )}
    </button>
  )
}

function SubNews({ item, onClick }: { item: NewsItem; onClick: () => void }) {
  const info = getImpactInfo(item.impact, item.impact_score)
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-2.5 border-b border-[var(--border)]/50 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-2">
        <span className="text-sm font-bold text-[var(--text-muted)] w-5 shrink-0 text-right">{item.rank}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span>{info.icon}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{
              backgroundColor: info.color + '10', color: info.color,
            }}>{info.label}</span>
            <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{renderStars(item.impact_score)}</span>
          </div>
          <div className="text-[15px] sm:text-[16px] text-[var(--text-primary)] font-semibold leading-snug">{item.title}</div>
          {item.kr_impact && (
            <div className="text-xs text-[var(--text-dim)] mt-0.5 line-clamp-1">{item.kr_impact}</div>
          )}
        </div>
      </div>
    </button>
  )
}

function SmallNews({ item, onClick }: { item: NewsItem; onClick: () => void }) {
  const info = getImpactInfo(item.impact, item.impact_score)
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-1.5 border-b border-[var(--border)]/20 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[var(--text-muted)] w-4 shrink-0 text-right tabular-nums">{item.rank}</span>
        <span className="text-sm">{info.icon}</span>
        <span className="text-[13px] text-[var(--text-primary)] truncate flex-1">{item.title}</span>
        <span className="text-[10px] text-[var(--text-muted)] tabular-nums shrink-0">{renderStars(item.impact_score)}</span>
      </div>
    </button>
  )
}

// ─── 메인 패널 ───

interface HotIssuesPanelProps {
  scope: 'GLOBAL' | 'DOMESTIC'
  title: string
  accentColor: string
}

export function HotIssuesPanel({ scope, title, accentColor }: HotIssuesPanelProps) {
  const { data, isLoading } = useInformationNews(scope)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const items = data?.items ?? []
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  const hero = items[0]
  const sub = items.slice(1, 3)
  const rest = items.slice(3)

  return (
    <>
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
              {hero && <HeroNews item={hero} onClick={() => setSelectedNews(hero)} />}
              {sub.map(item => <SubNews key={item.id} item={item} onClick={() => setSelectedNews(item)} />)}
              {rest.map(item => <SmallNews key={item.id} item={item} onClick={() => setSelectedNews(item)} />)}
            </>
          )}
        </div>
      </div>

      {selectedNews && (
        <NewsDetailModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      )}
    </>
  )
}
