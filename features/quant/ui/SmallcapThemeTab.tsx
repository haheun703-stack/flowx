'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import type { BluechipCheckupData } from './BluechipCheckupPanel'
import { fmtCap } from '@/shared/lib/formatters'
import { FibStock, ZONE_ORDER, ZONE_CONFIG, FibMiniGauge, FibLegend } from '@/features/swing/ui/FibShared'

type FibFilter = 'all' | 'DEEP' | 'MID' | 'MILD'

export default function SmallcapThemeTab({ bluechip: _bluechip }: { bluechip: BluechipCheckupData | null }) {
  const [fibStocks, setFibStocks] = useState<FibStock[]>([])
  const [fibDate, setFibDate] = useState('')
  const [fibLoading, setFibLoading] = useState(true)
  const [fibFilter, setFibFilter] = useState<FibFilter>('all')
  const [fibSort, setFibSort] = useState<'drop' | 'upside' | 'per'>('drop')

  useEffect(() => {
    const ac = new AbortController()
    async function load() {
      try {
        let res = await fetch('/api/quant/fib-scanner', { signal: ac.signal })
        let json = res.ok ? await res.json() : null
        if (json?.data?.fib_stocks?.length) {
          setFibStocks(json.data.fib_stocks)
          setFibDate(json.data.date ?? '')
        } else {
          res = await fetch('/api/swing-dashboard', { signal: ac.signal })
          json = res.ok ? await res.json() : null
          setFibStocks(json?.data?.fib_stocks ?? [])
          setFibDate(json?.data?.date ?? '')
        }
      } catch { /* abort */ }
      setFibLoading(false)
    }
    load()
    return () => ac.abort()
  }, [])

  const filteredFib = useMemo(() => {
    let arr = fibFilter === 'all' ? [...fibStocks] : fibStocks.filter(s => s.fib_zone === fibFilter)
    if (fibSort === 'drop') arr.sort((a, b) => a.drop - b.drop)
    else if (fibSort === 'upside') arr.sort((a, b) => b.upside - a.upside)
    else if (fibSort === 'per') arr.sort((a, b) => a.per - b.per)
    return arr
  }, [fibStocks, fibFilter, fibSort])

  const zoneCounts = useMemo(() =>
    ZONE_ORDER.map(zone => ({ zone, count: fibStocks.filter(s => s.fib_zone === zone).length }))
      .filter(z => z.count > 0),
    [fibStocks],
  )

  return (
    <div className="space-y-4">
      <div className="fx-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[15px] font-bold text-[#1A1A2E]">눌림목 소형주 전체</span>
            <span className="text-[12px] text-[#9CA3AF] ml-2">{fibStocks.length}종목</span>
          </div>
          {fibDate && <span className="text-[12px] text-[#9CA3AF]">{fibDate} 기준</span>}
        </div>

        {fibLoading ? (
          <div className="animate-pulse h-32 bg-gray-200 rounded-xl" />
        ) : fibStocks.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF] text-center py-6">피보나치 데이터 없음</p>
        ) : (
          <div className="space-y-3">
            {/* 필터 탭 + 정렬 */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                {([{ key: 'all' as const, label: `전체 ${fibStocks.length}` }, ...zoneCounts.map(z => ({ key: z.zone as FibFilter, label: `${z.zone} ${z.count}` }))] as { key: FibFilter; label: string }[]).map(f => (
                  <button key={f.key} onClick={() => setFibFilter(f.key)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors"
                    style={{ backgroundColor: fibFilter === f.key ? '#F0EDE8' : 'transparent', color: fibFilter === f.key ? '#1A1A2E' : '#9CA3AF' }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-1">
                {(['drop', 'upside', 'per'] as const).map(k => (
                  <button key={k} onClick={() => setFibSort(k)}
                    className="text-[11px] font-bold px-2 py-1 rounded-md transition-colors"
                    style={{ backgroundColor: fibSort === k ? '#F0EDE8' : 'transparent', color: fibSort === k ? '#1A1A2E' : '#9CA3AF' }}>
                    {k === 'drop' ? '하락률순' : k === 'upside' ? '상승여력순' : 'PER순'}
                  </button>
                ))}
              </div>
            </div>

            {/* zone별 분포 뱃지 */}
            <div className="flex gap-2 flex-wrap">
              {zoneCounts.map(({ zone, count }) => {
                const cfg = ZONE_CONFIG[zone]
                return (
                  <span key={zone} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full"
                    style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    {cfg.icon} {cfg.label.split(' ')[0]} {count}종목
                  </span>
                )
              })}
            </div>

            {/* 테이블 */}
            <div className="table-scroll rounded-xl border border-[#E8E6E0]">
              <table className="w-full text-[13px] min-w-[700px]">
                <thead>
                  <tr style={{ backgroundColor: '#F5F4F0' }}>
                    <th className="text-center py-2 px-2 text-[11px] font-bold text-[#6B7280] w-8">#</th>
                    <th className="text-left py-2 px-3 text-[11px] font-bold text-[#6B7280]">종목</th>
                    <th className="text-center py-2 px-2 text-[11px] font-bold text-[#6B7280]">섹터</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">시총</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">현재가</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">하락률</th>
                    <th className="text-center py-2 px-2 text-[11px] font-bold text-[#6B7280]">구간</th>
                    <th className="text-center py-2 px-2 text-[12px] font-extrabold text-[#1A1A2E] min-w-[140px]">피보나치 위치</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">상승여력</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">PER</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFib.map((s, i) => {
                    const cfg = ZONE_CONFIG[s.fib_zone] ?? ZONE_CONFIG.MILD
                    return (
                      <tr key={s.code} className="border-t border-[#E8E6E0]/50 hover:bg-[#F9F8F6]">
                        <td className="text-center py-2.5 px-2 text-[12px] text-[#9CA3AF] tabular-nums">{i + 1}</td>
                        <td className="py-2.5 px-3">
                          <Link href={`/stock/${s.code}`} className="font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors">
                            {s.name}
                          </Link>
                        </td>
                        <td className="text-center py-2.5 px-2 text-[#6B7280] text-[12px]">{s.sector}</td>
                        <td className="text-right py-2.5 px-2 text-[#6B7280] tabular-nums text-[12px]">{fmtCap(s.cap ?? 0)}</td>
                        <td className="text-right py-2.5 px-2 font-bold text-[#1A1A2E] tabular-nums text-[12px]">{(s.price ?? 0).toLocaleString()}</td>
                        <td className="text-right py-2.5 px-2 font-bold tabular-nums text-[12px]" style={{ color: '#DC2626' }}>{(s.drop ?? 0).toFixed(1)}%</td>
                        <td className="text-center py-2.5 px-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            {cfg.icon} {s.fib_zone ?? '-'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          <FibMiniGauge stock={s} />
                          <p className="text-[10px] text-[#6B7280] text-center mt-0.5">{s.fib_status}</p>
                        </td>
                        <td className="text-right py-2.5 px-2 font-bold tabular-nums text-[12px]" style={{ color: '#16A34A' }}>+{(s.upside ?? 0).toFixed(1)}%</td>
                        <td className="text-right py-2.5 px-2 text-[#6B7280] tabular-nums text-[12px]">{(s.per ?? 0).toFixed(1)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {fibDate && <p className="text-[11px] text-[#9CA3AF]">{fibDate} 기준</p>}
            <FibLegend />
          </div>
        )}
      </div>
    </div>
  )
}
