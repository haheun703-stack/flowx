'use client'

import { useEtfSignals, useHeatmap, useChinaFlow, usePaperTrades } from '@/features/dashboard/api/useDashboard'

// ── 색상 상수 ──
const GRADE_COLOR: Record<string, string> = {
  '적극매수': 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  '매수': 'text-[#00cc6a] bg-[#00cc6a]/10 border-[#00cc6a]/30',
  '관망': 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  '매도': 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  '적극매도': 'text-[#cc2f4a] bg-[#cc2f4a]/10 border-[#cc2f4a]/30',
}

const SIGNAL_COLOR: Record<string, string> = {
  SURGE: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  INFLOW: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  SECTOR_FOCUS: 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/30',
  WATCH: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  NORMAL: 'text-[#64748b] bg-[#64748b]/10 border-[#64748b]/30',
}

// ── 로딩 스켈레톤 ──
function Skeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 mx-3 my-1 bg-[#1a2535] animate-pulse rounded-sm" />
      ))}
    </>
  )
}

// ── 패널 래퍼 ──
function Panel({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-[#0a0f18] border border-[#1a2535] rounded-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]">
        <span className="text-xl font-black text-[#e2e8f0] tracking-widest uppercase">{title}</span>
        {badge && <span className="text-sm text-[#64748b] font-bold">{badge}</span>}
      </div>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════
// 1. ETF 시그널 패널
// ═══════════════════════════════════════
function EtfSignalSection() {
  const { data, isLoading } = useEtfSignals()
  const items = data ?? []
  const ETF_COLS = '1fr 72px 64px 56px 56px 56px 64px'

  return (
    <Panel title="ETF 시그널" badge={`${items.length}종목`}>
      <div className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/50 text-xs text-[#64748b] font-bold"
        style={{ gridTemplateColumns: ETF_COLS }}>
        <span className="text-left">ETF</span>
        <span className="text-center">시그널</span>
        <span className="text-right">점수</span>
        <span className="text-right">1일%</span>
        <span className="text-right">5일%</span>
        <span className="text-right">RSI</span>
        <span className="text-right">순환순위</span>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {isLoading ? <Skeleton /> : items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : items.map(item => (
          <div key={item.etf_code} className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/30 hover:bg-[#0d1420] items-center text-xs"
            style={{ gridTemplateColumns: ETF_COLS }}>
            <div className="truncate">
              <span className="text-[#e2e8f0] text-sm font-bold">{item.sector}</span>
              <span className="text-[#334155] ml-1 text-[10px]">{item.etf_name}</span>
            </div>
            <div className="text-center">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[item.grade] ?? 'text-[#64748b]'}`}>
                {item.grade}
              </span>
            </div>
            <span className="text-right text-[#e2e8f0] font-bold">{item.score.toFixed(0)}</span>
            <span className={`text-right font-bold ${item.ret_1 >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {item.ret_1 >= 0 ? '+' : ''}{item.ret_1.toFixed(1)}%
            </span>
            <span className={`text-right font-bold ${item.ret_5 >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {item.ret_5 >= 0 ? '+' : ''}{item.ret_5.toFixed(1)}%
            </span>
            <span className={`text-right font-bold ${
              item.rsi >= 70 ? 'text-[#ff3b5c]' :
              item.rsi <= 30 ? 'text-[#0ea5e9]' : 'text-[#64748b]'
            }`}>
              {item.rsi.toFixed(0)}
            </span>
            <span className="text-right text-[#f59e0b] font-bold">#{item.sector_rotation_rank}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ═══════════════════════════════════════
// 2. 그룹순환 (섹터 모멘텀 확장)
// ═══════════════════════════════════════
function SectorRotationSection() {
  const { data, isLoading } = useHeatmap()
  const sectors = data ?? []
  const COLS = '28px 1fr 56px 72px 72px 72px 48px 72px'

  return (
    <Panel title="그룹순환" badge={`TOP ${sectors.length}`}>
      <div className="grid text-xs text-[#64748b] font-bold tracking-widest uppercase border-b border-[#1a2535] px-4 py-2"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">#</span>
        <span className="text-left">섹터</span>
        <span className="text-right">점수</span>
        <span className="text-right">5일</span>
        <span className="text-right">20일</span>
        <span className="text-right">60일</span>
        <span className="text-right">RSI</span>
        <span className="text-right">수급</span>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {isLoading ? <Skeleton /> : sectors.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : sectors.map((s, i) => (
          <div key={s.sector}
            className="grid items-center px-4 py-2 border-b border-[#1a2535]/50 hover:bg-[#0d1420] text-xs"
            style={{ gridTemplateColumns: COLS }}>
            <span className="text-center text-[#64748b] tabular-nums">{i + 1}</span>
            <span className="text-[#e2e8f0] font-medium truncate">{s.sector}</span>
            <span className={`text-right font-bold tabular-nums ${
              s.score >= 70 ? 'text-[#ff3b5c]' : s.score >= 50 ? 'text-[#f59e0b]' : 'text-[#0ea5e9]'
            }`}>{s.score}</span>
            <span className={`text-right font-bold tabular-nums ${s.change_5d >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {s.change_5d >= 0 ? '+' : ''}{s.change_5d.toFixed(1)}%
            </span>
            <span className={`text-right tabular-nums ${s.change_20d >= 0 ? 'text-[#ff3b5c]/80' : 'text-[#0ea5e9]/80'}`}>
              {s.change_20d >= 0 ? '+' : ''}{s.change_20d.toFixed(1)}%
            </span>
            <span className="text-right tabular-nums text-[#64748b]">
              {s.change_60d >= 0 ? '+' : ''}{s.change_60d.toFixed(1)}%
            </span>
            <span className={`text-right tabular-nums ${
              s.rsi >= 70 ? 'text-[#ff3b5c]' : s.rsi <= 30 ? 'text-[#00ff88]' : 'text-[#64748b]'
            }`}>{s.rsi}</span>
            <div className="flex items-center justify-end gap-1 text-[10px]">
              <span className={s.foreign_flow > 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}>
                외{s.foreign_flow > 0 ? '▲' : '▼'}
              </span>
              <span className={s.inst_flow > 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}>
                기{s.inst_flow > 0 ? '▲' : '▼'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ═══════════════════════════════════════
// 3. 외국인 자본 흐름
// ═══════════════════════════════════════
function ChinaFlowSection() {
  const { data, isLoading } = useChinaFlow()
  const items = data?.filter(s => s.signal !== 'NORMAL') ?? []
  const COLS = '1fr 72px 56px 56px 56px 56px'

  return (
    <Panel title="외국인 자본 흐름" badge={`${items.length}종목`}>
      <div className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/50 text-xs text-[#64748b] font-bold"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-left">종목</span>
        <span className="text-center">시그널</span>
        <span className="text-right">점수</span>
        <span className="text-right">Z-score</span>
        <span className="text-right">5일%</span>
        <span className="text-right">연속</span>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {isLoading ? <Skeleton /> : items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : items.map(item => (
          <div key={item.ticker} className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/30 hover:bg-[#0d1420] items-center text-xs"
            style={{ gridTemplateColumns: COLS }}>
            <div className="truncate">
              <span className="text-[#e2e8f0] text-sm font-bold">{item.name}</span>
              <span className="text-[#334155] ml-1">{item.ticker}</span>
            </div>
            <div className="text-center">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border font-bold ${SIGNAL_COLOR[item.signal] ?? SIGNAL_COLOR.NORMAL}`}>
                {item.signal}
              </span>
            </div>
            <span className="text-right text-[#e2e8f0] font-bold">{item.score}</span>
            <span className={`text-right font-bold ${item.foreign_zscore >= 1.5 ? 'text-[#00ff88]' : 'text-[#64748b]'}`}>
              {item.foreign_zscore.toFixed(1)}
            </span>
            <span className={`text-right font-bold ${item.pct_change_5d >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {item.pct_change_5d >= 0 ? '+' : ''}{item.pct_change_5d.toFixed(1)}%
            </span>
            <span className="text-right text-[#f59e0b] font-bold">{item.consecutive_days}일</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ═══════════════════════════════════════
// 4. 페이퍼 트레이딩 수익률
// ═══════════════════════════════════════
function PaperTradeSection() {
  const { data, isLoading } = usePaperTrades()
  const trades = data?.trades ?? []
  const stats = data?.cumulative
  const COLS = '72px 1fr 56px 72px 72px 64px'

  return (
    <Panel title="페이퍼 트레이딩" badge={stats ? `승률 ${stats.win_rate.toFixed(0)}%` : ''}>
      {/* 누적 통계 */}
      {stats && (
        <div className="flex gap-6 px-4 py-3 border-b border-[#1a2535] text-sm">
          <div>
            <span className="text-[#64748b]">PF </span>
            <span className={`font-bold ${stats.pf >= 1 ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}>
              {stats.pf.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[#64748b]">MDD </span>
            <span className="text-[#ff3b5c] font-bold">{stats.mdd.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[#64748b]">총 </span>
            <span className="text-[#e2e8f0] font-bold">{stats.total_trades}건</span>
          </div>
          <div>
            <span className="text-[#64748b]">승률 </span>
            <span className={`font-bold ${stats.win_rate >= 50 ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}>
              {stats.win_rate.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/50 text-xs text-[#64748b] font-bold"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-left">날짜</span>
        <span className="text-left">종목</span>
        <span className="text-center">방향</span>
        <span className="text-right">진입가</span>
        <span className="text-right">청산가</span>
        <span className="text-right">수익률</span>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {isLoading ? <Skeleton /> : trades.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : trades.map((t, i) => (
          <div key={`${t.ticker}-${i}`} className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/30 hover:bg-[#0d1420] items-center text-xs"
            style={{ gridTemplateColumns: COLS }}>
            <span className="text-[#64748b] tabular-nums">{t.trade_date}</span>
            <div className="truncate">
              <span className="text-[#e2e8f0] font-bold">{t.name}</span>
              <span className="text-[#334155] ml-1 text-[10px]">{t.ticker}</span>
            </div>
            <span className={`text-center font-bold ${t.side === 'BUY' ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {t.side === 'BUY' ? '매수' : '매도'}
            </span>
            <span className="text-right text-[#e2e8f0] tabular-nums">{t.entry_price?.toLocaleString()}</span>
            <span className="text-right text-[#e2e8f0] tabular-nums">{t.exit_price?.toLocaleString()}</span>
            <span className={`text-right font-bold tabular-nums ${t.pnl_pct >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {t.pnl_pct >= 0 ? '+' : ''}{t.pnl_pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ═══════════════════════════════════════
// 메인 뷰
// ═══════════════════════════════════════
export function QuantView() {
  return (
    <div className="min-h-screen bg-[#131722]" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 페이지 헤더 */}
      <div className="border-b border-[#1a2535] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-[#e2e8f0] tracking-widest uppercase">퀀트시스템</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-sm border border-[#f59e0b]/40 text-[#f59e0b] font-bold">PRO</span>
        </div>
        <span className="text-sm text-[#64748b] font-bold">₩25,000/월</span>
      </div>

      {/* 2×2 그리드 */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EtfSignalSection />
        <SectorRotationSection />
        <ChinaFlowSection />
        <PaperTradeSection />
      </div>
    </div>
  )
}
