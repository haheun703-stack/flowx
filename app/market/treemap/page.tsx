'use client'

import { useState, useMemo } from 'react'
import { useTreemap, TreemapSector } from '@/features/market-summary/model/useTreemap'
import { StockTreemap, SizeBy, LeafNode } from '@/features/market-summary/ui/StockTreemap'

const FONT = 'var(--font-jetbrains), monospace'

const SIZE_FILTERS: { key: SizeBy; label: string; desc: string }[] = [
  { key: 'marketCap',    label: '시총',   desc: '박스 크기 = 시가총액 비중' },
  { key: 'tradingValue', label: '거래대금', desc: '박스 크기 = 당일 거래대금' },
  { key: 'changeAbs',    label: '등락률',  desc: '박스 크기 = 등락률 절대값' },
]

const MARKET_TABS = ['전체', 'KOSPI', 'KOSDAQ'] as const
type MarketFilter = typeof MARKET_TABS[number]

const DEFAULT_OPEN = 5

function fmt(v: number) {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}조`
  return `${Math.round(v)}억`
}

function fmtPrice(v: number) {
  return v >= 10000 ? `${(v / 10000).toFixed(1)}만` : v.toLocaleString()
}

function changeColor(v: number) {
  return v > 0 ? 'text-[var(--up)]' : v < 0 ? 'text-[var(--down)]' : 'text-[var(--text-muted)]'
}

function changeBg(v: number) {
  return v > 0 ? 'bg-red-50' : v < 0 ? 'bg-blue-50' : 'bg-gray-50'
}

function filterByMarket(sectors: TreemapSector[], market: MarketFilter): TreemapSector[] {
  if (market === '전체') return sectors
  return sectors
    .map(s => ({
      ...s,
      stocks: s.stocks.filter(st => st.market === market),
    }))
    .filter(s => s.stocks.length > 0)
    .map(s => ({
      ...s,
      marketCap: s.stocks.reduce((sum, st) => sum + st.marketCap, 0),
      tradingValue: s.stocks.reduce((sum, st) => sum + st.tradingValue, 0),
      avgChange: s.stocks.length > 0
        ? s.stocks.reduce((sum, st) => sum + st.changePercent * st.marketCap, 0) /
          s.stocks.reduce((sum, st) => sum + st.marketCap, 0)
        : 0,
    }))
    .sort((a, b) => b.marketCap - a.marketCap)
}

/* ── Detail Panel (side) ── */

function DetailPanel({ stock, onClose }: { stock: LeafNode | null; onClose: () => void }) {
  if (!stock) return null

  const isPos = stock.changePercent >= 0
  const color = isPos ? 'text-[var(--up)]' : 'text-[var(--down)]'
  const sign = isPos ? '+' : ''

  return (
    <div className="w-[260px] shrink-0 border-l border-[var(--border)] bg-white flex flex-col" style={{ fontFamily: FONT }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="text-[var(--text-primary)] font-bold text-sm">{stock.name}</span>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none">x</button>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div>
          <div className="text-[var(--text-muted)] text-xs mb-1">종목코드 · {stock.market}</div>
          <div className="text-[var(--text-primary)] font-bold text-sm">{stock.ticker}</div>
        </div>
        <div>
          <div className="text-[var(--text-muted)] text-xs mb-1">섹터</div>
          <div className="text-[var(--yellow)] font-bold text-sm">{stock.sector}</div>
        </div>
        {stock.price > 0 && (
          <div>
            <div className="text-[var(--text-muted)] text-xs mb-1">현재가</div>
            <div className="text-[var(--text-primary)] font-bold text-lg">{stock.price.toLocaleString()}원</div>
          </div>
        )}
        <div className="border-t border-[var(--border)] pt-4">
          <div className="text-[var(--text-muted)] text-xs mb-1">등락률</div>
          <div className={`text-2xl font-black ${color}`}>{sign}{stock.changePercent.toFixed(2)}%</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><div className="text-[var(--text-muted)] text-xs mb-1">시총</div><div className="text-[var(--text-primary)] font-bold text-sm">{fmt(stock.marketCap)}원</div></div>
          <div><div className="text-[var(--text-muted)] text-xs mb-1">거래대금</div><div className="text-[var(--text-primary)] font-bold text-sm">{fmt(stock.tradingValue)}원</div></div>
        </div>
        {(stock.foreignNet !== 0 || stock.instNet !== 0) && (
          <div className="grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-3">
            <div>
              <div className="text-[var(--text-muted)] text-xs mb-1">외국인</div>
              <div className={`font-bold text-sm ${stock.foreignNet >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                {stock.foreignNet >= 0 ? '+' : ''}{fmt(stock.foreignNet)}
              </div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-xs mb-1">기관</div>
              <div className={`font-bold text-sm ${stock.instNet >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                {stock.instNet >= 0 ? '+' : ''}{fmt(stock.instNet)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sector Detail Card ── */

function SectorCard({ sector, defaultOpen }: { sector: TreemapSector; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const sign = sector.avgChange >= 0 ? '+' : ''
  const top = sector.stocks.slice(0, 20)

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-[var(--text-primary)]">{sector.name}</span>
          <span className="text-xs text-[var(--text-muted)]">{sector.stocks.length}종목</span>
          <span className={`text-xs font-bold ${changeColor(sector.avgChange)}`}>{sign}{sector.avgChange.toFixed(2)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">시총 {fmt(sector.marketCap)}</span>
          <span className="text-xs text-[var(--text-muted)]">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-[var(--border)] p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {top.map(s => (
              <div
                key={s.ticker}
                className={`rounded-lg px-3 py-2 ${changeBg(s.changePercent)} border border-transparent hover:border-[var(--border)] transition-colors`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">{s.name}</span>
                  <span className={`text-[10px] font-bold ${changeColor(s.changePercent)}`}>
                    {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span>{s.price > 0 ? `${fmtPrice(s.price)}` : s.ticker}</span>
                  <span>{fmt(s.marketCap)}</span>
                </div>
                {(s.foreignNet !== 0 || s.instNet !== 0) && (
                  <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                    <span className={s.foreignNet >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>
                      외{s.foreignNet >= 0 ? '+' : ''}{fmt(s.foreignNet)}
                    </span>
                    <span className={s.instNet >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>
                      기{s.instNet >= 0 ? '+' : ''}{fmt(s.instNet)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Page ── */

export default function TreemapPage() {
  const { data: sectors, isLoading } = useTreemap()
  const [sizeBy, setSizeBy] = useState<SizeBy>('marketCap')
  const [selected, setSelected] = useState<LeafNode | null>(null)
  const [drilledSector, setDrilledSector] = useState<string | null>(null)
  const [market, setMarket] = useState<MarketFilter>('전체')

  const filtered = useMemo(() => filterByMarket(sectors ?? [], market), [sectors, market])
  const currentFilter = SIZE_FILTERS.find(f => f.key === sizeBy)!
  const totalStocks = filtered.reduce((sum, s) => sum + s.stocks.length, 0)
  const nonEtc = useMemo(() => filtered.filter(s => s.name !== '기타'), [filtered])

  return (
    <div className="flex flex-col min-h-[calc(100vh-88px)] bg-[var(--bg-base)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-white" style={{ fontFamily: FONT }}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--green)]" />
          <span className="text-base font-black tracking-widest uppercase text-[var(--text-primary)]">
            시가총액 트리맵
          </span>
          <span className="text-sm font-black text-[var(--text-muted)]">
            {drilledSector
              ? `${market === '전체' ? 'KOSPI · KOSDAQ' : market} — ${drilledSector}`
              : `${market === '전체' ? 'KOSPI · KOSDAQ' : market} ${totalStocks}종목`
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

        <div className="flex items-center gap-3">
          {/* Market filter */}
          <div className="flex items-center gap-1 border-r border-[var(--border)] pr-3">
            {MARKET_TABS.map(m => (
              <button
                key={m}
                onClick={() => setMarket(m)}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  market === m
                    ? 'bg-green-50 text-[var(--green)] border border-green-200'
                    : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Size filter */}
          <div className="flex items-center gap-1">
            {SIZE_FILTERS.map(f => (
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
      </div>

      {/* Filter description */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--border)] bg-white" style={{ fontFamily: FONT }}>
        <span className="text-xs text-[var(--text-dim)]">
          {currentFilter.desc} · 색상 = 등락률 · 스크롤 = 줌 · 드래그 = 이동 · 섹터 클릭 = 확대
        </span>
        <span className="text-xs text-[var(--text-muted)]">더블클릭 = 전체보기</span>
      </div>

      {/* Treemap + Detail Panel */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 500 }}>
        <div className="flex-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-[var(--text-muted)] text-sm" style={{ fontFamily: FONT }}>데이터 로딩중...</div>
            </div>
          ) : (
            <StockTreemap
              sectors={filtered}
              sizeBy={sizeBy}
              selectedTicker={selected?.ticker}
              onStockClick={(stock) => setSelected(prev => prev?.ticker === stock.ticker ? null : stock)}
              onSectorDrillDown={setDrilledSector}
            />
          )}
        </div>
        {selected && <DetailPanel stock={selected} onClose={() => setSelected(null)} />}
      </div>

      {/* Sector Detail Cards */}
      {!isLoading && nonEtc.length > 0 && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-base)] p-4" style={{ fontFamily: FONT }}>
          <div className="max-w-[1400px] mx-auto space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider mb-2">
              섹터별 상세 ({nonEtc.length}개 섹터)
            </h3>
            {nonEtc.map((s, i) => (
              <SectorCard key={s.name} sector={s} defaultOpen={i < DEFAULT_OPEN} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
