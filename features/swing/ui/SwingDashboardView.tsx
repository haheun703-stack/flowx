'use client'

import { useEffect, useState } from 'react'

/* ── 타입 ── */
interface Pick {
  code: string; name: string; grade: string; score: number
  entry_price: number; target_price: number; stop_price: number
  hold_days: number; conviction: string; catalyst: string
  rr_ratio: number; regime: string; supply_score: number
  tv_pattern: string; nat_power_grade: string
  category?: string; category_label?: string; star?: boolean
  action?: string; conviction_label?: string; reasons?: string[]
  close?: number; chg_pct?: number; rsi?: number
  vol_ratio?: number; sector?: string; is_etf?: boolean
  /* 피보나치 (단타봇 v4 추가) */
  fib_position?: string; fib_upside_pct?: number; fib_downside_pct?: number
  sl_fib?: number; tp_fib?: number; fib_adj?: number
}

interface EtfPick {
  code: string; name: string; category: string; signal: string
  entry: number; sl: number; tp: number; reason: string; holding_days: number
}

interface WatchItem {
  code: string; name: string; reason: string; trigger: string; grade: string; score: number
}

interface NxtTarget {
  code: string; name: string; sector: string; tier: string
  priority: number; supply_score: number; is_etf: boolean
}

interface SwingData {
  date: string
  brain_verdict: string; brain_pct: number; brain_reason: string
  regime: string; regime_severity: number; regime_desc: string
  alloc_swing: number; alloc_gold_etf: number; alloc_inverse: number
  alloc_group_etf: number; alloc_small_cap: number; alloc_cash: number
  picks: Pick[]; etf_picks: EtfPick[]; watchlist: WatchItem[]
  nxt_signal: string; nxt_signal_text: string; nxt_score: number
  nxt_reason: string; nxt_targets: NxtTarget[]
  vix: number; nasdaq_pct: number; usdkrw: number
  oil_pct: number; gold_pct: number; silver_pct: number
  analysis: Record<string, string>; portfolio: Record<string, number>
  smart_money_score: number; smart_money_signal: string
  stress_index: number; stress_level: string
  rotation_signal: string; liquidity_score: number; market_comment: string
}

/* ── BRAIN 히어로 색상 (스펙 §1) ── */
function getVerdictHero(verdict: string) {
  const v = verdict.toLowerCase()
  if (v.includes('공격') || v.includes('강세'))
    return { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669', label: '강세' }
  if (v.includes('방어') || v.includes('약세'))
    return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', label: '약세' }
  if (v.includes('표준'))
    return { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', label: '표준' }
  // 관망 (기본)
  return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', label: '관망' }
}

/* ── action 뱃지 색상 ── */
function actionBadgeStyle(action?: string) {
  switch (action) {
    case '매수': return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' }
    case '관심매수': return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' }
    default: return { bg: '#F3F4F6', border: '#E5E7EB', text: '#6B7280' }
  }
}

/* ── 등급 뱃지 ── */
function gradeBadgeStyle(grade: string) {
  if (grade === 'S' || grade === 'A+') return { bg: '#FEF2F2', text: '#DC2626' }
  if (grade === 'A') return { bg: '#FFFBEB', text: '#D97706' }
  if (grade === 'B+' || grade === 'B') return { bg: '#FEF9C3', text: '#A16207' }
  return { bg: '#F3F4F6', text: '#6B7280' }
}

/* ── 분석 키 포맷 ── */
function formatAnalysisKey(key: string): string {
  const map: Record<string, string> = {
    macro_summary: '매크로 요약', commodity_summary: '원자재 요약',
    sector_summary: '섹터 요약', flow_summary: '수급 요약',
    risk_summary: '리스크 요약', 시장상태: '시장 상태', 시장요약: '시장 요약',
    경고: '경고', 전략요약: '전략 요약', 나이트워치: '나이트워치', 매매안내: '매매 안내',
  }
  return map[key] ?? key
}

/* ── 분석 카드 분류 (4칸 + 나이트워치) ── */
function classifyAnalysis(analysis: Record<string, string>) {
  const warning = analysis['경고'] ?? analysis['risk_summary'] ?? ''
  const strategy = analysis['전략요약'] ?? analysis['매매안내'] ?? ''
  const sector = analysis['sector_summary'] ?? analysis['섹터 요약'] ?? ''
  const commodity = analysis['commodity_summary'] ?? analysis['원자재 요약'] ?? ''
  const nightwatch = analysis['나이트워치'] ?? ''
  const rest: Record<string, string> = {}
  for (const [k, v] of Object.entries(analysis)) {
    if (!['경고', 'risk_summary', '전략요약', '매매안내', 'sector_summary', '섹터 요약', 'commodity_summary', '원자재 요약', '나이트워치'].includes(k)) {
      rest[k] = v
    }
  }
  return { warning, strategy, sector, commodity, nightwatch, rest }
}

/* ── 매매 타임라인 데이터 ── */
const TIMELINE = [
  { time: '09:00~09:15', color: '#DC2626', action: '시장 방향 확인', desc: '인버스/금 ETF 판단, 갭 확인', badge: '관망/진입' },
  { time: '09:15~09:30', color: '#F59E0B', action: '에너지주 체크', desc: '급락 시 분할 매수 검토', badge: '주시' },
  { time: '09:30~10:00', color: '#2563EB', action: '워치리스트 트리거 체크', desc: 'TV 스캔, 거래량 돌파 감시', badge: '트리거 대기' },
  { time: '10:00~11:00', color: '#6B7280', action: 'TV 스캔 결과 확인', desc: '추가 조정, 신규 진입 여부 판단', badge: '' },
  { time: '종일', color: '#16A34A', action: '포지션 관리', desc: '손절가 감시, 목표가 도달 시 분할 매도', badge: '자동 알림' },
]

export default function SwingDashboardView() {
  const [data, setData] = useState<SwingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedStock, setExpandedStock] = useState<string | null>(null)
  const [brainExpanded, setBrainExpanded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/swing-dashboard', { signal: controller.signal })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        setData(json.data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setData(null)
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-6">
        <div className="h-20 bg-[var(--bg-row)] rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[var(--bg-row)] rounded-xl" />)}
        </div>
        <div className="h-64 bg-[var(--bg-row)] rounded-xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-[#6B7280]">스윙시스템 데이터가 아직 없습니다.</p>
        <p className="text-[#9CA3AF] text-sm mt-1">매일 16:40 업데이트됩니다.</p>
      </div>
    )
  }

  const hero = getVerdictHero(data.brain_verdict)
  const hasCategory = data.picks?.some(p => p.category)
  const krxPicks = hasCategory ? data.picks.filter(p => p.category !== 'NXT') : data.picks
  const nxtPicks = hasCategory ? data.picks.filter(p => p.category === 'NXT') : []
  const analysisCards = data.analysis ? classifyAnalysis(data.analysis) : null

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">

      {/* ═══ 1행: BRAIN AI 오늘의 결론 — 히어로 ═══ */}
      <section
        className="rounded-xl p-5"
        style={{ backgroundColor: hero.bg, border: `1px solid ${hero.border}` }}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-1">BRAIN AI 오늘의 결론</h2>
            <p className="text-[24px] font-bold" style={{ color: hero.text }}>
              {data.brain_verdict} ({data.brain_pct}%)
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <span
              className="text-[13px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${hero.text}15`, color: hero.text }}
            >
              {data.regime} ({data.regime_severity}/5)
            </span>
            <span className="text-[12px] text-[#6B7280]">{data.date}</span>
          </div>
        </div>
        {data.brain_reason && (
          <p className="text-[15px] font-medium" style={{ color: hero.text }}>{data.brain_reason}</p>
        )}
        {data.regime_desc && (
          <p className="text-[13px] text-[#6B7280] mt-2">{data.regime_desc}</p>
        )}
      </section>

      {/* ═══ 2행: 추천 종목 카드 (접힌/펼침) ═══ */}
      {krxPicks?.length > 0 && (
        <section>
          <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">
            추천 종목 — 클릭하면 AI 분석 근거가 펼쳐져요
          </h2>
          <div
            className="rounded-r-xl p-4 space-y-2"
            style={{ border: '1px solid var(--border)', borderLeft: '3px solid #00FF88' }}
          >
            {krxPicks.map((p) => {
              const isExpanded = expandedStock === p.code
              const actionStyle = actionBadgeStyle(p.action)
              const gradeS = gradeBadgeStyle(p.grade)
              const targetPct = p.entry_price > 0 ? ((p.target_price - p.entry_price) / p.entry_price * 100) : 0
              const stopPct = p.entry_price > 0 ? ((p.stop_price - p.entry_price) / p.entry_price * 100) : 0

              return (
                <div key={p.code}>
                  {/* 접힌 상태 (요약 카드) */}
                  <div
                    className="rounded-[10px] p-3 cursor-pointer transition-colors hover:bg-[#ECEAE4]"
                    style={{ backgroundColor: '#F5F4F0' }}
                    onClick={() => setExpandedStock(isExpanded ? null : p.code)}
                  >
                    {/* 상단: 종목명 + 등급 + 점수 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {p.star && <span className="text-[#D97706] text-sm">★</span>}
                        <span className="text-[17px] font-bold text-[#1A1A2E]">{p.name}</span>
                        <span className="text-[12px] text-[#6B7280]">{p.code}</span>
                        {p.action && (
                          <span
                            className="text-[12px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: actionStyle.bg, color: actionStyle.text, border: `1px solid ${actionStyle.border}` }}
                          >
                            {p.action}
                          </span>
                        )}
                        <span
                          className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: gradeS.bg, color: gradeS.text }}
                        >
                          {p.grade}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[20px] font-bold text-[#1A1A2E] tabular-nums">{p.score.toFixed(1)}점</span>
                        <span className="text-[14px] font-bold" style={{ color: isExpanded ? '#00CC6A' : '#9CA3AF' }}>
                          상세 근거 {isExpanded ? '▼' : '▸'}
                        </span>
                      </div>
                    </div>

                    {/* 6칸 가격 그리드 */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                      <PriceCell label="현재가" value={p.close ?? p.entry_price} />
                      <PriceCell label="진입가" value={p.entry_price} />
                      <PriceCell label="목표가" value={p.target_price} bg="#EFF6FF" sub={targetPct > 0 ? `+${targetPct.toFixed(1)}%` : ''} subColor="#2563EB" />
                      <PriceCell label="손절가" value={p.stop_price} bg="#FEF2F2" sub={stopPct !== 0 ? `${stopPct.toFixed(1)}%` : ''} subColor="#DC2626" />
                      <PriceCell label="R:R" value={p.rr_ratio} isRatio />
                      <PriceCell label="보유일" value={p.hold_days} isDays />
                    </div>

                    {/* 트리거 바 */}
                    {p.catalyst && (
                      <div
                        className="mt-2 rounded-r-md text-[12px] font-medium px-2.5 py-1.5"
                        style={{ backgroundColor: '#ECFDF5', borderLeft: '3px solid #00FF88', color: '#065F46' }}
                      >
                        트리거: {p.catalyst}
                      </div>
                    )}
                  </div>

                  {/* 펼쳐진 상태 (Phase 2에서 근거 6가지 추가) */}
                  {isExpanded && (
                    <div
                      className="rounded-xl p-4 -mt-1 mb-2"
                      style={{ backgroundColor: '#FFF', border: '1px solid #E8E6E0' }}
                    >
                      {/* 근거 요약 (Phase 1 — 기본 정보) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {/* 수급 */}
                        <div className="bg-[#F5F4F0] rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                            <span className="text-[13px] font-bold text-[#1A1A2E]">수급 근거</span>
                          </div>
                          <p className="text-[12px] text-[#6B7280]">
                            매집점수 {p.supply_score} · {p.nat_power_grade ?? '-'}
                          </p>
                        </div>
                        {/* 차트 */}
                        <div className="bg-[#F5F4F0] rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                            <span className="text-[13px] font-bold text-[#1A1A2E]">차트 근거</span>
                          </div>
                          <p className="text-[12px] text-[#6B7280]">
                            RSI {p.rsi?.toFixed(0) ?? '-'} · {p.tv_pattern ?? '패턴 분석 중'}
                          </p>
                        </div>
                        {/* 종합 */}
                        <div className="bg-[#F5F4F0] rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-5 h-5 rounded-full bg-[#16A34A] text-white text-[11px] font-bold flex items-center justify-center">AI</span>
                            <span className="text-[13px] font-bold text-[#1A1A2E]">AI 종합</span>
                          </div>
                          <p className="text-[12px] text-[#6B7280]">
                            {p.conviction_label ?? p.conviction} · {p.sector ?? ''}
                          </p>
                        </div>
                      </div>
                      {/* 피보나치 레벨 (데이터 있을 때만) */}
                      {p.fib_position && (
                        <div className="bg-[#F5F4F0] rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[11px] font-bold flex items-center justify-center">F</span>
                            <span className="text-[13px] font-bold text-[#1A1A2E]">피보나치 분석</span>
                            <span className="text-[11px] text-[#6B7280] ml-auto">{p.fib_position}</span>
                          </div>
                          {/* 게이지 바: 하방 ← 현재 → 상방 */}
                          <div className="relative h-4 bg-[#E8E6E0] rounded-full overflow-hidden mb-1.5">
                            {/* 하방 영역 */}
                            <div
                              className="absolute left-0 top-0 h-full bg-[#DC2626]/25 rounded-l-full"
                              style={{ width: `${Math.min(((p.fib_downside_pct ?? 0) / ((p.fib_downside_pct ?? 0) + (p.fib_upside_pct ?? 0) || 1)) * 100, 100)}%` }}
                            />
                            {/* 상방 영역 */}
                            <div
                              className="absolute right-0 top-0 h-full bg-[#16A34A]/25 rounded-r-full"
                              style={{ width: `${Math.min(((p.fib_upside_pct ?? 0) / ((p.fib_downside_pct ?? 0) + (p.fib_upside_pct ?? 0) || 1)) * 100, 100)}%` }}
                            />
                            {/* 현재 위치 마커 */}
                            <div
                              className="absolute top-0 h-full w-[3px] bg-[#1A1A2E]"
                              style={{ left: `${Math.min(((p.fib_downside_pct ?? 0) / ((p.fib_downside_pct ?? 0) + (p.fib_upside_pct ?? 0) || 1)) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-[#DC2626] font-bold">▼ {(p.fib_downside_pct ?? 0).toFixed(1)}%</span>
                            <span className="text-[#16A34A] font-bold">▲ {(p.fib_upside_pct ?? 0).toFixed(1)}%</span>
                          </div>
                          {/* 피보 손절/목표 */}
                          <div className="grid grid-cols-3 gap-1.5 mt-2">
                            <div className="text-center bg-white rounded p-1">
                              <p className="text-[8px] text-[#9CA3AF]">피보 손절</p>
                              <p className="text-[13px] font-bold text-[#DC2626] tabular-nums">{(p.sl_fib ?? 0).toLocaleString()}</p>
                            </div>
                            <div className="text-center bg-white rounded p-1">
                              <p className="text-[8px] text-[#9CA3AF]">피보 목표</p>
                              <p className="text-[13px] font-bold text-[#2563EB] tabular-nums">{(p.tp_fib ?? 0).toLocaleString()}</p>
                            </div>
                            <div className="text-center bg-white rounded p-1">
                              <p className="text-[8px] text-[#9CA3AF]">피보 보정</p>
                              <p className="text-[13px] font-bold text-[#7C3AED] tabular-nums">{(p.fib_adj ?? 0).toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 근거 태그 */}
                      {p.reasons?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {p.reasons.map((r, i) => (
                            <span key={i} className="text-[12px] px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#065F46] border border-[#A7F3D0]">
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="text-[12px] text-[#9CA3AF] mt-2 text-center">
                        상세 근거 6가지 (수급/차트/시나리오/재무/비교/AI) — 준비 중
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* NXT 야간매매 종목 */}
      {nxtPicks.length > 0 && (
        <section>
          <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">추천 종목 — 야간 매매 (NXT)</h2>
          <div
            className="rounded-r-xl p-4 space-y-2"
            style={{ border: '1px solid var(--border)', borderLeft: '3px solid #7C3AED' }}
          >
            {nxtPicks.map((p) => {
              const actionStyle = actionBadgeStyle(p.action)
              const gradeS = gradeBadgeStyle(p.grade)
              const targetPct = p.entry_price > 0 ? ((p.target_price - p.entry_price) / p.entry_price * 100) : 0
              const stopPct = p.entry_price > 0 ? ((p.stop_price - p.entry_price) / p.entry_price * 100) : 0
              return (
                <div key={p.code} className="rounded-[10px] p-3" style={{ backgroundColor: '#F5F4F0' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {p.star && <span className="text-[#D97706] text-sm">★</span>}
                      <span className="text-[16px] font-bold text-[#1A1A2E]">{p.name}</span>
                      <span className="text-[12px] text-[#6B7280]">{p.code}</span>
                      {p.action && (
                        <span className="text-[12px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: actionStyle.bg, color: actionStyle.text }}>
                          {p.action}
                        </span>
                      )}
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: gradeS.bg, color: gradeS.text }}>
                        {p.grade}
                      </span>
                    </div>
                    <span className="text-[16px] font-bold text-[#1A1A2E] tabular-nums">{p.score.toFixed(1)}점</span>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                    <PriceCell label="현재가" value={p.close ?? p.entry_price} />
                    <PriceCell label="진입가" value={p.entry_price} />
                    <PriceCell label="목표가" value={p.target_price} bg="#EFF6FF" sub={targetPct > 0 ? `+${targetPct.toFixed(1)}%` : ''} subColor="#2563EB" />
                    <PriceCell label="손절가" value={p.stop_price} bg="#FEF2F2" sub={stopPct !== 0 ? `${stopPct.toFixed(1)}%` : ''} subColor="#DC2626" />
                    <PriceCell label="R:R" value={p.rr_ratio} isRatio />
                    <PriceCell label="보유일" value={p.hold_days} isDays />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══ 3행: 매매 타임라인 ═══ */}
      <section>
        <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">오늘의 매매 타임라인</h2>
        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5">
          <div className="relative pl-7">
            {/* 세로 선 */}
            <div className="absolute left-[10px] top-0 bottom-0 w-[2px] bg-[#E8E6E0]" />
            <div className="space-y-4">
              {TIMELINE.map((t, i) => (
                <div key={i} className="relative">
                  {/* 컬러 점 */}
                  <div
                    className="absolute -left-[22px] top-[2px] w-[14px] h-[14px] rounded-full border-2 border-white"
                    style={{ backgroundColor: t.color }}
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[15px] font-bold" style={{ color: t.color }}>{t.time}</span>
                      <p className="text-[13px] font-bold text-[#1A1A2E]">{t.action}</p>
                      <p className="text-[12px] text-[#6B7280]">{t.desc}</p>
                    </div>
                    {t.badge && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                        {t.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4행: ETF 추천 ═══ */}
      {data.etf_picks?.length > 0 && (
        <section>
          <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">ETF 추천</h2>
          <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[#6B7280] border-b border-[var(--border)]">
                  <th className="text-left py-2 px-3">ETF</th>
                  <th className="text-center py-2 px-2">카테고리</th>
                  <th className="text-center py-2 px-2">시그널</th>
                  <th className="text-right py-2 px-2">진입</th>
                  <th className="text-right py-2 px-2">손절</th>
                  <th className="text-right py-2 px-2">목표</th>
                  <th className="text-right py-2 px-2">보유일</th>
                  <th className="text-left py-2 px-2">사유</th>
                </tr>
              </thead>
              <tbody>
                {data.etf_picks.map((e) => (
                  <tr key={e.code} className="border-b border-[var(--border)]/30 hover:bg-[var(--bg-row)]/50">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#1A1A2E]">{e.name}</span>
                      <span className="text-[#6B7280] ml-1">{e.code}</span>
                    </td>
                    <td className="text-center py-2.5 px-2 text-[#6B7280]">{e.category}</td>
                    <td className="text-center py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] font-bold">{e.signal}</span>
                    </td>
                    <td className="text-right py-2.5 px-2 text-[#1A1A2E] font-mono">{e.entry?.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 text-[#DC2626] font-mono">{e.sl?.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 text-[#2563EB] font-mono">{e.tp?.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 text-[#6B7280] font-mono">{e.holding_days}일</td>
                    <td className="text-left py-2.5 px-2 text-[#6B7280] max-w-[200px] truncate">{e.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══ 5행: 시장 지표 + 자산 배분 (2열) ═══ */}
      <section>
        <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">시장 지표 & 자산 배분</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌: 시장 지표 */}
          <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5">
            <h3 className="text-[14px] font-bold text-[#1A1A2E] mb-3">시장 지표</h3>
            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="VIX" value={data.vix.toFixed(1)} bg={data.vix >= 25 ? '#FEF2F2' : data.vix >= 18 ? '#FFFBEB' : '#DBEAFE'} color={data.vix >= 25 ? '#DC2626' : data.vix >= 18 ? '#D97706' : '#2563EB'} />
              <MetricCard label="NASDAQ" value={`${data.nasdaq_pct >= 0 ? '+' : ''}${data.nasdaq_pct.toFixed(2)}%`} color={data.nasdaq_pct >= 0 ? '#059669' : '#DC2626'} />
              <MetricCard label="USD/KRW" value={data.usdkrw.toFixed(0)} color="#1A1A2E" />
              <MetricCard label="유가" value={`${data.oil_pct >= 0 ? '+' : ''}${data.oil_pct.toFixed(2)}%`} color={data.oil_pct >= 0 ? '#059669' : '#DC2626'} />
              <MetricCard label="금" value={`${data.gold_pct >= 0 ? '+' : ''}${data.gold_pct.toFixed(2)}%`} color={data.gold_pct >= 0 ? '#059669' : '#DC2626'} />
              <MetricCard label="스트레스" value={data.stress_index.toFixed(1)} bg={data.stress_level === 'HIGH' ? '#FEF2F2' : '#F5F4F0'} color={data.stress_level === 'HIGH' ? '#DC2626' : data.stress_level === 'ELEVATED' ? '#D97706' : '#059669'} />
            </div>
            {/* 위험 경고 */}
            {data.stress_level === 'HIGH' && (
              <div className="mt-3 rounded-r-md text-[12px] px-3 py-2" style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #EF4444', color: '#DC2626' }}>
                위험 신호: 스트레스 {data.stress_level} ({data.stress_index.toFixed(1)})
              </div>
            )}
          </div>

          {/* 우: 자산 배분 */}
          <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5">
            <h3 className="text-[14px] font-bold text-[#1A1A2E] mb-3">자산 배분</h3>
            {data.alloc_cash >= 100 ? (
              <div className="bg-[#DBEAFE] rounded-xl p-6 text-center">
                <p className="text-[16px] font-bold text-[#1D4ED8] mb-1">현금 100%</p>
                <p className="text-[13px] text-[#3B82F6]">지금은 쉬세요. 시장이 안전해지면 자동 배분 변경</p>
              </div>
            ) : (
              <>
                {/* 가로 바 */}
                <div className="flex h-5 rounded-full overflow-hidden mb-3">
                  {[
                    { label: '스윙', pct: data.alloc_swing, color: '#DC2626' },
                    { label: '금ETF', pct: data.alloc_gold_etf, color: '#D97706' },
                    { label: '인버스', pct: data.alloc_inverse, color: '#3B82F6' },
                    { label: '그룹', pct: data.alloc_group_etf, color: '#059669' },
                    { label: '소형', pct: data.alloc_small_cap, color: '#7C3AED' },
                    { label: '현금', pct: data.alloc_cash, color: '#9CA3AF' },
                  ].filter(a => a.pct > 0).map((a) => (
                    <div
                      key={a.label}
                      className="flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ width: `${a.pct}%`, backgroundColor: a.color, minWidth: a.pct > 5 ? undefined : '2px' }}
                      title={`${a.label} ${a.pct}%`}
                    >
                      {a.pct >= 10 ? `${a.label} ${a.pct}%` : ''}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'BH 스윙', pct: data.alloc_swing, color: '#DC2626' },
                    { label: '금 ETF', pct: data.alloc_gold_etf, color: '#D97706' },
                    { label: '인버스', pct: data.alloc_inverse, color: '#3B82F6' },
                    { label: '그룹 ETF', pct: data.alloc_group_etf, color: '#059669' },
                    { label: '소형주', pct: data.alloc_small_cap, color: '#7C3AED' },
                    { label: '현금', pct: data.alloc_cash, color: '#9CA3AF' },
                  ].map((a) => (
                    <div key={a.label} className="text-center bg-[#F5F4F0] rounded-lg p-2.5">
                      <p className="text-[11px] font-bold text-[#6B7280] mb-0.5">{a.label}</p>
                      <p className="text-[17px] font-black tabular-nums" style={{ color: a.color }}>{a.pct}%</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ═══ 6행: BRAIN 분석 보고서 (4칸 + 나이트워치) ═══ */}
      {analysisCards && (
        <section>
          <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">BRAIN 분석 보고서</h2>

          {/* 4칸 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {analysisCards.warning && (
              <ReportCard title="경고" content={analysisCards.warning} bg="#FEF2F2" lineColor="#EF4444" />
            )}
            {analysisCards.strategy && (
              <ReportCard title="전략 요약" content={analysisCards.strategy} bg="#FFFBEB" lineColor="#F59E0B" />
            )}
            {analysisCards.sector && (
              <ReportCard title="섹터 요약" content={analysisCards.sector} bg="#F5F4F0" />
            )}
            {analysisCards.commodity && (
              <ReportCard title="원자재 요약" content={analysisCards.commodity} bg="#F5F4F0" />
            )}
          </div>

          {/* 나이트워치 */}
          {analysisCards.nightwatch && (
            <ReportCard title="나이트워치" content={analysisCards.nightwatch} bg="#F0F0FF" lineColor="#7C3AED" />
          )}

          {/* BRAIN 상세 (아코디언) */}
          {Object.keys(analysisCards.rest).length > 0 && (
            <div className="mt-3">
              <button
                className="text-[14px] font-bold cursor-pointer mb-2"
                style={{ color: brainExpanded ? '#00CC6A' : '#9CA3AF' }}
                onClick={() => setBrainExpanded(!brainExpanded)}
              >
                BRAIN 상세 {brainExpanded ? '▼' : '▸'}
              </button>
              {brainExpanded && (
                <div className="space-y-2">
                  {Object.entries(analysisCards.rest).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-lg border border-[var(--border)] p-3">
                      <p className="text-[12px] font-bold text-[#6B7280] mb-1">{formatAnalysisKey(key)}</p>
                      <p className="text-[13px] text-[#1A1A2E] whitespace-pre-wrap">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 마켓 코멘트 */}
          {data.market_comment && (
            <div className="mt-3 bg-white rounded-lg border border-[var(--border)] p-4">
              <p className="text-[12px] font-bold text-[#6B7280] mb-1">마켓 코멘트</p>
              <p className="text-[13px] text-[#1A1A2E] whitespace-pre-wrap">{data.market_comment}</p>
            </div>
          )}
        </section>
      )}

      {/* ── 워치리스트 ── */}
      {data.watchlist?.length > 0 && (
        <section className="pb-8">
          <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">워치리스트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.watchlist.map((w) => {
              const gradeS = gradeBadgeStyle(w.grade)
              return (
                <div key={w.code} className="bg-white rounded-lg border border-[var(--border)] p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[15px] font-bold text-[#1A1A2E]">
                      {w.name} <span className="text-[12px] text-[#6B7280]">{w.code}</span>
                    </span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: gradeS.bg, color: gradeS.text }}>
                      {w.grade}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6B7280]">{w.reason}</p>
                  {w.trigger && (
                    <p className="text-[12px] text-[#D97706] mt-1 font-medium">트리거: {w.trigger}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

/* ── 가격 셀 ── */
function PriceCell({ label, value, bg, sub, subColor, isRatio, isDays }: {
  label: string; value: number; bg?: string; sub?: string; subColor?: string; isRatio?: boolean; isDays?: boolean
}) {
  const display = isRatio
    ? `${value?.toFixed(1) ?? '-'}`
    : isDays
      ? `${value}일`
      : value?.toLocaleString() ?? '-'

  return (
    <div className="rounded-md p-2.5 text-center" style={{ backgroundColor: bg ?? '#F9FAFB' }}>
      <p className="text-[11px] font-bold text-[#6B7280] mb-0.5">{label}</p>
      <p className="text-[17px] font-black text-[#1A1A2E] tabular-nums">{display}</p>
      {sub && <p className="text-[12px] font-bold tabular-nums mt-0.5" style={{ color: subColor ?? '#6B7280' }}>{sub}</p>}
    </div>
  )
}

/* ── 시장 지표 미니카드 ── */
function MetricCard({ label, value, color, bg }: { label: string; value: string; color: string; bg?: string }) {
  return (
    <div className="rounded-lg p-2.5 text-center" style={{ backgroundColor: bg ?? '#F5F4F0' }}>
      <p className="text-[11px] font-bold text-[#6B7280] mb-0.5">{label}</p>
      <p className="text-[17px] font-black font-mono tabular-nums" style={{ color }}>{value}</p>
    </div>
  )
}

/* ── 보고서 카드 ── */
function ReportCard({ title, content, bg, lineColor }: { title: string; content: string; bg: string; lineColor?: string }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        backgroundColor: bg,
        borderLeft: lineColor ? `3px solid ${lineColor}` : undefined,
        borderRadius: lineColor ? '0 8px 8px 0' : '8px',
      }}
    >
      <p className="text-[13px] font-bold text-[#1A1A2E] mb-1">{title}</p>
      <p className="text-[13px] text-[#374151] whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  )
}
