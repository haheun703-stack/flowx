'use client'

import { useTreemap } from '@/features/market-summary/model/useTreemap'
import { StockTreemap } from '@/features/market-summary/ui/StockTreemap'

export default function TreemapPage() {
  const { data: sectors, isLoading } = useTreemap()

  return (
    <div className="flex flex-col h-[calc(100vh/1.25-88px)] overflow-hidden" style={{ background: '#131722' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]"
        style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
          <span className="text-base font-black tracking-widest uppercase text-white">
            시가총액 트리맵
          </span>
          <span className="text-sm font-bold text-[#64748b]">KOSPI · KOSDAQ 상위 50종목</span>
        </div>
        <span className="text-sm font-bold text-[#64748b]">박스 크기 = 시총 비중 · 색상 = 등락률</span>
      </div>

      {/* 트리맵 */}
      <div className="flex-1 p-3 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[#334155] text-sm" style={{ fontFamily: 'var(--font-jetbrains), monospace' }}>
              데이터 로딩중...
            </div>
          </div>
        ) : (
          <StockTreemap sectors={sectors ?? []} />
        )}
      </div>
    </div>
  )
}
