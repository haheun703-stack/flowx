'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import type { BluechipCheckupData } from './BluechipCheckupPanel'
import { FibStock, ZONE_ORDER, ZONE_CONFIG, fmtCap as fibFmtCap, FibMiniGauge, FibLegend } from '@/features/swing/ui/FibShared'

/* ─── Types ─── */
interface ScoreAxis { score: number; reason: string }

interface BluechipItem {
  code: string; name: string; sector: string; cap: number; price: number
  grade: string; total_score: number; comment: string
  scores: {
    valuation: ScoreAxis; earnings: ScoreAxis; events: ScoreAxis
    supply_demand: ScoreAxis; technical: ScoreAxis
  }
  target_price: number; upside_pct: number; per: number; pbr: number
  fib_zone: string; drop_52w: number; position_pct: number
  major_events: { event: string; tier: string; score: number; url?: string; report?: string }[]
  global_view: string | null
}

/* ─── Constants ─── */
const GRADE_CFG: Record<string, { bg: string; text: string; color: string }> = {
  A: { bg: 'bg-red-100', text: 'text-red-700', color: '#16A34A' },
  B: { bg: 'bg-orange-100', text: 'text-orange-700', color: '#2563EB' },
  C: { bg: 'bg-blue-100', text: 'text-blue-700', color: '#EA580C' },
  D: { bg: 'bg-gray-200', text: 'text-gray-500', color: '#9CA3AF' },
}

const ZONE_COLOR: Record<string, string> = {
  DEEP: '#dc2626', MID: '#d97706', MILD: '#2563eb', SHALLOW: '#6B7280', NEAR_HIGH: '#16a34a',
}

const AXIS_LABELS = ['밸류에이션', '실적', '이벤트', '수급', '기술적']
const AXIS_KEYS: (keyof BluechipItem['scores'])[] = ['valuation', 'earnings', 'events', 'supply_demand', 'technical']

const fmtPrice = (v: number) => v.toLocaleString()
const fmtCap = (v: number) => {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`
  return `${v.toLocaleString()}억`
}

/* ─── ScoreBar ─── */
function ScoreBar({ score, max = 20 }: { score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100)
  const color = score >= 16 ? '#dc2626' : score >= 12 ? '#d97706' : score >= 8 ? '#2563eb' : '#9CA3AF'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-full h-[5px] bg-[#F0EDE8] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-bold tabular-nums w-5 text-right shrink-0" style={{ color }}>{score}</span>
    </div>
  )
}

/* ─── BluechipRow (expandable) ─── */
function BluechipRow({ item }: { item: BluechipItem }) {
  const [open, setOpen] = useState(false)
  const gc = GRADE_CFG[item.grade] ?? GRADE_CFG.D
  const zoneColor = ZONE_COLOR[item.fib_zone] ?? '#888'

  return (
    <div className="border-b border-[#F0EDE8]">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full grid grid-cols-[1fr_40px_50px_70px_60px_60px] md:grid-cols-[1fr_40px_50px_80px_70px_70px_70px_60px] gap-1.5 items-center py-2.5 px-1 text-left hover:bg-[#FAFAF8] transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-black ${gc.bg} ${gc.text}`}>{item.grade}</span>
            <Link href={`/stock/${item.code}`} onClick={e => e.stopPropagation()}
              className="text-[13px] font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors truncate">
              {item.name}
            </Link>
          </div>
          <div className="text-[10px] text-[#9CA3AF] mt-0.5">{item.sector} · {fmtCap(item.cap)}</div>
        </div>
        <span className="text-[14px] font-black tabular-nums text-[#1A1A2E] text-center">{item.total_score}</span>
        <span className="text-[11px] font-bold px-1 py-0.5 rounded text-center"
          style={{ backgroundColor: `${zoneColor}15`, color: zoneColor }}>{item.fib_zone || '—'}</span>
        <span className="text-[12px] tabular-nums font-semibold text-[#1A1A2E] text-right">{fmtPrice(item.price)}</span>
        <span className="text-[12px] tabular-nums font-bold text-[#dc2626] text-right">+{item.upside_pct.toFixed(0)}%</span>
        <span className="hidden md:block text-[11px] tabular-nums text-[#6B7280] text-right">{item.per > 0 ? item.per.toFixed(1) : '—'}</span>
        <span className="hidden md:block text-[11px] tabular-nums text-[#6B7280] text-right">{item.pbr > 0 ? item.pbr.toFixed(2) : '—'}</span>
        <span className="text-[11px] tabular-nums font-bold text-[#2563eb] text-right">{item.drop_52w.toFixed(0)}%</span>
      </button>

      {open && (
        <div className="px-2 pb-3 space-y-2">
          {/* 5축 스코어 */}
          <div className="grid grid-cols-5 gap-2 bg-[#FAFAF8] rounded-lg p-2">
            {AXIS_KEYS.map((key, i) => (
              <div key={key} className="text-center">
                <div className="text-[10px] text-[#9CA3AF] font-bold mb-1">{AXIS_LABELS[i]}</div>
                <ScoreBar score={item.scores[key]?.score ?? 0} />
                <div className="text-[9px] text-[#9CA3AF] mt-1 line-clamp-2">{item.scores[key]?.reason ?? ''}</div>
              </div>
            ))}
          </div>

          {/* 피보나치 상세 */}
          <div className="bg-[#FAFAF8] rounded-lg p-2 text-[11px]">
            <p className="font-bold text-[#9CA3AF] mb-1">피보나치 상세</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#6B7280]">
              <span>52주 고점 대비: <strong className="text-[#DC2626]">{item.drop_52w.toFixed(1)}%</strong></span>
              <span>Zone: <strong style={{ color: zoneColor }}>{item.fib_zone || '—'}</strong></span>
              <span>위치: <strong className="text-[#1A1A2E]">{item.position_pct?.toFixed(0) ?? '—'}%</strong></span>
              <span>목표가: <strong className="text-[#16A34A]">{fmtPrice(item.target_price)}원</strong></span>
            </div>
          </div>

          {/* 코멘트 */}
          <div className="text-[12px] text-[#6B7280]">{item.comment}</div>

          {/* 해외시각 */}
          {item.global_view && (
            <div className="text-[11px] text-[#6B7280]">
              <span className="font-bold text-[#9CA3AF]">해외시각:</span> {typeof item.global_view === 'string' ? item.global_view : (item.global_view as { summary?: string })?.summary ?? ''}
            </div>
          )}

          {/* 주요 공시 */}
          {item.major_events?.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#9CA3AF]">주요 공시</div>
              {item.major_events.map((ev, i) => (
                <div key={i} className="text-[11px] flex items-center gap-1.5">
                  <span className="text-[10px] px-1 py-0.5 rounded bg-[#F0EDE8] text-[#6B7280] font-bold shrink-0">{ev.tier?.split('_')[0]}</span>
                  <span className="text-[#1A1A2E]">{ev.event}</span>
                  {ev.report && <span className="text-[#9CA3AF] truncate">— {ev.report}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════ */
/*           MAIN COMPONENT               */
/* ═══════════════════════════════════════ */

export default function BluechipInspectionTab({ bluechip }: { bluechip: BluechipCheckupData | null }) {
  const [gradeFilter, setGradeFilter] = useState<string | null>(null)
  const [fibLeaders, setFibLeaders] = useState<FibStock[]>([])
  const [fibDate, setFibDate] = useState('')
  const [fibLoading, setFibLoading] = useState(true)
  const [showFib, setShowFib] = useState(false)
  const [fibSort, setFibSort] = useState<'cap' | 'drop' | 'upside'>('cap')

  // Fetch fib_leaders
  useEffect(() => {
    const ac = new AbortController()
    async function load() {
      try {
        let res = await fetch('/api/quant/fib-scanner', { signal: ac.signal })
        let json = res.ok ? await res.json() : null
        if (json?.data?.fib_leaders?.length) {
          setFibLeaders(json.data.fib_leaders)
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

  const items = bluechip?.bluechips ?? []
  const gradeCounts = useMemo(() => {
    const gc: Record<string, number> = {}
    for (const item of items) gc[item.grade] = (gc[item.grade] ?? 0) + 1
    return gc
  }, [items])

  const filtered = gradeFilter ? items.filter(i => i.grade === gradeFilter) : items

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

  if (!bluechip) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280]">대형주 점검 데이터가 없습니다.</p>
        <p className="text-[#9CA3AF] text-sm mt-1">다음 갱신 시 업데이트됩니다.</p>
      </div>
    )
  }

  const verdict = (gradeCounts['A'] ?? 0) > 10 ? '전반적 강세' : (gradeCounts['C'] ?? 0) > 20 ? '전반적 약세 — 대형주 신중하게' : '혼조세'

  return (
    <div className="space-y-4">

      {/* ── 등급 요약 카드 ── */}
      <div className="grid grid-cols-4 gap-2">
        {['A', 'B', 'C', 'D'].map((g) => {
          const cfg = GRADE_CFG[g]!
          const active = gradeFilter === g
          return (
            <button key={g} onClick={() => setGradeFilter(gradeFilter === g ? null : g)}
              className={`rounded-xl p-3 text-center transition-all border-2 ${
                active ? 'border-[#1A1A2E] shadow-md' : 'border-transparent'
              }`}
              style={{ backgroundColor: active ? '#FAFAF8' : '#F5F4F0' }}>
              <span className="text-[22px] font-black tabular-nums text-[#1A1A2E] block">{gradeCounts[g] ?? 0}</span>
              <span className="text-[12px] font-bold block" style={{ color: cfg.color }}>{g}등급</span>
            </button>
          )
        })}
      </div>
      <p className="text-[13px] font-bold text-[#1A1A2E]">
        {verdict}
        {gradeFilter && <span className="text-[#7C3AED] ml-2">({gradeFilter}등급 필터 적용 중)</span>}
      </p>

      {/* ── 30종목 테이블 ── */}
      <div className="fx-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[15px] font-bold text-[#1A1A2E]">대형주 종합점검</span>
            <span className="text-[12px] text-[#9CA3AF] ml-2">{filtered.length}종목</span>
          </div>
          <span className="text-[12px] text-[#9CA3AF]">{bluechip.date} 장마감 기준</span>
        </div>

        {/* 테이블 헤더 */}
        <div className="hidden md:grid grid-cols-[1fr_40px_50px_80px_70px_70px_70px_60px] gap-1.5 text-[10px] font-bold text-[#9CA3AF] border-b border-[#E8E6E0] pb-1 mb-1 px-1">
          <span>종목</span>
          <span className="text-center">점수</span>
          <span className="text-center">피보</span>
          <span className="text-right">현재가</span>
          <span className="text-right">상승여력</span>
          <span className="text-right">PER</span>
          <span className="text-right">PBR</span>
          <span className="text-right">52W낙폭</span>
        </div>

        {filtered.map(item => (
          <BluechipRow key={item.code} item={item as BluechipItem} />
        ))}

        {filtered.length === 0 && (
          <p className="text-[13px] text-[#9CA3AF] text-center py-6">해당 등급 종목이 없습니다</p>
        )}
      </div>

      {/* ── 피보나치 레벨 상세 ── */}
      <div className="fx-card">
        <button onClick={() => setShowFib(p => !p)}
          className="w-full flex items-center justify-between">
          <div>
            <span className="text-[15px] font-bold text-[#1A1A2E]">피보나치 레벨 상세</span>
            <span className="text-[12px] text-[#9CA3AF] ml-2">대형주 {fibLeaders.length}종목</span>
          </div>
          <span className="text-[12px] font-bold text-[#7C3AED]">{showFib ? '접기 ▲' : '펼치기 ▼'}</span>
        </button>

        {showFib && (
          <div className="mt-3 space-y-3">
            {fibLoading ? (
              <div className="animate-pulse h-32 bg-gray-200 rounded-xl" />
            ) : fibLeaders.length === 0 ? (
              <p className="text-[13px] text-[#9CA3AF] text-center py-6">피보나치 데이터 없음</p>
            ) : (
              <>
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
                  <table className="w-full text-[13px] min-w-[800px]">
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
                      {sortedFib.map((s, i) => {
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
                            <td className="text-right py-2.5 px-2 font-bold text-[#1A1A2E] tabular-nums text-[12px]">{fibFmtCap(s.cap ?? 0)}</td>
                            <td className="text-right py-2.5 px-2 text-[#1A1A2E] tabular-nums text-[12px]">{(s.price ?? 0).toLocaleString()}</td>
                            <td className="text-right py-2.5 px-2 font-bold tabular-nums text-[12px]" style={{ color: '#DC2626' }}>{(s.drop ?? 0).toFixed(1)}%</td>
                            <td className="text-center py-2.5 px-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                {cfg.icon} {s.fib_zone ?? '-'}
                              </span>
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

                {fibDate && <p className="text-[11px] text-[#9CA3AF]">{fibDate} 기준</p>}
                <FibLegend />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
