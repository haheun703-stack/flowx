'use client'

import { useShortSignals } from '../api/useDashboard'

const GRADE_COLOR: Record<string, string> = {
  AA: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  A: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  B: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
}

const SIGNAL_COLOR: Record<string, string> = {
  FORCE_BUY: 'text-[#ff3b5c]',
  BUY: 'text-[#00ff88]',
  WATCH: 'text-[#f59e0b]',
}

const COLS = '1fr 40px 72px 72px 56px 64px'

export function SniperWatchPanel() {
  const { data, isLoading } = useShortSignals('watch')

  const items = data?.slice(0, 15) ?? []

  return (
    <div className="flex flex-col h-full text-xs" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          <span className="text-[#e2e8f0] text-sm font-black tracking-widest uppercase">스나이퍼 워치</span>
          <span className="text-sm text-[#64748b] font-bold">매수 시그널</span>
        </div>
        <span className="text-sm text-[#64748b] font-bold">{items[0]?.date ?? ''}</span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/50 text-xs text-[#64748b] font-bold"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-left">종목</span>
        <span className="text-center">등급</span>
        <span className="text-right">진입가</span>
        <span className="text-right">목표가</span>
        <span className="text-right">점수</span>
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
                <span className="text-[#334155] ml-1 text-[10px]">{item.code}</span>
              </div>
              <div className="text-center">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[item.grade] ?? 'text-[#64748b]'}`}>
                  {item.grade}
                </span>
              </div>
              <span className="text-right text-[#e2e8f0] font-bold tabular-nums">
                {item.entry_price?.toLocaleString()}
              </span>
              <span className="text-right text-[#00ff88] font-bold tabular-nums">
                {item.target_price?.toLocaleString()}
              </span>
              <span className={`text-right font-bold tabular-nums ${
                item.total_score >= 80 ? 'text-[#00ff88]' :
                item.total_score >= 60 ? 'text-[#f59e0b]' : 'text-[#64748b]'
              }`}>
                {item.total_score}
              </span>
              <div className="text-center">
                <span className={`font-bold ${SIGNAL_COLOR[item.signal_type] ?? 'text-[#64748b]'}`}>
                  {item.signal_type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
