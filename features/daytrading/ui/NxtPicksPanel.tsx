"use client"

import { useState, useEffect } from "react"

/* ─── Types ─── */
interface NxtPick {
  rank: number
  code: string
  name: string
  sector: string
  supply_score: number
  entry_price: number
}

interface NxtPicksData {
  date: string
  nxt_score: number | null
  signal: string | null
  sectors: string[] | null
  picks: NxtPick[] | null
  created_at: string
}

/* ─── Helpers ─── */
const fmt = (v: number) => v.toLocaleString("ko-KR")
const rankMedal = (r: number) =>
  r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `${r}`

function scoreColor(score: number) {
  if (score >= 5) return { bg: "bg-emerald-100", text: "text-emerald-700", label: "강력 매수" }
  if (score >= 2) return { bg: "bg-green-50", text: "text-green-600", label: "매수 고려" }
  if (score >= 0) return { bg: "bg-gray-100", text: "text-gray-600", label: "중립" }
  if (score >= -3) return { bg: "bg-amber-50", text: "text-amber-600", label: "경계" }
  return { bg: "bg-red-50", text: "text-red-500", label: "회피" }
}

function supplyBadge(score: number) {
  if (score >= 70) return { bg: "bg-emerald-100", text: "text-emerald-700" }
  if (score >= 50) return { bg: "bg-blue-50", text: "text-blue-600" }
  return { bg: "bg-gray-100", text: "text-gray-600" }
}

/* ─── Component ─── */
export default function NxtPicksPanel() {
  const [data, setData] = useState<NxtPicksData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/intelligence/nxt-picks", { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => { setData(j.data); setLoading(false) })
      .catch((e) => { if (e.name !== "AbortError") setLoading(false) })
    return () => ac.abort()
  }, [])

  if (loading)
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-4">
        <div className="animate-pulse h-40 bg-gray-100 rounded-2xl" />
      </div>
    )

  if (!data)
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-8 text-center">
        <p className="text-2xl mb-2">🌙</p>
        <p className="text-[#6B7280]">NXT 야간매수 데이터가 아직 없습니다.</p>
        <p className="text-xs text-[#9CA3AF] mt-1">매일 16:40 발행됩니다.</p>
      </div>
    )

  const picks = data.picks ?? []
  const sectors = data.sectors ?? []
  const nxtScore = data.nxt_score ?? 0
  const sc = scoreColor(nxtScore)

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-4 space-y-5">
      {/* ── Header: NXT 종합 점수 + 신호 ── */}
      <div className="bg-white rounded-2xl border border-[#E8E6E0] p-5">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h2 className="text-xl font-bold text-[#1A1A2E]">🌙 NXT 야간매수 TOP 5</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${sc.bg} ${sc.text}`}>
            {data.signal ?? sc.label}
          </span>
          <span className="text-sm text-[#6B7280]">{data.date}</span>
        </div>

        {/* NXT Score 바 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-bold text-[#1A1A2E]">NXT 점수</span>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden relative">
            {/* 0 기준선 */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 z-10" />
            {/* 바 */}
            <div
              className="h-full rounded-full absolute top-0"
              style={{
                backgroundColor: nxtScore >= 0 ? "#16A34A" : "#DC2626",
                left: nxtScore >= 0 ? "50%" : `${50 + (nxtScore / 10) * 50}%`,
                width: `${Math.abs(nxtScore / 10) * 50}%`,
              }}
            />
          </div>
          <span className={`text-lg font-bold tabular-nums ${nxtScore >= 0 ? "text-green-600" : "text-red-500"}`}>
            {nxtScore > 0 ? "+" : ""}{nxtScore.toFixed(1)}
          </span>
        </div>

        {/* 추천 섹터 */}
        {sectors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6B7280]">추천 섹터</span>
            {sectors.map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F0F0FF] text-[#4C1D95]">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── TOP 5 카드 그리드 ── */}
      {picks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {picks.map((p) => {
            const sb = supplyBadge(p.supply_score)
            return (
              <div
                key={p.code}
                className="bg-white rounded-xl border border-[#E8E6E0] p-4 text-center hover:shadow-md transition-shadow"
              >
                {/* Rank */}
                <div className="text-2xl mb-2">{rankMedal(p.rank)}</div>

                {/* Name */}
                <p className="font-bold text-[#1A1A2E] text-[15px]">{p.name}</p>
                <p className="text-xs text-[#9CA3AF] mb-3">{p.code} · {p.sector}</p>

                {/* Supply Score */}
                <div className="mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-sm font-bold ${sb.bg} ${sb.text}`}>
                    수급 {p.supply_score}점
                  </span>
                </div>

                {/* Entry Price */}
                <p className="text-sm text-[#6B7280]">진입가</p>
                <p className="text-lg font-bold text-[#1A1A2E] tabular-nums">{fmt(p.entry_price)}원</p>
              </div>
            )
          })}
        </div>
      )}

      {picks.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E8E6E0] p-8 text-center">
          <p className="text-[#6B7280]">오늘은 조건 충족 종목이 없습니다.</p>
        </div>
      )}

      {/* ── Footer ── */}
      <p className="text-center text-sm text-[#6B7280]">
        ⏰ NXT 야간매수 가능시간: 17:00 ~ 08:00 · supply_score TOP 5 필터
      </p>
    </div>
  )
}
