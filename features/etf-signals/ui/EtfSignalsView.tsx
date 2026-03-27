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
  '대량 자금유입': { color: 'text-red-400', bg: 'bg-red-900/30 border-red-800/50' },
  '자금유입': { color: 'text-red-300', bg: 'bg-red-900/20 border-red-800/30' },
  '강세 급등': { color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-800/50' },
  '강세': { color: 'text-orange-300', bg: 'bg-orange-900/20 border-orange-800/30' },
  '대량 자금유출': { color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/50' },
  '자금유출': { color: 'text-blue-300', bg: 'bg-blue-900/20 border-blue-800/30' },
  '약세 급락': { color: 'text-cyan-400', bg: 'bg-cyan-900/30 border-cyan-800/50' },
  '약세': { color: 'text-cyan-300', bg: 'bg-cyan-900/20 border-cyan-800/30' },
  '보합': { color: 'text-gray-400', bg: 'bg-gray-800/30 border-gray-700/50' },
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
          <div key={i} className="h-16 bg-gray-800 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-gray-500">ETF 시그널 데이터가 아직 없습니다.</p>
        <p className="text-gray-600 text-sm mt-1">매일 16:30 업데이트됩니다.</p>
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
          <h1 className="text-white text-2xl font-bold">ETF 자금흐름 시그널</h1>
          <p className="text-gray-500 text-sm mt-1">24개 섹터 ETF 설정액 변동 + 시그널 추적</p>
        </div>
        {date && <span className="text-gray-600 text-sm">{date}</span>}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="자금유입/강세" count={inflow.length} color="text-red-400" bg="bg-red-900/20" />
        <SummaryCard label="자금유출/약세" count={outflow.length} color="text-blue-400" bg="bg-blue-900/20" />
        <SummaryCard label="보합" count={neutral.length} color="text-gray-400" bg="bg-gray-800/20" />
      </div>

      {/* ETF 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b border-gray-800">
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
              const sig = SIGNAL_STYLE[item.signal_type] ?? { color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700' }
              return (
                <tr key={item.ticker} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2.5 px-2">
                    <span className="text-gray-200 font-medium">{item.name}</span>
                    <span className="text-gray-600 text-xs ml-1.5">{item.ticker}</span>
                    {item.sector && <span className="text-gray-700 text-xs ml-1.5">{item.sector}</span>}
                  </td>
                  <td className="text-center py-2.5 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${sig.bg} ${sig.color}`}>{item.signal_type}</span>
                  </td>
                  <td className="text-right py-2.5 px-2">
                    <span className={`font-bold font-mono ${item.score >= 70 ? 'text-red-400' : item.score >= 40 ? 'text-yellow-400' : 'text-gray-400'}`}>{item.score}</span>
                  </td>
                  <td className="text-right py-2.5 px-2 text-gray-300 font-mono">{item.close.toLocaleString()}</td>
                  <td className={`text-right py-2.5 px-2 font-mono ${item.change_pct >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {item.change_pct >= 0 ? '+' : ''}{Number(item.change_pct).toFixed(2)}%
                  </td>
                  <td className="text-right py-2.5 px-2 text-gray-400 font-mono text-xs">{formatBil(item.aum)}</td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${item.aum_change >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {formatBil(item.aum_change)}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${item.aum_change_pct >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {Number(item.aum_change_pct) >= 0 ? '+' : ''}{Number(item.aum_change_pct).toFixed(1)}%
                  </td>
                  <td className="text-right py-2.5 px-2 text-gray-500 font-mono text-xs">{formatVol(item.volume)}</td>
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
    <div className={`${bg} rounded-lg p-4 border border-gray-800`}>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className={`${color} text-2xl font-bold mt-1`}>{count}</p>
      <p className="text-gray-600 text-xs mt-0.5">ETF</p>
    </div>
  )
}
