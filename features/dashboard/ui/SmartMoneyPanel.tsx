'use client'

import Link from 'next/link'
import { useShortSignals } from '../api/useDashboard'

export function SmartMoneyPanel() {
  const { data, isLoading } = useShortSignals('force')
  const stocks = data?.slice(0, 12) ?? []
  const COLS = '1fr 64px 44px 44px'

  return (
    <div className="flex flex-col h-full bg-[#0a0f18]" style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">세력 포착</span>
        </div>
        <span className="text-[11px] text-[#8a8a8a] font-bold">포착 <span className="text-[#f59e0b]">{stocks.length}</span></span>
      </div>
      <div className="grid px-2 py-1 border-b border-[#2a2a3a] text-[11px] text-[#8a8a8a] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span>종목</span>
        <span className="text-right">진입가</span>
        <span className="text-center">등급</span>
        <span className="text-right">배수</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[32px] border-b border-[#2a2a3a]/30 animate-pulse bg-[#0d1420]/30" />
          ))
        ) : stocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          stocks.map((stock, i) => (
            <Link key={stock.code} href={`/chart/${stock.code}`}
              className={`grid items-center px-2 py-1 border-b border-[#2a2a3a]/30 hover:bg-[#0d1420] cursor-pointer transition-colors text-xs ${i % 2 === 1 ? 'bg-[#0d1117]' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <div>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    stock.volume_ratio >= 2 ? 'bg-[#ff3b5c]' :
                    stock.volume_ratio >= 1.5 ? 'bg-[#f59e0b]' : 'bg-[#64748b]'
                  }`} />
                  <span className="text-[13px] text-[#e2e8f0] font-medium">{stock.name}</span>
                </div>
                <div className="text-[10px] text-[#555] ml-3">{stock.code}</div>
              </div>
              <span className="text-right text-[13px] text-[#e2e8f0] tabular-nums">{stock.entry_price?.toLocaleString()}</span>
              <span className={`text-center text-[13px] font-bold ${
                stock.grade === 'AA' ? 'text-[#00ff88]' :
                stock.grade === 'A' ? 'text-[#00cc6a]' : 'text-[#64748b]'
              }`}>{stock.grade}</span>
              <span className="text-right text-[13px] text-[#f59e0b] font-bold tabular-nums">x{stock.volume_ratio?.toFixed(1)}</span>
            </Link>
          ))
        )}
      </div>
      <div className="flex gap-3 px-3 py-1.5 border-t border-[#2a2a3a] text-[11px] font-bold text-[#8a8a8a]">
        <span>x2.0+ <span className="text-[#ff3b5c]">{stocks.filter(s => s.volume_ratio >= 2).length}</span></span>
        <span>x1.5+ <span className="text-[#f59e0b]">{stocks.filter(s => s.volume_ratio >= 1.5 && s.volume_ratio < 2).length}</span></span>
      </div>
    </div>
  )
}
