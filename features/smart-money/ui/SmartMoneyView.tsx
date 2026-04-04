'use client'

import { useEffect, useState } from 'react'

interface SmartMoneyItem {
  ticker: string
  name: string
  sector: string
  foreign_consec_days: number
  inst_consec_days: number
  foreign_net_5d: number
  inst_net_5d: number
  signal_type: string
  price: number
  change_pct: number
  score: number
}

const SIGNAL_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  DUAL_BUY: { label: '쌍끌이 매수', color: 'text-[var(--up)]', bg: 'bg-red-50 border-red-200' },
  FOREIGN_BUY: { label: '외인 매집', color: 'text-[var(--green)]', bg: 'bg-green-50 border-green-200' },
  INST_BUY: { label: '기관 매집', color: 'text-[var(--down)]', bg: 'bg-blue-50 border-blue-200' },
}

function formatBil(n: number) {
  const bil = n / 1_000_000_000
  if (Math.abs(bil) >= 1) return `${bil >= 0 ? '+' : ''}${bil.toFixed(0)}억`
  const man = n / 100_000_000
  return `${man >= 0 ? '+' : ''}${man.toFixed(0)}억`
}

export default function SmartMoneyView() {
  const [items, setItems] = useState<SmartMoneyItem[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/smart-money', { signal: controller.signal })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        setItems(json.items ?? [])
        setDate(json.date)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setItems([])
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-[var(--bg-row)] rounded-xl" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-[var(--text-muted)]">세력 포착 데이터가 아직 없습니다.</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">매일 장마감 후 업데이트됩니다.</p>
      </div>
    )
  }

  const dual = items.filter((i) => i.signal_type === 'DUAL_BUY')
  const foreign = items.filter((i) => i.signal_type === 'FOREIGN_BUY')
  const inst = items.filter((i) => i.signal_type === 'INST_BUY')

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-bold">세력 포착 스캐너</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">외국인/기관 연속 순매수 종목 추적</p>
        </div>
        {date && <span className="text-[var(--text-muted)] text-sm">{date}</span>}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="쌍끌이 매수" count={dual.length} color="text-[var(--up)]" bg="bg-[var(--up-bg)]" />
        <SummaryCard label="외인 매집" count={foreign.length} color="text-[var(--green)]" bg="bg-green-50" />
        <SummaryCard label="기관 매집" count={inst.length} color="text-[var(--down)]" bg="bg-[var(--down-bg)]" />
      </div>

      {/* 종목 리스트 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
              <th className="text-left py-2 px-2">종목</th>
              <th className="text-center py-2 px-2">유형</th>
              <th className="text-right py-2 px-2">점수</th>
              <th className="text-right py-2 px-2">현재가</th>
              <th className="text-right py-2 px-2">등락</th>
              <th className="text-right py-2 px-2">외인(일)</th>
              <th className="text-right py-2 px-2">기관(일)</th>
              <th className="text-right py-2 px-2">외인5일</th>
              <th className="text-right py-2 px-2">기관5일</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sig = SIGNAL_STYLE[item.signal_type] ?? { label: item.signal_type, color: 'text-[var(--text-dim)]', bg: 'bg-gray-50 border-[var(--border)]' }
              return (
                <tr key={item.ticker} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-row)]">
                  <td className="py-2.5 px-2">
                    <span className="text-[var(--text-primary)] font-medium">{item.name}</span>
                    <span className="text-[var(--text-muted)] text-xs ml-1.5">{item.ticker}</span>
                    {item.sector && <span className="text-[var(--text-muted)] text-xs ml-1.5">{item.sector}</span>}
                  </td>
                  <td className="text-center py-2.5 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${sig.bg} ${sig.color}`}>{sig.label}</span>
                  </td>
                  <td className="text-right py-2.5 px-2">
                    <span className={`font-bold font-mono ${item.score >= 60 ? 'text-[var(--up)]' : item.score >= 40 ? 'text-[var(--yellow)]' : 'text-[var(--text-dim)]'}`}>{item.score}</span>
                  </td>
                  <td className="text-right py-2.5 px-2 text-[var(--text-primary)] font-mono">{item.price.toLocaleString()}</td>
                  <td className={`text-right py-2.5 px-2 font-mono ${item.change_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {item.change_pct >= 0 ? '+' : ''}{item.change_pct.toFixed(2)}%
                  </td>
                  <td className="text-right py-2.5 px-2">
                    {item.foreign_consec_days > 0 && <span className="text-[var(--green)] font-mono">{item.foreign_consec_days}일</span>}
                    {item.foreign_consec_days === 0 && <span className="text-[var(--text-muted)]">-</span>}
                  </td>
                  <td className="text-right py-2.5 px-2">
                    {item.inst_consec_days > 0 && <span className="text-[var(--down)] font-mono">{item.inst_consec_days}일</span>}
                    {item.inst_consec_days === 0 && <span className="text-[var(--text-muted)]">-</span>}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${item.foreign_net_5d >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {formatBil(item.foreign_net_5d)}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${item.inst_net_5d >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {formatBil(item.inst_net_5d)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-[var(--border)] shadow-sm`}>
      <p className="text-[var(--text-muted)] text-xs">{label}</p>
      <p className={`${color} text-2xl font-bold mt-1`}>{count}</p>
      <p className="text-[var(--text-muted)] text-xs mt-0.5">종목</p>
    </div>
  )
}
