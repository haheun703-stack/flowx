'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/* ── Types ── */
interface UsStock { ticker: string; change_pct: number; close: number; volume: number; volume_ratio?: number }
interface KrStock { ticker: string; name: string; relation: string; prev_change?: number; foreign_net?: number; inst_net?: number; price?: number }
interface KrActual { ticker: string; name: string; actual_change: number; hit: boolean }

interface ThemeSignal {
  date: string
  theme_id: string
  theme_name: string
  signal_strength: number
  signal_grade: string
  us_avg_change: number
  us_consecutive: number
  us_stocks: UsStock[]
  kr_stocks: KrStock[]
  kr_actual_change: KrActual[] | null
  hit_count: number | null
  total_kr_count: number | null
  analysis: string | null
}

/* ── Constants ── */
const GRADE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  '강력': { color: '#EF4444', bg: '#FEF2F2', label: '강력' },
  '주의': { color: '#F59E0B', bg: '#FFFBEB', label: '주의' },
  '관심': { color: '#3B82F6', bg: '#EFF6FF', label: '관심' },
  '평상': { color: '#6B7280', bg: '#F9FAFB', label: '평상' },
}

const strengthColor = (v: number) =>
  v >= 70 ? '#EF4444' : v >= 50 ? '#F59E0B' : v >= 30 ? '#3B82F6' : '#6B7280'

const fmtP = (v: number) => v?.toLocaleString('ko-KR') ?? '-'
const fmtUsd = (v: number) => `$${v?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '-'}`

/* ── Main ── */
export default function ThemeSignalView() {
  const [signals, setSignals] = useState<ThemeSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/theme-signals', { signal: ac.signal })
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (j?.data) setSignals(j.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const date = signals[0]?.date ?? ''
  const gradeCount = (g: string) => signals.filter((s) => s.signal_grade === g).length

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded-xl w-80" />
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 pb-16 space-y-6">
      {/* 그라데이션 */}
      <div className="h-[2px] rounded-full"
        style={{ background: 'linear-gradient(90deg, #EF4444, #F59E0B 30%, #3B82F6 60%, #6B7280)' }} />

      {/* 헤더 */}
      <div>
        <h1 className="text-[20px] font-black text-[#1A1A2E] mb-1">US &rarr; KR 테마 전파 시그널</h1>
        <p className="text-[12px] text-[#9CA3AF]">
          미국장 테마주 등락 &rarr; 한국 관련주 전파 감지 &middot; 매일 08:03 자동 스캔
          {date && <span className="ml-2 font-bold text-[#1A1A2E]">{date}</span>}
        </p>
      </div>

      {/* 시그널 등급 요약 */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['강력', '주의', '관심', '평상'] as const).map((g) => {
          const gs = GRADE_STYLE[g]
          const cnt = gradeCount(g)
          return (
            <div key={g} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold"
              style={{ backgroundColor: gs.bg, color: gs.color }}>
              {gs.label} <span className="text-[16px] font-black tabular-nums">{cnt}</span>
            </div>
          )
        })}
        <span className="text-[12px] text-[#9CA3AF] ml-auto">총 {signals.length}개 테마</span>
      </div>

      {/* 시그널 없음 */}
      {signals.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[14px] text-[#9CA3AF]">시그널 데이터가 없습니다</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1">08:03 이후 자동 갱신됩니다</p>
        </div>
      )}

      {/* 테마 카드 리스트 */}
      <div className="space-y-4">
        {signals.map((s) => {
          const gs = GRADE_STYLE[s.signal_grade] ?? GRADE_STYLE['평상']
          const isOpen = expanded.has(s.theme_id)
          const usStocks = Array.isArray(s.us_stocks) ? s.us_stocks : []
          const krStocks = Array.isArray(s.kr_stocks) ? s.kr_stocks : []
          const krActual = Array.isArray(s.kr_actual_change) ? s.kr_actual_change : null
          const hitRate = (s.hit_count != null && s.total_kr_count && s.total_kr_count > 0)
            ? Math.round((s.hit_count / s.total_kr_count) * 100)
            : null

          return (
            <div key={s.theme_id} className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm overflow-hidden"
              style={{ borderLeft: `3px solid ${gs.color}` }}>
              {/* 카드 헤더 */}
              <button onClick={() => toggle(s.theme_id)}
                className="w-full px-5 py-4 text-left hover:bg-[#FAFAF8] transition-colors">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded"
                    style={{ backgroundColor: gs.bg, color: gs.color }}>{gs.label}</span>
                  <span className="text-[15px] font-bold text-[#1A1A2E]">{s.theme_name}</span>
                  <span className="text-[14px] font-black tabular-nums" style={{ color: strengthColor(s.signal_strength) }}>
                    {s.signal_strength}점
                  </span>
                  <span className={`text-[12px] font-bold tabular-nums ${(s.us_avg_change ?? 0) >= 0 ? 'text-[#EF4444]' : 'text-[#3B82F6]'}`}>
                    US {(s.us_avg_change ?? 0) >= 0 ? '+' : ''}{(s.us_avg_change ?? 0).toFixed(2)}%
                  </span>
                  {s.us_consecutive > 1 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF2F2] text-[#EF4444]">
                      {s.us_consecutive}일 연속
                    </span>
                  )}
                  {hitRate != null ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded ml-auto"
                      style={{
                        backgroundColor: hitRate >= 70 ? '#DCFCE7' : hitRate >= 50 ? '#FEF9C3' : '#FEE2E2',
                        color: hitRate >= 70 ? '#16A34A' : hitRate >= 50 ? '#CA8A04' : '#DC2626',
                      }}>
                      적중 {s.hit_count}/{s.total_kr_count} ({hitRate}%)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F3F4F6] text-[#9CA3AF] ml-auto">
                      17:15 검증 예정
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-[#7C3AED] shrink-0">
                    {isOpen ? '접기 ▲' : '상세 ▼'}
                  </span>
                </div>

                {/* 강도 게이지 */}
                <div className="mt-2 h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(s.signal_strength, 100)}%`,
                      backgroundColor: strengthColor(s.signal_strength),
                    }} />
                </div>
              </button>

              {/* 펼침 상세 */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-[#F0EDE8]">
                  {/* 미국 종목 상세 — 그리드 카드 */}
                  <div className="mt-4">
                    <p className="text-[11px] font-bold text-[#6B7280] mb-2">미국 종목 상세</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {usStocks.map((u) => {
                        const isUp = u.change_pct >= 0
                        const volHigh = (u.volume_ratio ?? 0) >= 2.0
                        return (
                          <div key={u.ticker} className="rounded-lg p-3 border"
                            style={{
                              backgroundColor: isUp ? '#FEF2F2' : '#EFF6FF',
                              borderColor: isUp ? '#FECACA' : '#BFDBFE',
                            }}>
                            <p className="text-[13px] font-black text-[#1A1A2E] mb-1">{u.ticker}</p>
                            <p className="text-[14px] font-bold text-[#1A1A2E] tabular-nums mb-1">{fmtUsd(u.close)}</p>
                            <p className="text-[13px] font-bold tabular-nums" style={{ color: isUp ? '#EF4444' : '#3B82F6' }}>
                              {isUp ? '+' : ''}{u.change_pct.toFixed(2)}%
                            </p>
                            {u.volume_ratio != null && (
                              <p className={`text-[11px] tabular-nums mt-1 ${volHigh ? 'font-bold text-[#EA580C]' : 'text-[#9CA3AF]'}`}>
                                거래량 {u.volume_ratio.toFixed(1)}x{volHigh ? ' !' : ''}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-2">
                      그룹 평균: <strong className={`${(s.us_avg_change ?? 0) >= 0 ? 'text-[#EF4444]' : 'text-[#3B82F6]'}`}>
                        {(s.us_avg_change ?? 0) >= 0 ? '+' : ''}{(s.us_avg_change ?? 0).toFixed(2)}%
                      </strong>
                      {s.us_consecutive > 0 && <span className="ml-2">| 연속 {s.us_consecutive}일 {(s.us_avg_change ?? 0) >= 0 ? '상승' : '하락'}</span>}
                    </p>
                  </div>

                  {/* 한국 관련주 — 상세 카드 */}
                  <div>
                    <p className="text-[11px] font-bold text-[#6B7280] mb-2">한국 관련주 ({krStocks.length}종목)</p>
                    <div className="space-y-0 divide-y divide-[#F0EDE8] rounded-lg border border-[#E8E6E0] overflow-hidden">
                      {krStocks.map((k) => {
                        const actual = krActual?.find((a) => a.ticker === k.ticker)
                        const isUp = (k.prev_change ?? 0) >= 0
                        const fgnBig = Math.abs(k.foreign_net ?? 0) > 50000
                        return (
                          <div key={k.ticker} className="px-4 py-3 bg-white hover:bg-[#FAFAF8] transition-colors">
                            {/* 첫 줄: 종목명 + 가격 */}
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Link href={`/stock/${k.ticker}`} className="text-[13px] font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors">
                                {k.name}
                              </Link>
                              <span className="text-[10px] text-[#9CA3AF]">({k.ticker})</span>
                              {k.price != null && (
                                <span className="text-[13px] font-bold text-[#1A1A2E] tabular-nums ml-auto">
                                  {fmtP(k.price)}원
                                </span>
                              )}
                              {k.prev_change != null && (
                                <span className={`text-[12px] font-bold tabular-nums ${isUp ? 'text-[#EF4444]' : 'text-[#3B82F6]'}`}>
                                  {isUp ? '▲' : '▼'}{isUp ? '+' : ''}{k.prev_change.toFixed(2)}%
                                </span>
                              )}
                            </div>
                            {/* 둘째 줄: 관계 설명 */}
                            <p className="text-[11px] text-[#6B7280] mb-1.5">{k.relation}</p>
                            {/* 셋째 줄: 외인 + 기관 수급 */}
                            <div className="flex items-center gap-3 flex-wrap text-[11px]">
                              {k.foreign_net != null && k.foreign_net !== 0 && (
                                <span className={`font-bold tabular-nums ${(k.foreign_net ?? 0) >= 0 ? 'text-[#3B82F6]' : 'text-[#EF4444]'}`}>
                                  외인 {(k.foreign_net ?? 0) >= 0 ? '+' : ''}{fmtP(k.foreign_net ?? 0)}주
                                  {(k.foreign_net ?? 0) > 0 ? ' \u{1F4C8}' : ' \u{1F4C9}'}
                                  {fgnBig && ' \u26A1'}
                                </span>
                              )}
                              {k.inst_net != null && k.inst_net !== 0 && (
                                <span className={`font-bold tabular-nums ${(k.inst_net ?? 0) >= 0 ? 'text-[#3B82F6]' : 'text-[#EF4444]'}`}>
                                  기관 {(k.inst_net ?? 0) >= 0 ? '+' : ''}{fmtP(k.inst_net ?? 0)}주
                                  {(k.inst_net ?? 0) > 0 ? ' \u{1F4C8}' : ' \u{1F4C9}'}
                                </span>
                              )}
                              {actual && (
                                <span className={`font-bold px-1.5 py-0.5 rounded ml-auto ${actual.hit ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
                                  {actual.hit ? '적중' : '미적중'} {actual.actual_change >= 0 ? '+' : ''}{actual.actual_change.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 적중률 요약 */}
                  <div className="flex items-center gap-2">
                    {hitRate != null ? (
                      <span className="text-[12px] font-bold"
                        style={{ color: hitRate >= 70 ? '#16A34A' : hitRate >= 50 ? '#CA8A04' : '#DC2626' }}>
                        적중률: {s.hit_count}/{s.total_kr_count} ({hitRate}%)
                      </span>
                    ) : (
                      <span className="text-[12px] font-bold text-[#9CA3AF]">17:15 검증 예정</span>
                    )}
                  </div>

                  {/* 분석 코멘트 */}
                  {s.analysis && (
                    <div className="bg-[#FFFBEB] rounded-lg p-3 border border-[#FDE68A]">
                      <p className="text-[13px] text-[#92400E] leading-relaxed">{s.analysis}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
