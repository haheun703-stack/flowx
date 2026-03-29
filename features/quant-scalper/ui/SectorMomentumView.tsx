"use client"

import { useEffect, useState } from "react"

interface SectorMom {
  sector: string
  phase: string
  rank: number
  avg_return_1d: number
  avg_return_3d: number
  avg_return_5d: number
  breadth_1d: number
  acceleration: number
  volume_surge: number
  boost_score: number
  top_movers: { code: string; name: string; chg_1d: number }[]
}

interface MomentumData {
  date: string
  market_return_1d: number
  sectors: SectorMom[]
  hot_sectors: string[]
  cold_sectors: string[]
  rotation_signal: string
}

const signColor = (v: number) =>
  v > 0 ? "text-[#16a34a]" : v < 0 ? "text-[#dc2626]" : "text-[var(--text-muted)]"

const phaseBadge = (p: string) => {
  switch (p) {
    case "HOT": return "bg-[#dc2626]/20 text-[#dc2626] border-[#dc2626]/40"
    case "WARMING": return "bg-orange-500/20 text-orange-600 border-orange-500/40"
    case "COOLING": return "bg-blue-500/20 text-[var(--down)] border-blue-500/40"
    case "COLD": return "bg-cyan-500/20 text-cyan-600 border-cyan-500/40"
    default: return "bg-gray-200 text-[var(--text-dim)] border-[var(--border)]"
  }
}

export function SectorMomentumView() {
  const [data, setData] = useState<MomentumData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/quant/sector-momentum", { signal: ac.signal })
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
      {/* 헤더: 시장 수익률 + 로테이션 */}
      <div className="bg-white rounded-xl p-5 border border-[var(--border)]">
        <div className="flex items-center gap-6 mb-3">
          <div>
            <span className="text-xs text-[var(--text-muted)] block">시장 당일 수익률</span>
            <span className={`text-xl font-bold ${signColor(data.market_return_1d)}`}>
              {data.market_return_1d > 0 ? "+" : ""}{data.market_return_1d.toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)] block">HOT</span>
            <div className="flex gap-1 mt-1">
              {(data.hot_sectors ?? []).map((s, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#dc2626]/20 text-[#dc2626] border border-[#dc2626]/30">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)] block">COLD</span>
            <div className="flex gap-1 mt-1">
              {(data.cold_sectors ?? []).map((s, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 border border-cyan-500/30">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-[var(--text-primary)]">{data.rotation_signal}</p>
      </div>

      {/* 섹터 테이블 */}
      <div className="bg-white rounded-xl overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="text-center py-3 px-2 w-8">#</th>
                <th className="text-left px-3">섹터</th>
                <th className="text-center px-2">상태</th>
                <th className="text-right px-3">당일</th>
                <th className="text-right px-3">3일</th>
                <th className="text-right px-3">5일</th>
                <th className="text-right px-3">상승비율</th>
                <th className="text-right px-3">가속도</th>
                <th className="text-right px-3">거래폭증</th>
                <th className="text-left px-3">주도주</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((s, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                  <td className="text-center py-2.5 px-2 text-[var(--text-muted)]">{s.rank}</td>
                  <td className="px-3 text-[var(--text-primary)] font-medium">{s.sector}</td>
                  <td className="text-center px-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${phaseBadge(s.phase)}`}>{s.phase}</span>
                  </td>
                  <td className={`text-right px-3 ${signColor(s.avg_return_1d)}`}>{s.avg_return_1d > 0 ? "+" : ""}{s.avg_return_1d.toFixed(2)}%</td>
                  <td className={`text-right px-3 ${signColor(s.avg_return_3d)}`}>{s.avg_return_3d > 0 ? "+" : ""}{s.avg_return_3d.toFixed(2)}%</td>
                  <td className={`text-right px-3 ${signColor(s.avg_return_5d)}`}>{s.avg_return_5d > 0 ? "+" : ""}{s.avg_return_5d.toFixed(2)}%</td>
                  <td className="text-right px-3">{(s.breadth_1d * 100).toFixed(0)}%</td>
                  <td className={`text-right px-3 ${signColor(s.acceleration)}`}>{s.acceleration.toFixed(2)}</td>
                  <td className={`text-right px-3 ${s.volume_surge > 1.5 ? "text-[var(--yellow)]" : "text-[var(--text-muted)]"}`}>x{s.volume_surge.toFixed(1)}</td>
                  <td className="px-3">
                    <div className="flex gap-1 flex-wrap">
                      {(s.top_movers ?? []).slice(0, 2).map((m, j) => (
                        <span key={j} className={`text-[10px] ${signColor(m.chg_1d)}`}>
                          {m.name}{m.chg_1d > 0 ? "+" : ""}{m.chg_1d.toFixed(1)}%
                        </span>
                      ))}
                    </div>
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
