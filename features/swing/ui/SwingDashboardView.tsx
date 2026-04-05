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

interface FibStock {
  code: string; name: string; sector: string; cap: number
  price: number; w52h: number; w52l: number; drop: number
  fib_zone: string; fib_zone_label: string
  fib_382: number; fib_500: number; fib_618: number
  fib_status: string; target: number; upside: number
  per: number; pbr: number; frgn: number
}

interface FxMonitor {
  timestamp: string
  dxy: { value: number; prev: number; chg_1d: number; ma5: number; ma20: number; trend: string }
  usdkrw: { value: number; prev: number; chg_1d: number; ma5: number; ma20: number; trend: string }
  vix_structure: { vix: number; vix3m: number; ratio: number; structure: string; label: string }
  correlation: { matches: number; total: number; pct: number; label: string }
  foreign_flow: {
    proxy: string; today_억: number; sum_3d_억: number
    streak: number; direction: string; signal: string; signal_color: string
  }
  verdict: { text: string; color: string; bullish: number; bearish: number; score: number }
}

interface SectorItem {
  sector: string; count: number; total_score: number
  momentum: number; flow_score: number; dual_bonus: number
  avg_chg: number; avg_drop: number; avg_upside: number
  net_flow_억: number; dual_buy_3d: number
  up_count: number; down_count: number
  deep: number; mid: number; mild: number; shallow: number
  cap_조: number; cap_억: number
  stage: string; stage_num: number; stage_color: string; warning: string
}

interface SectorRotation {
  timestamp: string; total_sectors: number; total_stocks: number
  sectors: SectorItem[]
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
  nxt_rationale?: {
    timestamp?: string; verdict?: string
    green?: number; yellow?: number; red?: number; total?: number
    indicators?: { key: string; name: string; signal: string; signal_label: string; detail: string }[]
  }
  fib_stocks?: FibStock[]
  fx_monitor?: FxMonitor
  sector_rotation?: SectorRotation
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
    case '매수': case '포착': return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' }
    case '관심매수': case '관심': return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' }
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

/* ── 추세 화살표 ── */
function trendArrow(trend: string): { arrow: string; color: string } {
  if (trend === '약세' || trend === '원강세') return { arrow: '▼', color: '#22c55e' }
  if (trend === '강세' || trend === '원약세') return { arrow: '▲', color: '#ef4444' }
  return { arrow: '→', color: '#9ca3af' }
}

/* ── verdict 색상 ── */
const VERDICT_COLOR: Record<string, string> = { GREEN: '#22c55e', YELLOW: '#eab308', RED: '#ef4444' }
const SIGNAL_BG: Record<string, string> = { GREEN: '#F0FDF4', YELLOW: '#FFFBEB', RED: '#FEF2F2' }

/* ── FX 모니터 섹션 ── */
function FxMonitorSection({ fx }: { fx: FxMonitor }) {
  const vc = VERDICT_COLOR[fx.verdict.color] ?? '#9ca3af'
  const dxyT = trendArrow(fx.dxy.trend)
  const krwT = trendArrow(fx.usdkrw.trend)
  const corrColor = fx.correlation.pct >= 80 ? '#22c55e' : fx.correlation.pct >= 60 ? '#eab308' : '#ef4444'
  const sigColor = VERDICT_COLOR[fx.foreign_flow.signal_color] ?? '#9ca3af'
  const sigBg = SIGNAL_BG[fx.foreign_flow.signal_color] ?? '#F5F4F0'

  return (
    <section>
      {/* 헤더 + 종합 판정 */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">💲</span>
          <h2 className="text-[17px] font-bold text-[#1A1A2E]">달러-환율 모니터</h2>
          <span className="text-[12px] text-[#6B7280]">외국인 자금 흐름 신호</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[13px] font-bold px-3 py-1 rounded-lg text-white"
            style={{ backgroundColor: vc }}
          >
            {fx.verdict.text}
          </span>
          <span className="text-[12px] font-bold text-[#6B7280]">
            유입 <span style={{ color: '#22c55e' }}>+{fx.verdict.bullish}</span>
            {' / '}유출 <span style={{ color: '#ef4444' }}>{fx.verdict.bearish}</span>
          </span>
          <span className="text-[11px] text-[#9CA3AF]">{fx.timestamp}</span>
        </div>
      </div>

      {/* 4개 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {/* DXY */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <p className="text-[11px] font-bold text-[#6B7280] mb-1">DXY 달러인덱스</p>
          <p className="text-[24px] font-black text-[#1A1A2E] tabular-nums">{fx.dxy.value.toFixed(2)}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[14px] font-bold" style={{ color: dxyT.color }}>
              {dxyT.arrow}{fx.dxy.trend}
            </span>
            <span className="text-[12px] tabular-nums" style={{ color: fx.dxy.chg_1d >= 0 ? '#dc2626' : '#2563eb' }}>
              {fx.dxy.chg_1d >= 0 ? '+' : ''}{fx.dxy.chg_1d.toFixed(2)}%
            </span>
          </div>
          <div className="flex gap-3 mt-2 text-[11px] text-[#6B7280]">
            <span>5일: <span className="font-bold text-[#1A1A2E] tabular-nums">{fx.dxy.ma5.toFixed(1)}</span></span>
            <span>20일: <span className="font-bold text-[#1A1A2E] tabular-nums">{fx.dxy.ma20.toFixed(1)}</span></span>
          </div>
        </div>

        {/* USD/KRW */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <p className="text-[11px] font-bold text-[#6B7280] mb-1">USD/KRW 환율</p>
          <p className="text-[24px] font-black text-[#1A1A2E] tabular-nums">{fx.usdkrw.value.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}원</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[14px] font-bold" style={{ color: krwT.color }}>
              {krwT.arrow}{fx.usdkrw.trend}
            </span>
            <span className="text-[12px] tabular-nums" style={{ color: fx.usdkrw.chg_1d >= 0 ? '#dc2626' : '#2563eb' }}>
              {fx.usdkrw.chg_1d >= 0 ? '+' : ''}{fx.usdkrw.chg_1d.toFixed(2)}%
            </span>
          </div>
          <div className="flex gap-3 mt-2 text-[11px] text-[#6B7280]">
            <span>5일: <span className="font-bold text-[#1A1A2E] tabular-nums">{fx.usdkrw.ma5.toFixed(0)}</span></span>
            <span>20일: <span className="font-bold text-[#1A1A2E] tabular-nums">{fx.usdkrw.ma20.toFixed(0)}</span></span>
          </div>
        </div>

        {/* VIX 구조 */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <p className="text-[11px] font-bold text-[#6B7280] mb-1">VIX 구조</p>
          <p className="text-[24px] font-black text-[#1A1A2E] tabular-nums">{fx.vix_structure.vix.toFixed(2)}</p>
          <div className="mt-1">
            <span
              className="text-[12px] font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: fx.vix_structure.structure === 'CONTANGO' ? '#F0FDF4' : '#FEF2F2',
                color: fx.vix_structure.structure === 'CONTANGO' ? '#16A34A' : '#DC2626',
              }}
            >
              {fx.vix_structure.structure} — {fx.vix_structure.label}
            </span>
          </div>
          <div className="flex gap-3 mt-2 text-[11px] text-[#6B7280]">
            <span>VIX3M: <span className="font-bold text-[#1A1A2E] tabular-nums">{fx.vix_structure.vix3m.toFixed(1)}</span></span>
            <span>비율: <span className="font-bold text-[#1A1A2E] tabular-nums">{fx.vix_structure.ratio.toFixed(3)}</span></span>
          </div>
        </div>

        {/* 외국인 흐름 */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <p className="text-[11px] font-bold text-[#6B7280] mb-1">외국인 흐름 <span className="text-[#9CA3AF]">({fx.foreign_flow.proxy} 기준)</span></p>
          <div className="mt-0.5">
            <span
              className="text-[16px] font-bold px-2.5 py-1 rounded-lg inline-block"
              style={{ backgroundColor: sigBg, color: sigColor }}
            >
              {fx.foreign_flow.signal}
            </span>
          </div>
          <p className="text-[18px] font-black tabular-nums mt-1.5" style={{ color: fx.foreign_flow.today_억 >= 0 ? '#22c55e' : '#ef4444' }}>
            {fx.foreign_flow.today_억 >= 0 ? '+' : ''}{fx.foreign_flow.today_억.toLocaleString()}억
          </p>
          <div className="flex gap-3 mt-1 text-[11px] text-[#6B7280]">
            <span>3일: <span className="font-bold tabular-nums" style={{ color: fx.foreign_flow.sum_3d_억 >= 0 ? '#22c55e' : '#ef4444' }}>
              {fx.foreign_flow.sum_3d_억 >= 0 ? '+' : ''}{fx.foreign_flow.sum_3d_억.toLocaleString()}억
            </span></span>
            <span>{fx.foreign_flow.streak}일째 {fx.foreign_flow.direction}</span>
          </div>
        </div>
      </div>

      {/* 상관관계 바 */}
      <div className="bg-white rounded-xl border border-[var(--border)] p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[12px]">📊</span>
          <span className="text-[12px] font-bold text-[#1A1A2E]">환율↔KOSPI 상관</span>
          <span className="text-[13px] font-black tabular-nums" style={{ color: corrColor }}>{fx.correlation.pct}%</span>
          <span className="text-[11px] text-[#6B7280] ml-1">{fx.correlation.label}</span>
        </div>
        <div className="h-2 bg-[#E8E6E0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fx.correlation.pct}%`, backgroundColor: corrColor }}
          />
        </div>
      </div>
    </section>
  )
}

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

      {/* ═══ 0행: 달러-환율 모니터 (최상단) ═══ */}
      {data.fx_monitor && data.fx_monitor.dxy && (
        <FxMonitorSection fx={data.fx_monitor} />
      )}

      {/* ═══ 섹터 로테이션 맵 ═══ */}
      {data.sector_rotation && data.sector_rotation.sectors?.length > 0 && (
        <SectorRotationPanel rotation={data.sector_rotation} />
      )}

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

      {/* ═══ 2행: 주목 종목 카드 (접힌/펼침) ═══ */}
      {krxPicks?.length > 0 && (
        <section>
          <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">
            주목 종목 — 클릭하면 AI 분석 근거가 펼쳐져요
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

      {/* ═══ 채권자경단 v2 — 야간 매매 판단 근거 ═══ */}
      {(() => {
        const rat = data.nxt_rationale
        const indicators = rat?.indicators
        const hasData = indicators && indicators.length > 0 && rat?.verdict && rat.verdict !== '수집실패'

        const VERDICT_STYLE: Record<string, { backgroundColor: string; color: string }> = {
          '적극 매수': { backgroundColor: '#22c55e', color: '#FFF' },
          '강력 포착': { backgroundColor: '#22c55e', color: '#FFF' },
          '조건부 매수': { backgroundColor: '#3b82f6', color: '#FFF' },
          '조건부 포착': { backgroundColor: '#3b82f6', color: '#FFF' },
          '경계': { backgroundColor: '#eab308', color: '#FFF' },
          '회피': { backgroundColor: '#ef4444', color: '#FFF' },
        }
        const SIGNAL_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
          GREEN: { bg: '#F0FDF4', text: '#16A34A', dot: '#22c55e' },
          YELLOW: { bg: '#FFFBEB', text: '#A16207', dot: '#eab308' },
          RED: { bg: '#FEF2F2', text: '#DC2626', dot: '#ef4444' },
        }

        return (
          <section>
            <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">야간 매매 판단 근거 (채권자경단 v2)</h2>
            <div
              className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5"
              style={{ borderLeft: '3px solid #7C3AED' }}
            >
              {!hasData ? (
                <p className="text-[13px] text-[#6B7280] text-center py-4">
                  데이터 수집 중입니다. 16:35 이후 갱신됩니다.
                </p>
              ) : (
                <>
                  {/* 종합 판정 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[15px] font-black px-3.5 py-1.5 rounded-lg"
                        style={VERDICT_STYLE[rat.verdict!] ?? { backgroundColor: '#9CA3AF', color: '#FFF' }}
                      >
                        종합: {rat.verdict}
                      </span>
                      <div className="flex items-center gap-2.5 text-[14px] font-bold tabular-nums">
                        <span style={{ color: '#22c55e' }}>안전 {rat.green ?? 0}</span>
                        <span style={{ color: '#eab308' }}>경계 {rat.yellow ?? 0}</span>
                        <span style={{ color: '#ef4444' }}>위험 {rat.red ?? 0}</span>
                        <span className="text-[#9CA3AF]">/ {rat.total ?? 7}개</span>
                      </div>
                    </div>
                    {rat.timestamp && (
                      <span className="text-[13px] text-[#9CA3AF]">
                        기준: {rat.timestamp.slice(0, 16)}
                      </span>
                    )}
                  </div>

                  {/* 7개 지표 테이블 */}
                  <div className="space-y-1.5">
                    {indicators!.map((ind) => {
                      const ss = SIGNAL_STYLE[ind.signal] ?? SIGNAL_STYLE.GREEN
                      return (
                        <div
                          key={ind.key}
                          className="flex items-center gap-3 rounded-lg px-4 py-2.5"
                          style={{ backgroundColor: ss.bg }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: ss.dot }}
                          />
                          <span className="text-[14px] font-bold text-[#1A1A2E] min-w-[140px] shrink-0">
                            {ind.name}
                          </span>
                          <span
                            className="text-[13px] font-black min-w-[48px] shrink-0 text-center"
                            style={{ color: ss.text }}
                          >
                            {ind.signal_label}
                          </span>
                          <span className="text-[13px] text-[#6B7280] tabular-nums flex-1 truncate">
                            {ind.detail}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </section>
        )
      })()}

      {/* NXT 야간매매 종목 */}
      {nxtPicks.length > 0 && (
        <section>
          <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">주목 종목 — 야간 매매 (NXT)</h2>
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

      {/* ═══ 4행: ETF 인사이트 ═══ */}
      {data.etf_picks?.length > 0 && (
        <section>
          <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">ETF 인사이트</h2>
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
                      <p className="text-[13px] font-black text-[#6B7280] mb-1">{formatAnalysisKey(key)}</p>
                      <p className="text-[14px] font-medium text-[#1A1A2E] whitespace-pre-wrap">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 마켓 코멘트 */}
          {data.market_comment && (
            <div className="mt-3 bg-white rounded-lg border border-[var(--border)] p-4">
              <p className="text-[13px] font-black text-[#6B7280] mb-1">마켓 코멘트</p>
              <p className="text-[14px] font-medium text-[#1A1A2E] whitespace-pre-wrap">{data.market_comment}</p>
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

/* ── 섹터 로테이션 단계 스타일 ── */
const STAGE_STYLE: Record<string, { bg: string; border: string; text: string; badge: string; badgeText: string }> = {
  '선도': { bg: '#F0FDFA', border: '#14B8A6', text: '#0D9488', badge: '#14B8A6', badgeText: '#FFF' },
  '추격': { bg: '#F7FEE7', border: '#84CC16', text: '#65A30D', badge: '#84CC16', badgeText: '#FFF' },
  '대기': { bg: '#FFFBEB', border: '#EAB308', text: '#CA8A04', badge: '#EAB308', badgeText: '#FFF' },
  '후발': { bg: '#FEF2F2', border: '#EF4444', text: '#DC2626', badge: '#EF4444', badgeText: '#FFF' },
}

/* ── 섹터 로테이션 맵 ── */
function SectorRotationPanel({ rotation }: { rotation: SectorRotation }) {
  const sectors = rotation.sectors ?? []
  if (sectors.length === 0) {
    return (
      <section>
        <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">섹터 로테이션 맵</h2>
        <div className="bg-white rounded-xl border border-[var(--border)] p-6 text-center">
          <p className="text-[13px] text-[#6B7280]">데이터 수집 중입니다.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-[17px] font-bold text-[#1A1A2E]">섹터 로테이션 맵</h2>
          <p className="text-[12px] text-[#6B7280]">자금 흐름 예측 · 피보나치 + 수급 + 모멘텀</p>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-[#6B7280]">
          <span>{rotation.total_sectors}개 섹터 · {rotation.total_stocks}종목</span>
          <span>{rotation.timestamp}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sectors.map((s) => {
          const st = STAGE_STYLE[s.stage] ?? STAGE_STYLE['대기']
          const fibTotal = s.deep + s.mid + s.mild + s.shallow
          const capText = s.cap_조 > 0 ? `${s.cap_조.toFixed(1)}조` : `${s.cap_억.toLocaleString()}억`

          return (
            <div
              key={s.sector}
              className="rounded-xl p-4"
              style={{ backgroundColor: st.bg, border: `1px solid ${st.border}30` }}
            >
              {/* 상단: 뱃지 + 섹터명 + 점수 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: st.badge, color: st.badgeText }}
                  >
                    {s.stage}
                  </span>
                  <span className="text-[15px] font-bold text-[#1A1A2E]">{s.sector}</span>
                  <span className="text-[11px] text-[#6B7280]">{s.count}종목 · {capText}</span>
                </div>
                <span
                  className="text-[18px] font-black tabular-nums"
                  style={{ color: s.total_score >= 0 ? st.text : '#DC2626' }}
                >
                  {s.total_score >= 0 ? '+' : ''}{s.total_score.toFixed(1)}
                </span>
              </div>

              {/* 점수 구성 3칸 */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-[10px] font-bold text-[#6B7280]">모멘텀</p>
                  <p className="text-[14px] font-black tabular-nums" style={{ color: '#2563EB' }}>
                    {s.momentum >= 0 ? '+' : ''}{s.momentum.toFixed(1)}
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-[10px] font-bold text-[#6B7280]">수급</p>
                  <p className="text-[14px] font-black tabular-nums" style={{ color: s.flow_score >= 0 ? '#16A34A' : '#DC2626' }}>
                    {s.flow_score >= 0 ? '+' : ''}{s.flow_score.toFixed(1)}
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-[10px] font-bold text-[#6B7280]">쌍유입</p>
                  <p className="text-[14px] font-black tabular-nums" style={{ color: '#D97706' }}>
                    {s.dual_bonus > 0 ? '+' : ''}{s.dual_bonus.toFixed(0)}
                  </p>
                </div>
              </div>

              {/* 상세 정보 2행 */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] mb-2">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">3일 수급</span>
                  <span className="font-bold tabular-nums" style={{ color: s.net_flow_억 >= 0 ? '#16A34A' : '#DC2626' }}>
                    {s.net_flow_억 >= 0 ? '+' : ''}{s.net_flow_억.toLocaleString()}억
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">쌍유입</span>
                  <span className="font-bold text-[#1A1A2E] tabular-nums">{s.dual_buy_3d}종목</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">평균 하락</span>
                  <span className="font-bold text-[#DC2626] tabular-nums">{s.avg_drop.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">상승여력</span>
                  <span className="font-bold text-[#16A34A] tabular-nums">+{s.avg_upside.toFixed(1)}%</span>
                </div>
              </div>

              {/* 종목 등락 */}
              <div className="flex items-center gap-2 text-[12px] mb-2">
                <span className="text-[#6B7280]">등락</span>
                <span className="font-bold text-[#DC2626]">↑{s.up_count}</span>
                <span className="font-bold text-[#2563EB]">↓{s.down_count}</span>
                <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden ml-1">
                  <div
                    className="h-full bg-[#DC2626] rounded-full"
                    style={{ width: `${(s.up_count / (s.up_count + s.down_count || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* 피보나치 존 분포 */}
              {fibTotal > 0 && (
                <div className="flex items-center gap-1 text-[10px]">
                  {[
                    { label: 'DEEP', count: s.deep, color: '#EF4444' },
                    { label: 'MID', count: s.mid, color: '#F97316' },
                    { label: 'MILD', count: s.mild, color: '#EAB308' },
                    { label: 'SH', count: s.shallow, color: '#22C55E' },
                  ].filter(z => z.count > 0).map((z) => (
                    <div key={z.label} className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: z.color }} />
                      <span className="text-[#6B7280] font-bold">{z.label} {z.count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warning */}
              {s.warning && (
                <div className="mt-2 rounded-md px-2.5 py-1.5 text-[11px] font-bold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  ⚠ {s.warning}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
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
      <p className="text-[15px] font-black text-[#1A1A2E] mb-1.5">{title}</p>
      <p className="text-[14px] font-medium text-[#374151] whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  )
}
