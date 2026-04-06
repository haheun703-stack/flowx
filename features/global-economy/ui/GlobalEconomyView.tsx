'use client'

import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { useGlobalEconomy, type EconomicIndicator } from '../api/useGlobalEconomy'

/* ── 카테고리 순서 ── */
const CATEGORY_ORDER = ['rate', 'inflation', 'employment', 'market']

/* ── 금리 상태 판정 ── */
function getRateStatus(id: string, value: number): { text: string; color: string } | null {
  if (id === 'T10Y2Y') {
    return value > 0
      ? { text: '정상', color: '#16a34a' }
      : { text: '역전 경고', color: '#dc2626' }
  }
  return null
}

/* ── VIX 상태 판정 ── */
function getVixStatus(value: number): { text: string; color: string } {
  if (value < 15) return { text: '안정', color: '#16a34a' }
  if (value <= 25) return { text: '보통', color: '#d97706' }
  if (value <= 35) return { text: '주의', color: '#ef4444' }
  return { text: '공포', color: '#dc2626' }
}

/* ── 인플레 상태 ── */
function getInflationStatus(value: number): { text: string; color: string } {
  if (value <= 2.0) return { text: '안정', color: '#16a34a' }
  if (value <= 3.0) return { text: '보통', color: '#d97706' }
  if (value <= 5.0) return { text: '주의', color: '#ef4444' }
  return { text: '경계', color: '#dc2626' }
}

/* ── 값 포맷 ── */
function fmtValue(ind: EconomicIndicator): string {
  if (ind.id === 'DEXKOUS') return ind.value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })
  if (ind.id === 'PAYEMS') return (ind.value >= 0 ? '+' : '') + ind.value.toLocaleString() + '천명'
  if (ind.unit === '$/bbl') return '$' + ind.value.toFixed(2)
  if (ind.unit === '%' || ind.unit === '%p') return ind.value.toFixed(2) + ind.unit
  if (ind.unit === '원') return ind.value.toLocaleString('ko-KR', { maximumFractionDigits: 1 }) + '원'
  return ind.value.toFixed(2)
}

/* ── 상태 뱃지 결정 ── */
function getStatusBadge(ind: EconomicIndicator): { text: string; color: string } | null {
  if (ind.id === 'T10Y2Y') return getRateStatus(ind.id, ind.value)
  if (ind.id === 'VIXCLS') return getVixStatus(ind.value)
  if (ind.category === 'inflation') return getInflationStatus(ind.value)
  return null
}

/* ── 인디케이터 카드 ── */
function IndicatorCard({ ind }: { ind: EconomicIndicator }) {
  const badge = getStatusBadge(ind)
  const isUp = (ind.change ?? 0) >= 0
  const changeColor = ind.change === 0 || ind.change == null ? '#64748b' : isUp ? '#dc2626' : '#2563eb'
  const isSignificant = ind.change_pct != null && Math.abs(ind.change_pct) >= 3

  return (
    <div className={`bg-white rounded-xl p-5 border border-[var(--border)] shadow-sm transition-all hover:shadow-md ${
      isSignificant ? 'ring-1 ring-amber-300' : ''
    }`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-[var(--text-muted)] truncate">{ind.name}</span>
        {badge && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2"
            style={{ color: badge.color, backgroundColor: badge.color + '15' }}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* 메인 값 */}
      <div className="text-[28px] font-black text-[var(--text-primary)] tabular-nums leading-tight">
        {fmtValue(ind)}
      </div>

      {/* 변화량 + 날짜 */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          {ind.change != null && (
            <span className={`text-[14px] font-bold tabular-nums ${isSignificant ? 'animate-pulse' : ''}`} style={{ color: changeColor }}>
              {isUp ? '▲' : '▼'} {Math.abs(ind.change).toFixed(2)}
            </span>
          )}
          {ind.change_pct != null && (
            <span className="text-[12px] font-semibold tabular-nums" style={{ color: changeColor }}>
              ({isUp ? '+' : ''}{ind.change_pct.toFixed(2)}%)
            </span>
          )}
        </div>
        <span className="text-[11px] text-[var(--text-dim)]">{ind.date}</span>
      </div>
    </div>
  )
}

/* ── 카테고리 섹션 ── */
function CategorySection({ title, icon, items }: { title: string; icon: string; items: EconomicIndicator[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-[17px] font-bold text-[var(--text-primary)]">{title}</span>
        <span className="text-xs text-[var(--text-muted)]">{items.length}개</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((ind) => (
          <IndicatorCard key={ind.id} ind={ind} />
        ))}
      </div>
    </div>
  )
}

/* ── 스켈레톤 ── */
function Skeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="h-6 w-32 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-[140px] bg-white border border-[var(--border)] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 메인 뷰 ── */
export function GlobalEconomyView() {
  const { data, isLoading, isError } = useGlobalEconomy()

  return (
    <div className={PAGE}>
      {/* 헤더 */}
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-[var(--text-primary)]">Global Economy</h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#00FF88]/40 text-[#00CC6A] font-bold">LIVE</span>
          <span className="text-sm text-gray-500">미국 금리 · 인플레이션 · 고용 · 시장 지표</span>
        </div>
        {data?.updated_at && (
          <p className="text-xs text-[var(--text-dim)] mt-1">
            업데이트: {new Date(data.updated_at).toLocaleString('ko-KR')} · 출처: FRED (미국 연방준비제도)
          </p>
        )}
      </div>

      <div className={`${CONTAINER} pt-6 space-y-8`}>
        {isLoading && <Skeleton />}

        {isError && (
          <div className="bg-white rounded-xl p-8 text-center text-red-500 text-sm border border-red-200">
            경제 데이터 로드 실패 — FRED API 키를 확인해주세요
          </div>
        )}

        {data && (
          <>
            {CATEGORY_ORDER.map((catKey) => {
              const group = data.categories[catKey]
              if (!group || group.items.length === 0) return null
              return (
                <CategorySection
                  key={catKey}
                  title={group.meta.title}
                  icon={group.meta.icon}
                  items={group.items}
                />
              )
            })}

            {/* FRED 출처 표기 */}
            <div className="text-center py-4 border-t border-[var(--border)]">
              <p className="text-[11px] text-[var(--text-dim)]">
                데이터 출처: Federal Reserve Economic Data (FRED) · 1시간 주기 갱신 · 과거 데이터는 FRED 공식 발표 기준
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
