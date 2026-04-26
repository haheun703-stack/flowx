'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { fmtCap } from '@/shared/lib/formatters'

// ── 타입 ─────────────────────────────────────────────
interface DiscoveryItem {
  ticker: string
  date: string
  name: string
  sector: string
  market: string
  market_cap: number
  price: number
  theme_score: number
  theme_keywords: string[] | null
  theme_details: { matched_themes?: string[]; keyword_hits?: number } | null
  order_score: number
  order_details: { count?: number; total_amount?: number; items?: { title: string; amount: number; date: string }[] } | null
  earnings_score: number
  earnings_details: { op_yoy?: number; latest_op?: number; prev_op?: number; quarters?: { year: string; amount: number }[] } | null
  supply_score: number
  supply_details: { foreign_net?: number; institution_net?: number; dual_buy?: boolean; dual_sell?: boolean } | null
  technical_score: number
  technical_details: { rsi?: number; adx?: number; macd_histogram?: number; bb_pct?: number; volume_ratio?: number; alignment?: string; patterns?: string[] } | null
  global_score: number
  global_details: { relevant_symbols?: string[]; bullish_count?: number; total_tracked?: number; global_bullish_ratio?: number; positive_surprises?: number } | null
  total_score: number
  grade: string
  summary: string | null
  scenario: string | null
  category: string
}

interface Summary {
  S: number; A: number; B: number; C: number; D: number; total: number
}

// ── 상수 ─────────────────────────────────────────────
const CATEGORY_LABEL: Record<string, string> = {
  large_cap: '대형주', mid_cap: '중형주', small_cap: '소형주', micro_cap: '초소형',
}

const THEME_LIST = [
  'AI_데이터센터', '방산_수출', '원전_르네상스', '로봇_자동화',
  '2차전지_소재', '바이오_신약', '조선_해운', '우주항공',
]

const LAYER_NAMES = ['테마', '수주', '실적', '수급', '기술적', '글로벌'] as const
const LAYER_KEYS = ['theme_score', 'order_score', 'earnings_score', 'supply_score', 'technical_score', 'global_score'] as const
const LAYER_WEIGHTS = ['15%', '15%', '25%', '20%', '15%', '10%'] as const

// ── 헬퍼 ─────────────────────────────────────────────

function scoreColor(v: number): string {
  if (v >= 70) return '#16A34A'
  if (v >= 40) return '#D97706'
  if (v > 0) return '#DC2626'
  return '#9CA3AF'
}

function scoreBg(v: number): string {
  if (v >= 70) return '#DCFCE7'
  if (v >= 40) return '#FEF3C7'
  if (v > 0) return '#FEE2E2'
  return '#F5F4F0'
}

function scoreText(v: number): string {
  if (v >= 70) return '#16A34A'
  if (v >= 40) return '#D97706'
  if (v > 0) return '#DC2626'
  return '#9CA3AF'
}

interface Badge { text: string; color: 'purple' | 'green' | 'blue' | 'orange' }

function generateBadges(stock: DiscoveryItem): Badge[] {
  const badges: Badge[] = []
  stock.theme_keywords?.forEach(k =>
    badges.push({ text: k.replace(/_/g, ' '), color: 'purple' }))
  if (stock.earnings_details?.op_yoy != null && stock.earnings_details.op_yoy > 0)
    badges.push({ text: `실적 +${Math.round(stock.earnings_details.op_yoy)}%`, color: 'green' })
  if (stock.supply_details?.dual_buy)
    badges.push({ text: '쌍끌이', color: 'green' })
  if (stock.technical_details?.alignment === '정배열')
    badges.push({ text: '정배열', color: 'green' })
  if ((stock.global_details?.global_bullish_ratio ?? 0) >= 80) {
    const syms = stock.global_details?.relevant_symbols?.slice(0, 3).join('·')
    badges.push({ text: syms ? `${syms} 강세` : '글로벌 강세', color: 'blue' })
  }
  return badges
}

const BADGE_STYLE: Record<string, string> = {
  purple: 'bg-[#F3E8FF] text-[#7C3AED]',
  green: 'bg-[#DCFCE7] text-[#16A34A]',
  blue: 'bg-[#EFF6FF] text-[#2563EB]',
  orange: 'bg-[#FEF3C7] text-[#D97706]',
}

// ── 6중 프로그레스 바 ────────────────────────────────
function FilterScoreGrid({ item }: { item: DiscoveryItem }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 bg-white rounded-xl p-4">
      {LAYER_KEYS.map((k, i) => {
        const v = item[k] as number
        return (
          <div key={k} className="text-center">
            <div className="text-[11px] text-[#6B7280] font-bold">{LAYER_NAMES[i]} {LAYER_WEIGHTS[i]}</div>
            <div className="h-[6px] bg-[#F0EDE8] rounded-full mt-1.5 mb-1 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.min(v, 100)}%`, backgroundColor: scoreColor(v) }} />
            </div>
            <span className="text-[15px] font-bold tabular-nums" style={{ color: scoreColor(v) }}>{v}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── 상세 아코디언 (수급/기술/실적/글로벌) ──────────────
function DetailAccordion({ item }: { item: DiscoveryItem }) {
  const sd = item.supply_details
  const ed = item.earnings_details
  const td = item.technical_details
  const gd = item.global_details
  const od = item.order_details

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] mt-3">
      {/* 수급 */}
      {sd && (sd.foreign_net != null || sd.institution_net != null) && (
        <div className="bg-white rounded-xl p-4 border border-[#E2E5EA]">
          <div className="font-bold text-[#1A1A2E] text-[14px] mb-2">수급 상세</div>
          <div className="text-[#555] space-y-1">
            {sd.foreign_net != null && <div>외인 {sd.foreign_net >= 0 ? '+' : ''}{sd.foreign_net.toLocaleString()}백만</div>}
            {sd.institution_net != null && <div>기관 {sd.institution_net >= 0 ? '+' : ''}{sd.institution_net.toLocaleString()}백만</div>}
            {sd.dual_buy && <div className="text-[#DC2626] font-bold">쌍끌이 매수</div>}
          </div>
        </div>
      )}
      {/* 기술적 */}
      {td && (
        <div className="bg-white rounded-xl p-4 border border-[#E2E5EA]">
          <div className="font-bold text-[#1A1A2E] text-[14px] mb-2">기술적 분석</div>
          <div className="text-[#555] space-y-1">
            {td.alignment && <div className="font-bold">{td.alignment}</div>}
            <div className="flex flex-wrap gap-1.5 text-[12px]">
              {td.rsi != null && <span className="bg-[#F0EDE8] px-2 py-0.5 rounded-md">RSI {td.rsi.toFixed(0)}</span>}
              {td.adx != null && <span className="bg-[#F0EDE8] px-2 py-0.5 rounded-md">ADX {td.adx.toFixed(0)}</span>}
              {td.volume_ratio != null && <span className="bg-[#F0EDE8] px-2 py-0.5 rounded-md">거래량 {td.volume_ratio.toFixed(1)}x</span>}
            </div>
            {td.patterns && td.patterns.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {td.patterns.map((p, i) => (
                  <span key={i} className="text-[12px] bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded-md font-bold">{p}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* 실적 */}
      {ed && (
        <div className="bg-white rounded-xl p-4 border border-[#E2E5EA]">
          <div className="font-bold text-[#1A1A2E] text-[14px] mb-2">실적 상세</div>
          <div className="text-[#555] space-y-1">
            {ed.op_yoy != null && (
              <div>영업이익 YoY <span className="font-bold" style={{ color: ed.op_yoy >= 0 ? '#DC2626' : '#2563EB' }}>
                {ed.op_yoy >= 0 ? '+' : ''}{ed.op_yoy.toFixed(0)}%
              </span></div>
            )}
            {ed.latest_op != null && <div className="text-[12px] text-[#888]">최근 영업이익: {(ed.latest_op / 100000000).toFixed(0)}억</div>}
          </div>
        </div>
      )}
      {/* 수주 */}
      {od && od.count != null && od.count > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#E2E5EA]">
          <div className="font-bold text-[#1A1A2E] text-[14px] mb-2">수주</div>
          <div className="text-[#555] space-y-1">
            <div>수주 {od.count}건{od.total_amount ? `, 총 ${fmtCap(Math.round(od.total_amount / 100000000))}` : ''}</div>
            {od.items?.slice(0, 2).map((it, i) => (
              <div key={i} className="text-[12px] text-[#888]">{it.date} {it.title}</div>
            ))}
          </div>
        </div>
      )}
      {/* 글로벌 */}
      {gd && (
        <div className="bg-white rounded-xl p-4 border border-[#E2E5EA]">
          <div className="font-bold text-[#1A1A2E] text-[14px] mb-2">글로벌</div>
          <div className="text-[#555] space-y-1">
            {gd.relevant_symbols && gd.relevant_symbols.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {gd.relevant_symbols.slice(0, 5).map(s => (
                  <span key={s} className="text-[12px] bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-md font-bold">{s}</span>
                ))}
              </div>
            )}
            {gd.bullish_count != null && gd.total_tracked != null && (
              <div>{gd.bullish_count}/{gd.total_tracked} 강세 ({gd.global_bullish_ratio?.toFixed(0) ?? '—'}%)</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 미니 스코어 뱃지 ─────────────────────────────────
function MiniScore({ value }: { value: number }) {
  return (
    <span className="inline-block w-[36px] h-[22px] rounded-md text-center text-[11px] font-bold leading-[22px]"
      style={{ backgroundColor: scoreBg(value), color: scoreText(value) }}>
      {value}
    </span>
  )
}

// ── 필터 버튼 ────────────────────────────────────────
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap border ${
        active
          ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
          : 'bg-white text-[#6B7280] border-[#E2E5EA] hover:border-[#7C3AED] hover:text-[#7C3AED]'
      }`}>
      {label}
    </button>
  )
}

// ══════════════════════════════════════════════════════
// 메인 뷰
// ══════════════════════════════════════════════════════
export default function DiscoveryView() {
  const [items, setItems] = useState<DiscoveryItem[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAllA, setShowAllA] = useState(false)
  const [showAllB, setShowAllB] = useState(false)

  // 필터 상태
  const [fGrade, setFGrade] = useState<string>('all')
  const [fMarket, setFMarket] = useState<string>('all')
  const [fCategory, setFCategory] = useState<string>('all')
  const [fTheme, setFTheme] = useState<string>('all')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/discovery', { signal: controller.signal })
        if (!res.ok) throw new Error(`API ${res.status}`)
        const json = await res.json()
        setItems(json.items ?? [])
        setSummary(json.summary ?? null)
        setDate(json.date ?? null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setItems([])
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  // 필터 적용 (등급별 분리 전)
  const baseFiltered = useMemo(() => {
    let result = items
    if (fGrade !== 'all') result = result.filter(i => i.grade === fGrade)
    else result = result.filter(i => i.grade !== 'D')
    if (fMarket !== 'all') result = result.filter(i => i.market === fMarket)
    if (fCategory !== 'all') result = result.filter(i => i.category === fCategory)
    if (fTheme !== 'all') result = result.filter(i => i.theme_keywords?.some(k => k.includes(fTheme)))
    return [...result].sort((a, b) => b.total_score - a.total_score)
  }, [items, fGrade, fMarket, fCategory, fTheme])

  // 등급별 분리
  const sGrade = useMemo(() => baseFiltered.filter(i => i.grade === 'S'), [baseFiltered])
  const aGrade = useMemo(() => baseFiltered.filter(i => i.grade === 'A'), [baseFiltered])
  const bGrade = useMemo(() => baseFiltered.filter(i => i.grade === 'B' || i.grade === 'C'), [baseFiltered])

  // 테마 목록
  const availableThemes = useMemo(() => {
    const set = new Set<string>()
    items.forEach(i => i.theme_keywords?.forEach(k => set.add(k)))
    const ordered = THEME_LIST.filter(t => set.has(t))
    set.forEach(t => { if (!ordered.includes(t)) ordered.push(t) })
    return ordered
  }, [items])

  // 등급별 대표 종목명
  const gradeNames = useMemo(() => {
    const get = (g: string) => items.filter(i => i.grade === g).sort((a, b) => b.total_score - a.total_score).slice(0, 3).map(i => i.name)
    return { S: get('S'), A: get('A'), B: get('B') }
  }, [items])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 space-y-5">
        <div className="animate-pulse space-y-5">
          <div className="h-10 w-56 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="h-14 bg-gray-200 rounded-xl" />
          <div className="h-56 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  const displayA = showAllA ? aGrade : aGrade.slice(0, 4)
  const displayB = showAllB ? bGrade : bGrade.slice(0, 3)

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 pb-8 space-y-5">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold text-[#1A1A2E]">종목 발굴</h1>
          <p className="text-[13px] md:text-[14px] text-[#888]">6중 필터 AI 종목 스크리닝 — 테마·수주·실적·수급·기술적·글로벌</p>
        </div>
        {date && (
          <div className="text-[13px] text-[#888] shrink-0">
            {date} 기준 · <span className="text-[#16A34A] font-bold">FLOWX 정보봇</span>
          </div>
        )}
      </div>

      {/* ═══ 1행: 등급 요약 카드 3개 ═══ */}
      {summary && (
        <div className="grid grid-cols-3 gap-2">
          {/* S등급 — 금색 */}
          <button onClick={() => setFGrade(fGrade === 'S' ? 'all' : 'S')}
            className={`rounded-lg p-2.5 text-center transition-all border-2 ${
              fGrade === 'S' ? 'ring-2 ring-[#FFD700] shadow-lg' : ''
            }`}
            style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', borderColor: '#FFD700' }}>
            <div className="text-[11px] font-bold text-[#D97706]">S등급 최고 확신</div>
            <div className="text-[26px] font-bold text-[#92400E] tabular-nums leading-tight">{summary.S}</div>
            {gradeNames.S.length > 0 && (
              <div className="text-[11px] font-semibold text-[#D97706] truncate">{gradeNames.S.join(' · ')}</div>
            )}
          </button>
          {/* A등급 — 녹색 */}
          <button onClick={() => setFGrade(fGrade === 'A' ? 'all' : 'A')}
            className={`rounded-lg p-2.5 text-center transition-all border ${
              fGrade === 'A' ? 'ring-2 ring-[#00FF88] shadow-lg' : ''
            }`}
            style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <div className="text-[11px] font-bold text-[#16A34A]">A등급 우선 관심</div>
            <div className="text-[26px] font-bold text-[#1A1A2E] tabular-nums leading-tight">{summary.A}</div>
            {gradeNames.A.length > 0 && (
              <div className="text-[11px] font-semibold text-[#16A34A] truncate">{gradeNames.A.slice(0, 3).join(' · ')}</div>
            )}
          </button>
          {/* B등급 — 파랑 */}
          <button onClick={() => setFGrade(fGrade === 'B' ? 'all' : 'B')}
            className={`rounded-lg p-2.5 text-center transition-all border ${
              fGrade === 'B' ? 'ring-2 ring-[#3B82F6] shadow-lg' : ''
            }`}
            style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <div className="text-[11px] font-bold text-[#2563EB]">B등급 관심 후보</div>
            <div className="text-[26px] font-bold text-[#1A1A2E] tabular-nums leading-tight">{summary.B}</div>
            {gradeNames.B.length > 0 && (
              <div className="text-[11px] font-semibold text-[#2563EB] truncate">{gradeNames.B.slice(0, 3).join(' · ')}</div>
            )}
          </button>
        </div>
      )}

      {/* ═══ 2행: 필터 바 ═══ */}
      <div className="bg-white rounded-xl border border-[#E2E5EA] p-3 space-y-2">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[12px] font-bold text-[#6B7280] w-[36px] shrink-0">등급</span>
          {['all', 'S', 'A', 'B', 'C'].map(g => (
            <FilterChip key={g} label={g === 'all' ? '전체' : g}
              active={fGrade === g} onClick={() => setFGrade(g)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[12px] font-bold text-[#6B7280] w-[36px] shrink-0">시장</span>
          {[['all', '전체'], ['KOSPI', 'KOSPI'], ['KOSDAQ', 'KOSDAQ']].map(([k, l]) => (
            <FilterChip key={k} label={l} active={fMarket === k} onClick={() => setFMarket(k)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[12px] font-bold text-[#6B7280] w-[36px] shrink-0">규모</span>
          {[['all', '전체'], ['large_cap', '대형주'], ['mid_cap', '중형주'], ['small_cap', '소형주'], ['micro_cap', '초소형']].map(([k, l]) => (
            <FilterChip key={k} label={l} active={fCategory === k} onClick={() => setFCategory(k)} />
          ))}
        </div>
        {availableThemes.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[12px] font-bold text-[#6B7280] w-[36px] shrink-0">테마</span>
            <FilterChip label="전체" active={fTheme === 'all'} onClick={() => setFTheme('all')} />
            {availableThemes.map(t => (
              <FilterChip key={t} label={t.replace(/_/g, ' ')} active={fTheme === t} onClick={() => setFTheme(t)} />
            ))}
          </div>
        )}
      </div>

      {/* 종목 수 */}
      <div className="text-[13px] text-[#9CA3AF]">{baseFiltered.length}종목 표시 중</div>

      {baseFiltered.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p className="text-[17px] font-bold mb-2">종목 발굴 데이터 없음</p>
          <p className="text-[14px]">정보봇이 평일 17:35에 데이터를 업로드하면 표시됩니다</p>
        </div>
      ) : (
        <>
          {/* ═══ 3행: S등급 히어로 카드 ═══ */}
          {sGrade.length > 0 && (fGrade === 'all' || fGrade === 'S') && (
            <div className="bg-white rounded-xl border border-[#E2E5EA] shadow overflow-hidden"
              style={{ borderLeft: '4px solid #00FF88' }}>
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-[17px] font-bold text-[#1A1A2E]">S등급 — 6중 필터 대부분 양호, 최고 확신</h2>
              </div>

              <div className="space-y-0">
                {sGrade.map(item => {
                  const badges = generateBadges(item)
                  const isOpen = expanded === item.ticker
                  return (
                    <div key={item.ticker} className="border-t border-[#F0EDE8]">
                      <div className="p-5" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF8E1 100%)' }}>
                        {/* 헤더 행 */}
                        <div className="flex items-center gap-2.5 flex-wrap mb-3">
                          <span className="bg-[#FFD700] text-[#1A1A2E] text-[14px] font-bold px-2.5 py-1 rounded-lg">S</span>
                          <Link href={`/stock/${item.ticker}`}
                            className="text-[18px] font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors">
                            {item.name}
                          </Link>
                          <span className="text-[13px] text-[#9CA3AF]">{item.ticker}</span>
                          <span className="text-[13px] text-[#6B7280]">{item.sector}</span>
                          <span className="text-[13px] text-[#9CA3AF]">{item.market}</span>
                          {item.supply_details?.dual_buy && (
                            <span className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-[#FEE2E2] text-[#DC2626]">쌍끌이</span>
                          )}
                          <span className="ml-auto text-[22px] font-bold tabular-nums" style={{ color: scoreColor(item.total_score) }}>
                            {item.total_score.toFixed(1)}점
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[14px] text-[#6B7280] mb-4">
                          <span className="tabular-nums">{item.price.toLocaleString()}원</span>
                          <span>{fmtCap(item.market_cap)}</span>
                          <span>{CATEGORY_LABEL[item.category] ?? item.category}</span>
                        </div>

                        {/* 6중 프로그레스 바 */}
                        <FilterScoreGrid item={item} />

                        {/* AI 시나리오 */}
                        {item.scenario && (
                          <div className="mt-4 rounded-r-xl p-4" style={{ background: '#F0FDF4', borderLeft: '3px solid #00FF88' }}>
                            <span className="text-[12px] font-semibold text-[#059669]">AI 시나리오</span>
                            <p className="text-[13px] text-[#065F46] leading-relaxed mt-1 whitespace-pre-line">{item.scenario}</p>
                          </div>
                        )}

                        {/* 키워드 뱃지 */}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {badges.map((b, i) => (
                              <span key={i} className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${BADGE_STYLE[b.color]}`}>{b.text}</span>
                            ))}
                          </div>
                        )}

                        {/* summary 태그 */}
                        {item.summary && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.summary.split('|').map((s, i) => (
                              <span key={i} className="bg-[#DCFCE7] text-[#16A34A] text-[12px] font-bold px-2 py-0.5 rounded-full">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 상세 분석 토글 */}
                        <button onClick={() => setExpanded(isOpen ? null : item.ticker)}
                          className="mt-3 text-[13px] font-bold text-[#7C3AED] hover:underline">
                          {isOpen ? '상세 분석 접기 ▲' : '상세 분석 펼치기 ▼'}
                        </button>
                      </div>
                      {isOpen && (
                        <div className="px-5 pb-5 bg-[#FAFAF8]">
                          <DetailAccordion item={item} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══ 4행: A등급 컴팩트 행 ═══ */}
          {aGrade.length > 0 && (fGrade === 'all' || fGrade === 'A') && (
            <div className="bg-white rounded-xl border border-[#E2E5EA] shadow overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-[17px] font-bold text-[#1A1A2E]">A등급 — 핵심 지표 다수 충족 ({aGrade.length}종목)</h2>
              </div>

              <div>
                {displayA.map(item => {
                  const isOpen = expanded === item.ticker
                  const badges = generateBadges(item)
                  return (
                    <div key={item.ticker} className="border-t border-[#F0EDE8]">
                      <button onClick={() => setExpanded(isOpen ? null : item.ticker)}
                        className={`w-full text-left px-5 py-3.5 hover:bg-[#FAFAF8] transition-colors ${isOpen ? 'bg-[#F5F4F0]' : ''}`}>
                        {/* 데스크톱 */}
                        <div className="hidden md:flex items-center gap-2.5">
                          <span className="bg-[#3B82F6] text-white text-[12px] font-bold px-2 py-0.5 rounded-md shrink-0">A</span>
                          <Link href={`/stock/${item.ticker}`} onClick={e => e.stopPropagation()}
                            className="text-[15px] font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors truncate min-w-[90px]">
                            {item.name}
                          </Link>
                          {item.theme_keywords?.[0] && (
                            <span className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-[#F3E8FF] text-[#7C3AED] shrink-0">
                              {item.theme_keywords[0].replace(/_/g, ' ')}
                            </span>
                          )}
                          <span className="text-[13px] text-[#9CA3AF] shrink-0">{item.sector}</span>
                          <div className="flex gap-1 ml-auto shrink-0">
                            {LAYER_KEYS.map(k => <MiniScore key={k} value={item[k] as number} />)}
                          </div>
                          <span className="text-[16px] font-bold tabular-nums w-[56px] text-right shrink-0" style={{ color: scoreColor(item.total_score) }}>
                            {item.total_score.toFixed(1)}
                          </span>
                          <span className="text-[13px] text-[#9CA3AF] shrink-0">{isOpen ? '▲' : '▸'}</span>
                        </div>
                        {/* 모바일 */}
                        <div className="md:hidden">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-[#3B82F6] text-white text-[12px] font-bold px-2 py-0.5 rounded-md">A</span>
                            <Link href={`/stock/${item.ticker}`} onClick={e => e.stopPropagation()}
                              className="text-[15px] font-bold text-[#1A1A2E] hover:text-[#00FF88]">{item.name}</Link>
                            <span className="text-[13px] text-[#9CA3AF]">{item.sector}</span>
                            <span className="ml-auto text-[16px] font-bold tabular-nums" style={{ color: scoreColor(item.total_score) }}>
                              {item.total_score.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {LAYER_KEYS.map(k => <MiniScore key={k} value={item[k] as number} />)}
                          </div>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 bg-[#FAFAF8] border-t border-[#F0EDE8]">
                          <FilterScoreGrid item={item} />
                          {item.scenario && (
                            <div className="mt-3 rounded-r-xl p-4" style={{ background: '#F0FDF4', borderLeft: '3px solid #00FF88' }}>
                              <span className="text-[12px] font-semibold text-[#059669]">AI 시나리오</span>
                              <p className="text-[13px] text-[#065F46] leading-relaxed mt-1 whitespace-pre-line">{item.scenario}</p>
                            </div>
                          )}
                          {badges.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {badges.map((b, i) => (
                                <span key={i} className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${BADGE_STYLE[b.color]}`}>{b.text}</span>
                              ))}
                            </div>
                          )}
                          <DetailAccordion item={item} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {aGrade.length > 4 && (
                <button onClick={() => setShowAllA(p => !p)}
                  className="w-full py-3 text-[13px] font-bold text-[#7C3AED] hover:bg-[#F5F4F0] transition-colors border-t border-[#F0EDE8]">
                  {showAllA ? '접기 ▲' : `나머지 ${aGrade.length - 4}종목 보기 ▼`}
                </button>
              )}
            </div>
          )}

          {/* ═══ 5행: B등급 테이블 ═══ */}
          {bGrade.length > 0 && (fGrade === 'all' || fGrade === 'B' || fGrade === 'C') && (
            <div className="bg-white rounded-xl border border-[#E2E5EA] shadow overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <h2 className="text-[17px] font-bold text-[#1A1A2E]">B등급 — 관심 후보 ({bGrade.length}종목)</h2>
              </div>

              {/* 데스크톱 테이블 헤더 */}
              <div className="hidden md:grid grid-cols-[40px_1fr_80px_56px_56px_56px_56px_56px_56px_64px] gap-1.5 px-5 py-2.5 bg-[#F5F4F0] text-[12px] font-bold text-[#888] border-y border-[#E2E5EA]">
                <span>등급</span><span>종목명</span><span>테마</span>
                {LAYER_NAMES.map(n => <span key={n} className="text-center">{n}</span>)}
                <span className="text-right">총점</span>
              </div>

              {displayB.map(item => {
                const isOpen = expanded === item.ticker
                const badges = generateBadges(item)
                return (
                  <div key={item.ticker}>
                    <button onClick={() => setExpanded(isOpen ? null : item.ticker)}
                      className={`w-full text-left hover:bg-[#FAFAF8] transition-colors ${isOpen ? 'bg-[#F5F4F0]' : ''}`}>
                      {/* 데스크톱 */}
                      <div className="hidden md:grid grid-cols-[40px_1fr_80px_56px_56px_56px_56px_56px_56px_64px] gap-1.5 px-5 py-3 items-center border-b border-[#F0EDE8] text-[14px]">
                        <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md text-center ${
                          item.grade === 'B' ? 'bg-[#10B981] text-white' : 'bg-gray-300 text-gray-600'
                        }`}>{item.grade}</span>
                        <div className="min-w-0">
                          <Link href={`/stock/${item.ticker}`} onClick={e => e.stopPropagation()}
                            className="font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors truncate block text-[14px]">
                            {item.name}
                          </Link>
                          <span className="text-[12px] text-[#9CA3AF]">{item.sector}</span>
                        </div>
                        <span className="text-[12px] text-[#6B7280] truncate">{item.theme_keywords?.[0]?.replace(/_/g, ' ') ?? ''}</span>
                        {LAYER_KEYS.map(k => <MiniScore key={k} value={item[k] as number} />)}
                        <span className="text-right text-[15px] font-bold tabular-nums" style={{ color: scoreColor(item.total_score) }}>
                          {item.total_score.toFixed(1)}
                        </span>
                      </div>
                      {/* 모바일 */}
                      <div className="md:hidden px-5 py-3 border-b border-[#F0EDE8]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${
                            item.grade === 'B' ? 'bg-[#10B981] text-white' : 'bg-gray-300 text-gray-600'
                          }`}>{item.grade}</span>
                          <Link href={`/stock/${item.ticker}`} onClick={e => e.stopPropagation()}
                            className="text-[14px] font-bold text-[#1A1A2E] hover:text-[#00FF88]">{item.name}</Link>
                          <span className="text-[12px] text-[#9CA3AF]">{item.sector}</span>
                          <span className="ml-auto text-[15px] font-bold tabular-nums" style={{ color: scoreColor(item.total_score) }}>
                            {item.total_score.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {LAYER_KEYS.map(k => <MiniScore key={k} value={item[k] as number} />)}
                        </div>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 bg-[#FAFAF8] border-b border-[#F0EDE8]">
                        <FilterScoreGrid item={item} />
                        {item.scenario && (
                          <div className="mt-3 rounded-r-xl p-4" style={{ background: '#F0FDF4', borderLeft: '3px solid #00FF88' }}>
                            <span className="text-[12px] font-semibold text-[#059669]">AI 시나리오</span>
                            <p className="text-[13px] text-[#065F46] leading-relaxed mt-1 whitespace-pre-line">{item.scenario}</p>
                          </div>
                        )}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {badges.map((b, i) => (
                              <span key={i} className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${BADGE_STYLE[b.color]}`}>{b.text}</span>
                            ))}
                          </div>
                        )}
                        <DetailAccordion item={item} />
                      </div>
                    )}
                  </div>
                )
              })}

              {bGrade.length > 3 && (
                <button onClick={() => setShowAllB(p => !p)}
                  className="w-full py-3 text-[13px] font-bold text-[#7C3AED] hover:bg-[#F5F4F0] transition-colors border-t border-[#F0EDE8]">
                  {showAllB ? '접기 ▲' : `나머지 ${bGrade.length - 3}종목 보기 ▼`}
                </button>
              )}
            </div>
          )}
        </>
      )}

      <div className="text-center text-[12px] text-[#bbb] py-2">
        본 정보는 투자 권유가 아니며 최종 판단은 투자자 본인에게 있습니다 · FLOWX 정보봇 6중 필터 분석
      </div>
    </div>
  )
}
