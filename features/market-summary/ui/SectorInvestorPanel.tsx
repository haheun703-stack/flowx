'use client'

import { useEffect, useState } from 'react'

interface SectorFlow {
  sector: string
  foreign_net_amt: number // 천원
  inst_net_amt: number
  stock_count: number
  top_foreign_buy: string
  top_inst_buy: string
}

function fmtAmt(thousandWon: number): string {
  const v = thousandWon / 100000 // 천원→억원
  if (Math.abs(v) >= 10000) return `${v >= 0 ? '+' : ''}${(v / 10000).toFixed(1)}조`
  if (Math.abs(v) >= 1) return `${v >= 0 ? '+' : ''}${v.toFixed(0)}억`
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}억`
}

export default function SectorInvestorPanel() {
  const [date, setDateStr] = useState<string | null>(null)
  const [sectors, setSectors] = useState<SectorFlow[]>([])
  const [view, setView] = useState<'foreign' | 'inst'>('foreign')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/market/sector-investor', { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        setDateStr(json.date)
        setSectors(json.sectors ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="fx-card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    )
  }

  if (sectors.length === 0) return null

  const amtKey = view === 'foreign' ? 'foreign_net_amt' : 'inst_net_amt'
  const sorted = [...sectors].sort((a, b) => b[amtKey] - a[amtKey])
  const maxAbs = Math.max(...sorted.map((s) => Math.abs(s[amtKey] / 100000)), 1)

  return (
    <div className="fx-card">
      <div className="flex items-center justify-between mb-3">
        <span className="fx-card-title">업종별 투자자 수급</span>
        <div className="flex items-center gap-2">
          {date && <span className="text-[13px] text-[#9CA3AF]">{date}</span>}
          <div className="flex gap-0.5 bg-[#F5F4F0] rounded-lg p-0.5">
            {(['foreign', 'inst'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setView(t)}
                className={`px-3 py-1 rounded-md text-[12px] font-bold transition-colors ${
                  view === t
                    ? 'bg-white shadow-sm text-[#1A1A2E]'
                    : 'text-[#9CA3AF] hover:text-[#6B7280]'
                }`}
              >
                {t === 'foreign' ? '외국인' : '기관'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 섹터 수평 바 */}
      <div className="space-y-1.5">
        {sorted.map((s) => {
          const amt = s[amtKey] / 100000 // 억원
          const pct = (Math.abs(amt) / maxAbs) * 100
          const positive = amt >= 0
          const topBuy = view === 'foreign' ? s.top_foreign_buy : s.top_inst_buy
          const topName = topBuy?.split(':')[0] ?? ''

          return (
            <div key={s.sector} className="flex items-center gap-2" title={topBuy}>
              <span className="text-[12px] font-bold text-[#1A1A2E] w-[64px] shrink-0 truncate">
                {s.sector}
              </span>
              <div className="flex-1 h-4 bg-[#F5F4F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${positive ? 'bg-[#EF4444]' : 'bg-[#3B82F6]'}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span
                className={`text-[11px] font-bold tabular-nums w-[52px] text-right shrink-0 ${
                  positive ? 'text-[#EF4444]' : 'text-[#3B82F6]'
                }`}
              >
                {fmtAmt(s[amtKey])}
              </span>
              {topName && (
                <span className="text-[10px] text-[#9CA3AF] w-[56px] shrink-0 truncate">
                  {topName}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
