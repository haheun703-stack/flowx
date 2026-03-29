'use client'

import { useState } from 'react'
import { useTreemap } from '@/features/market-summary/model/useTreemap'
import { StockTreemap, SizeBy, LeafNode } from '@/features/market-summary/ui/StockTreemap'

const FONT = 'var(--font-jetbrains), monospace'

const FILTERS: { key: SizeBy; label: string; desc: string }[] = [
  { key: 'marketCap',    label: '시총',   desc: '박스 크기 = 시가총액 비중' },
  { key: 'tradingValue', label: '거래대금', desc: '박스 크기 = 당일 거래대금' },
  { key: 'changeAbs',    label: '등락률',  desc: '박스 크기 = 등락률 절대값' },
]

function DetailPanel({ stock, onClose }: { stock: LeafNode | null; onClose: () => void }) {
  if (!stock) return null

  const isPositive = stock.changePercent >= 0
  const color = isPositive ? 'text-[var(--up)]' : 'text-[var(--down)]'
  const sign = isPositive ? '+' : ''

  const mcapText = stock.marketCap >= 10000
    ? `${(stock.marketCap / 10000).toFixed(1)}조원`
    : `${Math.round(stock.marketCap)}억원`
  const tvText = stock.tradingValue >= 10000
    ? `${(stock.tradingValue / 10000).toFixed(1)}조원`
    : `${Math.round(stock.tradingValue)}억원`

  return (
    <div
      className="w-[260px] shrink-0 border-l border-[var(--border)] bg-white flex flex-col"
      style={{ fontFamily: FONT }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="text-[var(--text-primary)] font-bold text-sm">{stock.name}</span>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none"
        >
          x
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div>
          <div className="text-[var(--text-muted)] text-xs mb-1">종목코드</div>
          <div className="text-[var(--text-primary)] font-bold text-sm">{stock.ticker}</div>
        </div>
        <div>
          <div className="text-[var(--text-muted)] text-xs mb-1">섹터</div>
          <div className="text-[var(--yellow)] font-bold text-sm">{stock.sector}</div>
        </div>

        <div className="border-t border-[var(--border)] pt-4">
          <div className="text-[var(--text-muted)] text-xs mb-1">등락률</div>
          <div className={`text-2xl font-black ${color}`}>
            {sign}{stock.changePercent.toFixed(2)}%
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[var(--text-muted)] text-xs mb-1">시총</div>
            <div className="text-[var(--text-primary)] font-bold text-sm">{mcapText}</div>
          </div>
          <div>
            <div className="text-[var(--text-muted)] text-xs mb-1">거래대금</div>
            <div className="text-[var(--text-primary)] font-bold text-sm">{tvText}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TreemapPage() {
  const { data: sectors, isLoading } = useTreemap()
  const [sizeBy, setSizeBy] = useState<SizeBy>('marketCap')
  const [selected, setSelected] = useState<LeafNode | null>(null)
  const [drilledSector, setDrilledSector] = useState<string | null>(null)

  const currentFilter = FILTERS.find(f => f.key === sizeBy)!
  const totalStocks = sectors?.reduce((sum, s) => sum + s.stocks.length, 0) ?? 0

  return (
    <div className="flex flex-col min-h-[calc(100vh-88px)] bg-[var(--bg-base)]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-white"
        style={{ fontFamily: FONT }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--green)]" />
          <span className="text-base font-black tracking-widest uppercase text-[var(--text-primary)]">
            시가총액 트리맵
          </span>
          <span className="text-sm font-black text-[var(--text-muted)]">
            {drilledSector
              ? `KOSPI · KOSDAQ — ${drilledSector}`
              : `KOSPI · KOSDAQ 상위 ${totalStocks}종목`
            }
          </span>
          {drilledSector && (
            <button
              onClick={() => setDrilledSector(null)}
              className="ml-2 px-2 py-1 text-xs font-bold text-[var(--blue)] border border-[var(--blue)]/30 rounded hover:bg-[var(--blue)]/10 transition-colors"
            >
              ← 전체 보기
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setSizeBy(f.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                sizeBy === f.key
                  ? 'bg-blue-50 text-[var(--blue)] border border-[var(--blue)]/30'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter description + controls */}
      <div
        className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--border)] bg-white"
        style={{ fontFamily: FONT }}
      >
        <span className="text-xs text-[var(--text-dim)]">
          {currentFilter.desc} · 색상 = 등락률 · 스크롤 = 줌 · 드래그 = 이동 · 섹터 클릭 = 확대
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          더블클릭 = 전체보기
        </span>
      </div>

      {/* Treemap + Detail Panel */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-[var(--text-muted)] text-sm" style={{ fontFamily: FONT }}>
                데이터 로딩중...
              </div>
            </div>
          ) : (
            <StockTreemap
              sectors={sectors ?? []}
              sizeBy={sizeBy}
              selectedTicker={selected?.ticker}
              onStockClick={(stock) => setSelected(prev => prev?.ticker === stock.ticker ? null : stock)}
              onSectorDrillDown={setDrilledSector}
            />
          )}
        </div>

        {selected && (
          <DetailPanel stock={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}
