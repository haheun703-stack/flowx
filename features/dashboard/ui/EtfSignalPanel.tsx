'use client'

import { useDashboardEtf } from '../api/useDashboard'

const GRADE_COLOR: Record<string, string> = {
  '적극매수': 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  '매수': 'text-[#00cc6a] bg-[#00cc6a]/10 border-[#00cc6a]/30',
  '관망': 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  '매도': 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  '적극매도': 'text-[#cc2f4a] bg-[#cc2f4a]/10 border-[#cc2f4a]/30',
}

const COLS = '1fr 72px 64px 56px 56px 56px'

export function EtfSignalPanel() {
  const { data, isLoading } = useDashboardEtf()

  const items = data?.etfs?.slice(0, 15) ?? []

  return (
    <div className="flex flex-col h-full text-xs" style={{ fontFamily: 'var(--font-terminal)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          <span className="text-[#e2e8f0] text-sm font-black tracking-widest uppercase">ETF 시그널</span>
          <span className="text-sm text-[#64748b] font-bold">{data?.etf_count ?? 0}종목</span>
        </div>
        <span className="text-sm text-[#64748b] font-bold">{data?.updated_at ?? ''}</span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/50 text-xs text-[#64748b] font-bold"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-left">ETF</span>
        <span className="text-center">시그널</span>
        <span className="text-right">점수</span>
        <span className="text-right">1일%</span>
        <span className="text-right">5일%</span>
        <span className="text-right">RSI</span>
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
            <div key={item.etf_code} className="grid gap-2 px-3 py-1.5 border-b border-[#1a2535]/30 hover:bg-[#0d1420] items-center"
              style={{ gridTemplateColumns: COLS }}>
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
