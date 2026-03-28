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
  '골든크로스': { color: 'text-red-400', bg: 'bg-red-900/30 border-red-800/50' },
  '과매도 반등': { color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-800/50' },
  '수급 반전': { color: 'text-green-400', bg: 'bg-green-900/30 border-green-800/50' },
  '볼밴 하단': { color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/50' },
  '추세 시작': { color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-800/50' },
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
          <div key={i} className="h-16 bg-gray-800 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-gray-500">스나이퍼워치 데이터가 아직 없습니다.</p>
        <p className="text-gray-600 text-sm mt-1">매일 장마감 후 업데이트됩니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">스나이퍼워치</h1>
          <p className="text-gray-500 text-sm mt-1">기술적 과매도 + 수급 반전 정밀 진입 포인트</p>
        </div>
        {date && <span className="text-gray-600 text-sm">{date}</span>}
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-900/20 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-500 text-xs">고점수 (70+)</p>
          <p className="text-red-400 text-2xl font-bold mt-1">{items.filter(i => i.score >= 70).length}</p>
          <p className="text-gray-600 text-xs mt-0.5">종목</p>
        </div>
        <div className="bg-yellow-900/20 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-500 text-xs">관심 (40-69)</p>
          <p className="text-yellow-400 text-2xl font-bold mt-1">{items.filter(i => i.score >= 40 && i.score < 70).length}</p>
          <p className="text-gray-600 text-xs mt-0.5">종목</p>
        </div>
        <div className="bg-gray-800/20 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-500 text-xs">전체</p>
          <p className="text-gray-300 text-2xl font-bold mt-1">{items.length}</p>
          <p className="text-gray-600 text-xs mt-0.5">종목</p>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs border-b border-gray-800">
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
                  <td className={`text-right py-2.5 px-2 font-mono ${Number(item.change_pct) >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {Number(item.change_pct) >= 0 ? '+' : ''}{Number(item.change_pct).toFixed(2)}%
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono ${Number(item.rsi) <= 30 ? 'text-green-400' : Number(item.rsi) >= 70 ? 'text-red-400' : 'text-gray-300'}`}>
                    {Number(item.rsi).toFixed(0)}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.ma20_gap) >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {Number(item.ma20_gap) >= 0 ? '+' : ''}{Number(item.ma20_gap).toFixed(1)}%
                  </td>
                  <td className="text-right py-2.5 px-2 font-mono text-xs text-gray-400">
                    {Number(item.bb_position).toFixed(2)}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.adx) >= 25 ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {Number(item.adx).toFixed(0)}
                  </td>
                  <td className="text-right py-2.5 px-2">
                    {item.foreign_days > 0 && <span className="text-green-400 font-mono text-xs">{item.foreign_days}일</span>}
                    {item.foreign_days <= 0 && <span className="text-gray-700 text-xs">-</span>}
                  </td>
                  <td className="text-right py-2.5 px-2">
                    {item.inst_days > 0 && <span className="text-blue-400 font-mono text-xs">{item.inst_days}일</span>}
                    {item.inst_days <= 0 && <span className="text-gray-700 text-xs">-</span>}
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.vol_ratio) >= 2 ? 'text-yellow-400' : 'text-gray-500'}`}>
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
