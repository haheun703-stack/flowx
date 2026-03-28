"use client"

import { useEffect, useState } from "react"

interface StockNarrative {
  code: string
  name: string
  total_score: number
  grade: string
  why_narrative: string
  risk_flag: string
  macro_alignment: string
}

interface BrainData {
  date: string
  overall_verdict: string
  position_size_pct: number
  position_size_reason: string
  macro_direction: string
  macro_narrative: string
  vix: number
  nasdaq_chg: number
  usdkrw: number
  usdkrw_chg: number
  gold_chg: number
  commodity_relay: string
  commodity_narrative: string
  hot_sectors: string[]
  next_sectors: string[]
  cooling_sectors: string[]
  sector_narrative: string
  dominant_buyer: string
  flow_narrative: string
  risk_level: string
  risk_score: number
  risk_narrative: string
  stock_narratives: StockNarrative[]
}

const signColor = (v: number) =>
  v > 0 ? "text-[#00ff88]" : v < 0 ? "text-[#ff3b5c]" : "text-gray-500"

const riskColor = (r: string) => {
  switch (r) {
    case "LOW": return "text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30"
    case "MEDIUM": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
    case "HIGH": return "text-orange-400 bg-orange-400/10 border-orange-400/30"
    case "EXTREME": return "text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30"
    default: return "text-gray-400 bg-gray-700/50 border-gray-600"
  }
}

const macroColor = (d: string) => {
  if (d.includes("BULL")) return "text-[#00ff88]"
  if (d.includes("BEAR")) return "text-[#ff3b5c]"
  return "text-yellow-400"
}

const gradeColor = (g: string) => {
  if (g.startsWith("A")) return "text-[#00ff88]"
  if (g.startsWith("B")) return "text-[#0ea5e9]"
  if (g.startsWith("C")) return "text-yellow-400"
  return "text-gray-500"
}

export function MarketBrainView() {
  const [data, setData] = useState<BrainData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/quant/brain", { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  if (loading) return <div className="text-gray-500 text-center py-20">로딩 중...</div>
  if (!data) return <div className="text-gray-500 text-center py-20">데이터 없음</div>

  return (
    <div className="space-y-6">
      {/* 종합판단 헤더 */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">{data.date} BRAIN 종합판단</span>
          <span className={`text-sm px-3 py-1 rounded border font-bold ${riskColor(data.risk_level)}`}>
            RISK: {data.risk_level}
          </span>
        </div>
        <p className="text-lg text-white font-bold leading-relaxed">{data.overall_verdict}</p>
        <div className="flex items-center gap-6 mt-4">
          <div>
            <span className="text-xs text-gray-500 block">투자비중</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#0ea5e9]">{data.position_size_pct}%</span>
              <div className="w-24 h-2 bg-gray-700 rounded-full">
                <div className="h-full rounded-full bg-[#0ea5e9]" style={{ width: `${data.position_size_pct}%` }} />
              </div>
            </div>
            <span className="text-[10px] text-gray-500">{data.position_size_reason}</span>
          </div>
        </div>
      </div>

      {/* 6 Phase 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Phase 1: 매크로 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Phase 1</span>
            <span className="text-sm text-white font-bold">매크로</span>
          </div>
          <span className={`text-lg font-bold ${macroColor(data.macro_direction)}`}>{data.macro_direction}</span>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div>
              <span className="text-gray-500">VIX</span>
              <span className={`ml-1 ${data.vix > 25 ? "text-[#ff3b5c]" : "text-gray-300"}`}>{data.vix.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-500">NASDAQ</span>
              <span className={`ml-1 ${signColor(data.nasdaq_chg)}`}>{data.nasdaq_chg > 0 ? "+" : ""}{data.nasdaq_chg.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-gray-500">USD/KRW</span>
              <span className="ml-1 text-gray-300">{data.usdkrw.toFixed(0)}</span>
              <span className={`ml-1 ${signColor(-data.usdkrw_chg)}`}>({data.usdkrw_chg > 0 ? "+" : ""}{data.usdkrw_chg.toFixed(2)}%)</span>
            </div>
            <div>
              <span className="text-gray-500">Gold</span>
              <span className={`ml-1 ${signColor(data.gold_chg)}`}>{data.gold_chg > 0 ? "+" : ""}{data.gold_chg.toFixed(2)}%</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">{data.macro_narrative}</p>
        </div>

        {/* Phase 2: 원자재 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Phase 2</span>
            <span className="text-sm text-white font-bold">원자재 릴레이</span>
          </div>
          <span className="text-lg font-bold text-yellow-400">{data.commodity_relay}</span>
          <p className="text-xs text-gray-400 mt-2">{data.commodity_narrative}</p>
        </div>

        {/* Phase 3: 섹터 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Phase 3</span>
            <span className="text-sm text-white font-bold">섹터</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-500">HOT</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(data.hot_sectors ?? []).map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-[#ff3b5c]/20 text-[#ff3b5c] border border-[#ff3b5c]/30 text-[10px]">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-500">NEXT</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(data.next_sectors ?? []).map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px]">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-500">COOLING</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(data.cooling_sectors ?? []).map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">{data.sector_narrative}</p>
        </div>

        {/* Phase 4: 수급 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Phase 4</span>
            <span className="text-sm text-white font-bold">수급</span>
          </div>
          <span className="text-lg font-bold text-[#0ea5e9]">주도: {data.dominant_buyer}</span>
          <p className="text-xs text-gray-400 mt-2">{data.flow_narrative}</p>
        </div>

        {/* Phase 5: 리스크 */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Phase 5</span>
            <span className="text-sm text-white font-bold">리스크</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold px-2 py-0.5 rounded border ${riskColor(data.risk_level)}`}>{data.risk_level}</span>
            <span className="text-sm text-gray-400">점수: {data.risk_score.toFixed(1)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">{data.risk_narrative}</p>
        </div>

        {/* Phase 6: 종목 서술 (미리보기) */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Phase 6</span>
            <span className="text-sm text-white font-bold">종목 AI 분석</span>
            <span className="text-xs text-gray-500">{(data.stock_narratives ?? []).length}종목</span>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {(data.stock_narratives ?? []).slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`font-bold ${gradeColor(s.grade)}`}>{s.grade}</span>
                <span className="text-white">{s.name}</span>
                <span className="text-gray-500">{s.total_score.toFixed(0)}점</span>
                <span className={`text-[10px] ${s.macro_alignment === "ALIGNED" ? "text-[#00ff88]" : "text-gray-500"}`}>
                  {s.macro_alignment === "ALIGNED" ? "매크로+" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 종목 상세 테이블 */}
      {(data.stock_narratives ?? []).length > 0 && (
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-bold text-white">종목별 AI 분석</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500">
                  <th className="text-center py-2.5 px-3">등급</th>
                  <th className="text-left px-3">종목</th>
                  <th className="text-right px-3">점수</th>
                  <th className="text-center px-3">매크로</th>
                  <th className="text-left px-3">분석</th>
                </tr>
              </thead>
              <tbody>
                {(data.stock_narratives ?? []).map((s, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className={`text-center py-2 px-3 font-bold ${gradeColor(s.grade)}`}>{s.grade}</td>
                    <td className="px-3">
                      <span className="text-white">{s.name}</span>
                      <span className="text-gray-600 ml-1">{s.code}</span>
                    </td>
                    <td className="text-right px-3 font-mono text-white">{s.total_score.toFixed(1)}</td>
                    <td className="text-center px-3">
                      <span className={`text-[10px] ${s.macro_alignment === "ALIGNED" ? "text-[#00ff88]" : s.macro_alignment === "DIVERGENT" ? "text-[#ff3b5c]" : "text-gray-500"}`}>
                        {s.macro_alignment}
                      </span>
                    </td>
                    <td className="px-3 text-gray-400 max-w-[300px] truncate">{s.why_narrative}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
