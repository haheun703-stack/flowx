"use client"

import { useEffect, useState, useMemo } from "react"

/* ── Types ── */
interface PensionStock {
  code: string
  name: string
  sector: string
  cap: number
  pension_consec: number
  pension_cum: number
  fi_today: number
  fi_3d: number
  fi_joined: "TODAY" | "YESTERDAY" | string
  ret5: number
  close: number
}

interface RankedStock {
  code: string
  name: string
  sector: string
  cap: number
  pension_buy_days: number
  pension_cum: number
  fi_today: number
  fi_3d: number
  fi_joined: "TODAY" | "YESTERDAY" | string
  ret5: number
  close: number
  pension_score: number
}

interface PensionScanData {
  date: string
  total_count: number
  best_count: number
  best_fresh_count: number
  standby_count: number
  best_stocks: PensionStock[]
  best_fresh: PensionStock[]
  standby_stocks: PensionStock[]
  ranked_stocks: RankedStock[]
}

type SubTab = "all" | "fresh" | "standby"

interface SectorGroup {
  sector: string
  stocks: PensionStock[]
  totalPension: number
  totalFi: number
}

/* ── Helpers ── */
function fmtAmt(v: number): string {
  const abs = Math.abs(v)
  const sign = v >= 0 ? "+" : "-"
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1)}조`
  return `${sign}${Math.round(abs).toLocaleString()}억`
}

function fmtPrice(v: number): string {
  return v.toLocaleString()
}

function flowClr(v: number): string {
  return v > 0 ? "#DC2626" : v < 0 ? "#2563EB" : "#6B7280"
}

/* ── 미발화 행 스타일 ── */
function freshRowStyle(ret5: number): { bg: string; star: boolean; starColor: string } {
  if (ret5 < 0) return { bg: "rgba(22,163,74,0.08)", star: true, starColor: "#16a34a" }
  if (ret5 <= 3) return { bg: "rgba(22,163,74,0.05)", star: true, starColor: "#22c55e" }
  if (ret5 < 5) return { bg: "transparent", star: true, starColor: "#86efac" }
  return { bg: "transparent", star: false, starColor: "" }
}

/* ── 합류 뱃지 ── */
function JoinedBadge({ joined }: { joined: string }) {
  if (joined === "TODAY") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-bold bg-[#FF4444] text-white">
        오늘
      </span>
    )
  }
  if (joined === "YESTERDAY") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-bold bg-[#FF8C00] text-white">
        어제
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-bold bg-[#9CA3AF] text-white">
      대기
    </span>
  )
}

/* ── 섹터별 그룹핑 ── */
function groupBySector(stocks: PensionStock[]): SectorGroup[] {
  const grouped: Record<string, PensionStock[]> = {}
  for (const s of stocks) {
    const sector = s.sector || "기타"
    if (!grouped[sector]) grouped[sector] = []
    grouped[sector].push(s)
  }
  return Object.entries(grouped)
    .map(([sector, stocks]) => ({
      sector,
      stocks,
      totalPension: stocks.reduce((sum, x) => sum + x.pension_cum, 0),
      totalFi: stocks.reduce((sum, x) => sum + x.fi_today, 0),
    }))
    .sort((a, b) => b.totalPension - a.totalPension)
}

/* ── 섹터 카드 (핵심후보용) ── */
function BestSectorCard({ group }: { group: SectorGroup }) {
  return (
    <div className="rounded-xl border border-[#E2E5EA] overflow-hidden bg-white">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[#E2E5EA]/60 bg-[#FAFAFA]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[18px] font-bold text-[#1A1A2E]">{group.sector}</span>
          <span className="text-[14px] text-[#6B7280]">
            연기금: <b style={{ color: flowClr(group.totalPension) }}>{fmtAmt(group.totalPension)}</b>
          </span>
          <span className="text-[14px] text-[#6B7280]">
            금투: <b style={{ color: flowClr(group.totalFi) }}>{fmtAmt(group.totalFi)}</b>
          </span>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#F5F4F0]/60">
              <th className="text-left py-2.5 px-3 font-bold text-[#1A1A2E]">종목</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">종가</th>
              <th className="text-center py-2.5 px-3 font-bold text-[#1A1A2E]">연기금</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">누적</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E] hidden md:table-cell">금투오늘</th>
              <th className="text-center py-2.5 px-3 font-bold text-[#1A1A2E] hidden md:table-cell">합류</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">5d수익</th>
            </tr>
          </thead>
          <tbody>
            {group.stocks.map((s) => {
              const ret5 = s.ret5 ?? 0
              const fr = freshRowStyle(ret5)
              const pc = s.pension_consec ?? 0
              const consecColor = pc >= 5 ? "#DC2626" : pc >= 3 ? "#2563EB" : "#1A1A2E"
              const fiBold = Math.abs(s.fi_today ?? 0) > 100

              return (
                <tr key={s.code} className="border-t border-[#e5e7ef]/40 hover:bg-white/60" style={{ background: fr.bg }}>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#1A1A2E]">{s.name ?? '—'}</span>
                    <span className="text-[12px] text-[#9ca3b8] ml-1.5">{s.code ?? ''}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#1A1A2E]">{fmtPrice(s.close ?? 0)}</td>
                  <td className="py-2.5 px-3 text-center tabular-nums font-semibold" style={{ color: consecColor }}>
                    {pc}d
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold" style={{ color: flowClr(s.pension_cum ?? 0) }}>
                    {fmtAmt(s.pension_cum ?? 0)}
                  </td>
                  <td className={`py-2.5 px-3 text-right tabular-nums hidden md:table-cell ${fiBold ? "font-bold text-[#1A1A2E]" : "text-[#1A1A2E]"}`}>
                    {fmtAmt(s.fi_today ?? 0)}
                  </td>
                  <td className="py-2.5 px-3 text-center hidden md:table-cell">
                    <JoinedBadge joined={s.fi_joined ?? ''} />
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                    <span style={{ color: ret5 < 0 ? "#16a34a" : ret5 <= 3 ? "#1A1A2E" : "#9CA3AF" }}>
                      {ret5 >= 0 ? "+" : ""}{ret5.toFixed(1)}%
                    </span>
                    {fr.star && <span className="ml-1 font-bold" style={{ color: fr.starColor }}>★</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── 섹터 카드 (대기용) ── */
function StandbySectorCard({ group }: { group: SectorGroup }) {
  return (
    <div className="rounded-xl border border-[#E2E5EA] overflow-hidden bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[#E2E5EA]/60">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[18px] font-bold text-[#1A1A2E]">{group.sector}</span>
          <span className="text-[14px] text-[#6B7280]">
            연기금: <b style={{ color: flowClr(group.totalPension) }}>{fmtAmt(group.totalPension)}</b>
          </span>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#F5F4F0]/60">
              <th className="text-left py-2.5 px-3 font-bold text-[#1A1A2E]">종목</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">종가</th>
              <th className="text-center py-2.5 px-3 font-bold text-[#1A1A2E]">연기금</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">누적</th>
              <th className="text-center py-2.5 px-3 font-bold text-[#1A1A2E] hidden md:table-cell">상태</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">5d수익</th>
            </tr>
          </thead>
          <tbody>
            {group.stocks.map((s) => {
              const ret5 = s.ret5 ?? 0
              const fr = freshRowStyle(ret5)
              const pc = s.pension_consec ?? 0
              const consecColor = pc >= 5 ? "#DC2626" : pc >= 3 ? "#2563EB" : "#1A1A2E"

              return (
                <tr key={s.code} className="border-t border-[#e5e7ef]/40 hover:bg-white/60" style={{ background: fr.bg }}>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#1A1A2E]">{s.name ?? '—'}</span>
                    <span className="text-[12px] text-[#9ca3b8] ml-1.5">{s.code ?? ''}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#1A1A2E]">{fmtPrice(s.close ?? 0)}</td>
                  <td className="py-2.5 px-3 text-center tabular-nums font-semibold" style={{ color: consecColor }}>
                    {pc}d
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold" style={{ color: flowClr(s.pension_cum ?? 0) }}>
                    {fmtAmt(s.pension_cum ?? 0)}
                  </td>
                  <td className="py-2.5 px-3 text-center hidden md:table-cell">
                    <JoinedBadge joined="" />
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                    <span style={{ color: ret5 < 0 ? "#16a34a" : ret5 <= 3 ? "#1A1A2E" : "#9CA3AF" }}>
                      {ret5 >= 0 ? "+" : ""}{ret5.toFixed(1)}%
                    </span>
                    {fr.star && <span className="ml-1 font-bold" style={{ color: fr.starColor }}>★</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── TOP 랭킹 테이블 ── */
function TopRankingTable({ stocks }: { stocks: RankedStock[] }) {
  if (stocks.length === 0) return null

  return (
    <div className="rounded-xl border border-[#E2E5EA] overflow-hidden bg-white mb-5">
      <div className="px-5 py-4 border-b border-[#E2E5EA]/60 bg-[#FAFAFA]">
        <span className="text-[18px] font-bold text-[#1A1A2E]">TOP 랭킹</span>
        <span className="text-[14px] text-[#6B7280] ml-3">점수순 상위 {stocks.length}종목</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#F5F4F0]/60">
              <th className="text-center py-2.5 px-3 font-bold text-[#1A1A2E] w-12">순위</th>
              <th className="text-left py-2.5 px-3 font-bold text-[#1A1A2E]">종목</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">점수</th>
              <th className="text-center py-2.5 px-3 font-bold text-[#1A1A2E]">연기금</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">누적</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E] hidden md:table-cell">금투오늘</th>
              <th className="text-center py-2.5 px-3 font-bold text-[#1A1A2E]">합류</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">5d수익</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, idx) => {
              const ret5 = s.ret5 ?? 0
              const fr = freshRowStyle(ret5)
              const days = s.pension_buy_days ?? 0
              const daysColor = days >= 10 ? "#DC2626" : days >= 7 ? "#2563EB" : "#1A1A2E"
              const score = s.pension_score ?? 0
              const scoreBg = score >= 300 ? "#DC2626" : score >= 200 ? "#F97316" : "#2563EB"

              return (
                <tr key={s.code} className="border-t border-[#e5e7ef]/40 hover:bg-white/60" style={{ background: fr.bg }}>
                  <td className="py-2.5 px-3 text-center font-bold text-[#9CA3AF]">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#1A1A2E]">{s.name ?? '—'}</span>
                    <span className="text-[12px] text-[#9ca3b8] ml-1.5">{s.code ?? ''}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-0.5 rounded text-[12px] font-bold text-white" style={{ background: scoreBg }}>
                      {score}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center tabular-nums font-semibold" style={{ color: daysColor }}>
                    {days}d
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold" style={{ color: flowClr(s.pension_cum ?? 0) }}>
                    {fmtAmt(s.pension_cum ?? 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums hidden md:table-cell" style={{ color: flowClr(s.fi_today ?? 0) }}>
                    {fmtAmt(s.fi_today ?? 0)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <JoinedBadge joined={s.fi_joined ?? ''} />
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                    <span style={{ color: ret5 < 0 ? "#16a34a" : ret5 <= 3 ? "#1A1A2E" : "#9CA3AF" }}>
                      {ret5 >= 0 ? "+" : ""}{ret5.toFixed(1)}%
                    </span>
                    {fr.star && <span className="ml-1 font-bold" style={{ color: fr.starColor }}>★</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Main Panel ── */
export default function PensionScanPanel() {
  const [data, setData] = useState<PensionScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState<SubTab>("all")

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/intelligence/pension-scan", { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          const d = j.data
          setData({
            ...d,
            best_stocks: Array.isArray(d.best_stocks) ? d.best_stocks : [],
            best_fresh: Array.isArray(d.best_fresh) ? d.best_fresh : [],
            standby_stocks: Array.isArray(d.standby_stocks) ? d.standby_stocks : [],
            ranked_stocks: Array.isArray(d.ranked_stocks) ? d.ranked_stocks : [],
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  // 탭별 그룹핑
  const bestGroups = useMemo(() => data ? groupBySector(data.best_stocks) : [], [data])
  const freshGroups = useMemo(() => data ? groupBySector(data.best_fresh) : [], [data])
  const standbyGroups = useMemo(() => data ? groupBySector(data.standby_stocks) : [], [data])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-8">
        <div className="animate-pulse h-40 bg-[#F5F4F0] rounded-xl" />
      </div>
    )
  }

  if (!data || (data.best_count === 0 && data.standby_count === 0)) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-8">
        <div className="bg-white border border-[#E2E5EA] rounded-xl p-6 text-center text-[#9CA3AF]">
          오늘은 감지된 종목이 없습니다
        </div>
      </div>
    )
  }

  const activeGroups = subTab === "all" ? bestGroups : subTab === "fresh" ? freshGroups : standbyGroups
  const emptyMsg = subTab === "standby"
    ? "연기금 연속매수 종목이 없습니다"
    : "오늘은 연기금+금투 합류 종목이 없습니다"

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6">
      {/* 헤더 */}
      <div className="mb-4">
        <h2 className="text-[19px] font-bold text-[#1A1A2E]">
          매집 합류 시그널
        </h2>
        <p className="text-[14px] text-[#6B7280] mt-1">
          연기금 7일+ 매수 → 금투 합류 시 D+5 +1.6% · {data.date} 기준
        </p>
      </div>

      {/* 3-탭 */}
      <nav className="flex gap-1.5 mb-4 flex-wrap">
        {([
          { key: "all" as SubTab, label: `전체 ${data.best_count}` },
          { key: "fresh" as SubTab, label: `미발화 ${data.best_fresh_count}` },
          { key: "standby" as SubTab, label: `대기 ${data.standby_count}` },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`py-1.5 px-3.5 rounded-lg text-[14px] font-semibold transition-all ${
              subTab === t.key
                ? "bg-[#00FF88] text-[#1A1A2E] shadow-sm"
                : "bg-[#F5F4F0] text-[#9CA3AF] hover:text-[#1A1A2E]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* TOP 랭킹 */}
      <TopRankingTable stocks={data.ranked_stocks} />

      {/* 섹터 카드 목록 */}
      <div className="space-y-4">
        {activeGroups.length === 0 ? (
          <div className="text-center py-8 text-[#9CA3AF]">
            {emptyMsg}
          </div>
        ) : subTab === "standby" ? (
          activeGroups.map((g) => <StandbySectorCard key={g.sector} group={g} />)
        ) : (
          activeGroups.map((g) => <BestSectorCard key={g.sector} group={g} />)
        )}
      </div>
    </div>
  )
}
