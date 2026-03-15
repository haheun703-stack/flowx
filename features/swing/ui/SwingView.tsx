'use client'

import Link from 'next/link'
import { useShortSignals } from '@/features/dashboard/api/useDashboard'

// ── 색상 상수 ──
const GRADE_COLOR: Record<string, string> = {
  AA: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  A: 'text-[#00cc6a] bg-[#00cc6a]/10 border-[#00cc6a]/30',
  B: 'text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/30',
  C: 'text-[#64748b] bg-[#64748b]/10 border-[#64748b]/30',
}

const SIGNAL_LABEL: Record<string, string> = {
  FORCE_BUY: '적극매수',
  BUY: '매수',
  WATCH: '관심',
}

const SIGNAL_COLOR: Record<string, string> = {
  FORCE_BUY: 'text-[#ff3b5c]',
  BUY: 'text-[#00ff88]',
  WATCH: 'text-[#f59e0b]',
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
function Panel({ title, badge, dot, children }: { title: string; badge?: string; dot?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-[#0a0f18] border border-[#1a2535] rounded-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          {dot && <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />}
          <span className="text-xl font-black text-[#e2e8f0] tracking-widest uppercase">{title}</span>
        </div>
        {badge && <span className="text-sm text-[#64748b] font-bold">{badge}</span>}
      </div>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════
// 1. AI 추천 상세
// ═══════════════════════════════════════
function AIDetailSection() {
  const { data, isLoading } = useShortSignals('all')
  const stocks = data ?? []
  const COLS = '80px 1fr 80px 72px 72px 56px 56px 64px'

  return (
    <Panel title="AI 추천 상세" dot="bg-[#a855f7]" badge={`${stocks.length}종목`}>
      <div className="grid text-xs text-[#64748b] font-bold tracking-widest uppercase border-b border-[#1a2535] px-3 py-2"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">신호</span>
        <span className="text-left">종목</span>
        <span className="text-right">진입가</span>
        <span className="text-right">목표가</span>
        <span className="text-right">손절가</span>
        <span className="text-right">배수</span>
        <span className="text-right">점수</span>
        <span className="text-center">보유일</span>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {isLoading ? <Skeleton /> : stocks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : stocks.map(stock => (
          <Link key={stock.code} href={`/chart/${stock.code}`}
            className="grid items-center px-3 py-2 border-b border-[#1a2535]/50 hover:bg-[#0d1420] cursor-pointer transition-colors text-xs"
            style={{ gridTemplateColumns: COLS }}>
            <span className={`text-[10px] px-3 py-1.5 rounded-sm border tracking-tight text-center whitespace-nowrap ${GRADE_COLOR[stock.grade] ?? 'text-[#64748b] border-[#334155]'}`}>
              {SIGNAL_LABEL[stock.signal_type] ?? stock.grade}
            </span>
            <div className="min-w-0 pl-1">
              <div className="text-[#e2e8f0] font-medium truncate">{stock.name}</div>
              <div className="text-[#334155] text-[10px]">{stock.code}</div>
            </div>
            <span className="text-right text-[#e2e8f0] tabular-nums">{stock.entry_price?.toLocaleString()}</span>
            <span className="text-right text-[#00ff88] tabular-nums font-bold">{stock.target_price?.toLocaleString()}</span>
            <span className="text-right text-[#ff3b5c] tabular-nums">{stock.stop_loss?.toLocaleString()}</span>
            <span className="text-right text-[#f59e0b] font-bold tabular-nums">x{stock.volume_ratio?.toFixed(1)}</span>
            <span className={`text-right font-bold tabular-nums ${
              stock.total_score >= 80 ? 'text-[#00ff88]' :
              stock.total_score >= 60 ? 'text-[#f59e0b]' : 'text-[#64748b]'
            }`}>{stock.total_score}</span>
            <span className="text-center text-[#64748b] tabular-nums">{stock.holding_days}일</span>
          </Link>
        ))}
      </div>
      {/* 하단 통계 */}
      <div className="flex gap-4 px-4 py-2 border-t border-[#1a2535] text-sm font-bold text-[#64748b]">
        <span>AA <span className="text-[#00ff88]">{stocks.filter(s => s.grade === 'AA').length}</span></span>
        <span>A <span className="text-[#00cc6a]">{stocks.filter(s => s.grade === 'A').length}</span></span>
        <span>B <span className="text-[#0ea5e9]">{stocks.filter(s => s.grade === 'B').length}</span></span>
        <span className="ml-auto">총 <span className="text-[#e2e8f0]">{stocks.length}</span></span>
      </div>
    </Panel>
  )
}

// ═══════════════════════════════════════
// 2. 세력 포착
// ═══════════════════════════════════════
function ForceDetectSection() {
  const { data, isLoading } = useShortSignals('force')
  const stocks = data ?? []
  const COLS = '1fr 72px 64px 56px 56px 64px'

  return (
    <Panel title="세력 포착" dot="bg-[#f59e0b]" badge={`포착 ${stocks.length}`}>
      <div className="grid text-xs text-[#64748b] font-bold tracking-widest uppercase border-b border-[#1a2535] px-3 py-2"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-left">종목</span>
        <span className="text-right">진입가</span>
        <span className="text-center">등급</span>
        <span className="text-right">배수</span>
        <span className="text-right">점수</span>
        <span className="text-center">모멘텀</span>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {isLoading ? <Skeleton /> : stocks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : stocks.map(stock => (
          <Link key={stock.code} href={`/chart/${stock.code}`}
            className="grid items-center px-3 py-2 border-b border-[#1a2535]/50 hover:bg-[#0d1420] cursor-pointer transition-colors text-xs"
            style={{ gridTemplateColumns: COLS }}>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  stock.volume_ratio >= 2 ? 'bg-[#ff3b5c]' :
                  stock.volume_ratio >= 1.5 ? 'bg-[#f59e0b]' : 'bg-[#64748b]'
                }`} />
                <span className="text-[#e2e8f0] font-medium">{stock.name}</span>
              </div>
              <div className="text-[#334155] text-[10px] ml-3">{stock.code}</div>
            </div>
            <span className="text-right text-[#e2e8f0] tabular-nums">{stock.entry_price?.toLocaleString()}</span>
            <span className={`text-center font-bold ${
              stock.grade === 'AA' ? 'text-[#00ff88]' :
              stock.grade === 'A' ? 'text-[#00cc6a]' : 'text-[#64748b]'
            }`}>{stock.grade}</span>
            <span className="text-right text-[#f59e0b] font-bold tabular-nums">x{stock.volume_ratio?.toFixed(1)}</span>
            <span className={`text-right font-bold tabular-nums ${
              stock.total_score >= 80 ? 'text-[#00ff88]' :
              stock.total_score >= 60 ? 'text-[#f59e0b]' : 'text-[#64748b]'
            }`}>{stock.total_score}</span>
            <span className={`text-center text-[10px] font-bold ${
              stock.momentum_regime === 'BULL' ? 'text-[#ff3b5c]' :
              stock.momentum_regime === 'BEAR' ? 'text-[#0ea5e9]' : 'text-[#f59e0b]'
            }`}>{stock.momentum_regime}</span>
          </Link>
        ))}
      </div>
      <div className="flex gap-4 px-4 py-2 border-t border-[#1a2535] text-sm font-bold text-[#64748b]">
        <span>x2.0+ <span className="text-[#ff3b5c]">{stocks.filter(s => s.volume_ratio >= 2).length}</span></span>
        <span>x1.5+ <span className="text-[#f59e0b]">{stocks.filter(s => s.volume_ratio >= 1.5 && s.volume_ratio < 2).length}</span></span>
      </div>
    </Panel>
  )
}

// ═══════════════════════════════════════
// 3. 스나이퍼 워치
// ═══════════════════════════════════════
function SniperSection() {
  const { data, isLoading } = useShortSignals('watch')
  const items = data ?? []
  const COLS = '1fr 40px 72px 72px 72px 56px 64px'

  return (
    <Panel title="스나이퍼 워치" badge={`${items.length}종목`}>
      <div className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/50 text-xs text-[#64748b] font-bold"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-left">종목</span>
        <span className="text-center">등급</span>
        <span className="text-right">진입가</span>
        <span className="text-right">목표가</span>
        <span className="text-right">손절가</span>
        <span className="text-right">점수</span>
        <span className="text-center">판정</span>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {isLoading ? <Skeleton /> : items.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : items.map(item => (
          <Link key={item.code} href={`/chart/${item.code}`}
            className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/30 hover:bg-[#0d1420] items-center text-xs"
            style={{ gridTemplateColumns: COLS }}>
            <div className="truncate">
              <span className="text-[#e2e8f0] text-sm font-bold">{item.name}</span>
              <span className="text-[#334155] ml-1 text-[10px]">{item.code}</span>
            </div>
            <div className="text-center">
              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[item.grade] ?? 'text-[#64748b]'}`}>
                {item.grade}
              </span>
            </div>
            <span className="text-right text-[#e2e8f0] font-bold tabular-nums">{item.entry_price?.toLocaleString()}</span>
            <span className="text-right text-[#00ff88] font-bold tabular-nums">{item.target_price?.toLocaleString()}</span>
            <span className="text-right text-[#ff3b5c] tabular-nums">{item.stop_loss?.toLocaleString()}</span>
            <span className={`text-right font-bold tabular-nums ${
              item.total_score >= 80 ? 'text-[#00ff88]' :
              item.total_score >= 60 ? 'text-[#f59e0b]' : 'text-[#64748b]'
            }`}>{item.total_score}</span>
            <div className="text-center">
              <span className={`font-bold ${SIGNAL_COLOR[item.signal_type] ?? 'text-[#64748b]'}`}>
                {SIGNAL_LABEL[item.signal_type] ?? item.signal_type}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  )
}

// ═══════════════════════════════════════
// 4. 시그널 히스토리 (전체 시그널 타임라인)
// ═══════════════════════════════════════
function SignalHistorySection() {
  const { data, isLoading } = useShortSignals('all')
  const stocks = data ?? []
  // 날짜 기준 그룹핑
  const grouped = stocks.reduce<Record<string, typeof stocks>>((acc, s) => {
    const key = s.date ?? 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})
  const dates = Object.keys(grouped).sort().reverse()

  return (
    <Panel title="시그널 히스토리" badge={`${dates.length}일`}>
      <div className="max-h-[480px] overflow-y-auto">
        {isLoading ? <Skeleton /> : dates.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#334155]">데이터 없음</div>
        ) : dates.map(date => (
          <div key={date}>
            <div className="px-3 py-1.5 bg-[#0d1420] border-b border-[#1a2535] text-sm text-[#64748b] font-bold">
              {date}
              <span className="text-[#334155] ml-2">{grouped[date].length}건</span>
            </div>
            {grouped[date].map(s => (
              <div key={`${s.code}-${s.signal_type}`}
                className="flex items-center gap-3 px-3 py-1.5 border-b border-[#1a2535]/30 hover:bg-[#0d1420] text-xs">
                <span className={`w-16 text-center font-bold ${SIGNAL_COLOR[s.signal_type] ?? 'text-[#64748b]'}`}>
                  {SIGNAL_LABEL[s.signal_type] ?? s.signal_type}
                </span>
                <span className={`text-[9px] px-1 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[s.grade] ?? 'text-[#64748b]'}`}>
                  {s.grade}
                </span>
                <span className="text-[#e2e8f0] font-medium">{s.name}</span>
                <span className="text-[#334155] text-[10px]">{s.code}</span>
                <span className="ml-auto text-[#e2e8f0] tabular-nums">{s.entry_price?.toLocaleString()}</span>
                <span className="text-[#00ff88] tabular-nums font-bold">→{s.target_price?.toLocaleString()}</span>
                <span className={`font-bold tabular-nums ${
                  s.total_score >= 80 ? 'text-[#00ff88]' :
                  s.total_score >= 60 ? 'text-[#f59e0b]' : 'text-[#64748b]'
                }`}>{s.total_score}점</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ═══════════════════════════════════════
// 메인 뷰
// ═══════════════════════════════════════
export function SwingView() {
  return (
    <div className="min-h-screen bg-[#131722]" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 페이지 헤더 */}
      <div className="border-b border-[#1a2535] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-[#e2e8f0] tracking-widest uppercase">스윙시스템</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-sm border border-[#a855f7]/40 text-[#a855f7] font-bold">QUANT</span>
        </div>
        <span className="text-sm text-[#64748b] font-bold">₩50,000/월</span>
      </div>

      {/* 2×2 그리드 */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIDetailSection />
        <ForceDetectSection />
        <SniperSection />
        <SignalHistorySection />
      </div>
    </div>
  )
}
