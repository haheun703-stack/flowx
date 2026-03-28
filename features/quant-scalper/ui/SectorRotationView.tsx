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
  v > 0 ? "text-[#00ff88]" : v < 0 ? "text-[#ff3b5c]" : "text-gray-500"

const rankArrow = (change: number) => {
  if (change > 0) return <span className="text-[#00ff88]">▲{change}</span>
  if (change < 0) return <span className="text-[#ff3b5c]">▼{Math.abs(change)}</span>
  return <span className="text-gray-600">-</span>
}

const signalBadge = (s: string) => {
  if (s.includes("매수") || s === "BUY") return "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30"
  if (s.includes("매도") || s === "SELL") return "bg-[#ff3b5c]/20 text-[#ff3b5c] border-[#ff3b5c]/30"
  if (s.includes("주의") || s === "CAUTION") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  return "bg-gray-700/50 text-gray-400 border-gray-600"
}

const rsiColor = (v: number) => {
  if (v >= 70) return "text-[#ff3b5c]"
  if (v <= 30) return "text-[#00ff88]"
  return "text-gray-300"
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

  if (loading) return <div className="text-gray-500 text-center py-20">로딩 중...</div>
  if (!rows.length) return <div className="text-gray-500 text-center py-20">데이터 없음</div>

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-400">{date} · {rows.length}개 섹터</span>
            <h3 className="text-lg font-bold text-white mt-1">섹터 로테이션 순위</h3>
          </div>
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <span className="text-gray-500 block">1위</span>
              <span className="text-[#00ff88] font-bold">{rows[0]?.sector}</span>
            </div>
            <div className="text-center">
              <span className="text-gray-500 block">꼴찌</span>
              <span className="text-[#ff3b5c] font-bold">{rows[rows.length - 1]?.sector}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500">
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
                <tr key={r.sector} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="text-center py-2.5 px-2 text-gray-500 font-mono">{r.rank}</td>
                  <td className="text-center px-2 text-[10px]">{rankArrow(r.rank_change)}</td>
                  <td className="px-3">
                    <span className="text-white font-medium">{r.sector}</span>
                    <span className="text-gray-600 text-[10px] ml-1">{r.etf_code}</span>
                  </td>
                  <td className={`text-right px-2 font-mono font-bold ${signColor(r.momentum_score)}`}>{r.momentum_score.toFixed(1)}</td>
                  <td className={`text-right px-2 ${signColor(r.ret_5d)}`}>{r.ret_5d > 0 ? "+" : ""}{r.ret_5d.toFixed(2)}%</td>
                  <td className={`text-right px-2 ${signColor(r.ret_20d)}`}>{r.ret_20d > 0 ? "+" : ""}{r.ret_20d.toFixed(2)}%</td>
                  <td className={`text-right px-2 ${signColor(r.ret_60d)}`}>{r.ret_60d > 0 ? "+" : ""}{r.ret_60d.toFixed(2)}%</td>
                  <td className={`text-right px-2 font-mono ${rsiColor(r.rsi_14)}`}>{r.rsi_14.toFixed(1)}</td>
                  <td className={`text-right px-2 ${signColor(r.rel_strength)}`}>{r.rel_strength > 0 ? "+" : ""}{r.rel_strength.toFixed(2)}</td>
                  <td className={`text-right px-2 ${r.vol_ratio > 1.5 ? "text-yellow-400" : "text-gray-500"}`}>x{r.vol_ratio.toFixed(1)}</td>
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
