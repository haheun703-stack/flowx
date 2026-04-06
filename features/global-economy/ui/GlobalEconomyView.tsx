'use client'

import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { useGlobalEconomy, type SectionData, type SeriesData } from '../api/useGlobalEconomy'
import { EconLineChart, YieldCurveChart, fmtEconValue, type ChartSeries } from './EconChart'

/* ── 상태 판정 ── */
function getStatus(sectionId: string, series: SeriesData[]): { text: string; color: string } | null {
  if (sectionId === 'rates') {
    const spread = series.find(s => s.id === 'T10Y2Y')
    if (spread?.current) {
      return spread.current.value > 0
        ? { text: '정상', color: '#16a34a' }
        : { text: '역전 경고', color: '#dc2626' }
    }
  }
  if (sectionId === 'inflation') {
    const cpi = series.find(s => s.id === 'CPIAUCSL')
    if (cpi?.current) {
      const v = cpi.current.value
      if (v <= 2.0) return { text: '안정', color: '#16a34a' }
      if (v <= 3.0) return { text: '보통', color: '#d97706' }
      if (v <= 5.0) return { text: '주의', color: '#ef4444' }
      return { text: '경계', color: '#dc2626' }
    }
  }
  if (sectionId === 'credit') {
    const hy = series.find(s => s.id === 'BAMLH0A0HYM2')
    if (hy?.current) {
      const v = hy.current.value
      if (v < 3.5) return { text: '안심', color: '#16a34a' }
      if (v <= 5) return { text: '보통', color: '#d97706' }
      return { text: '위험', color: '#dc2626' }
    }
  }
  if (sectionId === 'market') {
    const vix = series.find(s => s.id === 'VIXCLS')
    if (vix?.current) {
      const v = vix.current.value
      if (v < 15) return { text: '안정', color: '#16a34a' }
      if (v <= 25) return { text: '보통', color: '#d97706' }
      return { text: '공포', color: '#dc2626' }
    }
  }
  return null
}

/* ── 참조선 설정 ── */
function getRefLine(sectionId: string) {
  if (sectionId === 'inflation') return { y: 2.0, label: 'Fed 목표 2%', color: '#dc2626' }
  if (sectionId === 'rates') return { y: 0, label: '0%', color: '#9CA3AF' }
  if (sectionId === 'credit') return { y: 5, label: '위험선 5%p', color: '#dc2626' }
  return undefined
}

/* ── 수익률 곡선 역전 뱃지 ── */
function YieldCurveStatus({ current }: { current: { maturity: string; value: number | null }[] }) {
  const c2y = current.find(c => c.maturity === '2Y')?.value
  const c10y = current.find(c => c.maturity === '10Y')?.value
  if (c2y == null || c10y == null) return null
  const inverted = c10y < c2y
  const color = inverted ? '#dc2626' : '#16a34a'
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
      style={{ color, backgroundColor: color + '15' }}
    >
      {inverted ? '역전 경고' : '정상'}
    </span>
  )
}

/* ── 현재값 미니 카드들 ── */
function CurrentValues({ series }: { series: SeriesData[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
      {series.map(s => {
        if (!s.current) return null
        const chg = s.current.change
        const isZero = chg === 0 || chg == null
        const isUp = (chg ?? 0) > 0
        const chgColor = isZero ? '#64748b' : isUp ? '#dc2626' : '#2563eb'
        const arrow = isZero ? '─' : isUp ? '▲' : '▼'
        return (
          <div key={s.id} className="bg-[#FAFAF8] rounded-lg px-3 py-2 border border-[var(--border)]">
            <div className="text-[11px] text-gray-500 truncate">{s.name}</div>
            <div className="text-[18px] font-black text-[#1A1A2E] tabular-nums leading-tight">
              {fmtEconValue(s.current.value, s.unit)}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {chg != null && (
                <span className="text-[11px] font-bold tabular-nums" style={{ color: chgColor }}>
                  {arrow}{Math.abs(chg).toFixed(2)}
                </span>
              )}
              <span className="text-[10px] text-gray-400 ml-auto">{s.current.date}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── 섹션 패널 ── */
function SectionPanel({ section }: { section: SectionData }) {
  const status = getStatus(section.id, section.series)
  const refLine = getRefLine(section.id)
  const chartSeries: ChartSeries[] = section.series.map(s => ({
    id: s.id, name: s.name, unit: s.unit, color: s.color, history: s.history,
  }))

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)]/50">
        <span className="text-lg">{section.icon}</span>
        <span className="text-[17px] font-bold text-[#1A1A2E]">{section.title}</span>
        {status && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ color: status.color, backgroundColor: status.color + '15' }}
          >
            {status.text}
          </span>
        )}
        <span className="text-[11px] text-gray-400 ml-auto">{section.desc}</span>
      </div>
      <div className="p-5">
        <CurrentValues series={section.series} />
        <EconLineChart series={chartSeries} refLine={refLine} />
      </div>
    </div>
  )
}

/* ── 스켈레톤 ── */
function Skeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="h-10 bg-gray-50 border-b border-[var(--border)]/50 animate-pulse" />
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-[280px] bg-gray-50 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 메인 뷰 ── */
export function GlobalEconomyView() {
  const { data, isLoading, isError } = useGlobalEconomy()
  const totalCount = data?.total ?? 0

  return (
    <div className={PAGE}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-[var(--text-primary)]">
            Global Economy
          </h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#00FF88]/40 text-[#00CC6A] font-bold">LIVE</span>
          <span className="text-sm text-gray-500">FRED 5년 히스토리 · {totalCount || '—'}개 거시경제 지표</span>
        </div>
        {data?.updated_at && (
          <p className="text-xs text-[var(--text-dim)] mt-1">
            업데이트: {new Date(data.updated_at).toLocaleString('ko-KR')} · 출처: Federal Reserve Economic Data (FRED)
          </p>
        )}
      </div>

      <div className={`${CONTAINER} pt-6 space-y-6`}>
        {isLoading && <Skeleton />}

        {isError && (
          <div className="bg-white rounded-xl p-8 text-center text-red-500 text-sm border border-red-200">
            경제 데이터 로드 실패 — FRED API 키를 확인해주세요
          </div>
        )}

        {data && (
          <>
            {/* 수익률 곡선 */}
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)]/50">
                <span className="text-lg">📉</span>
                <span className="text-[17px] font-bold text-[#1A1A2E]">미국 국채 수익률 곡선</span>
                <YieldCurveStatus current={data.yield_curve.current} />
                <span className="text-[11px] text-gray-400 ml-auto">만기별 국채 수익률 — 역전 시 경기침체 신호</span>
              </div>
              <div className="p-5">
                <YieldCurveChart current={data.yield_curve.current} yearAgo={data.yield_curve.year_ago} />
              </div>
            </div>

            {data.sections.map(section => (
              <SectionPanel key={section.id} section={section} />
            ))}

            <div className="text-center py-4 border-t border-[var(--border)]">
              <p className="text-[11px] text-[var(--text-dim)]">
                데이터 출처: Federal Reserve Economic Data (FRED) · 6시간 캐시 · 월별 집계 · 5년 히스토리
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
