"use client"

import { useEffect, useState } from "react"

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

interface PensionScanData {
  date: string
  total_count: number
  best_count: number
  best_fresh_count: number
  standby_count: number
  best_stocks: PensionStock[]
  best_fresh: PensionStock[]
  standby_stocks: PensionStock[]
}

type SubTab = "best" | "standby"

/* ── Helpers ── */
function fmtCap(cap: number): string {
  if (cap >= 10000) return `${(cap / 10000).toFixed(1)}조`
  return `${cap.toLocaleString()}억`
}

function fmtAmt(v: number): string {
  const abs = Math.abs(v)
  const sign = v >= 0 ? "+" : "-"
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1)}조`
  return `${sign}${Math.round(abs).toLocaleString()}억`
}

function fmtPrice(v: number): string {
  return v.toLocaleString() + "원"
}

/* ── Badge ── */
function JoinedBadge({ joined }: { joined: string }) {
  if (joined === "TODAY") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FF4444] text-white">
        오늘합류
      </span>
    )
  }
  if (joined === "YESTERDAY") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FF8C00] text-white">
        어제합류
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#9CA3AF] text-white">
      대기중
    </span>
  )
}

/* ── Stock Card (핵심후보) ── */
function BestCard({ s }: { s: PensionStock }) {
  const ret5Color = s.ret5 < 0 ? "#16a34a" : s.ret5 <= 3 ? "#1A1A2E" : "#9CA3AF"
  const consecColor = s.pension_consec >= 5 ? "#DC2626" : s.pension_consec === 3 ? "#2196F3" : "#1A1A2E"
  const fiBold = Math.abs(s.fi_today) > 100

  return (
    <div className="bg-white border border-[#E2E5EA] rounded-xl p-4 hover:shadow-sm transition-shadow">
      {/* Row 1: Badge + Name + Sector + Cap */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <JoinedBadge joined={s.fi_joined} />
        <span className="font-bold text-[15px] text-[#1A1A2E]">{s.name}</span>
        <span className="text-[12px] text-[#9CA3AF]">{s.sector}</span>
        <span className="text-[12px] text-[#6B7280]">시총 {fmtCap(s.cap)}</span>
        <span className="ml-auto text-[13px] text-[#6B7280]">{fmtPrice(s.close)}</span>
      </div>
      {/* Row 2: 연기금 */}
      <div className="text-[13px] mb-1">
        <span style={{ color: consecColor }} className="font-semibold">
          연기금 {s.pension_consec}일째
        </span>
        <span className="text-[#6B7280]"> · 누적 {fmtAmt(s.pension_cum)}</span>
      </div>
      {/* Row 3: 금투 + ret5 */}
      <div className="text-[13px]">
        <span className={fiBold ? "font-bold text-[#1A1A2E]" : "text-[#1A1A2E]"}>
          금투 오늘 {fmtAmt(s.fi_today)}
        </span>
        <span className="text-[#6B7280]"> · </span>
        <span style={{ color: ret5Color }} className="font-semibold">
          5d {s.ret5 >= 0 ? "+" : ""}{s.ret5.toFixed(1)}%
        </span>
        {s.ret5 < 0 && (
          <span className="ml-1 text-[11px] text-[#16a34a] font-bold">미발화</span>
        )}
      </div>
    </div>
  )
}

/* ── Stock Card (대기) ── */
function StandbyCard({ s }: { s: PensionStock }) {
  const consecColor = s.pension_consec >= 5 ? "#DC2626" : s.pension_consec === 3 ? "#2196F3" : "#1A1A2E"

  return (
    <div className="bg-[#FAFAFA] border border-[#E2E5EA] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <JoinedBadge joined="STANDBY" />
        <span className="font-bold text-[15px] text-[#1A1A2E]">{s.name}</span>
        <span className="text-[12px] text-[#9CA3AF]">{s.sector}</span>
        <span className="text-[12px] text-[#6B7280]">시총 {fmtCap(s.cap)}</span>
        <span className="ml-auto text-[13px] text-[#6B7280]">{fmtPrice(s.close)}</span>
      </div>
      <div className="text-[13px] mb-1">
        <span style={{ color: consecColor }} className="font-semibold">
          연기금 {s.pension_consec}일째
        </span>
        <span className="text-[#6B7280]"> · 누적 {fmtAmt(s.pension_cum)}</span>
        <span className="text-[#6B7280]"> · 5d {s.ret5 >= 0 ? "+" : ""}{s.ret5.toFixed(1)}%</span>
      </div>
      <div className="text-[12px] text-[#9CA3AF]">
        금투 미합류 — 진입 시 알림 예정
      </div>
    </div>
  )
}

/* ── Main Panel ── */
export default function PensionScanPanel() {
  const [data, setData] = useState<PensionScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState<SubTab>("best")

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
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

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

  const bestList = data.best_stocks
  const standbyList = data.standby_stocks

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6">
      {/* 헤더 */}
      <div className="mb-4">
        <h2 className="text-[18px] md:text-[20px] font-bold text-[#1A1A2E]">
          매집 합류 시그널
        </h2>
        <p className="text-[13px] text-[#6B7280] mt-1">
          연기금 3-5일 매수 → 금투 합류 시 D+5 +1.6% · {data.date} 기준
        </p>
      </div>

      {/* 2-탭 */}
      <nav className="flex gap-1.5 mb-4">
        <button
          onClick={() => setSubTab("best")}
          className={`py-2 px-4 rounded-lg text-[13px] font-semibold transition-all ${
            subTab === "best"
              ? "bg-[#00FF88] text-[#1A1A2E] shadow-sm"
              : "bg-[#F5F4F0] text-[#9CA3AF] hover:text-[#1A1A2E]"
          }`}
        >
          핵심후보 ({data.best_count})
        </button>
        <button
          onClick={() => setSubTab("standby")}
          className={`py-2 px-4 rounded-lg text-[13px] font-semibold transition-all ${
            subTab === "standby"
              ? "bg-[#00FF88] text-[#1A1A2E] shadow-sm"
              : "bg-[#F5F4F0] text-[#9CA3AF] hover:text-[#1A1A2E]"
          }`}
        >
          대기 ({data.standby_count})
        </button>
        {data.best_fresh_count > 0 && subTab === "best" && (
          <span className="ml-2 self-center text-[12px] text-[#16a34a] font-semibold">
            미발화 {data.best_fresh_count}종목
          </span>
        )}
      </nav>

      {/* 핵심후보 탭 */}
      {subTab === "best" && (
        <div className="grid gap-3">
          {bestList.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF]">
              오늘은 연기금+금투 합류 종목이 없습니다
            </div>
          ) : (
            bestList.map((s) => <BestCard key={s.code} s={s} />)
          )}
        </div>
      )}

      {/* 대기 탭 */}
      {subTab === "standby" && (
        <div className="grid gap-3">
          {standbyList.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF]">
              연기금 연속매수 종목이 없습니다
            </div>
          ) : (
            standbyList.map((s) => <StandbyCard key={s.code} s={s} />)
          )}
        </div>
      )}
    </div>
  )
}
