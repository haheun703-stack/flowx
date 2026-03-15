'use client'

import { useDashboardEtf } from '../api/useDashboard'

const GRADE_COLOR: Record<string, string> = {
  '적극매수': 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  '매수': 'text-[#00cc6a] bg-[#00cc6a]/10 border-[#00cc6a]/30',
  '관망': 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  '매도': 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  '적극매도': 'text-[#cc2f4a] bg-[#cc2f4a]/10 border-[#cc2f4a]/30',
}

const COLS = '1fr 60px 48px 48px 48px 40px'

export function EtfSignalPanel() {
  const { data, isLoading } = useDashboardEtf()
  const items = data?.etfs?.slice(0, 15) ?? []

  return (
    <div className="flex flex-col h-full text-xs" style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">ETF 시그널</span>
          <span className="text-[11px] text-[#8a8a8a] font-bold">{data?.etf_count ?? 0}종목</span>
        </div>
        <span className="text-[11px] text-[#8a8a8a] font-bold">{data?.updated_at ?? ''}</span>
      </div>
      <div className="grid px-2 py-1 border-b border-[#2a2a3a] text-[11px] text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>ETF</span>
        <span className="text-center">시그널</span>
        <span className="text-right">점수</span>
        <span className="text-right">1일%</span>
        <span className="text-right">5일%</span>
        <span className="text-right">RSI</span>
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
            <div key={item.etf_code} className={`grid px-2 py-1 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] items-center ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <div className="truncate">
                <span className="text-[13px] text-[#e2e8f0] font-medium">{item.sector}</span>
                <span className="text-[10px] text-[#555] ml-1">{item.etf_name}</span>
              </div>
              <div className="text-center">
                <span className={`text-[10px] px-1 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[item.grade] ?? 'text-[#64748b]'}`}>
                  {item.grade}
                </span>
              </div>
              <span className="text-right text-[13px] text-[#e2e8f0] font-bold tabular-nums">{item.score.toFixed(0)}</span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${item.ret_1 >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                {item.ret_1 >= 0 ? '+' : ''}{item.ret_1.toFixed(1)}
              </span>
              <span className={`text-right text-[13px] font-bold tabular-nums ${item.ret_5 >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'}`}>
                {item.ret_5 >= 0 ? '+' : ''}{item.ret_5.toFixed(1)}
              </span>
              <span className={`text-right text-[13px] tabular-nums ${
                item.rsi >= 70 ? 'text-[#ff3b5c]' : item.rsi <= 30 ? 'text-[#0ea5e9]' : 'text-[#64748b]'
              }`}>{item.rsi.toFixed(0)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
