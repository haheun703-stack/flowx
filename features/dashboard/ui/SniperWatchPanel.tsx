'use client'

import { useDashboardSniper } from '../api/useDashboard'

const GRADE_COLOR: Record<string, string> = {
  S: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  A: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  B: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
}

const VERDICT_COLOR: Record<string, string> = {
  BUY: 'text-[#ff3b5c]',
  WATCH: 'text-[#f59e0b]',
  WAIT: 'text-[#64748b]',
  SELL: 'text-[#0ea5e9]',
}

const COLS = '1fr 40px 80px 56px 56px 64px'

export function SniperWatchPanel() {
  const { data, isLoading } = useDashboardSniper()

  const items = data?.slice(0, 15) ?? []

  return (
    <div className="flex flex-col h-full text-xs" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          <span className="text-[#e2e8f0] text-sm font-black tracking-widest uppercase">스나이퍼 워치</span>
          <span className="text-sm text-[#64748b] font-bold">밸류트랩 감시</span>
        </div>
        <span className="text-sm text-[#64748b] font-bold">{items[0]?.scan_date ?? ''}</span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/50 text-xs text-[#64748b] font-bold"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-left">종목</span>
        <span className="text-center">등급</span>
        <span className="text-left">섹터</span>
        <span className="text-right">현재가</span>
        <span className="text-right">RSI</span>
        <span className="text-center">판정</span>
      </div>

      {/* 데이터 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 mx-3 my-1 bg-[#1a2535] animate-pulse rounded-sm" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          items.map(item => (
            <div key={item.code} className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/30 hover:bg-[#0d1420] items-center"
              style={{ gridTemplateColumns: COLS }}>
              <div className="truncate">
                <span className="text-[#e2e8f0] text-sm font-bold">{item.name}</span>
              </div>
              <div className="text-center">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[item.grade] ?? 'text-[#64748b]'}`}>
                  {item.grade}
                </span>
              </div>
              <span className="text-[#64748b] truncate">{item.sector}</span>
              <span className="text-right text-[#e2e8f0] font-bold">
                {item.analysis.price.toLocaleString()}
              </span>
              <span className={`text-right font-bold ${
                item.analysis.rsi >= 70 ? 'text-[#ff3b5c]' :
                item.analysis.rsi <= 30 ? 'text-[#0ea5e9]' : 'text-[#64748b]'
              }`}>
                {item.analysis.rsi.toFixed(0)}
              </span>
              <div className="text-center">
                <span className={`font-bold ${VERDICT_COLOR[item.analysis.verdict] ?? 'text-[#64748b]'}`}>
                  {item.analysis.verdict}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
