"use client"

import { useEffect, useState } from "react"

interface EtfItem {
  code: string
  name: string
  alias: string
  group: string
  inst_1d: number
  inst_3d: number
  inst_consecutive: number
  foreign_1d: number
  foreign_3d: number
  foreign_consecutive: number
  retail_1d: number
  signal: string
  signal_desc: string
  strength: number
  change_pct: number
}

interface EtfFlowData {
  date: string
  etfs: EtfItem[]
  market_direction: string
  market_direction_desc: string
  inverse_warning: boolean
  hot_sector_etfs: string[]
  safe_haven_signal: string
  safe_haven_desc: string
  brain_defense_score: number
}

const fmt = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}천`
  return v.toFixed(0)
}

const signColor = (v: number) =>
  v > 0 ? "text-[#16a34a]" : v < 0 ? "text-[#dc2626]" : "text-[var(--text-muted)]"

const directionStyle = (d: string) => {
  switch (d) {
    case "BULLISH": return "text-[#16a34a] bg-[#16a34a]/10 border-[#16a34a]/30"
    case "BEARISH": return "text-[#dc2626] bg-[#dc2626]/10 border-[#dc2626]/30"
    default: return "text-[var(--yellow)] bg-yellow-400/10 border-yellow-400/30"
  }
}

const groupLabel = (g: string) => {
  switch (g) {
    case "directional": return "방향성"
    case "commodity": return "원자재"
    case "sector": return "섹터"
    default: return g
  }
}

export function EtfFlowView() {
  const [data, setData] = useState<EtfFlowData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/quant/etf-flow", { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  if (loading) return <div className="text-[var(--text-muted)] text-center py-20">로딩 중...</div>
  if (!data) return <div className="text-[var(--text-muted)] text-center py-20">데이터 준비 중 — 퀀트봇이 업로드하면 자동 표시됩니다</div>

  const etfs = data.etfs ?? []
  const groups = ["directional", "commodity", "sector"]

  return (
    <div className="space-y-6">
      {/* 시장 방향 + 경고 헤더 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)] block mb-1">시장방향</span>
          <span className={`text-lg font-bold px-3 py-1 rounded border ${directionStyle(data.market_direction)}`}>
            {data.market_direction}
          </span>
          <p className="text-xs text-[var(--text-dim)] mt-2">{data.market_direction_desc}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)] block mb-1">안전자산</span>
          <span className={`text-lg font-bold ${data.safe_haven_signal === "RISK_OFF" ? "text-[var(--yellow)]" : "text-[#16a34a]"}`}>
            {data.safe_haven_signal}
          </span>
          <p className="text-xs text-[var(--text-dim)] mt-2">{data.safe_haven_desc}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)] block mb-1">BRAIN 방어점수</span>
          <span className={`text-2xl font-bold ${signColor(data.brain_defense_score)}`}>
            {data.brain_defense_score > 0 ? "+" : ""}{data.brain_defense_score.toFixed(1)}
          </span>
          {data.inverse_warning && (
            <div className="mt-2 text-xs text-[#dc2626] bg-[#dc2626]/10 px-2 py-1 rounded border border-[#dc2626]/30">
              인버스 기관매수 경고
            </div>
          )}
        </div>
      </div>

      {/* ETF 그룹별 테이블 */}
      {groups.map((g) => {
        const items = etfs.filter((e) => e.group === g)
        if (!items.length) return null
        return (
          <div key={g} className="bg-white rounded-xl overflow-hidden border border-[var(--border)]">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <span className="text-sm font-bold text-[var(--text-primary)]">{groupLabel(g)}</span>
              <span className="text-xs text-[var(--text-muted)] ml-2">{items.length}개 ETF</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                    <th className="text-left py-2.5 px-4">ETF</th>
                    <th className="text-right px-3">등락</th>
                    <th className="text-right px-3">기관(당일)</th>
                    <th className="text-right px-3">기관(3일)</th>
                    <th className="text-right px-3">외인(당일)</th>
                    <th className="text-right px-3">외인(3일)</th>
                    <th className="text-right px-3">개인(당일)</th>
                    <th className="text-center px-3">시그널</th>
                    <th className="text-right px-3">강도</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e, i) => (
                    <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <div className="text-[var(--text-primary)] font-medium">{e.alias || e.name}</div>
                        <div className="text-[var(--text-muted)] text-[10px]">{e.code}</div>
                      </td>
                      <td className={`text-right px-3 ${signColor(e.change_pct)}`}>{e.change_pct > 0 ? "+" : ""}{e.change_pct.toFixed(2)}%</td>
                      <td className={`text-right px-3 ${signColor(e.inst_1d)}`}>{fmt(e.inst_1d)}</td>
                      <td className={`text-right px-3 ${signColor(e.inst_3d)}`}>{fmt(e.inst_3d)}</td>
                      <td className={`text-right px-3 ${signColor(e.foreign_1d)}`}>{fmt(e.foreign_1d)}</td>
                      <td className={`text-right px-3 ${signColor(e.foreign_3d)}`}>{fmt(e.foreign_3d)}</td>
                      <td className={`text-right px-3 ${signColor(e.retail_1d)}`}>{fmt(e.retail_1d)}</td>
                      <td className="text-center px-3">
                        <span className="text-[10px] text-[var(--yellow)]">{e.signal}</span>
                      </td>
                      <td className="text-right px-3">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full inline-block align-middle">
                          <div
                            className="h-full rounded-full bg-[#2563eb]"
                            style={{ width: `${Math.min(e.strength, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
