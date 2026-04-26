"use client"

import { useState, useEffect, useMemo } from "react"

/* ─── Types ─── */
interface PerfItem {
  rank: number
  code: string
  name: string
  sector: string
  score: number
  open_price: number
  close_price: number
  high_price: number
  low_price: number
  return_pct: number
  volume: number
}

interface PerfData {
  date: string
  avg_return: number
  best_pick: string
  worst_pick: string
  weekly_return: number
  weekly_days: number
  weekly_wins: number
  monthly_return: number
  monthly_days: number
  monthly_wins: number
  items: PerfItem[]
}

interface ChartPoint {
  date: string
  avg_return: number
}

/* ─── Helpers ─── */
const pctCls = (v: number) => (v >= 0 ? "text-green-600" : "text-red-500")
const pctStr = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`
const fmt = (v: number) => v.toLocaleString("ko-KR")
const rankMedal = (r: number) =>
  r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `${r}️⃣`

/* ─── Component ─── */
export default function DaytradingPerformancePanel() {
  const [latest, setLatest] = useState<PerfData | null>(null)
  const [chart, setChart] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/intelligence/daytrading-performance", { signal: ac.signal })
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json() })
      .then((j) => {
        setLatest(j.latest)
        setChart(j.chart ?? [])
        setLoading(false)
      })
      .catch((e) => { if (e.name !== "AbortError") setLoading(false) })
    return () => ac.abort()
  }, [])

  const cumulative = useMemo(() => {
    let sum = 0
    return chart.map((c) => { sum += c.avg_return; return sum })
  }, [chart])

  if (loading)
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-4">
        <div className="animate-pulse h-40 bg-gray-100 rounded-2xl" />
      </div>
    )

  if (!latest)
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-4">
        <div className="bg-white rounded-xl border border-[#E2E5EA] shadow p-6 text-center">
          <p className="text-[#6B7280] text-sm">📊 성적표 데이터가 아직 없습니다. 첫 발행은 다음 거래일 16:30입니다.</p>
        </div>
      </div>
    )

  const items = latest.items ?? []

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-4 space-y-4 md:space-y-5">
      {/* ── 오늘의 성적표 ── */}
      <div className="bg-white rounded-xl border border-[#E2E5EA] shadow p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="text-lg font-bold text-[#1A1A2E]">📊 단타 TOP 5 성적표</h3>
          <span className="text-sm text-[#6B7280]">{latest.date}</span>
          <span className={`text-xl font-bold ml-auto ${pctCls(latest.avg_return)}`}>
            평균 {pctStr(latest.avg_return)}
          </span>
        </div>

        {/* 종목별 리스트 */}
        {items.length > 0 && (
          <div className="space-y-2 mb-4">
            {items.map((it) => (
              <div
                key={it.code}
                className="flex items-center gap-3 flex-wrap bg-[#FAFAF8] rounded-lg px-3 py-2 text-sm"
              >
                <span className="w-6 text-center">{rankMedal(it.rank)}</span>
                <span className="font-semibold text-[#1A1A2E] min-w-[80px]">{it.name}</span>
                <span className="text-[#9CA3AF] text-xs">{it.sector}</span>
                <span className="ml-auto text-[#6B7280] font-mono">
                  {fmt(it.open_price)}→{fmt(it.close_price)}
                </span>
                <span className={`font-bold font-mono w-20 text-right ${pctCls(it.return_pct)}`}>
                  {pctStr(it.return_pct)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 최고/최저 + 주간/월간 배지 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-[#6B7280]">최고 수익</p>
            <p className="font-bold text-green-600 text-sm">{latest.best_pick}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-[#6B7280]">최저 수익</p>
            <p className="font-bold text-red-500 text-sm">{latest.worst_pick}</p>
          </div>
          <div className="bg-[#F5F4F0] rounded-lg p-3 text-center">
            <p className="text-[11px] text-[#6B7280]">주간</p>
            <p className={`font-bold text-sm ${pctCls(latest.weekly_return)}`}>
              {pctStr(latest.weekly_return)}
            </p>
            <p className="text-[10px] text-[#9CA3AF]">
              {latest.weekly_wins}/{latest.weekly_days}일 승
            </p>
          </div>
          <div className="bg-[#F5F4F0] rounded-lg p-3 text-center">
            <p className="text-[11px] text-[#6B7280]">월간</p>
            <p className={`font-bold text-sm ${pctCls(latest.monthly_return)}`}>
              {pctStr(latest.monthly_return)}
            </p>
            <p className="text-[10px] text-[#9CA3AF]">
              {latest.monthly_wins}/{latest.monthly_days}일 승
            </p>
          </div>
        </div>
      </div>

      {/* ── 수익률 바 차트 (최근 20거래일) ── */}
      {chart.length > 1 && (
        <div className="bg-white rounded-xl border border-[#E2E5EA] shadow p-5">
          <h3 className="font-bold text-[#1A1A2E] mb-3">
            📈 일별 수익률 <span className="text-xs font-normal text-[#9CA3AF]">최근 {chart.length}거래일</span>
          </h3>
          <div className="relative h-40">
            {/* 0선 */}
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-[#E8E6E0]" />
            <div className="flex items-end justify-between h-full gap-[2px]">
              {chart.map((c, i) => {
                const maxAbs = Math.max(...chart.map((p) => Math.abs(p.avg_return)), 1)
                const h = (Math.abs(c.avg_return) / maxAbs) * 50
                const isUp = c.avg_return >= 0
                return (
                  <div key={c.date} className="flex-1 flex flex-col items-center justify-center h-full relative group">
                    {/* 바 */}
                    {isUp ? (
                      <div className="absolute bottom-1/2 w-full flex justify-center">
                        <div
                          className="bg-green-400 rounded-t-sm w-full max-w-[16px]"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ) : (
                      <div className="absolute top-1/2 w-full flex justify-center">
                        <div
                          className="bg-red-400 rounded-b-sm w-full max-w-[16px]"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    )}
                    {/* 누적선 점 */}
                    {cumulative[i] !== undefined && (
                      <div
                        className="absolute w-1.5 h-1.5 rounded-full bg-blue-500 z-10"
                        style={{
                          bottom: `${50 + (cumulative[i] / (Math.max(...cumulative.map(Math.abs), 1)) * 45)}%`,
                        }}
                      />
                    )}
                    {/* 툴팁 */}
                    <div className="absolute bottom-0 opacity-0 group-hover:opacity-100 text-[9px] text-[#6B7280] whitespace-nowrap -translate-y-full z-20 bg-white px-1 rounded shadow">
                      {c.date.slice(5)} {pctStr(c.avg_return)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
            <span>{chart[0]?.date.slice(5)}</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-sm inline-block" /> 양수
              <span className="w-2 h-2 bg-red-400 rounded-sm inline-block ml-2" /> 음수
              <span className="w-2 h-2 bg-blue-500 rounded-full inline-block ml-2" /> 누적
            </span>
            <span>{chart[chart.length - 1]?.date.slice(5)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
