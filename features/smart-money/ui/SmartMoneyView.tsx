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
  DUAL_BUY: { label: '쌍끌이 매수', color: 'text-red-400', bg: 'bg-red-900/30 border-red-800/50' },
  FOREIGN_BUY: { label: '외인 매집', color: 'text-green-400', bg: 'bg-green-900/30 border-green-800/50' },
  INST_BUY: { label: '기관 매집', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/50' },
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
          <div key={i} className="h-16 bg-gray-800 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-gray-500">세력 포착 데이터가 아직 없습니다.</p>
        <p className="text-gray-600 text-sm mt-1">매일 장마감 후 업데이트됩니다.</p>
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
          <h1 className="text-white text-2xl font-bold">세력 포착 스캐너</h1>
          <p className="text-gray-500 text-sm mt-1">외국인/기관 연속 순매수 종목 추적</p>
        </div>
        {date && <span className="text-gray-600 text-sm">{date}</span>}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="쌍끌이 매수" count={dual.length} color="text-red-400" bg="bg-red-900/20" />
        <SummaryCard label="외인 매집" count={foreign.length} color="text-green-400" bg="bg-green-900/20" />
        <SummaryCard label="기관 매집" count={inst.length} color="text-blue-400" bg="bg-blue-900/20" />
      </div>

      {/* 종목 리스트 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b border-gray-800">
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
              const sig = SIGNAL_STYLE[item.signal_type] ?? { label: item.signal_type, color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700' }
              return (
                <tr key={item.ticker} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2.5 px-2">
                    <span className="text-gray-200 font-medium">{item.name}</span>
                    <span className="text-gray-600 text-xs ml-1.5">{item.ticker}</span>
                    {item.sector && <span className="text-gray-700 text-xs ml-1.5">{item.sector}</span>}
                  </td>
                  <td className="text-center py-2.5 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${sig.bg} ${sig.color}`}>{sig.label}</span>
                  </td>
                  <td className="text-right py-2.5 px-2">
                    <span className={`font-bold font-mono ${item.score >= 60 ? 'text-red-400' : item.score >= 40 ? 'text-yellow-400' : 'text-gray-400'}`}>{item.score}</span>
                  </td>
                  <td className="text-right py-2.5 px-2 text-gray-300 font-mono">{item.price.toLocaleString()}</td>
                  <td className={`text-right py-2.5 px-2 font-mono ${item.change_pct >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {item.change_pct >= 0 ? '+' : ''}{item.change_pct.toFixed(2)}%
                  </td>
                  <td className="text-right py-2.5 px-2">
                    {item.foreign_consec_days > 0 && <span className="text-green-400 font-mono">{item.foreign_consec_days}일</span>}
                    {item.foreign_consec_days === 0 && <span className="text-gray-700">-</span>}
                  </td>
                  <td className="text-right py-2.5 px-2">
                    {item.inst_consec_days > 0 && <span className="text-blue-400 font-mono">{item.inst_consec_days}일</span>}
                    {item.inst_consec_days === 0 && <span className="text-gray-700">-</span>}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${item.foreign_net_5d >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {formatBil(item.foreign_net_5d)}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${item.inst_net_5d >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
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
    <div className={`${bg} rounded-lg p-4 border border-gray-800`}>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className={`${color} text-2xl font-bold mt-1`}>{count}</p>
      <p className="text-gray-600 text-xs mt-0.5">종목</p>
    </div>
  )
}
