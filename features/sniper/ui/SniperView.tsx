'use client'

import { useEffect, useState } from 'react'

interface SniperItem {
  ticker: string
  name: string
  sector: string
  close: number
  change_pct: number
  rsi: number
  ma20_gap: number
  bb_position: number
  adx: number
  foreign_days: number
  inst_days: number
  exec_strength: number
  vol_ratio: number
  signal_type: string
  score: number
}

const SIGNAL_STYLE: Record<string, { color: string; bg: string }> = {
  '골든크로스': { color: 'text-[var(--up)]', bg: 'bg-red-50 border-red-200' },
  '과매도 반등': { color: 'text-[var(--yellow)]', bg: 'bg-amber-50 border-amber-200' },
  '수급 반전': { color: 'text-[var(--green)]', bg: 'bg-green-50 border-green-200' },
  '볼밴 하단': { color: 'text-[var(--down)]', bg: 'bg-blue-50 border-blue-200' },
  '추세 시작': { color: 'text-[var(--purple)]', bg: 'bg-purple-50 border-purple-200' },
}

export default function SniperView() {
  const [items, setItems] = useState<SniperItem[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/sniper', { signal: controller.signal })
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
        <p className="text-[var(--text-muted)]">스나이퍼워치 데이터가 아직 없습니다.</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">매일 장마감 후 업데이트됩니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-bold">스나이퍼워치</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">기술적 과매도 + 수급 반전 정밀 진입 포인트</p>
        </div>
        {date && <span className="text-[var(--text-muted)] text-sm">{date}</span>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="고점수 (70+)" count={items.filter(i => i.score >= 70).length} color="text-[var(--up)]" bg="bg-[var(--up-bg)]" />
        <SummaryCard label="관심 (40-69)" count={items.filter(i => i.score >= 40 && i.score < 70).length} color="text-[var(--yellow)]" bg="bg-yellow-50" />
        <SummaryCard label="전체" count={items.length} color="text-[var(--text-primary)]" bg="bg-gray-50" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
              <th className="text-left py-2 px-2">종목</th>
              <th className="text-center py-2 px-2">시그널</th>
              <th className="text-right py-2 px-2">점수</th>
              <th className="text-right py-2 px-2">현재가</th>
              <th className="text-right py-2 px-2">등락</th>
              <th className="text-right py-2 px-2">RSI</th>
              <th className="text-right py-2 px-2">MA20갭</th>
              <th className="text-right py-2 px-2">BB위치</th>
              <th className="text-right py-2 px-2">ADX</th>
              <th className="text-right py-2 px-2">외인(일)</th>
              <th className="text-right py-2 px-2">기관(일)</th>
              <th className="text-right py-2 px-2">거래량비</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sig = SIGNAL_STYLE[item.signal_type] ?? { color: 'text-[var(--text-dim)]', bg: 'bg-gray-50 border-[var(--border)]' }
              return (
                <tr key={item.ticker} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-row)]">
                  <td className="py-2.5 px-2">
                    <span className="text-[var(--text-primary)] font-medium">{item.name}</span>
                    <span className="text-[var(--text-muted)] text-xs ml-1.5">{item.ticker}</span>
                    {item.sector && <span className="text-[var(--text-muted)] text-xs ml-1.5">{item.sector}</span>}
                  </td>
                  <td className="text-center py-2.5 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${sig.bg} ${sig.color}`}>{item.signal_type}</span>
                  </td>
                  <td className="text-right py-2.5 px-2">
                    <span className={`font-bold font-mono ${item.score >= 70 ? 'text-[var(--up)]' : item.score >= 40 ? 'text-[var(--yellow)]' : 'text-[var(--text-dim)]'}`}>{item.score}</span>
                  </td>
                  <td className="text-right py-2.5 px-2 text-[var(--text-primary)] font-mono">{item.close.toLocaleString()}</td>
                  <td className={`text-right py-2.5 px-2 font-mono ${Number(item.change_pct) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {Number(item.change_pct) >= 0 ? '+' : ''}{Number(item.change_pct).toFixed(2)}%
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono ${Number(item.rsi) <= 30 ? 'text-[var(--green)]' : Number(item.rsi) >= 70 ? 'text-[var(--up)]' : 'text-[var(--text-primary)]'}`}>
                    {Number(item.rsi).toFixed(0)}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.ma20_gap) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {Number(item.ma20_gap) >= 0 ? '+' : ''}{Number(item.ma20_gap).toFixed(1)}%
                  </td>
                  <td className="text-right py-2.5 px-2 font-mono text-xs text-[var(--text-dim)]">
                    {Number(item.bb_position).toFixed(2)}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.adx) >= 25 ? 'text-[var(--yellow)]' : 'text-[var(--text-muted)]'}`}>
                    {Number(item.adx).toFixed(0)}
                  </td>
                  <td className="text-right py-2.5 px-2">
                    {item.foreign_days > 0 && <span className="text-[var(--green)] font-mono text-xs">{item.foreign_days}일</span>}
                    {item.foreign_days <= 0 && <span className="text-[var(--text-muted)] text-xs">-</span>}
                  </td>
                  <td className="text-right py-2.5 px-2">
                    {item.inst_days > 0 && <span className="text-[var(--down)] font-mono text-xs">{item.inst_days}일</span>}
                    {item.inst_days <= 0 && <span className="text-[var(--text-muted)] text-xs">-</span>}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.vol_ratio) >= 2 ? 'text-[var(--yellow)]' : 'text-[var(--text-muted)]'}`}>
                    {Number(item.vol_ratio).toFixed(1)}x
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
