'use client'

import { useQuantDashboard, type QuantDashboardState } from '@/features/dashboard/api/useDashboard'

/* ── 색상 유틸 ── */
const verdictStyle = (v: string) => {
  if (v === '매수' || v === '적극매수') return { border: '#00e59b', color: '#00e59b', bg: '#001f16', icon: 'B' }
  if (v === '매도' || v === '적극매도') return { border: '#ff4d6d', color: '#ff4d6d', bg: '#3d0012', icon: 'S' }
  return { border: '#f5a623', color: '#f5a623', bg: '#3d2800', icon: 'W' }
}

const shieldColor = (s: string) =>
  s === 'GREEN' ? '#00e59b' : s === 'YELLOW' ? '#f5a623' : '#ff4d6d'

const pctColor = (v: number) => v >= 0 ? '#ff3b5c' : '#0ea5e9'
const pctSign = (v: number) => v >= 0 ? '+' : ''

const gradeColor = (g: string) => {
  if (g === 'S' || g === 'A') return { bg: '#002b1a', border: '#00e59b', text: '#00e59b' }
  if (g === 'B') return { bg: '#1e1040', border: '#a78bfa', text: '#a78bfa' }
  return { bg: '#2a2000', border: '#f5a623', text: '#f5a623' }
}

const actionColor = (a: string) => {
  if (a === 'BUY') return { bg: '#001f16', border: '#00e59b', text: '#00e59b', label: '매수' }
  if (a === 'SELL') return { bg: '#3d0012', border: '#ff4d6d', text: '#ff4d6d', label: '매도' }
  return { bg: '#0c2a3d', border: '#38bdf8', text: '#38bdf8', label: '관찰' }
}

const trustBarColor = (v: number) =>
  v >= 60 ? '#00e59b' : v >= 40 ? '#f5a623' : '#ff4d6d'

const MONO = "'Space Mono', monospace"

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="space-y-1 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-11 bg-[#161b24] animate-pulse rounded" />
      ))}
    </div>
  )
}

/* ── Zone 6: 신뢰도 바 (상단) ── */
function TrustBar({ z6 }: { z6: QuantDashboardState['zone6'] }) {
  const items = [
    { label: 'AI 추천', val: z6.tomorrow_picks },
    { label: '세력 탐지', val: z6.whale_detect },
    { label: '거래량 폭증', val: z6.volume_spike },
    { label: 'AI 브레인', val: z6.brain },
  ]

  return (
    <div className="flex items-center overflow-x-auto border-b border-[#1e2736] bg-[#0f1218]"
      style={{ scrollbarWidth: 'none' }}>
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2.5 px-5 py-2.5 border-r border-[#1e2736] shrink-0">
          <span className="text-[11px] text-[#5a6a82] tracking-wide">{item.label}</span>
          <span className="text-[14px] font-bold tabular-nums" style={{ fontFamily: MONO, color: trustBarColor(item.val) }}>
            {item.val.toFixed(1)}%
          </span>
          <div className="w-[60px] h-1 bg-[#2a3545] rounded-sm overflow-hidden">
            <div className="h-full rounded-sm" style={{ width: `${Math.min(item.val, 100)}%`, background: trustBarColor(item.val) }} />
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2.5 px-5 py-2.5 border-r border-[#1e2736] shrink-0">
        <span className="text-[11px] text-[#5a6a82]">최근 적중</span>
        <div className="flex gap-[3px]">
          {z6.recent_10.map((hit, i) => (
            <div key={i} className="w-2 h-2 rounded-[1px]" style={{ background: hit ? '#00e59b' : '#2a3545' }} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-5 py-2.5 shrink-0">
        <span className="text-[11px] text-[#5a6a82]">활성 시그널</span>
        <span className="text-[14px] font-bold text-[#38bdf8] tabular-nums" style={{ fontFamily: MONO }}>{z6.active_signals}</span>
      </div>
    </div>
  )
}

/* ── Zone Header ── */
function ZoneHeader({ zone, title, badge }: { zone: string; title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b24] border-b border-[#1e2736]">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#5a6a82] tracking-[0.15em]" style={{ fontFamily: MONO }}>{zone}</span>
        <span className="text-[13px] font-medium text-[#e2e8f0]">{title}</span>
      </div>
      {badge && <span className="text-[11px] text-[#5a6a82]">{badge}</span>}
    </div>
  )
}

/* ── Zone 1: 오늘의 판단 ── */
function VerdictZone({ z1 }: { z1: QuantDashboardState['zone1'] }) {
  const vs = verdictStyle(z1.verdict)

  return (
    <div className="bg-[#0f1218] border border-[#1e2736] rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b24] border-b border-[#1e2736]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#5a6a82] tracking-[0.15em]" style={{ fontFamily: MONO }}>ZONE 1</span>
          <span className="text-[13px] font-medium text-[#e2e8f0]">오늘의 판단</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[7px] h-[7px] rounded-full animate-pulse" style={{ background: shieldColor(z1.shield_status), boxShadow: `0 0 8px ${shieldColor(z1.shield_status)}` }} />
          <span className="text-[11px] text-[#5a6a82]" style={{ fontFamily: MONO }}>{z1.updated_at?.slice(11, 16)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] min-h-[160px]">
        <div className="flex flex-col items-center justify-center gap-2 sm:border-r border-b sm:border-b-0 border-[#1e2736] py-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2"
            style={{ borderColor: vs.border, color: vs.color, background: vs.bg, fontFamily: MONO }}>
            {vs.icon}
          </div>
          <span className="text-sm font-bold" style={{ color: vs.color }}>{z1.verdict}</span>
          <div className="flex gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded" style={{ fontFamily: MONO, background: '#0c2a3d', color: '#38bdf8' }}>현금 {z1.cash_pct}%</span>
            <span className="text-[11px] px-2 py-0.5 rounded" style={{ fontFamily: MONO, background: '#001f16', color: '#00e59b' }}>매수 {z1.buy_pct}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex items-start gap-2.5 pb-3 border-b border-[#1e2736]">
            <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ fontFamily: MONO, background: '#1e1040', color: '#a78bfa' }}>REGIME</span>
            <div>
              <span className="text-[13px] text-[#e2e8f0]">{z1.regime} — {z1.regime_transition}</span>
              <span className="text-[11px] text-[#5a6a82] ml-2">전환확률 {z1.transition_prob}%</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 pb-3 border-b border-[#1e2736]">
            <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ fontFamily: MONO, background: '#3d2800', color: '#f5a623' }}>MACRO</span>
            <span className="text-[13px] text-[#e2e8f0]">{z1.macro_grade} · VIX {z1.vix}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ fontFamily: MONO, background: '#001f16', color: '#00e59b' }}>BRAIN</span>
            <span className="text-[13px] text-[#e2e8f0]">신뢰도 {z1.brain_score.toFixed(0)}점{z1.lens_summary ? ` — ${z1.lens_summary}` : ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Zone 2: 액션 리스트 ── */
function ActionZone({ z2 }: { z2: QuantDashboardState['zone2'] }) {
  return (
    <div className="bg-[#0f1218] border border-[#1e2736] rounded-md overflow-hidden">
      <ZoneHeader zone="ZONE 2" title="액션 리스트" badge={`${z2.length}종목`} />
      <div className="flex flex-col gap-2.5 p-4 max-h-[480px] overflow-y-auto">
        {z2.map(item => {
          const ac = actionColor(item.action)
          const gc = gradeColor(item.grade)
          return (
            <div key={item.ticker} className="flex items-center gap-3.5 px-3.5 py-3 rounded border"
              style={{ borderColor: ac.border + '40', background: ac.bg + '60' }}>
              <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold border shrink-0"
                style={{ borderColor: gc.border, color: gc.text, background: gc.bg, fontFamily: MONO }}>{item.grade}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#e2e8f0] font-medium truncate">{item.name}</span>
                  <span className="text-[11px] text-[#5a6a82]">{item.ticker}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold shrink-0"
                    style={{ borderColor: ac.border, color: ac.text, background: ac.bg, fontFamily: MONO }}>{ac.label}</span>
                </div>
                <p className="text-[11px] text-[#5a6a82] mt-1 line-clamp-1">{item.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[15px] font-bold tabular-nums" style={{ fontFamily: MONO, color: item.score >= 70 ? '#00e59b' : item.score >= 50 ? '#f5a623' : '#ff4d6d' }}>
                  {item.score}
                </span>
                <div className="text-[10px] text-[#5a6a82]">{item.strategy}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Zone 3: 포트폴리오 ── */
function PortfolioZone({ z3 }: { z3: QuantDashboardState['zone3'] }) {
  const returnColor = pctColor(z3.total_return_pct)

  return (
    <div className="bg-[#0f1218] border border-[#1e2736] rounded-md overflow-hidden">
      <ZoneHeader zone="ZONE 3" title="포트폴리오" />

      <div className="grid grid-cols-4 gap-px bg-[#1e2736]">
        {[
          { label: '총 수익률', val: `${pctSign(z3.total_return_pct)}${z3.total_return_pct.toFixed(2)}%`, color: returnColor },
          { label: 'PF', val: z3.pf > 0 ? z3.pf.toFixed(2) : '—', color: z3.pf >= 1 ? '#00e59b' : '#ff4d6d' },
          { label: 'MDD', val: `${z3.mdd.toFixed(1)}%`, color: '#ff4d6d' },
          { label: '승률', val: `${z3.win_rate.toFixed(0)}%`, color: z3.win_rate >= 50 ? '#00e59b' : '#ff4d6d' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1218] px-3 py-2.5 text-center">
            <div className="text-[10px] text-[#5a6a82] mb-0.5">{s.label}</div>
            <div className="text-[15px] font-bold tabular-nums" style={{ fontFamily: MONO, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {z3.positions.length > 0 && (
        <div className="border-t border-[#1e2736]">
          <div className="px-4 py-2 text-[11px] text-[#5a6a82] bg-[#161b24]">보유 포지션</div>
          {z3.positions.map(p => (
            <div key={p.ticker} className="flex items-center justify-between px-4 py-2 border-t border-[#1e2736]/50 hover:bg-[#161b24]/50">
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-1.5 py-0.5 rounded border text-[#a78bfa] border-[#a78bfa]/30 bg-[#1e1040]" style={{ fontFamily: MONO }}>{p.grade}</span>
                <span className="text-[13px] text-[#e2e8f0]">{p.name}</span>
                <span className="text-[11px] text-[#5a6a82]">{p.strategy}</span>
              </div>
              <div className="flex items-center gap-3 tabular-nums" style={{ fontFamily: MONO }}>
                <span className="text-[11px] text-[#5a6a82]">{p.days}일</span>
                <span className="text-[13px] font-bold" style={{ color: pctColor(p.pnl_pct) }}>
                  {pctSign(p.pnl_pct)}{p.pnl_pct.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {z3.recent_trades.length > 0 && (
        <div className="border-t border-[#1e2736]">
          <div className="px-4 py-2 text-[11px] text-[#5a6a82] bg-[#161b24]">최근 거래</div>
          {z3.recent_trades.slice(0, 5).map((t, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2 border-t border-[#1e2736]/50">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold ${t.side === 'BUY' ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>{t.side === 'BUY' ? '매수' : '매도'}</span>
                <span className="text-[13px] text-[#e2e8f0]">{t.name}</span>
              </div>
              <span className="text-[13px] font-bold tabular-nums" style={{ fontFamily: MONO, color: pctColor(t.pnl_pct) }}>
                {pctSign(t.pnl_pct)}{t.pnl_pct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Zone 4: 섹터 순환 ── */
function SectorZone({ z4 }: { z4: QuantDashboardState['zone4'] }) {
  const signalColor = (s: string) =>
    s === '매수' ? '#00e59b' : s === '매도' ? '#ff4d6d' : '#5a6a82'

  return (
    <div className="bg-[#0f1218] border border-[#1e2736] rounded-md overflow-hidden">
      <ZoneHeader zone="ZONE 4" title="섹터 순환" badge={`TOP ${z4.length}`} />

      <div className="grid px-3 py-1.5 border-b border-[#1e2736] text-[11px] text-[#5a6a82] font-bold"
        style={{ gridTemplateColumns: '28px 1fr 52px 60px 44px 52px' }}>
        <span className="text-center">#</span>
        <span>섹터</span>
        <span className="text-right">점수</span>
        <span className="text-right">5일%</span>
        <span className="text-right">RSI</span>
        <span className="text-right">시그널</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {z4.map((s, i) => (
          <div key={s.name} className={`grid items-center px-3 py-2 border-b border-[#1e2736]/30 hover:bg-[#161b24]/50 ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
            style={{ gridTemplateColumns: '28px 1fr 52px 60px 44px 52px' }}>
            <span className="text-center text-[12px] text-[#5a6a82] tabular-nums font-bold" style={{ fontFamily: MONO }}>{s.rank}</span>
            <span className="text-[13px] text-[#e2e8f0] font-medium truncate">{s.name}</span>
            <span className="text-right text-[13px] font-bold tabular-nums" style={{ fontFamily: MONO, color: s.score >= 70 ? '#00e59b' : s.score >= 50 ? '#f5a623' : '#5a6a82' }}>
              {s.score.toFixed(0)}
            </span>
            <span className="text-right text-[13px] font-bold tabular-nums" style={{ fontFamily: MONO, color: pctColor(s.ret_5d) }}>
              {pctSign(s.ret_5d)}{s.ret_5d.toFixed(1)}
            </span>
            <span className="text-right text-[12px] tabular-nums" style={{ fontFamily: MONO, color: s.rsi >= 70 ? '#ff4d6d' : s.rsi <= 30 ? '#00e59b' : '#5a6a82' }}>
              {s.rsi.toFixed(0)}
            </span>
            <span className="text-right text-[11px] font-bold" style={{ color: signalColor(s.signal) }}>{s.signal}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Zone 5: 외국인 자본 ── */
function ForeignFlowZone({ z5 }: { z5: QuantDashboardState['zone5'] }) {
  const dirColor = (d: string) =>
    d === 'INFLOW' ? '#00e59b' : d === 'OUTFLOW' ? '#ff4d6d' : '#5a6a82'

  return (
    <div className="bg-[#0f1218] border border-[#1e2736] rounded-md overflow-hidden">
      <ZoneHeader zone="ZONE 5" title="외국인 자본 흐름" />

      <div className="flex gap-4 px-4 py-2 border-b border-[#1e2736] text-[12px]">
        {(['foreign', 'inst', 'indiv'] as const).map(k => {
          const label = k === 'foreign' ? '외국인' : k === 'inst' ? '기관' : '개인'
          const v = z5.supply_summary[k]
          return (
            <span key={k}>
              <span className="text-[#5a6a82]">{label} </span>
              <span className="font-bold tabular-nums" style={{ fontFamily: MONO, color: pctColor(v) }}>{v >= 0 ? '+' : ''}{v}</span>
            </span>
          )
        })}
      </div>

      <div className="grid px-3 py-1.5 border-b border-[#1e2736] text-[11px] text-[#5a6a82] font-bold"
        style={{ gridTemplateColumns: '1fr 72px 48px 52px' }}>
        <span>종목</span>
        <span className="text-center">방향</span>
        <span className="text-right">점수</span>
        <span className="text-right">Z값</span>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {z5.foreign_flow.map((item, i) => (
          <div key={item.ticker} className={`grid items-center px-3 py-2 border-b border-[#1e2736]/30 hover:bg-[#161b24]/50 ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
            style={{ gridTemplateColumns: '1fr 72px 48px 52px' }}>
            <div className="truncate">
              <span className="text-[13px] text-[#e2e8f0] font-medium">{item.name}</span>
              <span className="text-[11px] text-[#5a6a82] ml-1.5">{item.ticker}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] px-2 py-0.5 rounded border font-bold"
                style={{ borderColor: dirColor(item.direction) + '60', color: dirColor(item.direction), background: dirColor(item.direction) + '15', fontFamily: MONO }}>
                {item.direction}
              </span>
            </div>
            <span className="text-right text-[13px] font-bold tabular-nums" style={{ fontFamily: MONO, color: item.score >= 60 ? '#00e59b' : '#5a6a82' }}>{item.score}</span>
            <span className="text-right text-[13px] font-bold tabular-nums" style={{ fontFamily: MONO, color: item.z_score >= 2 ? '#f5a623' : '#5a6a82' }}>{item.z_score.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main ── */
export function QuantView() {
  const { data, isLoading } = useQuantDashboard()

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#0a0c10]">
        <div className="border-b border-[#1e2736] px-6 py-3.5 flex items-center gap-3 bg-[#0f1218]">
          <span className="text-[15px] text-[#00e59b] tracking-[0.1em] font-bold" style={{ fontFamily: MONO }}>QUANTUM MASTER</span>
          <span className="text-[11px] text-[#5a6a82]" style={{ fontFamily: MONO }}>FLOWX</span>
        </div>
        <Skeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0c10]">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#1e2736] bg-[#0f1218] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-[15px] text-[#00e59b] tracking-[0.1em] font-bold" style={{ fontFamily: MONO }}>QUANTUM MASTER</span>
          <span className="text-[11px] text-[#5a6a82]" style={{ fontFamily: MONO }}>FLOWX</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[7px] h-[7px] rounded-full bg-[#00e59b] animate-pulse" style={{ boxShadow: '0 0 8px #00e59b' }} />
          <span className="text-[11px] text-[#5a6a82] tabular-nums" style={{ fontFamily: MONO }}>
            {data.generated_at?.slice(0, 16).replace('T', ' ')}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded border border-[#f5a623] text-[#f5a623] font-bold" style={{ fontFamily: MONO }}>PRO</span>
        </div>
      </div>

      <TrustBar z6={data.zone6} />

      <div className="p-5 flex flex-col gap-4">
        <VerdictZone z1={data.zone1} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActionZone z2={data.zone2} />
          <PortfolioZone z3={data.zone3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectorZone z4={data.zone4} />
          <ForeignFlowZone z5={data.zone5} />
        </div>
      </div>
    </div>
  )
}
