"use client"

import { useEffect, useState } from "react"

interface PickItem {
  code: string
  name: string
  category: string
  etf_type: string
  signal: string
  confidence: string
  score: number
  entry: number
  sl: number
  tp: number
  risk_pct: number
  reason: string
  holding_days: number
}

interface PicksData {
  date: string
  picks: PickItem[]
  pick_count: number
  has_directional: boolean
  has_commodity: boolean
  has_sector: boolean
}

const signalColor = (s: string) => {
  switch (s) {
    case "BUY": return "text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30"
    case "SELL": return "text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30"
    default: return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
  }
}

const confidenceColor = (c: string) => {
  switch (c) {
    case "HIGH": return "text-[#00ff88]"
    case "MEDIUM": return "text-yellow-400"
    default: return "text-gray-500"
  }
}

const categoryLabel = (c: string) => {
  switch (c) {
    case "directional": return "방향성"
    case "commodity": return "원자재"
    case "sector": return "섹터"
    default: return c
  }
}

const fmtPrice = (v: number) => v.toLocaleString()

export function EtfPicksView() {
  const [data, setData] = useState<PicksData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch("/api/quant/etf-picks", { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  if (loading) return <div className="text-gray-500 text-center py-20">로딩 중...</div>
  if (!data) return <div className="text-gray-500 text-center py-20">데이터 없음</div>

  const picks = data.picks ?? []

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{data.date}</span>
          <span className="text-sm text-white font-bold">오늘의 ETF 추천 {data.pick_count}건</span>
          <div className="flex gap-2">
            {data.has_directional && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">방향성</span>}
            {data.has_commodity && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">원자재</span>}
            {data.has_sector && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">섹터</span>}
          </div>
        </div>
      </div>

      {/* 추천 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {picks.map((p, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 mr-2">{categoryLabel(p.category)}</span>
                <span className="text-[10px] text-gray-600">{p.code}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded border font-bold ${signalColor(p.signal)}`}>
                {p.signal}
              </span>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg">{p.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${confidenceColor(p.confidence)}`}>신뢰도: {p.confidence}</span>
                <span className="text-xs text-gray-500">점수: {p.score.toFixed(1)}</span>
              </div>
            </div>

            {/* 가격 목표 */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-800 rounded-lg p-2">
                <span className="text-[10px] text-gray-500 block">진입가</span>
                <span className="text-sm text-white font-bold">{fmtPrice(p.entry)}</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <span className="text-[10px] text-gray-500 block">손절가</span>
                <span className="text-sm text-[#ff3b5c] font-bold">{fmtPrice(p.sl)}</span>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <span className="text-[10px] text-gray-500 block">목표가</span>
                <span className="text-sm text-[#00ff88] font-bold">{fmtPrice(p.tp)}</span>
              </div>
            </div>

            {/* 리스크 + 보유일 */}
            <div className="flex justify-between text-xs">
              <span className="text-[#ff3b5c]">손실률: {p.risk_pct.toFixed(1)}%</span>
              <span className="text-gray-500">최대 {p.holding_days}일 보유</span>
            </div>

            {/* 사유 */}
            <p className="text-xs text-gray-400 bg-gray-800/50 rounded p-2">{p.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
