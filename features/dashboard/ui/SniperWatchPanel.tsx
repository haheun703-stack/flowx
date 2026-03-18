'use client'

import { useShortSignals } from '../api/useDashboard'
import { getRelativeDate } from '@/shared/lib/dateUtils'

const GRADE_COLOR: Record<string, string> = {
  AA: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  A: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  B: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
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

const COLS = '1fr 36px 64px 64px 40px 52px'

export function SniperWatchPanel() {
  const { data, isLoading } = useShortSignals('watch')
  const items = data?.slice(0, 15) ?? []
  const dateStr = items[0]?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false

  return (
    <div className={`flex flex-col h-full text-xs ${isStale ? 'opacity-50' : ''}`} style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">스나이퍼 워치</span>
          <span className="text-[11px] text-[#8a8a8a] font-bold">매수 시그널</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-[10px] font-bold ${rel.daysAgo === 0 ? 'text-[#00ff88]' : 'text-[#555]'}`}>{rel.label}</span>}
          <span className="text-[11px] text-[#8a8a8a] font-bold">{dateStr}</span>
        </div>
      </div>
      <div className="grid px-2 py-1 border-b border-[#2a2a3a] text-[11px] text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>종목</span>
        <span className="text-center">등급</span>
        <span className="text-right">진입가</span>
        <span className="text-right">목표가</span>
        <span className="text-right">점수</span>
        <span className="text-center">판정</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[32px] mx-2 my-px bg-[#1a2535] animate-pulse rounded-sm" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          items.map((item, i) => (
            <div key={item.code} className={`grid px-2 py-1 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] items-center ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <div className="truncate">
                <span className="text-[13px] text-[#e2e8f0] font-medium">{item.name}</span>
                <span className="text-[10px] text-[#555] ml-1">{item.code}</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] px-1 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[item.grade] ?? 'text-[#64748b]'}`}>
                  {item.grade}
                </span>
              </div>
              <span className="text-right text-[13px] text-[#e2e8f0] font-bold tabular-nums">{item.entry_price?.toLocaleString()}</span>
              <span className="text-right text-[13px] text-[#00ff88] font-bold tabular-nums">{item.target_price?.toLocaleString()}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${
                item.total_score >= 80 ? 'text-[#00ff88]' :
                item.total_score >= 60 ? 'text-[#f59e0b]' : 'text-[#64748b]'
              }`}>{item.total_score}</span>
              <div className="text-center">
                <span className={`text-[10px] font-bold ${SIGNAL_COLOR[item.signal_type] ?? 'text-[#64748b]'}`}>
                  {SIGNAL_LABEL[item.signal_type] ?? item.signal_type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
