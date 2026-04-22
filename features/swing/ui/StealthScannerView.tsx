'use client'

import { useEffect, useState, useMemo } from 'react'

/* ── 타입 (intelligence_oneshot_stealth) ── */
interface StealthStock {
  name: string
  ticker: string
  chg_pct: number
  frgn_buy: number
  inst_buy: number
  dual_total: number
  signal_date: string
  latest_close: number
  signal_close: number
}

interface StealthResponse {
  date: string
  lookback_days: number
  stealth_count: number
  gone_count: number
  failed_count: number
  stocks: StealthStock[]
}

/* ── 금액 포맷 ── */
function fmtBillion(val: number): string {
  if (Math.abs(val) >= 10000) return `${(val / 10000).toFixed(1)}조`
  if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}천억`
  return `${Math.round(val)}억`
}

/* ── 종목 카드 ── */
function StealthCard({ stock }: { stock: StealthStock }) {
  const isDual = stock.frgn_buy > 0 && stock.inst_buy > 0
  const pctColor = stock.chg_pct >= 0 ? '#16A34A' : '#DC2626'

  return (
    <div
      className="bg-white rounded-xl px-4 py-3.5 shadow-sm transition-all hover:shadow-md"
      style={{
        border: isDual ? '2px solid #EAB308' : '1px solid var(--border, #E8E6E0)',
      }}
    >
      {/* 상단: 종목명 + 티커 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {isDual && <span className="text-[14px]" title="쌍매수 (기관+외인 동시)">&#9889;</span>}
          <span className="text-[14px] font-bold text-[var(--text-primary,#1A1A2E)] truncate">
            {stock.name}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5F4F0] text-[var(--text-muted,#6B7280)] shrink-0">
            {stock.ticker}
          </span>
        </div>
        <span className="text-[13px] font-mono font-bold tabular-nums" style={{ color: pctColor }}>
          {stock.chg_pct >= 0 ? '+' : ''}{stock.chg_pct.toFixed(1)}%
        </span>
      </div>

      {/* 중간: 수급 */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[11px] font-mono text-[#DC2626] font-semibold">
          기관 +{fmtBillion(stock.inst_buy)}
        </span>
        <span className="text-[11px] font-mono text-[#2563EB] font-semibold">
          외인 +{fmtBillion(stock.frgn_buy)}
        </span>
        <span className="text-[11px] font-mono text-[#7C3AED] font-bold">
          합계 {fmtBillion(stock.dual_total)}
        </span>
      </div>

      {/* 하단: 포착가 → 현재가 + 포착일 */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted,#6B7280)]">
        <span>포착 {stock.signal_close.toLocaleString()}원 → 현재 {stock.latest_close.toLocaleString()}원</span>
        <span className="text-[10px]">포착일 {stock.signal_date}</span>
      </div>
    </div>
  )
}

/* ── 메인 뷰 ── */
export default function StealthScannerView() {
  const [data, setData] = useState<StealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch('/api/intelligence/stealth', { signal: controller.signal })
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        if (json.data) setData(json.data)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error('[StealthScanner]', e)
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  const stocks = useMemo(() => {
    if (!data?.stocks || !Array.isArray(data.stocks)) return []
    return [...data.stocks].sort((a, b) => b.dual_total - a.dual_total)
  }, [data])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-10 text-center">
        <div className="text-[var(--text-muted,#6B7280)] text-sm font-mono">
          선매집 데이터 없음 (장마감 후 갱신)
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-3 md:space-y-4">
      {/* 헤더 */}
      <div className="bg-white rounded-xl border-2 border-[#00FF88] px-5 py-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] md:text-[16px] font-bold text-[var(--text-primary,#1A1A2E)] font-mono tracking-wide">
              선매집 탐지 — 외국인·기관 쌍매수 {data.lookback_days}일 추적
            </h2>
            <p className="text-[11px] text-[var(--text-dim,#9CA3AF)] font-mono mt-0.5">
              조용히 매수 중이지만 아직 주가가 크게 움직이지 않은 종목
            </p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono">잠복</div>
              <div className="text-[15px] font-mono font-bold text-[#7C3AED]">{data.stealth_count}</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono">이탈(상승)</div>
              <div className="text-[15px] font-mono font-bold text-[#16A34A]">{data.gone_count}</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono">실패</div>
              <div className="text-[15px] font-mono font-bold text-[#DC2626]">{data.failed_count}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 카드 리스트 */}
      {stocks.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] text-sm font-mono py-8">
          잠복 종목 없음
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stocks.map((stock) => (
            <StealthCard key={stock.ticker} stock={stock} />
          ))}
        </div>
      )}

      {/* 범례 */}
      <div className="flex items-center gap-4 flex-wrap text-[10px] font-mono text-[var(--text-dim,#9CA3AF)] pt-2 border-t border-[var(--border,#E8E6E0)]">
        <span>&#9889; 금테 = 쌍매수(기관+외인 동시)</span>
        <span className="text-[#DC2626]">기관 순매수</span>
        <span className="text-[#2563EB]">외인 순매수</span>
        <span>기준: {data.date} | 합계 순매수 기준 정렬</span>
      </div>
    </div>
  )
}
