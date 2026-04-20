'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import type { BluechipCheckupData } from './BluechipCheckupPanel'
import { fmtCap } from '@/shared/lib/formatters'
import { FibStock, ZONE_ORDER, ZONE_CONFIG, FibMiniGauge, FibLegend } from '@/features/swing/ui/FibShared'

const ENTRY_GRADE_CFG: Record<string, { text: string; bg: string; color: string; border: string }> = {
  '적기': { text: '★ 적기', bg: '#FFD700', color: '#1A1A2E', border: '#FFD700' },
  '관심': { text: '관심', bg: 'transparent', color: '#3B82F6', border: '#3B82F6' },
  '수급 유입': { text: '수급↑', bg: 'transparent', color: '#10B981', border: '#10B981' },
}

const fmtBaseDate = (d: string) => { const m = d.match(/(\d+)-(\d+)$/); return m ? `${+m[1]}/${+m[2]}` : d }

export default function BluechipInspectionTab({ bluechip: _bluechip }: { bluechip: BluechipCheckupData | null }) {
  const [fibLeaders, setFibLeaders] = useState<FibStock[]>([])
  const [entryPicks, setEntryPicks] = useState<FibStock[]>([])
  const [fibDate, setFibDate] = useState('')
  const [fibLoading, setFibLoading] = useState(true)
  const [fibSort, setFibSort] = useState<'cap' | 'drop' | 'upside'>('cap')

  useEffect(() => {
    const ac = new AbortController()
    async function load() {
      try {
        let res = await fetch('/api/quant/fib-scanner', { signal: ac.signal })
        let json = res.ok ? await res.json() : null
        if (json?.data?.fib_leaders?.length) {
          setFibLeaders(json.data.fib_leaders)
          setEntryPicks(json.data.entry_picks ?? [])
          setFibDate(json.data.date ?? '')
        } else {
          res = await fetch('/api/swing-dashboard', { signal: ac.signal })
          json = res.ok ? await res.json() : null
          setFibLeaders(json?.data?.fib_leaders ?? [])
          setFibDate(json?.data?.date ?? '')
        }
      } catch { /* abort */ }
      setFibLoading(false)
    }
    load()
    return () => ac.abort()
  }, [])

  const sortedFib = useMemo(() => {
    const arr = [...fibLeaders]
    if (fibSort === 'cap') arr.sort((a, b) => b.cap - a.cap)
    else if (fibSort === 'drop') arr.sort((a, b) => a.drop - b.drop)
    else if (fibSort === 'upside') arr.sort((a, b) => b.upside - a.upside)
    return arr
  }, [fibLeaders, fibSort])

  const zoneCounts = useMemo(() =>
    ZONE_ORDER.map(zone => ({ zone, count: fibLeaders.filter(s => s.fib_zone === zone).length }))
      .filter(z => z.count > 0),
    [fibLeaders],
  )

  return (
    <div className="space-y-4">

      {/* ★ 매수 적기 하이라이트 */}
      {entryPicks.length > 0 && (
        <div className="rounded-xl border-2 border-[#FFD700] overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' }}>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-bold text-[#1A1A2E]">★ 매수 적기 {entryPicks.length}종목</h3>
              {fibDate && <span className="text-[11px] text-[#92400E]">{fmtBaseDate(fibDate)} 기준</span>}
            </div>
            <p className="text-[11px] text-[#92400E] mb-3">RSI 과매도 + 수급 유입 동시 충족 | 백테스트 D+5 +2.97%, 승률 61.9%</p>
            <div className="space-y-2">
              {entryPicks.map((p) => (
                <div key={p.code} className="bg-white/80 rounded-lg p-3 border border-[#FDE68A]">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[14px] font-bold" style={{ color: '#B8860B' }}>★</span>
                    <Link href={`/stock/${p.code}`} className="text-[14px] font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors">
                      {p.name}
                    </Link>
                    <span className="text-[11px] text-[#9CA3AF]">({p.code})</span>
                    <span className="text-[13px] font-bold text-[#1A1A2E] tabular-nums ml-auto">
                      {(p.price ?? 0).toLocaleString()}원
                      <span className="text-[10px] text-[#9CA3AF] font-normal ml-1">({fmtBaseDate(fibDate)} 기준)</span>
                    </span>
                    <span className="text-[12px] font-bold tabular-nums" style={{ color: '#DC2626' }}>▼{Math.abs(p.drop ?? 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                    <span>RSI <strong className="text-[#1A1A2E]">{(p.rsi ?? 0).toFixed(1)}</strong></span>
                    {(p.foreign_net ?? 0) !== 0 && <span>외인 <strong className="text-[#2563EB]">{(p.foreign_net ?? 0) > 0 ? '+' : ''}{(p.foreign_net ?? 0).toFixed(0)}억</strong></span>}
                    {(p.inst_net ?? 0) !== 0 && <span>기관 <strong className="text-[#EA580C]">{(p.inst_net ?? 0) > 0 ? '+' : ''}{(p.inst_net ?? 0).toFixed(0)}억</strong></span>}
                    <span>목표 <strong style={{ color: '#16A34A' }}>{(p.target ?? 0).toLocaleString()}원 (▲{(p.upside ?? 0).toFixed(1)}%)</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="fx-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[15px] font-bold text-[#1A1A2E]">피보나치 레벨 상세</span>
            <span className="text-[12px] text-[#9CA3AF] ml-2">대형주 {fibLeaders.length}종목</span>
          </div>
          {fibDate && <span className="text-[12px] text-[#9CA3AF]">{fibDate} 기준</span>}
        </div>

        {fibLoading ? (
          <div className="animate-pulse h-32 bg-gray-200 rounded-xl" />
        ) : fibLeaders.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF] text-center py-6">피보나치 데이터 없음</p>
        ) : (
          <div className="space-y-3">
            {/* 정렬 + zone분포 */}
            <div className="flex flex-wrap items-center gap-2">
              {zoneCounts.map(({ zone, count }) => {
                const cfg = ZONE_CONFIG[zone]
                return (
                  <span key={zone} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full"
                    style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    {cfg.icon} {zone} {count}
                  </span>
                )
              })}
              <div className="ml-auto flex gap-1">
                {(['cap', 'drop', 'upside'] as const).map(k => (
                  <button key={k} onClick={() => setFibSort(k)}
                    className="text-[11px] font-bold px-2 py-1 rounded-md transition-colors"
                    style={{ backgroundColor: fibSort === k ? '#F0EDE8' : 'transparent', color: fibSort === k ? '#1A1A2E' : '#9CA3AF' }}>
                    {k === 'cap' ? '시총순' : k === 'drop' ? '하락률순' : '상승여력순'}
                  </button>
                ))}
              </div>
            </div>

            {/* 피보나치 테이블 */}
            <div className="table-scroll rounded-xl border border-[#E8E6E0]">
              <table className="w-full text-[13px] min-w-[950px]">
                <thead>
                  <tr style={{ backgroundColor: '#F5F4F0' }}>
                    <th className="text-center py-2 px-2 text-[11px] font-bold text-[#6B7280] w-8">#</th>
                    <th className="text-left py-2 px-3 text-[11px] font-bold text-[#6B7280]">종목</th>
                    <th className="text-center py-2 px-2 text-[11px] font-bold text-[#6B7280]">섹터</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">시총</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">현재가</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">하락률</th>
                    <th className="text-center py-2 px-2 text-[11px] font-bold text-[#6B7280]">구간</th>
                    <th className="text-center py-2 px-2 text-[11px] font-bold text-[#6B7280]">RSI</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">외인(억)</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">기관(억)</th>
                    <th className="text-center py-2 px-2 text-[12px] font-extrabold text-[#1A1A2E] min-w-[140px]">피보나치 위치</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">상승여력</th>
                    <th className="text-right py-2 px-2 text-[11px] font-bold text-[#6B7280]">PER</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFib.map((s, i) => {
                    const cfg = ZONE_CONFIG[s.fib_zone] ?? ZONE_CONFIG.MILD
                    const eg = s.entry_grade && s.entry_grade !== '대기' ? ENTRY_GRADE_CFG[s.entry_grade] : null
                    return (
                      <tr key={s.code} className="border-t border-[#E8E6E0]/50 hover:bg-[#F9F8F6]"
                        style={s.entry_grade === '적기' ? { backgroundColor: '#FFFBEB' } : undefined}>
                        <td className="text-center py-2.5 px-2 text-[12px] text-[#9CA3AF] tabular-nums">{i + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/stock/${s.code}`} className="font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors">
                              {s.name}
                            </Link>
                            {eg && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                style={{ backgroundColor: eg.bg, color: eg.color, border: `1px solid ${eg.border}` }}>
                                {eg.text}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-2.5 px-2 text-[#6B7280] text-[12px]">{s.sector}</td>
                        <td className="text-right py-2.5 px-2 font-bold text-[#1A1A2E] tabular-nums text-[12px]">{fmtCap(s.cap ?? 0)}</td>
                        <td className="text-right py-2.5 px-2 tabular-nums text-[12px]">
                          <span className="text-[#1A1A2E]">{(s.price ?? 0).toLocaleString()}</span>
                          {fibDate && <span className="text-[9px] text-[#9CA3AF] ml-0.5">({fmtBaseDate(fibDate)})</span>}
                        </td>
                        <td className="text-right py-2.5 px-2 font-bold tabular-nums text-[12px]" style={{ color: '#DC2626' }}>{(s.drop ?? 0).toFixed(1)}%</td>
                        <td className="text-center py-2.5 px-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            {cfg.icon} {s.fib_zone ?? '-'}
                          </span>
                        </td>
                        <td className="text-center py-2.5 px-2 tabular-nums text-[12px]">
                          {s.rsi != null ? (
                            <span className="font-bold" style={{ color: s.rsi < 40 ? '#DC2626' : '#6B7280' }}>{s.rsi.toFixed(0)}</span>
                          ) : <span className="text-[#D1D5DB]">-</span>}
                        </td>
                        <td className="text-right py-2.5 px-2 tabular-nums text-[12px]">
                          {s.foreign_net != null ? (
                            <span className="font-bold" style={{ color: s.foreign_net > 0 ? '#2563EB' : s.foreign_net < 0 ? '#DC2626' : '#6B7280' }}>
                              {s.foreign_net > 0 ? '+' : ''}{s.foreign_net.toFixed(0)}
                            </span>
                          ) : <span className="text-[#D1D5DB]">-</span>}
                        </td>
                        <td className="text-right py-2.5 px-2 tabular-nums text-[12px]">
                          {s.inst_net != null ? (
                            <span className="font-bold" style={{ color: s.inst_net > 0 ? '#EA580C' : s.inst_net < 0 ? '#DC2626' : '#6B7280' }}>
                              {s.inst_net > 0 ? '+' : ''}{s.inst_net.toFixed(0)}
                            </span>
                          ) : <span className="text-[#D1D5DB]">-</span>}
                        </td>
                        <td className="py-2.5 px-2">
                          <FibMiniGauge stock={s} />
                          <p className="text-[10px] text-[#6B7280] text-center mt-0.5">{s.fib_status ?? '-'}</p>
                        </td>
                        <td className="text-right py-2.5 px-2 font-bold tabular-nums text-[12px]" style={{ color: '#16A34A' }}>+{(s.upside ?? 0).toFixed(1)}%</td>
                        <td className="text-right py-2.5 px-2 text-[#6B7280] tabular-nums text-[12px]">{(s.per ?? 0).toFixed(1)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <FibLegend />
          </div>
        )}
      </div>
    </div>
  )
}
