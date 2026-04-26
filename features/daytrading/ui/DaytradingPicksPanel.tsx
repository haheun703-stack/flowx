"use client"

import { useState, useEffect, useMemo } from "react"

/* ─── Types ─── */
interface Pick {
  rank: number
  code: string
  name: string
  sector: string
  track: string // "A_대형주" | "B_중소형주"
  mcap_억: number
  close: number
  entry_low: number
  entry_high: number
  tp1: number
  tp2: number
  sl: number
  upside_to_tp1_pct: number
  final_score: number
  score: number
  buy_days: number
  inst_joining: number
  "price_change_%": number
  key_reasons: string
  foreign_total_억: number | null
  inst_total_억: number | null
  dual_total_억: number | null
  etf_alt_code: string
  etf_alt_name: string
  etf_alt_theme: string
}

interface PicksData {
  date: string
  mode: "preview" | "confirmed"
  updated_at: string
  picks_count: number
  track_a_count: number
  track_b_count: number
  ewy_1d: number | null
  ewy_5d: number | null
  ks200_1d: number | null
  ks200_5d: number | null
  ewy_source: string
  picks: Pick[]
}

type TrackFilter = "all" | "A" | "B"

/* ─── Helpers ─── */
const fmt = (v: number) => v.toLocaleString("ko-KR")
const fmtPct = (v: number | null) => {
  if (v == null) return "-"
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`
}
const rankMedal = (r: number) =>
  r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `${r}`

function ewyInfo(pct: number | null) {
  if (pct == null) return { icon: "❓", text: "EWY 데이터 없음", cls: "text-gray-400" }
  if (pct >= 5) return { icon: "🔥", text: "외국인 한국 폭발매수", cls: "text-red-500" }
  if (pct >= 2) return { icon: "✅", text: "외국인 한국 순매수", cls: "text-green-600" }
  if (pct <= -2) return { icon: "⚠️", text: "외국인 한국 순매도", cls: "text-amber-500" }
  return { icon: "➖", text: "외국인 수급 중립", cls: "text-gray-500" }
}

/* ─── Component ─── */
export default function DaytradingPicksPanel() {
  const [data, setData] = useState<PicksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [track, setTrack] = useState<TrackFilter>("all")

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/intelligence/daytrading-picks", { signal: ac.signal })
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json() })
      .then((j) => { setData(j.data); setLoading(false) })
      .catch((e) => { if (e.name !== "AbortError") setLoading(false) })
    return () => ac.abort()
  }, [])

  const filtered = useMemo(() => {
    if (!data?.picks) return []
    if (track === "all") return data.picks
    return data.picks.filter((p) => p.track.startsWith(track))
  }, [data, track])

  const etfTop3 = useMemo(() => {
    if (!data?.picks) return []
    const map = new Map<string, { code: string; name: string; theme: string; stocks: string[] }>()
    for (const p of data.picks) {
      if (!p.etf_alt_code) continue
      const e = map.get(p.etf_alt_code)
      if (e) e.stocks.push(p.name)
      else map.set(p.etf_alt_code, { code: p.etf_alt_code, name: p.etf_alt_name, theme: p.etf_alt_theme, stocks: [p.name] })
    }
    return [...map.values()].sort((a, b) => b.stocks.length - a.stocks.length).slice(0, 3)
  }, [data])

  /* ── Loading ── */
  if (loading)
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-100 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-56 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    )

  /* ── No data (휴장일 등) ── */
  if (!data)
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-16 text-center">
        <p className="text-2xl mb-2">📅</p>
        <p className="text-[#6B7280]">오늘은 장이 닫힌 날이거나 아직 데이터가 발행되지 않았습니다.</p>
      </div>
    )

  /* ── Empty picks ── */
  if (data.picks_count === 0)
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-16 text-center">
        <p className="text-2xl mb-2">🔍</p>
        <p className="text-[#6B7280]">오늘은 필터 통과 종목이 없습니다. ({data.date})</p>
      </div>
    )

  const isConfirmed = data.mode === "confirmed"
  const ewy = ewyInfo(data.ewy_1d)
  const updatedKST = new Date(data.updated_at).toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const TRACK_TABS: { key: TrackFilter; label: string }[] = [
    { key: "all", label: `전체 (${data.picks_count})` },
    { key: "A", label: `🔷 대형주 (${data.track_a_count})` },
    { key: "B", label: `🟢 중소형주 (${data.track_b_count})` },
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-4 md:space-y-5">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-[#E2E5EA] shadow p-5">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h2 className="text-xl font-bold text-[#1A1A2E]">🎯 단타 TOP픽</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isConfirmed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {isConfirmed ? "✅ 확정 · 미국장 반영" : "📢 프리뷰 · 국장 마감 기준"}
          </span>
          <span className="text-sm text-[#6B7280]">
            {data.date} {updatedKST}
          </span>
        </div>

        {/* EWY/KS200 — confirmed만 표시 */}
        {isConfirmed && data.ewy_1d != null && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className={`font-semibold ${ewy.cls}`}>
              {ewy.icon} EWY {fmtPct(data.ewy_1d)}
              {data.ewy_5d != null && (
                <span className="text-[#9CA3AF] font-normal ml-1">(5D {fmtPct(data.ewy_5d)})</span>
              )}
            </span>
            <span className="text-[#6B7280]">
              KS200 {fmtPct(data.ks200_1d)}
              {data.ks200_5d != null && (
                <span className="ml-1">(5D {fmtPct(data.ks200_5d)})</span>
              )}
            </span>
            <span className={`font-medium ${ewy.cls}`}>{ewy.text}</span>
          </div>
        )}
        {isConfirmed && data.ewy_source === "none" && (
          <p className="text-xs text-amber-500 mt-1">⚠️ EWY 데이터를 가져올 수 없었습니다 (미국장 미개장 등)</p>
        )}
      </div>

      {/* ── Track Filter ── */}
      <div className="flex gap-2 flex-wrap">
        {TRACK_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTrack(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              track === t.key
                ? "bg-[#00FF88] text-[#1A1A2E]"
                : "bg-[#F5F4F0] text-[#6B7280] hover:bg-white border border-[#E2E5EA]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Card Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const isA = p.track.startsWith("A")
          return (
            <div
              key={p.code}
              className={`bg-white rounded-xl border border-[#E2E5EA] shadow-sm hover:shadow-md transition-shadow duration-150 p-4 border-l-4 ${
                isA ? "border-l-blue-500" : "border-l-emerald-500"
              }`}
            >
              {/* Rank + Name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-lg mr-1.5">{rankMedal(p.rank)}</span>
                  <span className="font-bold text-[#1A1A2E]">{p.name}</span>
                  <span className="text-[#9CA3AF] text-xs ml-1.5">({p.code})</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F5F4F0] text-[#6B7280]">
                  {p.final_score.toFixed(1)}점
                </span>
              </div>

              {/* Price + Sector */}
              <div className="text-sm text-[#6B7280] mb-3">
                <span className="font-semibold text-[#1A1A2E]">{fmt(p.close)}원</span>
                <span className="mx-1.5">·</span>
                <span>시총 {fmt(p.mcap_억)}억</span>
                <span className="mx-1.5">·</span>
                <span>{p.sector}</span>
              </div>

              {/* Entry / Target / SL */}
              <div className="bg-[#FAFAF8] rounded-lg p-3 mb-3 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">진입</span>
                  <span className="font-medium text-[#1A1A2E]">{fmt(p.entry_low)} ~ {fmt(p.entry_high)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">목표 1</span>
                  <span className="font-medium text-green-600">{fmt(p.tp1)} (+{p.upside_to_tp1_pct.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">목표 2</span>
                  <span className="font-medium text-green-600">{fmt(p.tp2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">손절</span>
                  <span className="font-medium text-red-500">{fmt(p.sl)}</span>
                </div>
              </div>

              {/* Key Reasons */}
              <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">{p.key_reasons}</p>

              {/* Supply Info */}
              <div className="flex flex-wrap gap-2 text-xs mb-3">
                {p.foreign_total_억 != null && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                    외인 {p.buy_days}일 {p.foreign_total_억 > 0 ? "+" : ""}{fmt(Math.round(p.foreign_total_억))}억
                  </span>
                )}
                {p.inst_joining > 0 && (
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600">
                    기관 합류 {p.inst_joining}일
                  </span>
                )}
              </div>

              {/* ETF Alternative */}
              {p.etf_alt_code && (
                <div className="text-xs text-[#9CA3AF] border-t border-[#F0EDE8] pt-2">
                  🔗 {p.etf_alt_name} ({p.etf_alt_code}) [{p.etf_alt_theme}]
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── ETF TOP 3 집계 ── */}
      {etfTop3.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E5EA] shadow p-5">
          <h3 className="font-bold text-[#1A1A2E] mb-3">🔗 오늘의 섹터 ETF TOP 3 <span className="text-xs font-normal text-[#9CA3AF]">(개별 종목 대신 분산진입)</span></h3>
          <div className="space-y-2">
            {etfTop3.map((e, i) => (
              <div key={e.code} className="flex items-start gap-2 text-sm">
                <span className="font-bold text-[#6B7280] w-5">{i + 1}.</span>
                <div>
                  <span className="font-semibold text-[#1A1A2E]">{e.name}</span>
                  <span className="text-[#9CA3AF] ml-1">({e.code})</span>
                  <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-[#F5F4F0] text-[#6B7280]">{e.theme}</span>
                  <span className="ml-2 text-[#6B7280]">— {e.stocks.length}종목: {e.stocks.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="text-center text-sm text-[#6B7280] py-2">
        {isConfirmed
          ? "⏰ 09:00 개장 ~ 09:30 진입 권장"
          : "⏰ NXT 야간 매수 가능 (17:00~20:00) · 내일 07:35 확정 재발행"}
      </div>
    </div>
  )
}
