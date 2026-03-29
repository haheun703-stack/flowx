"use client"

import { useEffect, useState } from "react"

interface SectorFlow {
  sector: string
  alias: string
  inst_1d: number
  inst_3d: number
  inst_5d: number
  inst_consecutive: number
  foreign_1d: number
  foreign_3d: number
  foreign_5d: number
  foreign_consecutive: number
  agreement: string
  agreement_desc: string
  boost_score: number
}

interface FlowData {
  date: string
  sectors: SectorFlow[]
  top_inflow: string[]
  top_outflow: string[]
  signal: string
  total_sectors: number
}

const fmt = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}천`
  return v.toFixed(0)
}

const signColor = (v: number) =>
  v > 0 ? "text-[#16a34a]" : v < 0 ? "text-[#dc2626]" : "text-[var(--text-muted)]"

const agreementBadge = (a: string) => {
  switch (a) {
    case "합의매수": return "bg-[#16a34a]/20 text-[#16a34a] border-[#16a34a]/40"
    case "합의매도": return "bg-[#dc2626]/20 text-[#dc2626] border-[#dc2626]/40"
    case "의견분열": return "bg-yellow-500/20 text-[var(--yellow)] border-yellow-500/40"
    default: return "bg-gray-200 text-[var(--text-dim)] border-[var(--border)]"
  }
}

const consecutive = (n: number) => {
  if (n === 0) return ""
  return n > 0 ? `${n}일↑` : `${Math.abs(n)}일↓`
}

export function SectorFlowView() {
  const [data, setData] = useState<FlowData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/quant/sector-flow", { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  if (loading) return <div className="text-[var(--text-muted)] text-center py-20">로딩 중...</div>
  if (!data) return <div className="text-[var(--text-muted)] text-center py-20">데이터 없음</div>

  const sectors = data.sectors ?? []

  return (
    <div className="space-y-6">
      {/* 시그널 헤더 */}
      <div className="bg-white rounded-xl p-5 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--text-dim)]">{data.date} · {data.total_sectors}개 섹터</span>
        </div>
        <p className="text-lg font-bold text-[#16a34a]">{data.signal}</p>
        <div className="flex gap-4 mt-3 text-xs">
          <div>
            <span className="text-[var(--text-muted)] mr-1">매수집중</span>
            {(data.top_inflow ?? []).map((s, i) => (
              <span key={i} className="text-[#16a34a] mr-1">#{s}</span>
            ))}
          </div>
          <div>
            <span className="text-[var(--text-muted)] mr-1">이탈</span>
            {(data.top_outflow ?? []).map((s, i) => (
              <span key={i} className="text-[#dc2626] mr-1">#{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 섹터 테이블 */}
      <div className="bg-white rounded-xl overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="text-left py-3 px-4">섹터</th>
                <th className="text-right px-3">기관(당일)</th>
                <th className="text-right px-3">기관(3일)</th>
                <th className="text-right px-3">기관연속</th>
                <th className="text-right px-3">외인(당일)</th>
                <th className="text-right px-3">외인(3일)</th>
                <th className="text-right px-3">외인연속</th>
                <th className="text-center px-3">판단</th>
                <th className="text-right px-3">점수</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((s, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                  <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">{s.alias || s.sector}</td>
                  <td className={`text-right px-3 ${signColor(s.inst_1d)}`}>{fmt(s.inst_1d)}</td>
                  <td className={`text-right px-3 ${signColor(s.inst_3d)}`}>{fmt(s.inst_3d)}</td>
                  <td className={`text-right px-3 ${signColor(s.inst_consecutive)}`}>{consecutive(s.inst_consecutive)}</td>
                  <td className={`text-right px-3 ${signColor(s.foreign_1d)}`}>{fmt(s.foreign_1d)}</td>
                  <td className={`text-right px-3 ${signColor(s.foreign_3d)}`}>{fmt(s.foreign_3d)}</td>
                  <td className={`text-right px-3 ${signColor(s.foreign_consecutive)}`}>{consecutive(s.foreign_consecutive)}</td>
                  <td className="text-center px-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${agreementBadge(s.agreement)}`}>
                      {s.agreement}
                    </span>
                  </td>
                  <td className={`text-right px-3 font-mono ${signColor(s.boost_score)}`}>{s.boost_score > 0 ? "+" : ""}{s.boost_score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
