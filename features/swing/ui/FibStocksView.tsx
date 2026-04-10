'use client'

import { useEffect, useState } from 'react'
import { FibStock, ZONE_ORDER, ZONE_CONFIG, fmtCap, FibMiniGauge, FibLegend } from './FibShared'

type FibSortKey = 'drop' | 'upside' | 'per' | 'frgn'

/* ── 메인 뷰 ── */

export default function FibStocksView() {
  const [stocks, setStocks] = useState<FibStock[]>([])
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<FibSortKey>('drop')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        let res = await fetch('/api/quant/fib-scanner', { signal: controller.signal })
        let json = res.ok ? await res.json() : null
        if (json?.data?.fib_stocks?.length) {
          setStocks(json.data.fib_stocks)
          setDate(json.data.date ?? '')
        } else {
          res = await fetch('/api/swing-dashboard', { signal: controller.signal })
          json = res.ok ? await res.json() : null
          setStocks(json?.data?.fib_stocks ?? [])
          setDate(json?.data?.date ?? '')
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setStocks([])
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-4">
        <div className="h-12 bg-[var(--bg-row)] rounded-xl" />
        <div className="h-64 bg-[var(--bg-row)] rounded-xl" />
        <div className="h-48 bg-[var(--bg-row)] rounded-xl" />
      </div>
    )
  }

  if (!stocks.length) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-[#6B7280]">피보나치 스크리닝 데이터가 없습니다.</p>
        <p className="text-[#9CA3AF] text-sm mt-1">다음 갱신 시 업데이트됩니다.</p>
      </div>
    )
  }

  const grouped = ZONE_ORDER.map(zone => {
    const items = [...stocks.filter(s => s.fib_zone === zone)]
    if (sortKey === 'drop') items.sort((a, b) => a.drop - b.drop)
    else if (sortKey === 'upside') items.sort((a, b) => b.upside - a.upside)
    else if (sortKey === 'per') items.sort((a, b) => a.per - b.per)
    else if (sortKey === 'frgn') items.sort((a, b) => b.frgn - a.frgn)
    return { zone, items }
  }).filter(g => g.items.length > 0)

  const SORT_OPTIONS: { key: FibSortKey; label: string }[] = [
    { key: 'drop', label: '하락률순' },
    { key: 'upside', label: '상승여력순' },
    { key: 'per', label: 'PER순' },
    { key: 'frgn', label: '외국인순' },
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-4">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-bold text-[#1A1A2E]">
            피보나치 눌림목 — 바닥 매수 후보
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            52주 고점 대비 크게 하락한 우량주 {stocks.length}종목 · 시총 3조원+ · 피보나치 되돌림 기준
            {date && <span className="ml-2">· {date} 기준</span>}
          </p>
        </div>
        <div className="flex gap-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className="text-[12px] font-bold px-2.5 py-1 rounded-md transition-colors"
              style={{
                backgroundColor: sortKey === opt.key ? '#F0EDE8' : 'transparent',
                color: sortKey === opt.key ? '#1A1A2E' : '#9CA3AF',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* zone별 분포 요약 */}
      <div className="flex gap-2">
        {grouped.map(({ zone, items }) => {
          const cfg = ZONE_CONFIG[zone]
          return (
            <div
              key={zone}
              className="flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label.split(' ')[0]}</span>
              <span>{items.length}종목</span>
            </div>
          )
        })}
      </div>

      {/* zone별 테이블 */}
      {grouped.map(({ zone, items }) => {
        const cfg = ZONE_CONFIG[zone]
        return (
          <div key={zone}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[15px]">{cfg.icon}</span>
              <span className="text-[15px] font-black" style={{ color: cfg.color }}>
                {cfg.label}
              </span>
              <span className="text-[13px] text-[#6B7280]">— {items.length}종목</span>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${cfg.border}` }}>
              <table className="w-full text-[14px]">
                <thead>
                  <tr style={{ backgroundColor: cfg.bg }}>
                    <th className="text-left py-2 px-3 text-[12px] font-bold text-[#6B7280]">종목</th>
                    <th className="text-center py-2 px-2 text-[12px] font-bold text-[#6B7280]">섹터</th>
                    <th className="text-right py-2 px-2 text-[12px] font-bold text-[#6B7280]">시총</th>
                    <th className="text-right py-2 px-2 text-[12px] font-bold text-[#6B7280]">현재가</th>
                    <th className="text-right py-2 px-2 text-[12px] font-bold text-[#6B7280]">하락률</th>
                    <th className="text-center py-2 px-2 text-[12px] font-bold text-[#6B7280] min-w-[100px]">피보나치 위치</th>
                    <th className="text-right py-2 px-2 text-[12px] font-bold text-[#6B7280]">상승여력</th>
                    <th className="text-right py-2 px-2 text-[12px] font-bold text-[#6B7280]">PER</th>
                    <th className="text-right py-2 px-2 text-[12px] font-bold text-[#6B7280]">외국인</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.code} className="border-t border-[#E8E6E0]/50 hover:bg-[#F9F8F6]">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#1A1A2E]">{s.name}</span>
                      </td>
                      <td className="text-center py-2.5 px-2 text-[#6B7280]">{s.sector}</td>
                      <td className="text-right py-2.5 px-2 text-[#6B7280] tabular-nums">{fmtCap(s.cap ?? 0)}</td>
                      <td className="text-right py-2.5 px-2 font-bold text-[#1A1A2E] tabular-nums">{(s.price ?? 0).toLocaleString()}</td>
                      <td className="text-right py-2.5 px-2 font-bold tabular-nums" style={{ color: '#DC2626' }}>
                        {(s.drop ?? 0).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-2">
                        <FibMiniGauge stock={s} />
                        <p className="text-[11px] text-[#6B7280] text-center mt-0.5">{s.fib_status}</p>
                      </td>
                      <td className="text-right py-2.5 px-2 font-bold tabular-nums" style={{ color: '#16A34A' }}>
                        +{(s.upside ?? 0).toFixed(1)}%
                      </td>
                      <td className="text-right py-2.5 px-2 text-[#6B7280] tabular-nums">{(s.per ?? 0).toFixed(1)}</td>
                      <td className="text-right py-2.5 px-2 text-[#6B7280] tabular-nums">{(s.frgn ?? 0).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* 하단 범례 */}
      <FibLegend />
    </div>
  )
}
