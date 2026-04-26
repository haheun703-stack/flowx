'use client'

import { useEffect, useState } from 'react'

interface DtPick {
  rank: number; code: string; name: string; sector: string
  entry_low: number; entry_high: number; tp1: number; sl: number
  upside_to_tp1_pct: number; final_score: number; track: string
}

interface NxtPick {
  rank: number; code: string; name: string; sector: string
  supply_score: number; entry_price: number
}

const pctColor = (v: number) => (v >= 0 ? '#16A34A' : '#DC2626')

export default function TodayVsNxtPanel() {
  const [dtPicks, setDtPicks] = useState<DtPick[]>([])
  const [nxtPicks, setNxtPicks] = useState<NxtPick[]>([])
  const [dtDate, setDtDate] = useState('')
  const [nxtDate, setNxtDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    Promise.allSettled([
      fetch('/api/intelligence/daytrading-picks', { signal: ac.signal }),
      fetch('/api/intelligence/nxt-picks', { signal: ac.signal }),
    ]).then(async ([dtRes, nxtRes]) => {
      if (dtRes.status === 'fulfilled' && dtRes.value.ok) {
        const j = await dtRes.value.json()
        const d = j.data
        if (d) {
          setDtPicks(Array.isArray(d.picks) ? d.picks.slice(0, 5) : [])
          setDtDate(d.date ?? '')
        }
      }
      if (nxtRes.status === 'fulfilled' && nxtRes.value.ok) {
        const j = await nxtRes.value.json()
        const d = j.data
        if (d) {
          setNxtPicks(Array.isArray(d.picks) ? d.picks.slice(0, 5) : [])
          setNxtDate(d.date ?? '')
        }
      }
      setLoading(false)
    })
    return () => ac.abort()
  }, [])

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />
  if (dtPicks.length === 0 && nxtPicks.length === 0) return null

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6">
      <div className="bg-white rounded-xl border border-[#E2E5EA] shadow p-5">
        <h3 className="text-[15px] font-bold text-[#1A1A2E] tracking-[-0.2px] mb-4">
          TODAY vs NXT 비교
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 좌: TODAY 단타 TOP 5 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] font-bold px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626]">TODAY</span>
              <span className="text-[12px] text-[#6B7280]">단타 TOP 5 {dtDate && `· ${dtDate}`}</span>
            </div>
            {dtPicks.length === 0 ? (
              <p className="text-[13px] text-[#9CA3AF] py-4 text-center">데이터 없음</p>
            ) : (
              <div className="space-y-1.5">
                {dtPicks.map((p) => (
                  <div key={p.code} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FAFAF8] border border-[#F0EDE8] text-[12px]">
                    <span className="w-5 text-[11px] font-bold text-[#9CA3AF] tabular-nums">{p.rank}</span>
                    <span className="font-bold text-[#1A1A2E] truncate flex-1">{p.name}</span>
                    <span className="text-[10px] text-[#6B7280] shrink-0">{p.sector}</span>
                    <span className="font-bold tabular-nums shrink-0" style={{ color: pctColor(p.upside_to_tp1_pct) }}>
                      +{p.upside_to_tp1_pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ backgroundColor: p.track === 'A_대형주' ? '#EFF6FF' : '#F5F3FF', color: p.track === 'A_대형주' ? '#2563EB' : '#7C3AED' }}>
                      {p.track === 'A_대형주' ? '대형' : '중소'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 우: NXT 야간매수 TOP 5 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] font-bold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB]">NXT</span>
              <span className="text-[12px] text-[#6B7280]">야간매수 TOP 5 {nxtDate && `· ${nxtDate}`}</span>
            </div>
            {nxtPicks.length === 0 ? (
              <p className="text-[13px] text-[#9CA3AF] py-4 text-center">데이터 없음</p>
            ) : (
              <div className="space-y-1.5">
                {nxtPicks.map((p) => (
                  <div key={p.code} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FAFAF8] border border-[#F0EDE8] text-[12px]">
                    <span className="w-5 text-[11px] font-bold text-[#9CA3AF] tabular-nums">{p.rank}</span>
                    <span className="font-bold text-[#1A1A2E] truncate flex-1">{p.name}</span>
                    <span className="text-[10px] text-[#6B7280] shrink-0">{p.sector}</span>
                    <span className="font-bold tabular-nums text-[#2563EB] shrink-0">수급 {p.supply_score}</span>
                    <span className="text-[#1A1A2E] tabular-nums shrink-0">{p.entry_price.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
