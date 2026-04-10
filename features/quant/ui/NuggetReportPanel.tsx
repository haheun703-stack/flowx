"use client"

import { useState, useEffect } from "react"

interface NuggetItem {
  code: string
  name: string
  grade: string
  total_score: number
  entry_price: number
  stop_loss: number
  target_price: number
  holding_days: number
  momentum_regime: string
}

const GRADE_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  AA: { label: "GOLD", bg: "bg-amber-100", text: "text-amber-700" },
  A:  { label: "SILVER", bg: "bg-gray-100", text: "text-gray-700" },
  B:  { label: "BRONZE", bg: "bg-orange-50", text: "text-orange-600" },
}

export default function NuggetReportPanel() {
  const [items, setItems] = useState<NuggetItem[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/intelligence/nugget-picks", { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => { setItems(j.items ?? []); setDate(j.date); setLoading(false) })
      .catch((e) => { if (e.name !== "AbortError") setLoading(false) })
    return () => ac.abort()
  }, [])

  if (loading)
    return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />

  if (items.length === 0)
    return (
      <div className="bg-white rounded-xl border border-[var(--border)] p-6 text-center">
        <p className="text-[#6B7280] text-sm">노다지 데이터가 아직 없습니다.</p>
      </div>
    )

  const gold = items.filter((i) => i.grade === "AA")
  const silver = items.filter((i) => i.grade === "A")
  const bronze = items.filter((i) => i.grade === "B")

  return (
    <div className="space-y-4">
      {/* 요약 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-amber-600">GOLD {gold.length}</span>
          <span className="text-sm font-bold text-gray-500">SILVER {silver.length}</span>
          <span className="text-sm font-bold text-orange-500">BRONZE {bronze.length}</span>
          <span className="text-sm text-[#9CA3AF]">전체 {items.length}종목</span>
        </div>
        {date && <span className="text-sm text-[#9CA3AF]">{date}</span>}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#6B7280] text-[12px] border-b border-[var(--border)]">
              <th className="text-left py-2 px-3">종목</th>
              <th className="text-center py-2 px-2">등급</th>
              <th className="text-right py-2 px-2">점수</th>
              <th className="text-right py-2 px-2">현재가</th>
              <th className="text-right py-2 px-2">목표가</th>
              <th className="text-right py-2 px-2">손절가</th>
              <th className="text-right py-2 px-2">상승여력</th>
              <th className="text-right py-2 px-2">R:R</th>
              <th className="text-center py-2 px-2">시장</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const g = GRADE_STYLE[item.grade] ?? { label: item.grade, bg: "bg-gray-100", text: "text-gray-500" }
              const upside = item.entry_price > 0 ? ((item.target_price - item.entry_price) / item.entry_price) * 100 : 0
              const risk = item.entry_price > 0 ? ((item.entry_price - item.stop_loss) / item.entry_price) * 100 : 0
              const rr = risk > 0 ? upside / risk : 0

              return (
                <tr key={item.code} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <span className="text-[#1A1A2E] font-medium">{item.name}</span>
                    <span className="text-[#9CA3AF] text-[12px] ml-1">{item.code}</span>
                  </td>
                  <td className="text-center py-2 px-2">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${g.bg} ${g.text}`}>{g.label}</span>
                  </td>
                  <td className="text-right py-2 px-2">
                    <span className={`font-bold font-mono ${item.total_score >= 70 ? "text-amber-600" : "text-gray-600"}`}>
                      {item.total_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="text-right py-2 px-2 text-[#1A1A2E] font-mono">{item.entry_price.toLocaleString()}</td>
                  <td className="text-right py-2 px-2 text-green-600 font-mono">{item.target_price.toLocaleString()}</td>
                  <td className="text-right py-2 px-2 text-red-500 font-mono">{item.stop_loss.toLocaleString()}</td>
                  <td className={`text-right py-2 px-2 font-mono font-bold ${upside >= 30 ? "text-green-600" : "text-gray-600"}`}>
                    +{upside.toFixed(1)}%
                  </td>
                  <td className={`text-right py-2 px-2 font-mono font-bold ${rr >= 3 ? "text-green-600" : "text-gray-500"}`}>
                    {rr.toFixed(1)}
                  </td>
                  <td className="text-center py-2 px-2">
                    <span className={`text-[11px] px-1 py-0.5 rounded ${
                      item.momentum_regime === "BULL" ? "bg-green-50 text-green-600" :
                      item.momentum_regime === "BEAR" ? "bg-red-50 text-red-500" :
                      "bg-yellow-50 text-yellow-600"
                    }`}>{item.momentum_regime}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs text-[#9CA3AF]">
        DCF/RIM + 섹터PER + 피보나치 + ATR 역산 · 보유기간 ~6개월
      </p>
    </div>
  )
}
