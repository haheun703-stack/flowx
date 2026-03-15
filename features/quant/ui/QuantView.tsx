'use client'

import { useEtfSignals, useHeatmap, useChinaFlow, usePaperTrades } from '@/features/dashboard/api/useDashboard'

const GRADE_COLOR: Record<string, string> = {
  '적극매수': 'text-black bg-[#00ff88] border-[#00ff88]',
  '매수': 'text-black bg-[#00cc6a] border-[#00cc6a]',
  '관망': 'text-black bg-[#ffaa00] border-[#ffaa00]',
  '매도': 'text-white bg-[#ff3b5c] border-[#ff3b5c]',
  '적극매도': 'text-white bg-[#cc2f4a] border-[#cc2f4a]',
}

const SIGNAL_COLOR: Record<string, string> = {
  SURGE: 'text-white bg-[#ff3b5c] border-[#ff3b5c]',
  INFLOW: 'text-white bg-[#00cc66] border-[#00cc66]',
  OUTFLOW: 'text-white bg-[#ff4444] border-[#ff4444]',
  SECTOR_FOCUS: 'text-white bg-[#0ea5e9] border-[#0ea5e9]',
  WATCH: 'text-black bg-[#ffaa00] border-[#ffaa00]',
  NEUTRAL: 'text-white bg-[#888] border-[#888]',
  NORMAL: 'text-white bg-[#888] border-[#888]',
}

function Skeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[44px] mx-2 my-px bg-[#1a2535] animate-pulse rounded-sm" />
      ))}
    </>
  )
}

function Panel({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-[#0a0f18] border border-[#2a2a3a] rounded overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <span className="text-xl font-bold text-[#e2e8f0] tracking-wider uppercase">{title}</span>
        {badge && <span className="text-sm text-[#8a8a8a] font-bold">{badge}</span>}
      </div>
      {children}
    </div>
  )
}

// 1. ETF 시그널
function EtfSignalSection() {
  const { data, isLoading } = useEtfSignals()
  const items = data ?? []
  const COLS = '1fr 80px 60px 60px 60px 52px 60px'

  return (
    <Panel title="ETF 시그널" badge={`${items.length}종목`}>
      <div className="grid px-2 py-1.5 border-b border-[#2a2a3a] text-sm text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>ETF</span>
        <span className="text-center">시그널</span>
        <span className="text-right">점수</span>
        <span className="text-right">1일%</span>
        <span className="text-right">5일%</span>
        <span className="text-right">RSI</span>
        <span className="text-right">순위</span>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {isLoading ? <Skeleton /> : items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : items.map((item, i) => (
          <div key={item.etf_code} className={`grid px-2 py-2 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] items-center ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
            style={{ gridTemplateColumns: COLS }}>
            <div className="truncate">
              <span className="text-lg text-[#e2e8f0] font-medium">{item.sector}</span>
              <span className="text-[13px] text-[#888] ml-1.5">{item.etf_name}</span>
            </div>
            <div className="text-center">
              <span className={`text-sm px-2.5 py-1 rounded-sm border font-bold ${GRADE_COLOR[item.grade] ?? 'text-[#64748b]'}`}>
                {item.grade}
              </span>
            </div>
            <span className="text-right text-[17px] text-[#e2e8f0] font-bold tabular-nums">{(item.score ?? 0).toFixed(0)}</span>
            <span className={`text-right text-[17px] font-bold tabular-nums ${(item.ret_1 ?? 0) >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {(item.ret_1 ?? 0) >= 0 ? '+' : ''}{(item.ret_1 ?? 0).toFixed(1)}
            </span>
            <span className={`text-right text-[17px] font-bold tabular-nums ${(item.ret_5 ?? 0) >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {(item.ret_5 ?? 0) >= 0 ? '+' : ''}{(item.ret_5 ?? 0).toFixed(1)}
            </span>
            <span className={`text-right text-[17px] tabular-nums ${
              (item.rsi ?? 0) >= 70 ? 'text-[#ff3b5c]' :
              (item.rsi ?? 0) <= 30 ? 'text-[#0ea5e9]' : 'text-[#64748b]'
            }`}>
              {(item.rsi ?? 0).toFixed(0)}
            </span>
            <span className="text-right text-[16px] text-[#f59e0b] font-bold tabular-nums">#{item.sector_rotation_rank}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// 2. 그룹순환
function SectorRotationSection() {
  const { data, isLoading } = useHeatmap()
  const sectors = data ?? []
  const COLS = '32px 1fr 56px 64px 64px 64px 48px 64px'

  return (
    <Panel title="그룹순환" badge={`TOP ${sectors.length}`}>
      <div className="grid px-2 py-1.5 border-b border-[#2a2a3a] text-sm text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">#</span>
        <span>섹터</span>
        <span className="text-right">점수</span>
        <span className="text-right">5일</span>
        <span className="text-right">20일</span>
        <span className="text-right">60일</span>
        <span className="text-right">RSI</span>
        <span className="text-right">수급</span>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {isLoading ? <Skeleton /> : sectors.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : sectors.map((s, i) => (
          <div key={s.sector}
            className={`grid items-center px-2 py-2 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
            style={{ gridTemplateColumns: COLS }}>
            <span className="text-center text-[#8a8a8a] text-[16px] font-bold tabular-nums">{i + 1}</span>
            <span className="text-lg text-[#e2e8f0] font-medium truncate">{s.sector}</span>
            <span className={`text-right text-[17px] font-bold tabular-nums ${
              s.score >= 70 ? 'text-[#ff3b5c]' : s.score >= 50 ? 'text-[#f59e0b]' : 'text-[#0ea5e9]'
            }`}>{s.score}</span>
            <span className={`text-right text-[17px] font-bold tabular-nums ${(s.change_5d ?? 0) >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {(s.change_5d ?? 0) >= 0 ? '+' : ''}{(s.change_5d ?? 0).toFixed(1)}
            </span>
            <span className={`text-right text-[17px] tabular-nums ${(s.change_20d ?? 0) >= 0 ? 'text-[#ff3b5c]/80' : 'text-[#0ea5e9]/80'}`}>
              {(s.change_20d ?? 0) >= 0 ? '+' : ''}{(s.change_20d ?? 0).toFixed(1)}
            </span>
            <span className="text-right text-[17px] tabular-nums text-[#64748b]">
              {(s.change_60d ?? 0) >= 0 ? '+' : ''}{(s.change_60d ?? 0).toFixed(1)}
            </span>
            <span className={`text-right text-[17px] tabular-nums ${
              s.rsi >= 70 ? 'text-[#ff3b5c]' : s.rsi <= 30 ? 'text-[#00ff88]' : 'text-[#64748b]'
            }`}>{s.rsi}</span>
            <div className="flex items-center justify-end gap-1.5 text-sm">
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

// 3. 외국인 자본 흐름
function ChinaFlowSection() {
  const { data, isLoading } = useChinaFlow()
  const items = data?.filter(s => s.signal !== 'NORMAL' && s.signal !== 'NEUTRAL') ?? []
  const COLS = '1fr 90px 56px 60px 60px 56px'

  return (
    <Panel title="외국인 자본 흐름" badge={`${items.length}종목`}>
      <div className="grid px-2 py-1.5 border-b border-[#2a2a3a] text-sm text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>종목</span>
        <span className="text-center">시그널</span>
        <span className="text-right">점수</span>
        <span className="text-right">Z값</span>
        <span className="text-right">5일%</span>
        <span className="text-right">연속</span>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {isLoading ? <Skeleton /> : items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : items.map((item, i) => (
          <div key={item.ticker} className={`grid px-2 py-2 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] items-center ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
            style={{ gridTemplateColumns: COLS }}>
            <div className="truncate">
              <span className="text-lg text-[#e2e8f0] font-medium">{item.name}</span>
              <span className="text-[13px] text-[#888] ml-1.5">{item.ticker}</span>
            </div>
            <div className="text-center">
              <span className={`text-sm px-2.5 py-1 rounded-sm border font-bold ${SIGNAL_COLOR[item.signal] ?? SIGNAL_COLOR.NORMAL}`}>
                {item.signal}
              </span>
            </div>
            <span className="text-right text-[17px] text-[#e2e8f0] font-bold tabular-nums">{item.score}</span>
            <span className={`text-right text-[17px] font-bold tabular-nums ${(item.foreign_zscore ?? 0) >= 1.5 ? 'text-[#00ff88]' : 'text-[#64748b]'}`}>
              {(item.foreign_zscore ?? 0).toFixed(1)}
            </span>
            <span className={`text-right text-[17px] font-bold tabular-nums ${(item.pct_change_5d ?? 0) >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {(item.pct_change_5d ?? 0) >= 0 ? '+' : ''}{(item.pct_change_5d ?? 0).toFixed(1)}
            </span>
            <span className="text-right text-[17px] text-[#f59e0b] font-bold tabular-nums">{item.consecutive_days}일</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// 4. 페이퍼 트레이딩
function PaperTradeSection() {
  const { data, isLoading } = usePaperTrades()
  const trades = data?.trades ?? []
  const stats = data?.cumulative
  const COLS = '80px 1fr 56px 80px 80px 64px'

  return (
    <Panel title="페이퍼 트레이딩" badge={stats ? `승률 ${stats.win_rate.toFixed(0)}%` : ''}>
      {stats && (
        <div className="flex gap-4 px-3 py-2 border-b border-[#2a2a3a] text-sm">
          <div><span className="text-[#8a8a8a]">PF </span><span className={`font-bold ${stats.pf >= 1 ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}>{stats.pf.toFixed(2)}</span></div>
          <div><span className="text-[#8a8a8a]">MDD </span><span className="text-[#ff3b5c] font-bold">{stats.mdd.toFixed(1)}%</span></div>
          <div><span className="text-[#8a8a8a]">총 </span><span className="text-[#e2e8f0] font-bold">{stats.total_trades}건</span></div>
          <div><span className="text-[#8a8a8a]">승률 </span><span className={`font-bold ${stats.win_rate >= 50 ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}>{stats.win_rate.toFixed(0)}%</span></div>
        </div>
      )}
      <div className="grid px-2 py-1.5 border-b border-[#2a2a3a] text-sm text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>날짜</span>
        <span>종목</span>
        <span className="text-center">방향</span>
        <span className="text-right">진입가</span>
        <span className="text-right">청산가</span>
        <span className="text-right">수익률</span>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {isLoading ? <Skeleton /> : trades.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : trades.map((t, i) => (
          <div key={`${t.ticker}-${i}`} className={`grid px-2 py-2 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] items-center ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
            style={{ gridTemplateColumns: COLS }}>
            <span className="text-[#8a8a8a] text-[17px] tabular-nums">{t.trade_date}</span>
            <div className="truncate">
              <span className="text-lg text-[#e2e8f0] font-medium">{t.name}</span>
              <span className="text-[13px] text-[#888] ml-1.5">{t.ticker}</span>
            </div>
            <span className={`text-center text-[17px] font-bold ${t.side === 'BUY' ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {t.side === 'BUY' ? '매수' : '매도'}
            </span>
            <span className="text-right text-[17px] text-[#e2e8f0] tabular-nums">{t.entry_price?.toLocaleString()}</span>
            <span className="text-right text-[17px] text-[#e2e8f0] tabular-nums">{t.exit_price?.toLocaleString()}</span>
            <span className={`text-right text-[17px] font-bold tabular-nums ${(t.pnl_pct ?? 0) >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
              {(t.pnl_pct ?? 0) >= 0 ? '+' : ''}{(t.pnl_pct ?? 0).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

export function QuantView() {
  return (
    <div className="min-h-screen bg-[#131722]" style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="border-b border-[#2a2a3a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] font-bold text-[#e2e8f0] tracking-wider uppercase">퀀트시스템</h1>
          <span className="text-sm px-2.5 py-1 rounded-sm border border-[#f59e0b] text-black bg-[#f59e0b] font-bold">PRO</span>
        </div>
        <span className="text-sm text-[#8a8a8a] font-bold">25,000/월</span>
      </div>
      <div className="p-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
        <EtfSignalSection />
        <SectorRotationSection />
        <ChinaFlowSection />
        <PaperTradeSection />
      </div>
    </div>
  )
}
