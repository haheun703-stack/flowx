'use client'

import { useQuantDashboard, type QuantDashboardState, type Zone2Item, type Zone7MarketHeader, type Zone7EtfItem, type Zone5SdPattern } from '@/features/dashboard/api/useDashboard'
import { GRADE_LEGACY_BUY, GRADE_OBSERVE } from '@/shared/constants/grades'

/* ── 라이트 테마 색상 (Dashboard 기준 통일) ── */
const C = {
  bg: '#f8f9fb', bg2: '#ffffff', bg3: '#f3f4f6',
  border: '#e2e5ea', border2: '#d1d5db',
  text: '#111827', muted: '#6b7280', muted2: '#9ca3af',
  green: '#16a34a', green2: '#dcfce7', green3: '#f0fdf4',
  amber: '#d97706', amber2: '#fef9c3',
  red: '#dc2626', red2: '#fef2f2',
  blue: '#2563eb', blue2: '#eff6ff',
  purple: '#7c3aed', purple2: '#f5f3ff',
} as const

const MONO = "'Space Mono', monospace"
const PNL_BAR_SCALE = 10           // 10% PnL → 100% bar width
const SUPPLY_BAR_MAX = 10_000_000  // 1천만원 → 100% bar width

/* ── 유틸 ── */
function moneyStr(v: number | undefined | null): string {
  if (v == null || v === 0) return '0'
  const abs = Math.abs(v)
  const sign = v > 0 ? '+' : '-'
  if (abs >= 100000000) return sign + (abs / 100000000).toFixed(0) + '억'
  if (abs >= 10000) return sign + (abs / 10000).toFixed(0) + '만'
  return sign + abs.toLocaleString()
}

const pctColor = (v: number) => v > 0 ? C.green : v < 0 ? C.red : C.text
const pctSign = (v: number) => v > 0 ? '+' : ''
const signalColor = (s: string) => s === GRADE_LEGACY_BUY ? C.green : s === '매도' ? C.red : s === GRADE_OBSERVE ? C.blue : C.amber
const trustColor = (v: number) => v >= 60 ? C.green : v >= 45 ? C.amber : C.red

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div style={{ padding: 20 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse" style={{ height: 80, background: C.bg3, borderRadius: 6, marginBottom: 12 }} />
      ))}
    </div>
  )
}

/* ════════════════════════════════════════
   Zone 6: 신뢰도 바 (상단)
   ════════════════════════════════════════ */
function TrustBar({ z6, shield }: { z6: QuantDashboardState['zone6']; shield: string }) {
  const items = [
    { label: 'AI분석', val: z6.tomorrow_picks },
    { label: '세력탐지', val: z6.whale_detect },
    { label: '거래량적중', val: z6.volume_spike },
    { label: 'AI브레인', val: z6.brain },
  ]
  const shieldC = shield === 'RED' ? C.red : shield === 'YELLOW' ? C.amber : C.green
  const shieldLabel = shield === 'RED' ? '경고' : shield === 'YELLOW' ? '주의' : '정상'
  const hits = (z6.recent_10 ?? []).filter(x => x === 1).length

  return (
    <div className="quant-trust-bar" style={{ display: 'flex', alignItems: 'center', background: C.bg2, borderBottom: `1px solid ${C.border}`, overflowX: 'auto', scrollbarWidth: 'none' as const, padding: '0 24px' }}>
      {items.map(it => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRight: `1px solid ${C.border}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ color: C.muted, fontSize: 11 }}>{it.label}</span>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: trustColor(it.val ?? 0) }}>{(it.val ?? 0).toFixed(1)}%</span>
          <div style={{ width: 60, height: 4, background: C.border2, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${Math.min(it.val ?? 0, 100)}%`, background: trustColor(it.val ?? 0) }} />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ color: C.muted, fontSize: 11 }}>최근 10건</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {(z6.recent_10 ?? []).map((h, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 1, background: h ? C.green : C.muted2 }} />
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.green }}>{hits}/10</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ color: C.muted, fontSize: 11 }}>SHIELD</span>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: shieldC }}>{shieldLabel}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', flexShrink: 0 }}>
        <span style={{ color: C.muted, fontSize: 11 }}>활성 시그널</span>
        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.purple }}>{z6.active_signals}</span>
      </div>
    </div>
  )
}

/* ── Zone Card 공통 ── */
function Zone({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: C.bg3, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, letterSpacing: '0.15em' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

/* ════════════════════════════════════════
   Zone 1: 오늘의 판단
   ════════════════════════════════════════ */
function VerdictZone({ z1 }: { z1: QuantDashboardState['zone1'] }) {
  const vc = z1.verdict === GRADE_LEGACY_BUY ? 'buy' : z1.verdict === '매도' || z1.verdict === '회피' ? 'sell' : 'watch'
  const vcColor = vc === 'buy' ? C.green : vc === 'sell' ? C.red : C.amber
  const vcBg = vc === 'buy' ? C.green3 : vc === 'sell' ? C.red2 : C.amber2

  return (
    <Zone label="오늘의 판단" title="AI 종합 분석">
      <div className="quant-verdict-grid" style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', borderRight: `1px solid ${C.border}`, gap: 8 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, fontFamily: MONO, border: `2px solid ${vcColor}`, color: vcColor, background: vcBg }}>
            {z1.verdict}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, padding: '3px 8px', borderRadius: 3, background: C.blue2, color: C.blue }}>현금 {z1.cash_pct}%</span>
            <span style={{ fontFamily: MONO, fontSize: 11, padding: '3px 8px', borderRadius: 3, background: C.green3, color: C.green }}>매수 {z1.buy_pct}%</span>
          </div>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InfoRow tag="시장" tagBg={C.blue2} tagColor={C.blue}>
            <div style={{ fontSize: 13, color: C.text }}>KOSPI {z1.kospi != null ? z1.kospi.toLocaleString() : '—'} ({(z1.kospi_chg ?? 0) > 0 ? '+' : ''}{z1.kospi_chg ?? 0}%)</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>VIX {z1.vix ?? '—'} · AI 신뢰도 {z1.brain_score ?? '—'}점</div>
          </InfoRow>
          <InfoRow tag="시장국면" tagBg={C.purple2} tagColor={C.purple}>
            <div style={{ fontSize: 13, color: C.text }}>
              {z1.regime}{z1.regime_transition ? <> → <span style={{ color: C.amber }}>{z1.regime_transition} ({z1.transition_prob}%)</span></> : ''}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{z1.macro_grade}</div>
          </InfoRow>
          {z1.lens_summary && (
            <InfoRow tag="AI분석" tagBg={C.green3} tagColor={C.green} last>
              <div style={{ fontSize: 13, color: C.text }}>{z1.lens_summary}</div>
            </InfoRow>
          )}
        </div>
      </div>
    </Zone>
  )
}

function InfoRow({ tag, tagBg, tagColor, last, children }: { tag: string; tagBg: string; tagColor: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: last ? 0 : 10, borderBottom: last ? 'none' : `1px solid ${C.border}` }}>
      <span style={{ fontFamily: MONO, fontSize: 10, padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap', flexShrink: 0, background: tagBg, color: tagColor, letterSpacing: '0.05em' }}>{tag}</span>
      <div>{children}</div>
    </div>
  )
}

/* ════════════════════════════════════════
   Zone 2: 종목 풀 공개 카드 (V3 핵심)
   ════════════════════════════════════════ */
function StockCard({ a }: { a: Zone2Item }) {
  const act = (a.action || 'WATCH').toUpperCase()
  const actKr = act === 'BUY' ? GRADE_LEGACY_BUY : act === 'SELL' ? '매도' : GRADE_OBSERVE
  const stratKr = a.strategy === 'AI_BRAIN' ? 'AI 판단' : a.strategy === 'SCAN' ? '스캔 발굴' : a.strategy
  const borderColor = act === 'BUY' ? 'rgba(22,163,74,0.3)' : act === 'SELL' ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.25)'
  const bg = act === 'BUY' ? C.green3 : act === 'SELL' ? C.red2 : C.amber2
  const gradeColor = act === 'BUY' ? C.green : act === 'SELL' ? C.red : C.amber
  const badgeBg = act === 'BUY' ? C.green : act === 'SELL' ? C.red : C.amber
  const badgeText = '#fff'

  return (
    <div style={{ borderRadius: 6, border: `1px solid ${borderColor}`, background: bg, overflow: 'hidden' }}>
      {/* 헤더 */}
      <div className="quant-stock-header" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: gradeColor }}>{a.grade}</span>
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{a.name} <em style={{ fontStyle: 'normal', color: C.muted, fontSize: 11, marginLeft: 6 }}>{a.ticker}</em></span>
        <span style={{ fontFamily: MONO, fontSize: 10, padding: '2px 8px', borderRadius: 3, fontWeight: 700, background: badgeBg, color: badgeText }}>{actKr}</span>
        <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>{a.score}점</span>
        <span style={{ fontSize: 10, color: C.muted, fontFamily: MONO }}>{stratKr}</span>
      </div>

      {/* 사유 */}
      <div style={{ padding: '8px 14px', fontSize: 12, color: C.muted, lineHeight: 1.5, borderBottom: `1px solid ${C.border}` }}>{a.reason}</div>

      {/* 상세 */}
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* 가격 */}
        {a.close != null && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11 }}>
            <span>현재가 <b style={{ color: pctColor(a.price_change ?? 0) }}>{a.close.toLocaleString()}원</b>{a.price_change ? ` (${pctSign(a.price_change)}${a.price_change}%)` : ''}</span>
            {a.stop_loss && <span><span style={{ color: C.muted, fontSize: 10 }}>손절</span> {a.stop_loss.toLocaleString()}</span>}
            {a.target_price && <span><span style={{ color: C.muted, fontSize: 10 }}>목표</span> {a.target_price.toLocaleString()}</span>}
            {a.drawdown && <span><span style={{ color: C.muted, fontSize: 10 }}>52주낙폭</span> <span style={{ color: C.red }}>{a.drawdown}%</span></span>}
            {a.consensus_upside != null && a.consensus_upside !== 0 ? <span><span style={{ color: C.muted, fontSize: 10 }}>컨센</span> <span style={{ color: C.green }}>+{a.consensus_upside}%</span></span> : null}
          </div>
        )}

        {/* 기술지표 칩 */}
        <TechChips a={a} />

        {/* 태그 */}
        <Tags a={a} />

        {/* 점수 분해 */}
        {a.score_breakdown && (
          <div style={{ display: 'flex', gap: 4, fontFamily: MONO, fontSize: 10, flexWrap: 'wrap' }}>
            {Object.entries(a.score_breakdown).map(([k, v]) => {
              const labels: Record<string, string> = { multi: '복합', individual: '개별종목', tech: '기술분석', flow: '수급', safety: '안전도', overheat: '과열' }
              return <span key={k} style={{ padding: '1px 5px', borderRadius: 2, background: C.bg3, color: C.muted }}>{labels[k] || k} {v}</span>
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function TechChips({ a }: { a: Zone2Item }) {
  const chips: { label: string; cls: 'good' | 'bad' | '' }[] = []
  if (a.rsi != null) chips.push({ label: `RSI ${a.rsi}`, cls: a.rsi <= 30 ? 'good' : a.rsi >= 70 ? 'bad' : a.rsi <= 45 ? 'good' : '' })
  if (a.adx != null) chips.push({ label: `ADX ${a.adx}`, cls: a.adx >= 25 ? 'good' : '' })
  if (a.bb_position != null) chips.push({ label: `BB ${(a.bb_position * 100).toFixed(0)}%`, cls: a.bb_position < 0.3 ? 'good' : a.bb_position > 0.8 ? 'bad' : '' })
  if (a.stoch_k != null) chips.push({ label: `Stoch ${a.stoch_k}`, cls: a.stoch_k < 20 ? 'good' : a.stoch_k > 80 ? 'bad' : '' })
  if (a.ma5_gap != null) chips.push({ label: `MA5 ${a.ma5_gap > 0 ? '+' : ''}${a.ma5_gap}%`, cls: '' })
  if (a.above_ma60) chips.push({ label: 'MA60↑', cls: 'good' })
  if (a.sar_trend === -1) chips.push({ label: 'SAR↓', cls: 'bad' })
  else if (a.sar_trend === 1) chips.push({ label: 'SAR↑', cls: 'good' })
  if (!chips.length) return null

  const chipStyle = (cls: string): React.CSSProperties => ({
    fontFamily: MONO, fontSize: 10, padding: '2px 7px', borderRadius: 3,
    background: C.bg3, whiteSpace: 'nowrap',
    border: `1px solid ${cls === 'good' ? 'rgba(0,229,155,0.3)' : cls === 'bad' ? 'rgba(255,77,109,0.3)' : C.border}`,
    color: cls === 'good' ? C.green : cls === 'bad' ? C.red : C.text,
  })

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {chips.map(c => <span key={c.label} style={chipStyle(c.cls)}>{c.label}</span>)}
    </div>
  )
}

function Tags({ a }: { a: Zone2Item }) {
  const tags: { label: string; bg: string; color: string }[] = []
  if (a.accum_phase) tags.push({ label: `${a.accum_phase} ${a.accum_days}일`, bg: C.green3, color: C.green })
  if (a.safety_signal) {
    const sc = a.safety_signal === 'GREEN' ? { bg: C.green3, color: C.green } : a.safety_signal === 'YELLOW' ? { bg: C.amber2, color: C.amber } : { bg: C.red2, color: C.red }
    tags.push({ label: `안전: ${a.safety_label || a.safety_signal}`, ...sc })
  }
  if (a.ai_tag) tags.push({ label: a.ai_tag, bg: C.purple2, color: C.purple })
  if (a.foreign_5d) tags.push({ label: `외인5d ${moneyStr(a.foreign_5d)}`, bg: a.foreign_5d > 0 ? C.green3 : C.red2, color: a.foreign_5d > 0 ? C.green : C.red })
  if (a.inst_5d) tags.push({ label: `기관5d ${moneyStr(a.inst_5d)}`, bg: a.inst_5d > 0 ? C.green3 : C.red2, color: a.inst_5d > 0 ? C.green : C.red })
  if (a.overheat_flags?.length) a.overheat_flags.forEach(f => tags.push({ label: f, bg: C.amber2, color: C.amber }))
  if (!tags.length) return null

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tags.map(t => <span key={t.label} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap', background: t.bg, color: t.color }}>{t.label}</span>)}
    </div>
  )
}

function ActionZone({ z2 }: { z2: Zone2Item[] }) {
  return (
    <Zone label="종목 스크리닝" title="기술지표 · 수급 · 매집 전체 공개">
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 700, overflowY: 'auto' }}>
        {z2.length === 0 ? <div style={{ padding: 12, color: C.muted }}>오늘 액션 없음</div> :
          z2.map(a => <StockCard key={a.ticker} a={a} />)
        }
      </div>
    </Zone>
  )
}

/* ════════════════════════════════════════
   Zone 3: 포트폴리오
   ════════════════════════════════════════ */
function PortfolioZone({ z3 }: { z3: QuantDashboardState['zone3'] }) {
  const totRet = z3.total_return_pct ?? 0
  const weekRet = z3.week_return_pct ?? 0
  const wr = z3.win_rate ?? 0
  const pf = z3.pf ?? 0
  const mdd = z3.mdd ?? 0
  const valCls = (v: number) => v > 0 ? C.green : v < 0 ? C.red : C.text

  return (
    <Zone label="포트폴리오" title="모의투자 성과">
      <div style={{ padding: 16 }}>
        {/* 성과 그리드 */}
        <div className="quant-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: C.border, borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
          {[
            { label: '총 자산', val: z3.equity != null ? z3.equity.toLocaleString() + '원' : '—', sub: `${pctSign(totRet)}${totRet.toFixed(2)}% (초기 ${(z3.initial_capital ?? 0).toLocaleString()}원)`, color: valCls(totRet) },
            { label: '이번 주', val: `${pctSign(weekRet)}${weekRet.toFixed(2)}%`, sub: '', color: valCls(weekRet) },
            { label: '승률 / PF', val: `${wr}% / ${pf}`, sub: `총 ${z3.total_trades ?? 0}건 (${z3.wins ?? 0}승 ${z3.losses ?? 0}패)`, color: C.text },
            { label: 'MDD', val: mdd ? mdd.toFixed(1) + '%' : '—', sub: '한도 -10%', color: C.red },
          ].map(s => (
            <div key={s.label} style={{ background: C.bg3, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: C.muted }}>{s.label}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
              {s.sub && <div style={{ fontSize: 10, color: C.muted }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* 포지션 */}
        {(z3.positions ?? []).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(z3.positions ?? []).map(p => {
              const pnl = p.pnl_pct ?? 0
              const cls = pnl >= 0 ? C.green : C.red
              const barW = Math.min(Math.abs(pnl) * PNL_BAR_SCALE, 100)
              return (
                <div key={p.ticker} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: C.bg3, borderRadius: 4, borderLeft: `3px solid ${cls}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{p.name} <span style={{ color: C.muted, fontSize: 10 }}>{p.grade}</span></span>
                  <div style={{ width: 80 }}><div style={{ height: 3, borderRadius: 2, width: `${barW}%`, background: cls }} /></div>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: cls }}>{pctSign(pnl)}{pnl.toFixed(2)}%</span>
                  <span style={{ fontSize: 11, color: C.muted }}>D+{p.days}</span>
                </div>
              )
            })}
          </div>
        ) : <div style={{ padding: 8, color: C.muted, fontSize: 12 }}>보유 포지션 없음</div>}
      </div>
    </Zone>
  )
}

/* ════════════════════════════════════════
   Zone 4: 섹터 순환 + ETF
   ════════════════════════════════════════ */
function SectorZone({ z4 }: { z4: QuantDashboardState['zone4'] }) {
  return (
    <Zone label="섹터 순환" title="업종별 흐름 TOP 10">
      <div style={{ padding: '12px 16px' }}>
        {z4.map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, width: 80, flexShrink: 0, color: C.text }}>
              {s.name}
              {s.etf_code && <><br /><span style={{ fontFamily: MONO, fontSize: 9, color: C.muted }}>{s.etf_code}</span>{s.etf_signal && <span style={{ fontSize: 9, color: C.blue, marginLeft: 4 }}>{s.etf_signal}</span>}</>}
            </span>
            <div style={{ flex: 1, position: 'relative', height: 6, background: C.border2, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${s.score}%`, background: signalColor(s.signal) }} />
            </div>
            <span style={{ fontFamily: MONO, fontSize: 11, width: 44, textAlign: 'right', color: signalColor(s.signal) }}>{s.score.toFixed(0)}</span>
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 2, whiteSpace: 'nowrap', background: signalColor(s.signal) + '22', color: signalColor(s.signal) }}>{s.signal}</span>
            {s.relay ? <span style={{ fontSize: 10, color: C.green, fontFamily: MONO, flexShrink: 0 }}>FIRE</span> : <span style={{ width: 44 }} />}
          </div>
        ))}
      </div>
    </Zone>
  )
}

/* ════════════════════════════════════════
   Zone 5: 수급 레이더
   ════════════════════════════════════════ */
function SupplyZone({ z5 }: { z5: QuantDashboardState['zone5'] }) {
  const sum = z5.supply_summary
  const players = [
    { who: '외국인', val: sum.foreign },
    { who: '기관', val: sum.inst },
    { who: '개인', val: sum.indiv },
  ]

  return (
    <Zone label="외국인 · 기관 수급" title="자금 흐름 분석">
      <div style={{ padding: '12px 16px' }}>
        {/* 수급 요약 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {players.map(p => {
            const cls = p.val >= 0 ? C.green : C.red
            const barW = Math.min(Math.abs(p.val) / SUPPLY_BAR_MAX * 100, 100)
            return (
              <div key={p.who} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 5, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{p.who}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: cls }}>{moneyStr(p.val)}</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, width: `${barW}%`, background: cls }} />
              </div>
            )
          })}
        </div>

        {/* 매집·분산 패턴 or 외국인 흐름 */}
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: '0.05em' }}>매집 · 분산 패턴 감지</div>
        {z5.sd_patterns.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {z5.sd_patterns.map((d: Zone5SdPattern) => {
              const patCls = d.pattern === '매집' ? { bg: C.green3, color: C.green } : d.pattern === '분산' ? { bg: C.red2, color: C.red } : { bg: C.amber2, color: C.amber }
              return (
                <div key={d.ticker} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 4, background: C.bg3, border: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, width: 18, color: d.grade === 'A' ? C.green : d.grade === 'B' ? C.blue : C.amber }}>{d.grade}</span>
                  <span style={{ fontSize: 12, flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap', background: patCls.bg, color: patCls.color }}>{d.pattern} {d.pattern_name ? `(${d.pattern_name})` : ''}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>{d.sd_score}</span>
                </div>
              )
            })}
          </div>
        ) : z5.foreign_flow.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {z5.foreign_flow.map(f => (
              <div key={f.ticker} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 4, background: C.bg3, border: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, width: 18, color: C.blue }}>—</span>
                <span style={{ fontSize: 12, flex: 1 }}>{f.name}</span>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 3, background: C.amber2, color: C.amber }}>{f.direction} z{f.z_score.toFixed(1)}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>score {f.score}</span>
              </div>
            ))}
          </div>
        ) : <div style={{ color: C.muted, fontSize: 11, padding: 8 }}>패턴 감지 없음</div>}
      </div>
    </Zone>
  )
}

/* ════════════════════════════════════════
   Zone 7: ETF 인사이트 (신규)
   ════════════════════════════════════════ */
function isMarketHeader(item: Zone7MarketHeader | Zone7EtfItem): item is Zone7MarketHeader {
  return '_market_direction' in item
}

function EtfZone({ z7 }: { z7: (Zone7MarketHeader | Zone7EtfItem)[] }) {
  let marketHeader: Zone7MarketHeader | null = null
  let etfs: Zone7EtfItem[] = []

  if (z7.length > 0 && isMarketHeader(z7[0])) {
    marketHeader = z7[0]
    etfs = z7.slice(1).filter((x): x is Zone7EtfItem => !isMarketHeader(x))
  } else {
    etfs = z7.filter((x): x is Zone7EtfItem => !isMarketHeader(x))
  }

  const dirKr = (d: string) => d === 'BULL' ? '상승' : d === 'BEAR' ? '하락' : '횡보'
  const dirColor = (d: string) => d === 'BULL' ? C.green : d === 'BEAR' ? C.red : C.amber
  const catStyle = (cat: string) => cat === '섹터' ? { bg: C.blue2, color: C.blue } : cat === '매크로' ? { bg: C.purple2, color: C.purple } : { bg: C.amber2, color: C.amber }

  return (
    <Zone label="ETF 인사이트" title="매크로 · 섹터 · 테마별 ETF">
      <div style={{ padding: 16 }}>
        {/* 시장 방향 헤더 */}
        {marketHeader && (
          <div style={{ padding: '8px 14px', fontSize: 11, color: C.muted, background: C.bg3, borderRadius: 5, border: `1px solid ${C.border}`, marginBottom: 10, fontFamily: MONO }}>
            시장 방향: <span style={{ color: dirColor(marketHeader._market_direction), fontWeight: 700 }}>{dirKr(marketHeader._market_direction)}</span>
            {' '}(점수 {marketHeader._market_score}, 신뢰도 {marketHeader._market_confidence}%)
            {' '}· 레짐: {marketHeader._regime} · VIX {marketHeader._vix}
            {marketHeader._reasons?.length > 0 && <><br />{marketHeader._reasons.join(' · ')}</>}
          </div>
        )}

        {/* ETF 카드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {etfs.length === 0 ? <div style={{ padding: 12, color: C.muted }}>ETF 인사이트 없음</div> :
            etfs.map(e => {
              const cs = catStyle(e.category)
              const details: string[] = []
              if (e.holding_period) details.push(`보유 ${e.holding_period}`)
              if (e.stop_loss) details.push(`손절: ${e.stop_loss}`)
              if (e.entry_timing) details.push(e.entry_timing)

              return (
                <div key={e.ticker} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 5, background: C.bg3, border: `1px solid ${C.border}` }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap', flexShrink: 0, background: cs.bg, color: cs.color }}>{e.category}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{e.name} <em style={{ fontStyle: 'normal', color: C.muted, fontSize: 11, marginLeft: 6 }}>{e.ticker}</em></div>
                    {e.reasons?.length ? <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{e.reasons.join(' · ')}</div> : null}
                    {details.length > 0 && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{details.join(' · ')}</div>}
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 10, padding: '2px 8px', borderRadius: 3, fontWeight: 700, background: e.action === 'BUY' ? C.green : C.amber, color: '#000' }}>{e.action === 'BUY' ? GRADE_LEGACY_BUY : GRADE_OBSERVE}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: e.confidence >= 60 ? C.green : C.amber }}>신뢰 {e.confidence}%</span>
                  {e.portfolio_pct ? <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>{e.portfolio_pct}%</span> : null}
                </div>
              )
            })
          }
        </div>
      </div>
    </Zone>
  )
}

/* ════════════════════════════════════════
   Main QuantView
   ════════════════════════════════════════ */
export function QuantView() {
  const { data, isLoading, isError } = useQuantDashboard()

  if (isError) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: C.text, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${C.border}`, background: C.bg2 }}>
          <span style={{ fontFamily: MONO, fontSize: 15, color: C.green, letterSpacing: '0.1em' }}>퀀트 시스템 <span style={{ color: C.muted, fontSize: 11 }}>PRO</span></span>
        </header>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: C.red }}>데이터를 불러오지 못했습니다</span>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 20px', borderRadius: 4, background: C.bg3, border: `1px solid ${C.border}`, color: C.text, cursor: 'pointer', fontSize: 12 }}>다시 시도</button>
        </div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: C.text }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${C.border}`, background: C.bg2 }}>
          <span style={{ fontFamily: MONO, fontSize: 15, color: C.green, letterSpacing: '0.1em' }}>퀀트 시스템 <span style={{ color: C.muted, fontSize: 11 }}>PRO</span></span>
        </header>
        <Skeleton />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.5 }}>
      {/* 헤더 */}
      <header className="quant-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${C.border}`, background: C.bg2, position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: MONO, fontSize: 15, color: C.green, letterSpacing: '0.1em' }}>퀀트 시스템 <span style={{ color: C.muted, fontSize: 11 }}>PRO</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} className="animate-pulse" />
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>{data.generated_at?.slice(0, 16).replace('T', ' ') ?? '---'}</span>
        </div>
      </header>

      {/* 신뢰도 바 */}
      <TrustBar z6={data.zone6} shield={data.zone1.shield_status} />

      {/* 메인 */}
      <main className="quant-main" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <VerdictZone z1={data.zone1} />
        <ActionZone z2={data.zone2} />
        <PortfolioZone z3={data.zone3} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: 16 }}>
          <SectorZone z4={data.zone4} />
          <SupplyZone z5={data.zone5} />
        </div>

        {data.zone7 && data.zone7.length > 0 && <EtfZone z7={data.zone7} />}
      </main>

      {/* 푸터 */}
      <footer style={{ padding: '12px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', background: C.bg2 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted2 }}>퀀트 시스템 · 10단계 시그널엔진 · {data.zone6.active_signals}개 시그널 가동</span>
      </footer>
    </div>
  )
}
