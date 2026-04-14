'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import type { BluechipCheckupData } from './BluechipCheckupPanel'
import { fmtCap } from '@/shared/lib/formatters'
import { FibStock, ZONE_ORDER, ZONE_CONFIG, FibMiniGauge, FibLegend } from '@/features/swing/ui/FibShared'

/* ─── Types ─── */
interface SmallcapItem {
  code: string; name: string; sector: string; theme: string
  cap: number; price: number; drop_52w: number; fib_zone: string
  upside_pct: number; target_price: number; supply_signal: string
  per: number; pbr: number; ai_reason?: string
}

/* ─── Constants ─── */
const ZONE_COLOR: Record<string, string> = {
  DEEP: '#dc2626', MID: '#d97706', MILD: '#2563eb', SHALLOW: '#6B7280', NEAR_HIGH: '#16a34a',
}

const SUPPLY_CFG: Record<string, { bg: string; text: string }> = {
  '쌍끌이': { bg: 'bg-red-100', text: 'text-red-700' },
  '매집': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '관망': { bg: 'bg-gray-100', text: 'text-gray-500' },
  'AI추천': { bg: 'bg-green-100', text: 'text-green-700' },
}

type FibFilter = 'all' | 'DEEP' | 'MID' | 'MILD'

/* ═══════════════════════════════════════ */
/*           MAIN COMPONENT               */
/* ═══════════════════════════════════════ */

export default function SmallcapThemeTab({ bluechip }: { bluechip: BluechipCheckupData | null }) {
  const [openTheme, setOpenTheme] = useState<string | null>(null)
  const [fibStocks, setFibStocks] = useState<FibStock[]>([])
  const [fibDate, setFibDate] = useState('')
  const [fibLoading, setFibLoading] = useState(true)
  const [fibFilter, setFibFilter] = useState<FibFilter>('all')
  const [fibSort, setFibSort] = useState<'drop' | 'upside' | 'per'>('drop')
  const [showFib, setShowFib] = useState(false)

  // Fetch fib_stocks
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

  const smallcaps: SmallcapItem[] = (bluechip?.smallcaps ?? []) as SmallcapItem[]

  // Group by theme
  const themeGroups = useMemo(() => {
    const map = new Map<string, SmallcapItem[]>()
    for (const sc of smallcaps) {
      const theme = sc.theme || sc.sector || '기타'
      if (!map.has(theme)) map.set(theme, [])
      map.get(theme)!.push(sc)
    }
    return Array.from(map.entries())
  }, [smallcaps])

  // Fib zone filtering + sorting
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

  if (!bluechip) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280]">소형주 테마 데이터가 없습니다.</p>
        <p className="text-[#9CA3AF] text-sm mt-1">다음 갱신 시 업데이트됩니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* ── 안내 문구 ── */}
      <div className="bg-[#F5F4F0] rounded-xl p-4">
        <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-1">소형주 테마 — 대형주에서 찾은 산업의 저렴한 종목</h2>
        <p className="text-[12px] text-[#6B7280]">대형주 점검에서 &quot;이 산업이 좋다&quot; → 여기서 실제 매수 후보를 찾으세요</p>
      </div>

      {/* ── 테마별 카드 그리드 ── */}
      {themeGroups.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {themeGroups.map(([theme, items]) => {
              const isOpen = openTheme === theme
              // HOT 판단: 수급 좋은 종목이 있으면 HOT
              const hasHot = items.some(s => s.supply_signal === '쌍끌이' || s.supply_signal === '매집')
              const hasAI = items.some(s => s.supply_signal === 'AI추천')
              return (
                <button key={theme} onClick={() => setOpenTheme(isOpen ? null : theme)}
                  className={`rounded-xl p-3 text-left transition-all border-2 ${
                    isOpen ? 'border-[#1A1A2E] shadow-md' : 'border-transparent'
                  }`}
                  style={{
                    backgroundColor: hasHot ? '#FEF2F2' : hasAI ? '#F0FDF4' : '#F5F4F0',
                  }}>
                  <span className="text-[14px] font-bold text-[#1A1A2E] block">{theme}</span>
                  <span className="text-[12px] text-[#6B7280]">{items.length}종목</span>
                  {hasHot && <span className="text-[10px] font-bold text-[#DC2626] ml-2">HOT</span>}
                  {hasAI && <span className="text-[10px] font-bold text-[#16A34A] ml-2">AI</span>}
                </button>
              )
            })}
          </div>

          {/* 선택된 테마 종목 리스트 */}
          {openTheme && (
            <div className="fx-card">
              <h3 className="text-[14px] font-bold text-[#1A1A2E] mb-2">
                {openTheme} — {themeGroups.find(([t]) => t === openTheme)?.[1]?.length ?? 0}종목
              </h3>
              <div className="space-y-0">
                {themeGroups.find(([t]) => t === openTheme)?.[1]?.map(sc => {
                  const zc = ZONE_COLOR[sc.fib_zone] ?? '#888'
                  const sup = SUPPLY_CFG[sc.supply_signal] ?? SUPPLY_CFG['관망']
                  return (
                    <div key={sc.code} className="py-2.5 border-b border-[#F0EDE8] last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Link href={`/stock/${sc.code}`}
                            className="text-[13px] font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors truncate">
                            {sc.name}
                          </Link>
                          {sc.fib_zone && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0"
                              style={{ backgroundColor: `${zc}15`, color: zc }}>{sc.fib_zone}</span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${sup.bg} ${sup.text}`}>
                            {sc.supply_signal}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-[12px]">
                          {sc.price > 0 && <span className="tabular-nums text-[#1A1A2E]">{sc.price.toLocaleString()}원</span>}
                          {sc.cap > 0 && <span className="tabular-nums text-[#6B7280]">{fmtCap(sc.cap)}</span>}
                          {sc.drop_52w !== 0 && <span className="tabular-nums text-[#2563eb] font-bold">{sc.drop_52w.toFixed(0)}%</span>}
                          {sc.upside_pct > 0 && <span className="tabular-nums font-bold text-[#dc2626]">+{sc.upside_pct.toFixed(0)}%</span>}
                        </div>
                      </div>
                      {sc.ai_reason && (
                        <p className="text-[11px] text-[#6B7280] mt-1 ml-0.5">{sc.ai_reason}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-[13px] text-[#9CA3AF] text-center py-6">테마 소형주 데이터 없음</p>
      )}

      {/* ── 눌림목 소형주 전체 (피보나치) ── */}
      <div className="fx-card">
        <button onClick={() => setShowFib(p => !p)}
          className="w-full flex items-center justify-between">
          <div>
            <span className="text-[15px] font-bold text-[#1A1A2E]">눌림목 소형주 전체</span>
            <span className="text-[12px] text-[#9CA3AF] ml-2">{fibStocks.length}종목</span>
          </div>
          <span className="text-[12px] font-bold text-[#7C3AED]">{showFib ? '접기 ▲' : '펼치기 ▼'}</span>
        </button>

        {showFib && (
          <div className="mt-3 space-y-3">
            {fibLoading ? (
              <div className="animate-pulse h-32 bg-gray-200 rounded-xl" />
            ) : fibStocks.length === 0 ? (
              <p className="text-[13px] text-[#9CA3AF] text-center py-6">피보나치 데이터 없음</p>
            ) : (
              <>
                {/* 필터 탭 + 정렬 */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Zone filter */}
                  <div className="flex gap-1">
                    {([{ key: 'all' as const, label: `전체 ${fibStocks.length}` }, ...zoneCounts.map(z => ({ key: z.zone as FibFilter, label: `${z.zone} ${z.count}` }))] as { key: FibFilter; label: string }[]).map(f => (
                      <button key={f.key} onClick={() => setFibFilter(f.key)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors"
                        style={{ backgroundColor: fibFilter === f.key ? '#F0EDE8' : 'transparent', color: fibFilter === f.key ? '#1A1A2E' : '#9CA3AF' }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {/* Sort */}
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
