'use client'

import { useEffect, useState } from 'react'

interface ProgramTrading {
  date: string
  market: string
  arb_net_amt: number
  non_arb_net_amt: number
  total_net_amt: number
}

interface ProgramInvestor {
  investor_type: string
  net_amt: number
}

function fmtAmt(n: number): string {
  const v = n / 100 // 백만원→억원
  if (Math.abs(v) >= 10000) return `${v >= 0 ? '+' : ''}${(v / 10000).toFixed(1)}조`
  return `${v >= 0 ? '+' : ''}${v.toFixed(0)}억`
}

export default function ProgramTradingPanel() {
  const [market, setMarket] = useState<'KOSPI' | 'KOSDAQ'>('KOSPI')
  const [trading, setTrading] = useState<ProgramTrading[]>([])
  const [investors, setInvestors] = useState<ProgramInvestor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetch(`/api/market/program-trading?market=${market}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        setTrading(json.trading ?? [])
        setInvestors(json.investors ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [market])

  const latest = trading[0]
  const recent = trading.slice(0, 10)
  const recentAmts = recent.map((r) => Math.abs(r.total_net_amt / 100))
  const maxAbs = recentAmts.length > 0 ? Math.max(...recentAmts, 1) : 1
  const sortedInv = [...investors].sort((a, b) => b.net_amt - a.net_amt)
  const invAmts = sortedInv.map((r) => Math.abs(r.net_amt / 100))
  const maxInvAbs = invAmts.length > 0 ? Math.max(...invAmts, 1) : 1

  if (loading) {
    return (
      <div className="fx-card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!latest) return null

  return (
    <div className="fx-card">
      <div className="flex items-center justify-between mb-3">
        <span className="fx-card-title">프로그램 매매 동향</span>
        <div className="flex gap-1">
          {(['KOSPI', 'KOSDAQ'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-colors ${
                market === m
                  ? 'bg-[#00FF88] text-[#1A1A2E]'
                  : 'text-[#9CA3AF] hover:text-[#6B7280]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 오늘 요약 */}
      <div className="flex gap-4 mb-4 text-[14px]">
        <div>
          <span className="text-[#6B7280]">전체 </span>
          <span className={`font-bold ${latest.total_net_amt >= 0 ? 'text-[#3B82F6]' : 'text-[#EF4444]'}`}>
            {fmtAmt(latest.total_net_amt)}
          </span>
        </div>
        <div>
          <span className="text-[#6B7280]">차익 </span>
          <span className={`font-bold ${latest.arb_net_amt >= 0 ? 'text-[#93C5FD]' : 'text-[#FCA5A5]'}`}>
            {fmtAmt(latest.arb_net_amt)}
          </span>
        </div>
        <div>
          <span className="text-[#6B7280]">비차익 </span>
          <span className={`font-bold ${latest.non_arb_net_amt >= 0 ? 'text-[#3B82F6]' : 'text-[#EF4444]'}`}>
            {fmtAmt(latest.non_arb_net_amt)}
          </span>
        </div>
      </div>

      {/* 일별 추이 수평 바 */}
      <div className="space-y-1 mb-4">
        {recent.map((r) => {
          const amt = r.total_net_amt / 100 // 억원
          const pct = Math.min(Math.abs(amt) / maxAbs, 1) * 50
          const positive = amt >= 0
          return (
            <div key={r.date} className="flex items-center gap-2 h-5">
              <span className="text-[11px] text-[#9CA3AF] w-[40px] shrink-0 tabular-nums">
                {r.date.slice(5)}
              </span>
              <div className="flex-1 flex items-center h-full relative">
                <div className="absolute left-1/2 w-[1px] h-full bg-[#E8E6E0]" />
                {positive ? (
                  <div
                    className="h-3 bg-[#3B82F6] rounded-r absolute left-1/2"
                    style={{ width: `${pct}%` }}
                  />
                ) : (
                  <div
                    className="h-3 bg-[#EF4444] rounded-l absolute"
                    style={{ width: `${pct}%`, right: '50%' }}
                  />
                )}
              </div>
              <span
                className={`text-[11px] font-bold tabular-nums w-[56px] text-right shrink-0 ${
                  positive ? 'text-[#3B82F6]' : 'text-[#EF4444]'
                }`}
              >
                {fmtAmt(r.total_net_amt)}
              </span>
            </div>
          )
        })}
      </div>

      {/* 투자자별 수평 바 */}
      {sortedInv.length > 0 && (
        <>
          <p className="text-[12px] font-bold text-[#6B7280] mb-2">투자자별 프로그램 매매</p>
          <div className="space-y-1">
            {sortedInv.slice(0, 8).map((inv) => {
              const amt = inv.net_amt / 100
              const pct = (Math.abs(amt) / maxInvAbs) * 100
              const positive = amt >= 0
              return (
                <div key={inv.investor_type} className="flex items-center gap-2">
                  <span className="text-[12px] text-[#6B7280] w-[52px] shrink-0 truncate">
                    {inv.investor_type.replace(/\s/g, '')}
                  </span>
                  <div className="flex-1 h-3 bg-[#F5F4F0] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${positive ? 'bg-[#3B82F6]' : 'bg-[#EF4444]'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-bold tabular-nums w-[52px] text-right shrink-0 ${
                      positive ? 'text-[#3B82F6]' : 'text-[#EF4444]'
                    }`}
                  >
                    {fmtAmt(inv.net_amt)}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
