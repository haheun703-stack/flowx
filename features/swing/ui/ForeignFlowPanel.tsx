'use client'

import { useEffect, useState, useMemo } from 'react'

/* ── 타입 ── */
interface FlowStock {
  code: string
  name: string
  sector: string
  mcap_억: number
  foreign_today_억: number
  inst_today_억: number
  close: number
  foreign_5d_억: number
  inst_5d_억: number
  foreign_buy_days: number
  inst_buy_days: number
  is_dual_buy: boolean
  is_quiet_accum: boolean
  rank_single: number
  rank_cumul: number
  rank_dual: number
  price_change_5d_pct: number
}

interface FlowSector {
  sector: string
  foreign_5d_억: number
  inst_5d_억: number
  stock_count: number
  rank: number
  top_stocks: { name: string; foreign_5d: number; inst_5d: number }[]
}

interface FlowData {
  date: string
  stocks: FlowStock[]
  sectors: FlowSector[]
}

type ViewMode = 'stocks' | 'sectors'
type SortKey = 'rank_cumul' | 'foreign_5d_억' | 'inst_5d_억' | 'dual'

/* ── 금액 포맷 ── */
function fmtB(val: number): string {
  if (Math.abs(val) >= 10000) return `${(val / 10000).toFixed(1)}조`
  return `${val >= 0 ? '+' : ''}${Math.round(val).toLocaleString()}`
}

/* ── 메인 뷰 ── */
export default function ForeignFlowPanel() {
  const [data, setData] = useState<FlowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('stocks')
  const [sortKey, setSortKey] = useState<SortKey>('rank_cumul')
  const [filterDual, setFilterDual] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch('/api/intelligence/foreign-flow', { signal: controller.signal })
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        if (json.data) setData(json.data)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error('[ForeignFlow]', e)
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  const sortedStocks = useMemo(() => {
    if (!data?.stocks || !Array.isArray(data.stocks)) return []
    let list = [...data.stocks]
    if (filterDual) list = list.filter((s) => s.is_dual_buy)
    list.sort((a, b) => {
      if (sortKey === 'rank_cumul') return a.rank_cumul - b.rank_cumul
      if (sortKey === 'foreign_5d_억') return b.foreign_5d_억 - a.foreign_5d_억
      if (sortKey === 'inst_5d_억') return b.inst_5d_억 - a.inst_5d_억
      // dual: dual_buy first, then by rank
      if (a.is_dual_buy !== b.is_dual_buy) return a.is_dual_buy ? -1 : 1
      return a.rank_cumul - b.rank_cumul
    })
    return list
  }, [data, sortKey, filterDual])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-gray-100 h-12" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.stocks.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-10 text-center">
        <div className="text-[var(--text-muted,#6B7280)] text-sm font-mono">
          외국인 수급 데이터 없음
        </div>
      </div>
    )
  }

  const dualCount = data.stocks.filter((s) => s.is_dual_buy).length
  const quietCount = data.stocks.filter((s) => s.is_quiet_accum).length

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-3 md:space-y-4">
      {/* 헤더 */}
      <div className="bg-white rounded-xl border-2 border-[#2563EB] px-5 py-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] md:text-[16px] font-bold text-[var(--text-primary,#1A1A2E)] font-mono tracking-wide">
              외국인·기관 수급 X-Ray
            </h2>
            <p className="text-[11px] text-[var(--text-dim,#9CA3AF)] font-mono mt-0.5">
              5영업일 누적 순매수 기준 · {data.date}
            </p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono">종목 수</div>
              <div className="text-[15px] font-mono font-bold text-[var(--text-primary)]">{data.stocks.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono">쌍매수</div>
              <div className="text-[15px] font-mono font-bold text-[#EAB308]">{dualCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono">조용한 매집</div>
              <div className="text-[15px] font-mono font-bold text-[#7C3AED]">{quietCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 뷰 전환 + 필터 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <nav className="flex gap-1 bg-[#F5F4F0] rounded-lg p-1 border border-[#E8E6E0]">
          <button
            onClick={() => setView('stocks')}
            className={`py-2 px-4 rounded-md text-[13px] font-bold transition-colors ${
              view === 'stocks' ? 'bg-[#2563EB] text-white' : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white'
            }`}
          >
            종목별 ({filterDual ? sortedStocks.length : data.stocks.length})
          </button>
          <button
            onClick={() => setView('sectors')}
            className={`py-2 px-4 rounded-md text-[13px] font-bold transition-colors ${
              view === 'sectors' ? 'bg-[#2563EB] text-white' : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white'
            }`}
          >
            섹터별 ({data.sectors.length})
          </button>
        </nav>

        {view === 'stocks' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterDual(!filterDual)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                filterDual
                  ? 'bg-[#FEF9C3] border-[#EAB308] text-[#92400E]'
                  : 'bg-white border-[#E8E6E0] text-[#6B7280]'
              }`}
            >
              &#9889; 쌍매수만
            </button>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-[11px] font-mono px-2 py-1.5 rounded-lg border border-[#E8E6E0] bg-white text-[#6B7280]"
            >
              <option value="rank_cumul">누적 순위</option>
              <option value="foreign_5d_억">외국인 순매수</option>
              <option value="inst_5d_억">기관 순매수</option>
              <option value="dual">쌍매수 우선</option>
            </select>
          </div>
        )}
      </div>

      {/* 종목별 테이블 */}
      {view === 'stocks' && (
        <div className="bg-white rounded-xl border border-[#E8E6E0] overflow-x-auto shadow-sm">
          <table className="w-full text-[12px] font-mono">
            <thead>
              <tr className="bg-[#F5F4F0] text-[#6B7280] text-left">
                <th className="px-3 py-2.5 font-semibold">#</th>
                <th className="px-3 py-2.5 font-semibold">종목</th>
                <th className="px-3 py-2.5 font-semibold text-right">외국인 5일</th>
                <th className="px-3 py-2.5 font-semibold text-right">기관 5일</th>
                <th className="px-3 py-2.5 font-semibold text-center">연속매수</th>
                <th className="px-3 py-2.5 font-semibold text-right">5일 수익</th>
                <th className="px-3 py-2.5 font-semibold text-right">현재가</th>
                <th className="px-3 py-2.5 font-semibold text-center">태그</th>
              </tr>
            </thead>
            <tbody>
              {sortedStocks.slice(0, 50).map((s, i) => {
                const pctColor = s.price_change_5d_pct >= 0 ? '#16A34A' : '#DC2626'
                const fColor = s.foreign_5d_억 >= 0 ? '#2563EB' : '#DC2626'
                const iColor = s.inst_5d_억 >= 0 ? '#DC2626' : '#6B7280'
                return (
                  <tr key={s.code} className="border-t border-[#F0EFE9] hover:bg-[#FAFAF8]">
                    <td className="px-3 py-2 text-[#9CA3AF]">{i + 1}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {s.is_dual_buy && <span className="text-[12px]">&#9889;</span>}
                        <span className="font-bold text-[var(--text-primary,#1A1A2E)]">{s.name}</span>
                        <span className="text-[10px] text-[#9CA3AF]">{s.sector}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums" style={{ color: fColor }}>
                      {fmtB(s.foreign_5d_억)}억
                    </td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums" style={{ color: iColor }}>
                      {fmtB(s.inst_5d_억)}억
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-[#2563EB]">F{s.foreign_buy_days}</span>
                      <span className="text-[#9CA3AF] mx-0.5">/</span>
                      <span className="text-[#DC2626]">I{s.inst_buy_days}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums" style={{ color: pctColor }}>
                      {s.price_change_5d_pct >= 0 ? '+' : ''}{s.price_change_5d_pct.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-muted,#6B7280)]">
                      {s.close.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {s.is_dual_buy && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FEF9C3] text-[#92400E] border border-[#EAB308]">
                            쌍매수
                          </span>
                        )}
                        {s.is_quiet_accum && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                            조용한매집
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 섹터별 뷰 */}
      {view === 'sectors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.sectors.map((sec) => (
            <div key={sec.sector} className="bg-white rounded-xl border border-[#E8E6E0] px-4 py-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-white bg-[#2563EB] rounded px-1.5 py-0.5">
                    {sec.rank}위
                  </span>
                  <span className="text-[14px] font-bold text-[var(--text-primary,#1A1A2E)]">
                    {sec.sector}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF]">{sec.stock_count}종목</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[12px] font-mono font-bold" style={{ color: sec.foreign_5d_억 >= 0 ? '#2563EB' : '#DC2626' }}>
                  외인 {fmtB(sec.foreign_5d_억)}억
                </span>
                <span className="text-[12px] font-mono font-bold" style={{ color: sec.inst_5d_억 >= 0 ? '#DC2626' : '#6B7280' }}>
                  기관 {fmtB(sec.inst_5d_억)}억
                </span>
              </div>
              {Array.isArray(sec.top_stocks) && sec.top_stocks.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sec.top_stocks.slice(0, 5).map((t) => (
                    <span key={t.name} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5F4F0] text-[#6B7280]">
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 범례 */}
      <div className="flex items-center gap-4 flex-wrap text-[10px] font-mono text-[var(--text-dim,#9CA3AF)] pt-2 border-t border-[var(--border,#E8E6E0)]">
        <span>&#9889; 쌍매수 = 외국인+기관 동시 순매수</span>
        <span className="text-[#7C3AED]">조용한 매집 = 수급↑ 가격↓</span>
        <span>F = 외국인 연속매수일 / I = 기관 연속매수일</span>
      </div>
    </div>
  )
}
