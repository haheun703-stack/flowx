'use client'

import { useQuantDashboard, type QuantDashboardState } from '@/features/dashboard/api/useDashboard'

/* ── 색상 유틸 ── */
const verdictStyle = (v: string) => {
  if (v === '매수' || v === '적극매수') return { border: '#00ff88', color: '#00ff88', bg: '#00ff88/10', icon: 'B' }
  if (v === '매도' || v === '적극매도') return { border: '#ff3b5c', color: '#ff3b5c', bg: '#ff3b5c/10', icon: 'S' }
  return { border: '#f59e0b', color: '#f59e0b', bg: '#f59e0b/10', icon: 'W' }
}

const shieldColor = (s: string) =>
  s === 'GREEN' ? '#00ff88' : s === 'YELLOW' ? '#f59e0b' : '#ff3b5c'

const pctColor = (v: number) => v >= 0 ? '#ff3b5c' : '#0ea5e9'
const pctSign = (v: number) => v >= 0 ? '+' : ''

const GRADE_COLOR: Record<string, string> = {
  S: 'text-black bg-[#00ff88] border-[#00ff88]',
  A: 'text-black bg-[#00cc6a] border-[#00cc6a]',
  B: 'text-white bg-[#0ea5e9] border-[#0ea5e9]',
  C: 'text-white bg-[#888] border-[#888]',
}

const actionStyle = (a: string) => {
  if (a === 'BUY') return 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30'
  if (a === 'SELL') return 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/30'
  return 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30'
}
const actionLabel = (a: string) => a === 'BUY' ? '매수' : a === 'SELL' ? '매도' : '관찰'

const trustBarColor = (v: number) =>
  v >= 60 ? '#00ff88' : v >= 40 ? '#f59e0b' : '#ff3b5c'

/* ── 공통 컴포넌트 ── */
function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[40px] mx-2 my-px bg-[#1a2535] animate-pulse rounded-sm" />
      ))}
    </>
  )
}

function Panel({ title, badge, dot, children }: {
  title: string; badge?: string; dot?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col bg-[#0a0f18] border border-[#2a2a3a] rounded overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-1.5">
          {dot && <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />}
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">{title}</span>
        </div>
        {badge && <span className="text-xs text-[#8a8a8a] font-bold">{badge}</span>}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ msg = '데이터 없음' }: { msg?: string }) {
  return <div className="flex items-center justify-center h-32 text-[#334155] text-xs">{msg}</div>
}

/* ── Zone 6: 신뢰도 바 (상단) ── */
function TrustBar({ z6 }: { z6: QuantDashboardState['zone6'] }) {
  const items = [
    { label: 'AI추천', val: z6.tomorrow_picks },
    { label: '세력탐지', val: z6.whale_detect },
    { label: '거래량폭증', val: z6.volume_spike },
    { label: 'AI브레인', val: z6.brain },
  ]

  return (
    <div className="flex items-center overflow-x-auto border-b border-[#2a2a3a] bg-[#0a0f18]"
      style={{ scrollbarWidth: 'none' }}>
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 border-r border-[#2a2a3a] shrink-0">
          <span className="text-[10px] text-[#8a8a8a] font-bold">{item.label}</span>
          <span className="text-xs font-bold tabular-nums" style={{ color: trustBarColor(item.val) }}>
            {item.val.toFixed(1)}%
          </span>
          <div className="w-[48px] h-1 bg-[#1a2535] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min(item.val, 100)}%`, background: trustBarColor(item.val) }} />
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 px-3 py-1.5 border-r border-[#2a2a3a] shrink-0">
        <span className="text-[10px] text-[#8a8a8a] font-bold">최근적중</span>
        <div className="flex gap-[2px]">
          {z6.recent_10.map((hit, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-sm" style={{ background: hit ? '#00ff88' : '#1a2535' }} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
        <span className="text-[10px] text-[#8a8a8a] font-bold">활성시그널</span>
        <span className="text-xs font-bold text-[#0ea5e9] tabular-nums">{z6.active_signals}</span>
      </div>
    </div>
  )
}

/* ── Zone 1: 오늘의 판단 ── */
function VerdictZone({ z1 }: { z1: QuantDashboardState['zone1'] }) {
  const vs = verdictStyle(z1.verdict)

  return (
    <Panel title="오늘의 판단" dot="bg-[#00ff88]"
      badge={z1.updated_at?.slice(11, 16)}>

      <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
        <div className="flex flex-col items-center justify-center gap-1.5 sm:border-r border-b sm:border-b-0 border-[#2a2a3a] py-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2"
            style={{ borderColor: vs.border, color: vs.color }}>
            {vs.icon}
          </div>
          <span className="text-sm font-bold" style={{ color: vs.color }}>{z1.verdict}</span>
          <div className="flex gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm border border-[#0ea5e9]/30 text-[#0ea5e9] font-bold tabular-nums">현금 {z1.cash_pct}%</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm border border-[#00ff88]/30 text-[#00ff88] font-bold tabular-nums">매수 {z1.buy_pct}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-3 py-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#2a2a3a]/50">
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm border border-[#a855f7]/30 text-[#a855f7] font-bold">REGIME</span>
            <span className="text-xs text-[#e2e8f0]">{z1.regime} — {z1.regime_transition}</span>
            <span className="text-[10px] text-[#555]">전환 {z1.transition_prob}%</span>
          </div>
          <div className="flex items-center gap-2 pb-2 border-b border-[#2a2a3a]/50">
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm border border-[#f59e0b]/30 text-[#f59e0b] font-bold">MACRO</span>
            <span className="text-xs text-[#e2e8f0]">{z1.macro_grade}</span>
            <span className="text-[10px] text-[#555]">VIX {z1.vix}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm border border-[#00ff88]/30 text-[#00ff88] font-bold">BRAIN</span>
            <span className="text-xs text-[#e2e8f0]">신뢰도 {z1.brain_score.toFixed(0)}점</span>
            {z1.lens_summary && <span className="text-[10px] text-[#555]">{z1.lens_summary}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded-sm border font-bold"
              style={{ borderColor: shieldColor(z1.shield_status) + '50', color: shieldColor(z1.shield_status) }}>SHIELD</span>
            <span className={`w-2 h-2 rounded-full ${z1.shield_status === 'GREEN' ? 'bg-[#00ff88]' : z1.shield_status === 'YELLOW' ? 'bg-[#f59e0b]' : 'bg-[#ff3b5c]'} animate-pulse`} />
            <span className="text-xs text-[#e2e8f0]">{z1.shield_status}</span>
          </div>
        </div>
      </div>
    </Panel>
  )
}

/* ── Zone 2: 액션 리스트 ── */
function ActionZone({ z2 }: { z2: QuantDashboardState['zone2'] }) {
  const COLS = '48px 1fr 56px 48px'

  return (
    <Panel title="액션 리스트" dot="bg-[#a855f7]" badge={`${z2.length}종목`}>
      <div className="grid px-2 py-1 border-b border-[#2a2a3a] text-[11px] text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">등급</span>
        <span>종목</span>
        <span className="text-center">신호</span>
        <span className="text-right">점수</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 480 }}>
        {z2.length === 0 ? <EmptyState /> :
          z2.map((item, i) => (
            <div key={item.ticker}
              className={`grid items-center px-2 py-1.5 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border text-center font-bold ${GRADE_COLOR[item.grade] ?? 'text-[#64748b] border-[#334155]'}`}>
                {item.grade}
              </span>
              <div className="min-w-0 pl-1">
                <div className="text-xs text-[#e2e8f0] font-medium truncate">{item.name}</div>
                <div className="text-[10px] text-[#555] truncate">{item.reason}</div>
              </div>
              <span className={`text-[9px] px-1 py-0.5 rounded-sm border text-center font-bold ${actionStyle(item.action)}`}>
                {actionLabel(item.action)}
              </span>
              <span className={`text-right text-xs font-bold tabular-nums ${
                item.score >= 70 ? 'text-[#00ff88]' : item.score >= 50 ? 'text-[#f59e0b]' : 'text-[#64748b]'
              }`}>{item.score}</span>
            </div>
          ))
        }
      </div>
      <div className="flex gap-3 px-3 py-1.5 border-t border-[#2a2a3a] text-[11px] font-bold text-[#8a8a8a]">
        <span>BUY <span className="text-[#ff3b5c]">{z2.filter(s => s.action === 'BUY').length}</span></span>
        <span>WATCH <span className="text-[#f59e0b]">{z2.filter(s => s.action === 'WATCH').length}</span></span>
        <span className="ml-auto">{z2.map(s => s.strategy).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}</span>
      </div>
    </Panel>
  )
}

/* ── Zone 3: 포트폴리오 ── */
function PortfolioZone({ z3 }: { z3: QuantDashboardState['zone3'] }) {
  return (
    <Panel title="포트폴리오" dot="bg-[#0ea5e9]"
      badge={`₩${z3.equity.toLocaleString()}`}>

      <div className="grid grid-cols-4 border-b border-[#2a2a3a]">
        {[
          { label: '수익률', val: `${pctSign(z3.total_return_pct)}${z3.total_return_pct.toFixed(2)}%`, color: pctColor(z3.total_return_pct) },
          { label: 'PF', val: z3.pf > 0 ? z3.pf.toFixed(2) : '—', color: z3.pf >= 1 ? '#00ff88' : '#ff3b5c' },
          { label: 'MDD', val: `${z3.mdd.toFixed(1)}%`, color: '#ff3b5c' },
          { label: '승률', val: `${z3.win_rate.toFixed(0)}%`, color: z3.win_rate >= 50 ? '#00ff88' : '#ff3b5c' },
        ].map(s => (
          <div key={s.label} className="px-2 py-2 text-center border-r border-[#2a2a3a] last:border-r-0">
            <div className="text-[9px] text-[#555] font-bold mb-0.5">{s.label}</div>
            <div className="text-xs font-bold tabular-nums" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 320 }}>
        {z3.positions.length === 0 ? <EmptyState msg="보유 포지션 없음" /> :
          z3.positions.map((p, i) => (
            <div key={p.ticker}
              className={`flex items-center justify-between px-2 py-1.5 border-b border-[#2a2a3a]/30 ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[p.grade] ?? 'text-[#64748b] border-[#334155]'}`}>{p.grade}</span>
                <span className="text-xs text-[#e2e8f0] font-medium">{p.name}</span>
                <span className="text-[10px] text-[#555]">{p.strategy}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8a8a8a] tabular-nums">{p.days}일</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: pctColor(p.pnl_pct) }}>
                  {pctSign(p.pnl_pct)}{p.pnl_pct.toFixed(2)}%
                </span>
              </div>
            </div>
          ))
        }
      </div>

      {z3.recent_trades.length > 0 && (
        <div className="border-t border-[#2a2a3a]">
          <div className="px-3 py-1 text-[10px] text-[#555] font-bold">최근 거래</div>
          {z3.recent_trades.slice(0, 5).map((t, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1.5 border-t border-[#2a2a3a]/30">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold ${t.side === 'BUY' ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>{t.side === 'BUY' ? '매수' : '매도'}</span>
                <span className="text-xs text-[#e2e8f0]">{t.name}</span>
              </div>
              <span className="text-xs font-bold tabular-nums" style={{ color: pctColor(t.pnl_pct) }}>
                {pctSign(t.pnl_pct)}{t.pnl_pct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 px-3 py-1.5 border-t border-[#2a2a3a] text-[11px] font-bold text-[#8a8a8a]">
        <span>거래 <span className="text-[#e2e8f0]">{z3.total_trades}</span></span>
        <span>승 <span className="text-[#00ff88]">{z3.wins}</span></span>
        <span>패 <span className="text-[#ff3b5c]">{z3.losses}</span></span>
      </div>
    </Panel>
  )
}

/* ── Zone 4: 섹터 순환 ── */
function SectorZone({ z4 }: { z4: QuantDashboardState['zone4'] }) {
  const signalColor = (s: string) =>
    s === '매수' ? '#00ff88' : s === '매도' ? '#ff3b5c' : '#8a8a8a'

  const COLS = '28px 1fr 48px 52px 40px 48px'

  return (
    <Panel title="섹터 순환" dot="bg-[#f59e0b]" badge={`TOP ${z4.length}`}>
      <div className="grid px-2 py-1 border-b border-[#2a2a3a] text-[11px] text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">#</span>
        <span>섹터</span>
        <span className="text-right">점수</span>
        <span className="text-right">5일%</span>
        <span className="text-right">RSI</span>
        <span className="text-right">신호</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 400 }}>
        {z4.map((s, i) => (
          <div key={s.name}
            className={`grid items-center px-2 py-1.5 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
            style={{ gridTemplateColumns: COLS }}>
            <span className="text-center text-[11px] text-[#8a8a8a] tabular-nums font-bold">{s.rank}</span>
            <span className="text-xs text-[#e2e8f0] font-medium truncate">{s.name}</span>
            <span className={`text-right text-xs font-bold tabular-nums ${
              s.score >= 70 ? 'text-[#00ff88]' : s.score >= 50 ? 'text-[#f59e0b]' : 'text-[#64748b]'
            }`}>{s.score.toFixed(0)}</span>
            <span className="text-right text-xs font-bold tabular-nums" style={{ color: pctColor(s.ret_5d) }}>
              {pctSign(s.ret_5d)}{s.ret_5d.toFixed(1)}
            </span>
            <span className={`text-right text-[11px] tabular-nums ${
              s.rsi >= 70 ? 'text-[#ff3b5c]' : s.rsi <= 30 ? 'text-[#00ff88]' : 'text-[#64748b]'
            }`}>{s.rsi.toFixed(0)}</span>
            <span className="text-right text-[11px] font-bold" style={{ color: signalColor(s.signal) }}>{s.signal}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

/* ── Zone 5: 외국인 자본 흐름 ── */
function ForeignFlowZone({ z5 }: { z5: QuantDashboardState['zone5'] }) {
  const dirColor = (d: string) =>
    d === 'INFLOW' ? '#00ff88' : d === 'OUTFLOW' ? '#ff3b5c' : '#8a8a8a'

  const COLS = '1fr 64px 44px 44px'

  return (
    <Panel title="외국인 자본 흐름" dot="bg-[#0ea5e9]">
      <div className="flex gap-3 px-3 py-1.5 border-b border-[#2a2a3a] text-[11px]">
        {(['foreign', 'inst', 'indiv'] as const).map(k => {
          const label = k === 'foreign' ? '외국인' : k === 'inst' ? '기관' : '개인'
          const v = z5.supply_summary[k]
          return (
            <span key={k}>
              <span className="text-[#8a8a8a] font-bold">{label} </span>
              <span className="font-bold tabular-nums" style={{ color: pctColor(v) }}>{v >= 0 ? '+' : ''}{v}</span>
            </span>
          )
        })}
      </div>

      <div className="grid px-2 py-1 border-b border-[#2a2a3a] text-[11px] text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>종목</span>
        <span className="text-center">방향</span>
        <span className="text-right">점수</span>
        <span className="text-right">Z값</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 320 }}>
        {z5.foreign_flow.length === 0 ? <EmptyState /> :
          z5.foreign_flow.map((item, i) => (
            <div key={item.ticker}
              className={`grid items-center px-2 py-1.5 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <div className="truncate">
                <span className="text-xs text-[#e2e8f0] font-medium">{item.name}</span>
                <span className="text-[10px] text-[#555] ml-1">{item.ticker}</span>
              </div>
              <div className="text-center">
                <span className={`text-[9px] px-1 py-0.5 rounded-sm border font-bold`}
                  style={{ borderColor: dirColor(item.direction) + '50', color: dirColor(item.direction) }}>
                  {item.direction}
                </span>
              </div>
              <span className={`text-right text-xs font-bold tabular-nums ${item.score >= 60 ? 'text-[#00ff88]' : 'text-[#64748b]'}`}>{item.score}</span>
              <span className={`text-right text-xs font-bold tabular-nums ${item.z_score >= 2 ? 'text-[#f59e0b]' : 'text-[#64748b]'}`}>{item.z_score.toFixed(1)}</span>
            </div>
          ))
        }
      </div>
    </Panel>
  )
}

/* ── Main ── */
export function QuantView() {
  const { data, isLoading } = useQuantDashboard()

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#131722]" style={{ fontFamily: 'var(--font-terminal)' }}>
        <div className="border-b border-[#2a2a3a] px-4 py-3 flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#e2e8f0] tracking-wider uppercase">퀀트시스템</h1>
        </div>
        <Skeleton rows={6} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#131722]" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 헤더 */}
      <div className="border-b border-[#2a2a3a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#e2e8f0] tracking-wider uppercase">퀀트시스템</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-sm border border-[#a855f7] text-white bg-[#a855f7] font-bold">PRO</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-xs text-[#8a8a8a] tabular-nums">
            {data.generated_at?.slice(0, 16).replace('T', ' ')}
          </span>
        </div>
      </div>

      <TrustBar z6={data.zone6} />

      <div className="p-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2">
        {/* Row 1: 오늘의 판단 (2칸) + 액션 리스트 (2칸) */}
        <div className="lg:col-span-2">
          <VerdictZone z1={data.zone1} />
        </div>
        <div className="lg:col-span-2">
          <ActionZone z2={data.zone2} />
        </div>

        {/* Row 2: 포트폴리오 + 섹터순환 + 외국인자본 + (빈칸 or 추가) */}
        <PortfolioZone z3={data.zone3} />
        <SectorZone z4={data.zone4} />
        <div className="xl:col-span-2">
          <ForeignFlowZone z5={data.zone5} />
        </div>
      </div>
    </div>
  )
}
