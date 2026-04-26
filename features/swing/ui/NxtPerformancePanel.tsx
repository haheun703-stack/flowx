'use client'

import { useEffect, useState } from 'react'

/* ── 타입 (intelligence_nxt_performance) ── */
interface PerfItem {
  code: string
  name: string
  rank: number
  sector: string
  return_pct: number
  close_price: number
  entry_price: number
  supply_score: number
}

interface NxtPerf {
  pick_date: string
  result_date: string
  avg_return: number
  best_pick: string
  worst_pick: string
  weekly_return: number
  weekly_days: number
  weekly_wins: number
  monthly_return: number
  monthly_days: number
  monthly_wins: number
  items: PerfItem[]
}

/* ── 메인 컴포넌트 ── */
export default function NxtPerformancePanel() {
  const [data, setData] = useState<NxtPerf | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch('/api/intelligence/nxt-performance', { signal: controller.signal })
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        if (json.data) setData(json.data)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error('[NxtPerf]', e)
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse rounded-xl bg-gray-100 h-40" />
    )
  }

  if (!data) return null

  const pctColor = (v: number) => (v >= 0 ? '#16A34A' : '#DC2626')
  const pctStr = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
  const weeklyWinRate = data.weekly_days > 0 ? ((data.weekly_wins / data.weekly_days) * 100).toFixed(0) : '0'
  const monthlyWinRate = data.monthly_days > 0 ? ((data.monthly_wins / data.monthly_days) * 100).toFixed(0) : '0'

  return (
    <div className="bg-white rounded-xl border border-[#E2E5EA] shadow overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-3 bg-[#F5F4F0] border-b border-[#E2E5EA]">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-bold text-[var(--text-primary,#1A1A2E)] font-mono">
            NXT 추천 성적표
          </h3>
          <span className="text-[10px] font-mono text-[var(--text-dim,#9CA3AF)]">
            선정 {data.pick_date} → 결과 {data.result_date}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* 요약 카드 3개 */}
        <div className="grid grid-cols-3 gap-3">
          {/* 전일 수익 */}
          <div className="text-center">
            <div className="text-[10px] font-mono text-[var(--text-dim,#9CA3AF)]">전일 평균</div>
            <div className="text-[22px] font-mono font-bold tabular-nums" style={{ color: pctColor(data.avg_return) }}>
              {pctStr(data.avg_return)}
            </div>
          </div>
          {/* 주간 */}
          <div className="text-center">
            <div className="text-[10px] font-mono text-[var(--text-dim,#9CA3AF)]">주간 ({data.weekly_days}일)</div>
            <div className="text-[22px] font-mono font-bold tabular-nums" style={{ color: pctColor(data.weekly_return) }}>
              {pctStr(data.weekly_return)}
            </div>
            <div className="text-[10px] font-mono text-[#6B7280]">승률 {weeklyWinRate}%</div>
          </div>
          {/* 월간 */}
          <div className="text-center">
            <div className="text-[10px] font-mono text-[var(--text-dim,#9CA3AF)]">월간 ({data.monthly_days}일)</div>
            <div className="text-[22px] font-mono font-bold tabular-nums" style={{ color: pctColor(data.monthly_return) }}>
              {pctStr(data.monthly_return)}
            </div>
            <div className="text-[10px] font-mono text-[#6B7280]">승률 {monthlyWinRate}%</div>
          </div>
        </div>

        {/* 종목별 상세 */}
        {Array.isArray(data.items) && data.items.length > 0 && (
          <div className="border-t border-[#F0EFE9] pt-3">
            <div className="text-[10px] font-mono text-[var(--text-dim,#9CA3AF)] mb-2">
              전일 추천 종목 ({data.pick_date}) · Best: {data.best_pick} / Worst: {data.worst_pick}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.items.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono"
                  style={{
                    borderColor: item.return_pct >= 0 ? '#BBF7D0' : '#FECACA',
                    background: item.return_pct >= 0 ? '#F0FDF4' : '#FEF2F2',
                  }}
                >
                  <span className="font-bold text-[var(--text-primary,#1A1A2E)]">{item.name}</span>
                  <span className="font-bold tabular-nums" style={{ color: pctColor(item.return_pct) }}>
                    {pctStr(item.return_pct)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
