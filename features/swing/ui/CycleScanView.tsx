'use client'

import { useEffect, useState } from 'react'
import { getRelativeDate } from '@/shared/lib/dateUtils'
import { fmtCap } from '@/shared/lib/formatters'

/* ── 타입 ── */
interface CycleSignal {
  name: string
  name_kr: string
  score: number
  detail: string
  days: number
}

interface CycleItem {
  code: string
  name: string
  phase: string
  phase_kr: string
  score: number
  latest_close: number
  change_pct: number
  cap_억: number
  market: string
  summary: string
  signals: CycleSignal[]
}

interface CycleScanData {
  date: string
  total_scanned: number
  surge_count: number
  accumulate_count: number
  reversal_count: number
  neutral_count: number
  distribute_count: number
  peak_warn_count: number
  surge_items: CycleItem[]
  accumulate_items: CycleItem[]
  warning_items: CycleItem[]
  top_surge_names: string[]
  phase_summary: Record<string, number>
}

/* ── 신호 아이콘 ── */
const SIGNAL_ICON: Record<string, string> = {
  twin_buy: '\u26A1',
  twin_sell: '\uD83D\uDD3B',
  retail_sacrifice: '\uD83C\uDFAF',
  stealth_acc: '\uD83D\uDD75\uFE0F',
  stealth_exit: '\u26D4',
  force_reversal: '\uD83D\uDD04',
  retail_trap: '\uD83E\uDE64',
  triple_buy: '\uD83D\uDC51',
}

const SIGNAL_BG: Record<string, string> = {
  twin_buy: 'bg-amber-100 text-amber-800',
  twin_sell: 'bg-red-100 text-red-700',
  retail_sacrifice: 'bg-purple-100 text-purple-700',
  stealth_acc: 'bg-indigo-100 text-indigo-700',
  stealth_exit: 'bg-gray-200 text-gray-800',
  force_reversal: 'bg-green-100 text-green-700',
  retail_trap: 'bg-gray-100 text-gray-600',
  triple_buy: 'bg-amber-100 text-amber-800',
}

/* ── 점수 스타일 ── */
function scoreStyle(score: number) {
  if (score >= 80) return 'text-amber-600 font-bold'
  if (score >= 50) return 'text-orange-500 font-bold'
  if (score >= 20) return 'text-yellow-600 font-bold'
  if (score > -20) return 'text-gray-500 font-semibold'
  if (score > -50) return 'text-purple-500 font-bold'
  return 'text-red-600 font-bold'
}

function scoreBorder(score: number) {
  if (score >= 80) return 'border-amber-400 ring-1 ring-amber-200'
  if (score <= -50) return 'border-red-400 ring-1 ring-red-200'
  return 'border-[var(--border)]'
}

/* fmtCap: shared/lib/formatters.ts SSoT 사용 (cap_억 단위) */

/* ── 종목 카드 ── */
function CycleCard({ item, theme }: { item: CycleItem; theme: 'surge' | 'accumulate' | 'warning' }) {
  const phaseIcon = theme === 'surge' ? '\uD83D\uDD25' : theme === 'accumulate' ? '\uD83D\uDCE6' : '\u26A0\uFE0F'

  return (
    <div className={`bg-white rounded-xl border p-4 shadow hover:shadow-md transition-shadow duration-150 ${scoreBorder(item.score)}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{phaseIcon}</span>
          <span className="text-[15px] font-bold text-[var(--text-primary)] truncate">{item.name}</span>
          <span className="text-[12px] text-gray-400">{item.code}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-bold">{item.market}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[12px] px-2 py-0.5 rounded-full font-bold ${
            theme === 'surge' ? 'bg-red-100 text-red-600' :
            theme === 'accumulate' ? 'bg-orange-100 text-orange-600' :
            'bg-gray-800 text-white'
          }`}>{item.phase_kr}</span>
          <span className={`text-[15px] tabular-nums ${scoreStyle(item.score)}`}>
            {item.score > 0 ? '+' : ''}{item.score}점
          </span>
        </div>
      </div>

      {/* 신호 목록 */}
      <div className="space-y-1.5 mb-3">
        {(Array.isArray(item.signals) ? item.signals : []).map((sig, i) => (
          <div key={i} className={`flex items-center gap-2 text-[13px] px-2.5 py-1.5 rounded-lg ${SIGNAL_BG[sig.name] || 'bg-gray-50 text-gray-600'}`}>
            <span>{SIGNAL_ICON[sig.name] || '\u2022'}</span>
            <span className="font-bold">{sig.name_kr}</span>
            <span className={`tabular-nums font-bold ${sig.score > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({sig.score > 0 ? '+' : ''}{sig.score})
            </span>
            <span className="text-[12px] opacity-80 truncate">{sig.detail}</span>
          </div>
        ))}
      </div>

      {/* 하단 정보 */}
      <div className="flex items-center gap-3 text-[13px] text-gray-500 border-t border-[var(--border)] pt-2.5">
        <span className="font-semibold text-[var(--text-primary)]">{item.latest_close != null ? `${item.latest_close.toLocaleString()}원` : '—'}</span>
        <span className={`font-bold tabular-nums ${(item.change_pct ?? 0) >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          {item.change_pct != null ? `${item.change_pct >= 0 ? '+' : ''}${item.change_pct.toFixed(1)}%` : '—'}
        </span>
        <span>시총 {fmtCap(item.cap_억)}</span>
      </div>
      <p className="text-[12px] text-gray-500 mt-1.5">{item.summary}</p>
    </div>
  )
}

/* ── 섹션 ── */
function CycleSection({
  title, icon, items, theme, emptyMsg, defaultOpen = true
}: {
  title: string; icon: string; items: CycleItem[]; theme: 'surge' | 'accumulate' | 'warning'
  emptyMsg: string; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const themeColor = theme === 'surge' ? 'text-red-600' : theme === 'accumulate' ? 'text-orange-500' : 'text-gray-800'

  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left mb-3"
      >
        <span className="text-xl">{icon}</span>
        <span className={`text-[16px] font-bold ${themeColor}`}>{title}</span>
        <span className="text-[13px] text-gray-400 font-bold">{items.length}건</span>
        <span className="ml-auto text-gray-400 text-[12px]">{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && (
        items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => <CycleCard key={item.code} item={item} theme={theme} />)}
          </div>
        ) : (
          <p className="text-[14px] text-gray-400 py-4 text-center">{emptyMsg}</p>
        )
      )}
    </div>
  )
}

/* ── 메인 뷰 ── */
export default function CycleScanView() {
  const [data, setData] = useState<CycleScanData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch('/api/swing/cycle-scan', { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json() })
      .then((j) => setData(j.data ?? null))
      .catch((err) => { if (err?.name !== 'AbortError') setData(null) })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-8">
        <div className="text-center py-16 text-gray-400 text-[15px] font-semibold">
          사이클 감지 데이터 없음 (장마감 후 갱신)
        </div>
      </div>
    )
  }

  const rel = data.date ? getRelativeDate(data.date) : null
  const isStale = rel ? rel.daysAgo >= 30 : false
  const warningCount = (data.distribute_count ?? 0) + (data.peak_warn_count ?? 0)

  return (
    <div className={`max-w-[1400px] mx-auto px-3 md:px-6 py-6 ${isStale ? 'opacity-50' : ''}`}>
      {/* 헤더 배너 */}
      <div className="bg-white rounded-xl border border-[#E2E5EA] shadow p-5 mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xl">{'\uD83D\uDD0D'}</span> 수급 사이클 감지기
              <span className="text-[14px] text-gray-400 font-bold ml-2">총 {data.total_scanned}종목 스캔</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[14px] font-bold">
              <span className="text-red-600">{'\uD83D\uDD25'} 급등임박 {data.surge_count}</span>
              <span className="text-orange-500">{'\uD83D\uDCE6'} 매집 {data.accumulate_count}</span>
              <span className="text-green-600">{'\uD83D\uDD04'} 전환 {data.reversal_count}</span>
              <span className="text-gray-800">{'\u26A0\uFE0F'} 경고 {warningCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            {rel && (
              <span className={`font-bold ${rel.daysAgo === 0 ? 'text-[#00CC6A]' : 'text-[#B0ADA6]'}`}>
                {rel.label}
              </span>
            )}
            <span className="font-extrabold text-gray-500">{data.date}</span>
          </div>
        </div>

        {/* 위상 분포 바 */}
        {data.phase_summary && data.total_scanned > 0 && (
          <div className="mt-4">
            <div className="flex rounded-lg overflow-hidden h-6 text-[11px] font-bold">
              {[
                { key: 'SURGE', label: '급등', color: 'bg-red-500 text-white' },
                { key: 'ACCUMULATION', label: '매집', color: 'bg-orange-400 text-white' },
                { key: 'REVERSAL', label: '전환', color: 'bg-green-500 text-white' },
                { key: 'NEUTRAL', label: '중립', color: 'bg-gray-300 text-gray-600' },
                { key: 'DISTRIBUTION', label: '분배', color: 'bg-purple-400 text-white' },
                { key: 'PEAK_WARN', label: '경고', color: 'bg-gray-800 text-white' },
              ].map(({ key, label, color }) => {
                const count = data.phase_summary[key] ?? 0
                if (count === 0) return null
                const pct = (count / data.total_scanned) * 100
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-center ${color}`}
                    style={{ width: `${pct}%`, minWidth: count > 0 ? '28px' : 0 }}
                  >
                    {label} {count}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 컨셉 설명 */}
      <div className="bg-gray-50 rounded-xl border border-[#E2E5EA] shadow-sm p-4 mb-5 text-[13px] text-gray-500 leading-relaxed">
        <p className="font-bold text-gray-600 mb-1">외인·기관·개인·기타법인 4세력 수급 흐름 분석</p>
        <p>{'\uD83D\uDD25'} <b>급등임박</b> = 세력이 모았고, 개인이 바쳤고, 터질 준비 완료 &nbsp;|&nbsp;
           {'\uD83D\uDCE6'} <b>매집</b> = 조용히 모으는 중 &nbsp;|&nbsp;
           {'\u26A0\uFE0F'} <b>고점경고</b> = 세력은 빠지고 개인만 남음</p>
        <p className="mt-1">최강 신호: {'\u26A1'}쌍매수 + {'\uD83D\uDD75\uFE0F'}기타매집 + {'\uD83C\uDFAF'}개인바침 동시 발생</p>
      </div>

      {/* 3개 섹션 */}
      <CycleSection
        title="급등임박"
        icon={'\uD83D\uDD25'}
        items={data.surge_items ?? []}
        theme="surge"
        emptyMsg="급등임박 종목 없음"
        defaultOpen={true}
      />

      <CycleSection
        title="매집 감지"
        icon={'\uD83D\uDCE6'}
        items={data.accumulate_items ?? []}
        theme="accumulate"
        emptyMsg="매집 감지 종목 없음"
        defaultOpen={false}
      />

      <CycleSection
        title="경고"
        icon={'\u26A0\uFE0F'}
        items={data.warning_items ?? []}
        theme="warning"
        emptyMsg="경고 종목 없음 — 시장 안정"
        defaultOpen={false}
      />
    </div>
  )
}
