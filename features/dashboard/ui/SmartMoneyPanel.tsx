'use client'

import Link from 'next/link'
import { useShortSignals } from '../api/useDashboard'

export function SmartMoneyPanel() {
  const { data, isLoading } = useShortSignals('force')

  const stocks = data?.slice(0, 12) ?? []

  return (
    <div className="flex flex-col h-full bg-[#0a0f18]"
      style={{ fontFamily: 'var(--font-terminal)' }}>

      {/* 패널 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
          <span className="text-xl font-black text-[#e2e8f0] tracking-widest uppercase">세력 포착</span>
        </div>
        <span className="text-sm text-[#64748b] font-bold">
          포착 <span className="text-[#f59e0b]">{stocks.length}</span>
        </span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid text-xs text-[#64748b] font-bold tracking-widest uppercase border-b border-[#1a2535] px-3 py-2"
        style={{ gridTemplateColumns: '1fr 72px 64px 44px' }}>
        <span className="text-left">종목</span>
        <span className="text-center">진입가</span>
        <span className="text-center">등급</span>
        <span className="text-center">배수</span>
      </div>

      {/* 종목 행 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 border-b border-[#1a2535]/50 animate-pulse bg-[#0d1420]/30" />
          ))
        ) : stocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">데이터 없음</div>
        ) : (
          stocks.map(stock => (
            <Link
              key={stock.code}
              href={`/chart/${stock.code}`}
              className="grid items-center px-3 py-2 border-b border-[#1a2535]/50 hover:bg-[#0d1420] cursor-pointer transition-colors text-xs"
              style={{ gridTemplateColumns: '1fr 72px 64px 44px' }}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full ${
                    stock.volume_ratio >= 2 ? 'bg-[#ff3b5c]' :
                    stock.volume_ratio >= 1.5 ? 'bg-[#f59e0b]' :
                    'bg-[#64748b]'
                  }`} />
                  <span className="text-[#e2e8f0] font-medium">{stock.name}</span>
                </div>
                <div className="text-[#334155] text-[10px] ml-2.5">{stock.code}</div>
              </div>
              <span className="text-right text-[#e2e8f0] tabular-nums">
                {stock.entry_price?.toLocaleString()}
              </span>
              <span className={`text-center font-bold ${
                stock.grade === 'AA' ? 'text-[#00ff88]' :
                stock.grade === 'A' ? 'text-[#00cc6a]' :
                'text-[#64748b]'
              }`}>
                {stock.grade}
              </span>
              <span className="text-right text-[#f59e0b] font-bold tabular-nums">
                x{stock.volume_ratio?.toFixed(1)}
              </span>
            </Link>
          ))
        )}
      </div>

      {/* 하단 통계 */}
      <div className="flex gap-4 px-4 py-2 border-t border-[#1a2535] text-sm font-bold text-[#64748b]">
        <span>x2.0+ <span className="text-[#ff3b5c]">{stocks.filter(s => s.volume_ratio >= 2).length}</span></span>
        <span>x1.5+ <span className="text-[#f59e0b]">{stocks.filter(s => s.volume_ratio >= 1.5 && s.volume_ratio < 2).length}</span></span>
      </div>
    </div>
  )
}
