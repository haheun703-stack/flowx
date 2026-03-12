'use client'

import Link from 'next/link'
import { useDashboardWhale } from '../api/useDashboard'

export function SmartMoneyPanel() {
  const { data, isLoading } = useDashboardWhale()

  const stocks = data?.items
    ?.sort((a, b) => b.strength - a.strength)
    ?.slice(0, 12) ?? []

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
          포착 <span className="text-[#f59e0b]">{data?.total_detected ?? 0}</span>
        </span>
      </div>

      {/* 컬럼 헤더 */}
      <div className="grid text-xs text-[#64748b] font-bold tracking-widest uppercase border-b border-[#1a2535] px-3 py-2"
        style={{ gridTemplateColumns: '1fr 72px 56px 44px' }}>
        <span className="text-left">종목</span>
        <span className="text-center">현재가</span>
        <span className="text-center">등락</span>
        <span className="text-center">배수</span>
      </div>

      {/* 종목 행 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 border-b border-[#1a2535]/50 animate-pulse bg-[#0d1420]/30" />
          ))
        ) : (
          stocks.map(stock => (
            <Link
              key={stock.ticker}
              href={`/chart/${stock.ticker}`}
              className="grid items-center px-3 py-2 border-b border-[#1a2535]/50 hover:bg-[#0d1420] cursor-pointer transition-colors text-xs"
              style={{ gridTemplateColumns: '1fr 72px 56px 44px' }}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full ${
                    stock.grade === '세력포착' ? 'bg-[#ff3b5c]' :
                    stock.grade === '매집의심' ? 'bg-[#f59e0b]' :
                    'bg-[#64748b]'
                  }`} />
                  <span className="text-[#e2e8f0] font-medium">{stock.name}</span>
                </div>
                <div className="text-[#334155] text-[10px] ml-2.5">{stock.ticker}</div>
              </div>
              <span className="text-right text-[#e2e8f0] tabular-nums">
                {stock.close.toLocaleString()}
              </span>
              <span className={`text-right tabular-nums font-bold ${
                stock.price_change >= 0 ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'
              }`}>
                {stock.price_change >= 0 ? '+' : ''}{stock.price_change.toFixed(1)}%
              </span>
              <span className="text-right text-[#f59e0b] font-bold tabular-nums">
                x{stock.volume_surge_ratio.toFixed(1)}
              </span>
            </Link>
          ))
        )}
      </div>

      {/* 하단 통계 */}
      <div className="flex gap-4 px-4 py-2 border-t border-[#1a2535] text-sm font-bold text-[#64748b]">
        <span>세력 <span className="text-[#ff3b5c]">{data?.stats?.['세력포착'] ?? 0}</span></span>
        <span>매집 <span className="text-[#f59e0b]">{data?.stats?.['매집의심'] ?? 0}</span></span>
        <span>이상 <span className="text-[#64748b]">{data?.stats?.['이상감지'] ?? 0}</span></span>
      </div>
    </div>
  )
}
