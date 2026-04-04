'use client'

import { useEffect, useState } from 'react'

interface EtfSignalItem {
  ticker: string
  name: string
  sector: string
  close: number
  change_pct: number
  aum: number
  aum_change: number
  aum_change_pct: number
  volume: number
  value: number
  signal_type: string
  score: number
}

const SIGNAL_STYLE: Record<string, { color: string; bg: string }> = {
  '대량 자금유입': { color: 'text-[var(--up)]', bg: 'bg-[var(--up-bg)] border-[var(--up)]/20' },
  '자금유입': { color: 'text-[var(--up)]', bg: 'bg-[var(--up-bg)]/60 border-[var(--up)]/10' },
  '강세 급등': { color: 'text-[var(--yellow)]', bg: 'bg-amber-50 border-amber-200' },
  '강세': { color: 'text-[var(--yellow)]', bg: 'bg-amber-50/60 border-amber-200/60' },
  '대량 자금유출': { color: 'text-[var(--down)]', bg: 'bg-[var(--down-bg)] border-[var(--down)]/20' },
  '자금유출': { color: 'text-[var(--down)]', bg: 'bg-[var(--down-bg)]/60 border-[var(--down)]/10' },
  '약세 급락': { color: 'text-[var(--down)]', bg: 'bg-[var(--down-bg)] border-[var(--down)]/20' },
  '약세': { color: 'text-[var(--down)]', bg: 'bg-[var(--down-bg)]/60 border-[var(--down)]/10' },
  '보합': { color: 'text-[var(--text-dim)]', bg: 'bg-gray-50 border-[var(--border)]' },
}

function formatBil(n: number) {
  const bil = n / 100_000_000
  if (Math.abs(bil) >= 100) return `${bil >= 0 ? '+' : ''}${(bil / 10000).toFixed(1)}조`
  if (Math.abs(bil) >= 1) return `${bil >= 0 ? '+' : ''}${bil.toFixed(0)}억`
  return `${bil >= 0 ? '+' : ''}${bil.toFixed(1)}억`
}

function formatVol(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export default function EtfSignalsView() {
  const [items, setItems] = useState<EtfSignalItem[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/etf-signals', { signal: controller.signal })
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
        <p className="text-[var(--text-muted)]">ETF 시그널 데이터가 아직 없습니다.</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">매일 16:30 업데이트됩니다.</p>
      </div>
    )
  }

  const inflow = items.filter((i) => i.signal_type.includes('유입') || i.signal_type.includes('강세'))
  const outflow = items.filter((i) => i.signal_type.includes('유출') || i.signal_type.includes('약세'))
  const neutral = items.filter((i) => i.signal_type === '보합')

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-bold">ETF 자금흐름 시그널</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">24개 섹터 ETF 설정액 변동 + 시그널 추적</p>
        </div>
        {date && <span className="text-[var(--text-muted)] text-sm">{date}</span>}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="자금유입/강세" count={inflow.length} color="text-[var(--up)]" bg="bg-[var(--up-bg)]" />
        <SummaryCard label="자금유출/약세" count={outflow.length} color="text-[var(--down)]" bg="bg-[var(--down-bg)]" />
        <SummaryCard label="보합" count={neutral.length} color="text-[var(--text-dim)]" bg="bg-gray-50" />
      </div>

      {/* ETF 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
              <th className="text-left py-2 px-2">ETF</th>
              <th className="text-center py-2 px-2">시그널</th>
              <th className="text-right py-2 px-2">점수</th>
              <th className="text-right py-2 px-2">현재가</th>
              <th className="text-right py-2 px-2">등락</th>
              <th className="text-right py-2 px-2">설정액</th>
              <th className="text-right py-2 px-2">설정액 변동</th>
              <th className="text-right py-2 px-2">변동률</th>
              <th className="text-right py-2 px-2">거래량</th>
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
                  <td className={`text-right py-2.5 px-2 font-mono ${item.change_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {item.change_pct >= 0 ? '+' : ''}{Number(item.change_pct).toFixed(2)}%
                  </td>
                  <td className="text-right py-2.5 px-2 text-[var(--text-dim)] font-mono text-xs">{formatBil(item.aum)}</td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${item.aum_change >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {formatBil(item.aum_change)}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${item.aum_change_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {Number(item.aum_change_pct) >= 0 ? '+' : ''}{Number(item.aum_change_pct).toFixed(1)}%
                  </td>
                  <td className="text-right py-2.5 px-2 text-[var(--text-muted)] font-mono text-xs">{formatVol(item.volume)}</td>
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
      <p className="text-[var(--text-muted)] text-xs mt-0.5">ETF</p>
    </div>
  )
}
