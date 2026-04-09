'use client'

import { useEffect, useState } from 'react'
import { GRADE_PICK, GRADE_LEGACY_BUY } from '@/shared/constants/grades'

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
  '강한 매수 기회': { color: 'text-[var(--up)]', bg: 'bg-red-50 border-red-200' },
  '강한 포착 기회': { color: 'text-[var(--up)]', bg: 'bg-red-50 border-red-200' },
  '매수 기회': { color: 'text-[var(--yellow)]', bg: 'bg-amber-50 border-amber-200' },
  '포착 기회': { color: 'text-[var(--yellow)]', bg: 'bg-amber-50 border-amber-200' },
  '관심 구간': { color: 'text-[var(--yellow)]', bg: 'bg-yellow-50 border-yellow-200' },
  '추격 진행중': { color: 'text-[var(--green)]', bg: 'bg-green-50 border-green-200' },
  '선행 하락': { color: 'text-[var(--down)]', bg: 'bg-blue-50 border-blue-200' },
  '대기': { color: 'text-[var(--text-dim)]', bg: 'bg-gray-50 border-[var(--border)]' },
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
          <div key={i} className="h-16 bg-[var(--bg-row)] rounded-xl" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-[var(--text-muted)]">릴레이 데이터가 아직 없습니다.</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">매일 16:35 업데이트됩니다.</p>
      </div>
    )
  }

  const buySignals = items.filter((i) => i.signal_type.includes(GRADE_LEGACY_BUY) || i.signal_type.includes(GRADE_PICK) || i.signal_type === '관심 구간')
  const otherSignals = items.filter((i) => !i.signal_type.includes(GRADE_LEGACY_BUY) && !i.signal_type.includes(GRADE_PICK) && i.signal_type !== '관심 구간')

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-bold">섹터 릴레이</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">선행→후행 섹터 순환 괴리율 추적 (Lead-Lag)</p>
        </div>
        {date && <span className="text-[var(--text-muted)] text-sm">{date}</span>}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="포착 기회" count={buySignals.length} color="text-[var(--up)]" bg="bg-[var(--up-bg)]" />
        <SummaryCard label="기타 시그널" count={otherSignals.length} color="text-[var(--down)]" bg="bg-[var(--down-bg)]" />
        <SummaryCard label="전체 쌍" count={items.length} color="text-[var(--text-primary)]" bg="bg-gray-50" />
      </div>

      {/* 릴레이 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
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
              const sig = SIGNAL_STYLE[item.signal_type] ?? { color: 'text-[var(--text-dim)]', bg: 'bg-gray-50 border-[var(--border)]' }
              const gapNum = Number(item.gap)
              return (
                <tr key={`${item.lead_sector}-${item.lag_sector}`} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-row)]">
                  <td className="py-2.5 px-2">
                    <span className="text-[var(--text-primary)] font-medium">{item.lead_sector}</span>
                    <span className="text-[var(--text-muted)] mx-1.5">→</span>
                    <span className="text-[var(--text-primary)]">{item.lag_sector}</span>
                  </td>
                  <td className="text-center py-2.5 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${sig.bg} ${sig.color}`}>{item.signal_type}</span>
                  </td>
                  <td className="text-right py-2.5 px-2">
                    <span className={`font-bold font-mono ${item.score >= 50 ? 'text-[var(--up)]' : item.score >= 30 ? 'text-[var(--yellow)]' : 'text-[var(--text-dim)]'}`}>{item.score}</span>
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono font-bold ${gapNum >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {gapNum >= 0 ? '+' : ''}{gapNum.toFixed(1)}%p
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.lead_return_1d) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {Number(item.lead_return_1d) >= 0 ? '+' : ''}{Number(item.lead_return_1d).toFixed(2)}%
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.lead_return_5d) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {Number(item.lead_return_5d) >= 0 ? '+' : ''}{Number(item.lead_return_5d).toFixed(2)}%
                  </td>
                  <td className="text-right py-2.5 px-2 font-mono text-xs text-[var(--text-dim)]">
                    {Number(item.lead_breadth).toFixed(0)}%
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.lag_return_1d) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {Number(item.lag_return_1d) >= 0 ? '+' : ''}{Number(item.lag_return_1d).toFixed(2)}%
                  </td>
                  <td className={`text-right py-2.5 px-2 font-mono text-xs ${Number(item.lag_return_5d) >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
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
    <div className={`${bg} rounded-xl p-4 border border-[var(--border)] shadow-sm`}>
      <p className="text-[var(--text-muted)] text-xs">{label}</p>
      <p className={`${color} text-2xl font-bold mt-1`}>{count}</p>
      <p className="text-[var(--text-muted)] text-xs mt-0.5">쌍</p>
    </div>
  )
}
