"use client"

import { useEffect, useState } from "react"

interface SectorRow {
  sector: string
  etf_code: string
  category: string
  momentum_score: number
  rank: number
  rank_prev: number
  rank_change: number
  ret_5d: number
  ret_20d: number
  ret_60d: number
  rsi_14: number
  rel_strength: number
  vol_ratio: number
  foreign_cum: number
  inst_cum: number
  signal: string
  signal_reason: string
}

const signColor = (v: number) =>
  v > 0 ? "text-[#16a34a]" : v < 0 ? "text-[#dc2626]" : "text-[var(--text-muted)]"

const rankArrow = (change: number) => {
  if (change > 0) return <span className="text-[#16a34a]">▲{change}</span>
  if (change < 0) return <span className="text-[#dc2626]">▼{Math.abs(change)}</span>
  return <span className="text-[var(--text-muted)]">-</span>
}

const signalBadge = (s: string | undefined) => {
  if (!s) return "bg-gray-200 text-[var(--text-dim)] border-[var(--border)]"
  if (s.includes("매수") || s === "BUY") return "bg-[#16a34a]/20 text-[#16a34a] border-[#16a34a]/30"
  if (s.includes("매도") || s === "SELL") return "bg-[#dc2626]/20 text-[#dc2626] border-[#dc2626]/30"
  if (s.includes("주의") || s === "CAUTION") return "bg-yellow-500/20 text-[var(--yellow)] border-yellow-500/30"
  return "bg-gray-200 text-[var(--text-dim)] border-[var(--border)]"
}

const rsiColor = (v: number) => {
  if (v >= 70) return "text-[#dc2626]"
  if (v <= 30) return "text-[#16a34a]"
  return "text-[var(--text-primary)]"
}

const fmt = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}천`
  return v.toFixed(0)
}

export function SectorRotationView() {
  const [rows, setRows] = useState<SectorRow[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/sector-rotation", { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => {
        setRows(j.data ?? [])
        setDate(j.date)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  if (loading) return <div className="text-[var(--text-muted)] text-center py-20">로딩 중...</div>
  if (!rows.length) return <div className="text-[var(--text-muted)] text-center py-20">데이터 준비 중 — 퀀트봇이 업로드하면 자동 표시됩니다</div>

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-xl p-5 border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-[var(--text-dim)]">{date} · {rows.length}개 섹터</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">섹터 로테이션 순위</h3>
          </div>
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <span className="text-[var(--text-muted)] block">1위</span>
              <span className="text-[#16a34a] font-bold">{rows[0]?.sector}</span>
            </div>
            <div className="text-center">
              <span className="text-[var(--text-muted)] block">꼴찌</span>
              <span className="text-[#dc2626] font-bold">{rows[rows.length - 1]?.sector}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="text-center py-3 px-2 w-8">#</th>
                <th className="text-center px-2">변동</th>
                <th className="text-left px-3">섹터</th>
                <th className="text-right px-2">모멘텀</th>
                <th className="text-right px-2">5일</th>
                <th className="text-right px-2">20일</th>
                <th className="text-right px-2">60일</th>
                <th className="text-right px-2">RSI</th>
                <th className="text-right px-2">상대강도</th>
                <th className="text-right px-2">거래비</th>
                <th className="text-right px-2">외인(5일)</th>
                <th className="text-right px-2">기관(5일)</th>
                <th className="text-center px-2">시그널</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sector} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-row)]">
                  <td className="text-center py-2.5 px-2 text-[var(--text-muted)] font-mono">{r.rank}</td>
                  <td className="text-center px-2 text-[10px]">{rankArrow(r.rank_change)}</td>
                  <td className="px-3">
                    <span className="text-[var(--text-primary)] font-medium">{r.sector}</span>
                    <span className="text-[var(--text-muted)] text-[10px] ml-1">{r.etf_code}</span>
                  </td>
                  <td className={`text-right px-2 font-mono font-bold ${signColor(r.momentum_score)}`}>{r.momentum_score.toFixed(1)}</td>
                  <td className={`text-right px-2 ${signColor(r.ret_5d)}`}>{r.ret_5d > 0 ? "+" : ""}{r.ret_5d.toFixed(2)}%</td>
                  <td className={`text-right px-2 ${signColor(r.ret_20d)}`}>{r.ret_20d > 0 ? "+" : ""}{r.ret_20d.toFixed(2)}%</td>
                  <td className={`text-right px-2 ${signColor(r.ret_60d)}`}>{r.ret_60d > 0 ? "+" : ""}{r.ret_60d.toFixed(2)}%</td>
                  <td className={`text-right px-2 font-mono ${rsiColor(r.rsi_14)}`}>{r.rsi_14.toFixed(1)}</td>
                  <td className={`text-right px-2 ${signColor(r.rel_strength)}`}>{r.rel_strength > 0 ? "+" : ""}{r.rel_strength.toFixed(2)}</td>
                  <td className={`text-right px-2 ${r.vol_ratio > 1.5 ? "text-[var(--yellow)]" : "text-[var(--text-muted)]"}`}>x{r.vol_ratio.toFixed(1)}</td>
                  <td className={`text-right px-2 ${signColor(r.foreign_cum)}`}>{fmt(r.foreign_cum)}</td>
                  <td className={`text-right px-2 ${signColor(r.inst_cum)}`}>{fmt(r.inst_cum)}</td>
                  <td className="text-center px-2">
                    {r.signal && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${signalBadge(r.signal)}`} title={r.signal_reason}>
                        {r.signal}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
