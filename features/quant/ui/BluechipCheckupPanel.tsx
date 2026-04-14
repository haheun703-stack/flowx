'use client'

import { useState } from 'react'
import Link from 'next/link'
import { fmtCap } from '@/shared/lib/formatters'

/* ─── Types ─── */
interface ScoreAxis {
  score: number
  reason: string
}

interface BluechipItem {
  code: string
  name: string
  sector: string
  cap: number
  price: number
  grade: string
  total_score: number
  comment: string
  scores: {
    valuation: ScoreAxis
    earnings: ScoreAxis
    events: ScoreAxis
    supply_demand: ScoreAxis
    technical: ScoreAxis
  }
  target_price: number
  upside_pct: number
  per: number
  pbr: number
  fib_zone: string
  drop_52w: number
  position_pct: number
  major_events: { event: string; tier: string; score: number; url?: string; report?: string }[]
  global_view: string | null
}

interface SmallcapItem {
  code: string
  name: string
  sector: string
  theme: string
  cap: number
  price: number
  drop_52w: number
  fib_zone: string
  upside_pct: number
  target_price: number
  supply_signal: string
  per: number
  pbr: number
}

export interface BluechipCheckupData {
  date: string
  bluechips: BluechipItem[]
  smallcaps: SmallcapItem[]
  summary: { bluechip_count: number; smallcap_count: number; grades: Record<string, number>; themes: string[] } | null
}

/* ─── Helpers ─── */
const fmtPrice = (v: number) => v.toLocaleString()
const GRADE_COLOR: Record<string, { bg: string; text: string }> = {
  A: { bg: 'bg-red-100', text: 'text-red-700' },
  B: { bg: 'bg-orange-100', text: 'text-orange-700' },
  C: { bg: 'bg-blue-100', text: 'text-blue-700' },
  D: { bg: 'bg-gray-200', text: 'text-gray-500' },
}

const ZONE_COLOR: Record<string, string> = {
  DEEP: '#dc2626',
  MID: '#d97706',
  MILD: '#2563eb',
  SHALLOW: '#6B7280',
  NEAR_HIGH: '#16a34a',
}

const SUPPLY_COLOR: Record<string, { bg: string; text: string }> = {
  '쌍끌이': { bg: 'bg-red-100', text: 'text-red-700' },
  '매집': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '관망': { bg: 'bg-gray-100', text: 'text-gray-500' },
  'AI추천': { bg: 'bg-green-100', text: 'text-green-700' },
}

const AXIS_LABELS = ['밸류에이션', '실적', '이벤트', '수급', '기술적']
const AXIS_KEYS: (keyof BluechipItem['scores'])[] = ['valuation', 'earnings', 'events', 'supply_demand', 'technical']

/* ─── Score Bar ─── */
function ScoreBar({ score, max = 20 }: { score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100)
  const color = score >= 16 ? '#dc2626' : score >= 12 ? '#d97706' : score >= 8 ? '#2563eb' : '#9CA3AF'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-[5px] bg-[#F0EDE8] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-bold tabular-nums w-5 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

/* ─── Bluechip Row (expandable) ─── */
function BluechipRow({ item }: { item: BluechipItem }) {
  const [open, setOpen] = useState(false)
  const gc = GRADE_COLOR[item.grade] ?? GRADE_COLOR.D
  const zoneColor = ZONE_COLOR[item.fib_zone] ?? '#888'

  return (
    <div className="border-b border-[#F0EDE8]">
      {/* Summary row */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full grid grid-cols-[1fr_40px_50px_70px_60px_60px] md:grid-cols-[1fr_40px_50px_80px_70px_70px_70px_60px] gap-1.5 items-center py-2.5 px-1 text-left hover:bg-[#FAFAF8] transition-colors"
      >
        {/* 종목 */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-black ${gc.bg} ${gc.text}`}>{item.grade}</span>
            <Link
              href={`/stock/${item.code}`}
              onClick={e => e.stopPropagation()}
              className="text-[13px] font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors truncate"
            >
              {item.name}
            </Link>
          </div>
          <div className="text-[10px] text-[#9CA3AF] mt-0.5">{item.sector} · {fmtCap(item.cap)}</div>
        </div>
        {/* 총점 */}
        <span className="text-[14px] font-black tabular-nums text-[#1A1A2E] text-center">{item.total_score}</span>
        {/* 피보 존 */}
        <span className="text-[11px] font-bold px-1 py-0.5 rounded text-center" style={{ backgroundColor: `${zoneColor}15`, color: zoneColor }}>
          {item.fib_zone}
        </span>
        {/* 현재가 */}
        <span className="text-[12px] tabular-nums font-semibold text-[#1A1A2E] text-right">{fmtPrice(item.price)}</span>
        {/* 목표 상승여력 */}
        <span className="text-[12px] tabular-nums font-bold text-[#dc2626] text-right">+{item.upside_pct.toFixed(0)}%</span>
        {/* PER (hidden on mobile) */}
        <span className="hidden md:block text-[11px] tabular-nums text-[#6B7280] text-right">{item.per > 0 ? item.per.toFixed(1) : '—'}</span>
        {/* PBR (hidden on mobile) */}
        <span className="hidden md:block text-[11px] tabular-nums text-[#6B7280] text-right">{item.pbr > 0 ? item.pbr.toFixed(2) : '—'}</span>
        {/* 52주 낙폭 */}
        <span className="text-[11px] tabular-nums font-bold text-[#2563eb] text-right">{item.drop_52w.toFixed(0)}%</span>
      </button>

      {/* Expanded detail */}
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

          {/* 코멘트 */}
          <div className="text-[12px] text-[#6B7280]">{item.comment}</div>

          {/* 주요 공시 */}
          {item.major_events && item.major_events.length > 0 && (
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

          {/* 해외시각 */}
          {item.global_view && (
            <div className="text-[11px] text-[#6B7280]">
              <span className="font-bold text-[#9CA3AF]">해외시각:</span> {item.global_view}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ─── */
export default function BluechipCheckupPanel({ data }: { data: BluechipCheckupData }) {
  const [showAllBlue, setShowAllBlue] = useState(false)
  const [showSmall, setShowSmall] = useState(false)

  const blueList = showAllBlue ? data.bluechips : data.bluechips.slice(0, 15)

  // Group smallcaps by theme
  const themeGroups = new Map<string, SmallcapItem[]>()
  for (const sc of data.smallcaps) {
    const theme = sc.theme || sc.sector || '기타'
    if (!themeGroups.has(theme)) themeGroups.set(theme, [])
    themeGroups.get(theme)!.push(sc)
  }

  return (
    <div className="space-y-4">
      {/* ── 대형주 점검 ── */}
      <div className="fx-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div>
            <span className="fx-card-title">대형주 종합점검</span>
            {data.summary && (
              <div className="flex gap-2 mt-1">
                {Object.entries(data.summary.grades ?? {}).map(([grade, count]) => {
                  const gc = GRADE_COLOR[grade] ?? GRADE_COLOR.D
                  return (
                    <span key={grade} className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${gc.bg} ${gc.text}`}>
                      {grade}: {count as number}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
          <span className="text-[12px] text-[#9CA3AF]">{data.date} 장마감 기준</span>
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

        {blueList.map(item => (
          <BluechipRow key={item.code} item={item} />
        ))}

        {data.bluechips.length > 15 && (
          <button onClick={() => setShowAllBlue(p => !p)} className="w-full text-center text-[12px] text-[#9CA3AF] hover:text-[#1A1A2E] py-2 font-bold">
            {showAllBlue ? '접기 ▲' : `전체 ${data.bluechips.length}개 보기 ▼`}
          </button>
        )}
      </div>

      {/* ── 테마별 소형주 수혜주 ── */}
      {data.smallcaps.length > 0 && (
        <div className="fx-card">
          <button
            onClick={() => setShowSmall(p => !p)}
            className="w-full flex items-center justify-between"
          >
            <div>
              <span className="fx-card-title">테마별 소형주 수혜주</span>
              <span className="text-[12px] text-[#9CA3AF] ml-2">{data.smallcaps.length}종목</span>
            </div>
            <span className="text-[14px] text-[#9CA3AF]">{showSmall ? '▲' : '▼'}</span>
          </button>

          {showSmall && (
            <div className="mt-3 space-y-4">
              {Array.from(themeGroups.entries()).map(([theme, items]) => (
                <div key={theme}>
                  <div className="text-[13px] font-black text-[#1A1A2E] mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                    {theme} ({items.length})
                  </div>
                  <div className="space-y-0">
                    {items.map(sc => {
                      const zc = ZONE_COLOR[sc.fib_zone] ?? '#888'
                      const sup = SUPPLY_COLOR[sc.supply_signal] ?? SUPPLY_COLOR['관망']
                      return (
                        <div key={sc.code} className="flex items-center justify-between py-1.5 border-b border-[#F0EDE8] text-[12px]">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Link href={`/stock/${sc.code}`} className="font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors truncate">
                              {sc.name}
                            </Link>
                            <span className="text-[10px] px-1 py-0.5 rounded font-bold shrink-0" style={{ backgroundColor: `${zc}15`, color: zc }}>
                              {sc.fib_zone}
                            </span>
                            <span className={`text-[10px] px-1 py-0.5 rounded font-bold shrink-0 ${sup.bg} ${sup.text}`}>
                              {sc.supply_signal}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="tabular-nums text-[#6B7280]">{fmtCap(sc.cap)}</span>
                            <span className="tabular-nums font-bold text-[#dc2626]">+{sc.upside_pct.toFixed(0)}%</span>
                            <span className="tabular-nums text-[#2563eb]">{sc.drop_52w.toFixed(0)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
