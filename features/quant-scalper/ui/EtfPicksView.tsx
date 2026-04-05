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
    case "BUY": return "text-[#16a34a] bg-[#16a34a]/10 border-[#16a34a]/30"
    case "SELL": return "text-[#dc2626] bg-[#dc2626]/10 border-[#dc2626]/30"
    default: return "text-[var(--yellow)] bg-yellow-400/10 border-yellow-400/30"
  }
}

const confidenceColor = (c: string) => {
  switch (c) {
    case "HIGH": return "text-[#16a34a]"
    case "MEDIUM": return "text-[var(--yellow)]"
    default: return "text-[var(--text-muted)]"
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

  if (loading) return <div className="text-[var(--text-muted)] text-center py-20">로딩 중...</div>
  if (!data) return <div className="text-[var(--text-muted)] text-center py-20">데이터 준비 중 — 퀀트봇이 업로드하면 자동 표시됩니다</div>

  const picks = data.picks ?? []

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="bg-white rounded-xl p-5 border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text-dim)]">{data.date}</span>
          <span className="text-sm text-[var(--text-primary)] font-bold">오늘의 ETF 인사이트 {data.pick_count}건</span>
          <div className="flex gap-2">
            {data.has_directional && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-[var(--down)] border border-blue-500/30">방향성</span>}
            {data.has_commodity && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-[var(--yellow)] border border-yellow-500/30">원자재</span>}
            {data.has_sector && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 border border-purple-500/30">섹터</span>}
          </div>
        </div>
      </div>

      {/* 인사이트 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {picks.map((p, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-[var(--border)] space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] mr-2">{categoryLabel(p.category)}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{p.code}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded border font-bold ${signalColor(p.signal)}`}>
                {p.signal}
              </span>
            </div>

            <div>
              <h3 className="text-[var(--text-primary)] font-bold text-lg">{p.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${confidenceColor(p.confidence)}`}>신뢰도: {p.confidence}</span>
                <span className="text-xs text-[var(--text-muted)]">점수: {p.score.toFixed(1)}</span>
              </div>
            </div>

            {/* 가격 목표 */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[var(--bg-row)] rounded-lg p-2">
                <span className="text-[10px] text-[var(--text-muted)] block">진입가</span>
                <span className="text-sm text-[var(--text-primary)] font-bold">{fmtPrice(p.entry)}</span>
              </div>
              <div className="bg-[var(--bg-row)] rounded-lg p-2">
                <span className="text-[10px] text-[var(--text-muted)] block">손절가</span>
                <span className="text-sm text-[#dc2626] font-bold">{fmtPrice(p.sl)}</span>
              </div>
              <div className="bg-[var(--bg-row)] rounded-lg p-2">
                <span className="text-[10px] text-[var(--text-muted)] block">목표가</span>
                <span className="text-sm text-[#16a34a] font-bold">{fmtPrice(p.tp)}</span>
              </div>
            </div>

            {/* 리스크 + 보유일 */}
            <div className="flex justify-between text-xs">
              <span className="text-[#dc2626]">손실률: {p.risk_pct.toFixed(1)}%</span>
              <span className="text-[var(--text-muted)]">최대 {p.holding_days}일 보유</span>
            </div>

            {/* 사유 */}
            <p className="text-xs text-[var(--text-dim)] bg-[var(--bg-row)] rounded p-2">{p.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
