'use client'

import { useEffect, useState } from 'react'

interface RelayItem {
  lead_sector: string
  lag_sector: string
  lead_return_1d: number
  lead_return_5d: number
  lead_breadth: number
  lag_return_1d: number
  lag_return_5d: number
  gap: number
  signal_type: string
  score: number
}

const SIGNAL_STYLE: Record<string, { color: string; bg: string }> = {
  '강한 매수 기회': { color: 'text-red-400', bg: 'bg-red-900/30 border-red-800/50' },
  '매수 기회': { color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-800/50' },
  '관심 구간': { color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800/50' },
  '추격 진행중': { color: 'text-green-400', bg: 'bg-green-900/30 border-green-800/50' },
  '선행 하락': { color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/50' },
  '대기': { color: 'text-gray-400', bg: 'bg-gray-800/30 border-gray-700/50' },
}

export default function RelayView() {
  const [items, setItems] = useState<RelayItem[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/relay', { signal: controller.signal })
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
        <p className="text-gray-500">릴레이 데이터가 아직 없습니다.</p>
        <p className="text-gray-600 text-sm mt-1">매일 16:35 업데이트됩니다.</p>
      </div>
    )
  }

  const buySignals = items.filter((i) => i.signal_type.includes('매수') || i.signal_type === '관심 구간')
  const otherSignals = items.filter((i) => !i.signal_type.includes('매수') && i.signal_type !== '관심 구간')

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">섹터 릴레이</h1>
          <p className="text-gray-500 text-sm mt-1">선행→후행 섹터 순환 괴리율 추적 (Lead-Lag)</p>
        </div>
        {date && <span className="text-gray-600 text-sm">{date}</span>}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="매수 기회" count={buySignals.length} color="text-red-400" bg="bg-red-900/20" />
        <SummaryCard label="기타 시그널" count={otherSignals.length} color="text-blue-400" bg="bg-blue-900/20" />
        <SummaryCard label="전체 쌍" count={items.length} color="text-gray-300" bg="bg-gray-800/20" />
      </div>

      {/* 릴레이 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b border-gray-800">
              <th className="text-left py-2 px-2">선행 → 후행</th>
              <th className="text-center py-2 px-2">시그널</th>
              <th className="text-right py-2 px-2">점수</th>
              <th className="text-right py-2 px-2">괴리율</th>
              <th className="text-right py-2 px-2">선행 1D</th>
              <th className="text-right py-2 px-2">선행 5D</th>
              <th className="text-right py-2 px-2">선행 종목비</th>
              <th className="text-right py-2 px-2">후행 1D</th>
              <th className="text-right py-2 px-2">후행 5D</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sig = SIGNAL_STYLE[item.signal_type] ?? { color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700' }
              const gapNum = Number(item.gap)
              return (
                <tr key={`${item.lead_sector}-${item.lag_sector}`} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2.5 px-2">
                    <span className="text-gray-200 font-medium">{item.lead_sector}</span>
                    <span className="text-gray-600 mx-1.5">→</span>
                    <span className="text-gray-300">{item.lag_sector}</span>
                  </td>
                  <td className="text-center py-2.5 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${sig.bg} ${sig.color}`}>{item.signal_type}</span>
                  </td>
                  <td className="text-right py-2.5 px-2">
                    <span className={`font-bold font-mono ${item.score >= 50 ? 'text-red-400' : item.score >= 30 ? 'text-yellow-400' : 'text-gray-400'}`}>{item.score}</span>
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono font-bold ${gapNum >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {gapNum >= 0 ? '+' : ''}{gapNum.toFixed(1)}%p
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.lead_return_1d) >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {Number(item.lead_return_1d) >= 0 ? '+' : ''}{Number(item.lead_return_1d).toFixed(2)}%
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.lead_return_5d) >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {Number(item.lead_return_5d) >= 0 ? '+' : ''}{Number(item.lead_return_5d).toFixed(2)}%
                  </td>
                  <td className="text-right py-2.5 px-2 font-mono text-xs text-gray-400">
                    {Number(item.lead_breadth).toFixed(0)}%
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.lag_return_1d) >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {Number(item.lag_return_1d) >= 0 ? '+' : ''}{Number(item.lag_return_1d).toFixed(2)}%
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.lag_return_5d) >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {Number(item.lag_return_5d) >= 0 ? '+' : ''}{Number(item.lag_return_5d).toFixed(2)}%
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
      <p className="text-gray-600 text-xs mt-0.5">쌍</p>
    </div>
  )
}
