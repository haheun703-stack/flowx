'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

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
const GRADE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  S: { bg: 'bg-[#FFD700]', text: 'text-[#1A1A2E]', label: '최고 확신' },
  A: { bg: 'bg-[#3B82F6]', text: 'text-white',     label: '우선 관심' },
  B: { bg: 'bg-[#10B981]', text: 'text-white',     label: '관심 후보' },
  C: { bg: 'bg-[#888888]', text: 'text-white',     label: '잠재력' },
  D: { bg: 'bg-[#CCCCCC]', text: 'text-[#555]',    label: '관망' },
}

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
function fmtCap(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}천억`
  return `${v}억`
}

function scoreColor(v: number) {
  if (v >= 70) return '#00843D'
  if (v >= 50) return '#1565C0'
  if (v >= 30) return '#B07D00'
  return '#D62728'
}

// ── 레이더 차트 (SVG) ────────────────────────────────
function RadarChart({ scores }: { scores: number[] }) {
  const cx = 80, cy = 80, r = 60
  const n = 6
  const angles = Array.from({ length: n }, (_, i) => (Math.PI * 2 * i) / n - Math.PI / 2)

  const bgPoints = angles.map(a => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`).join(' ')

  const grids = [0.2, 0.4, 0.6, 0.8].map(pct =>
    angles.map(a => `${cx + r * pct * Math.cos(a)},${cy + r * pct * Math.sin(a)}`).join(' ')
  )

  const dataPoints = angles.map((a, i) => {
    const v = Math.min(scores[i] ?? 0, 100) / 100
    return `${cx + r * v * Math.cos(a)},${cy + r * v * Math.sin(a)}`
  }).join(' ')

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[180px] mx-auto">
      {grids.map((g, i) => (
        <polygon key={i} points={g} fill="none" stroke="#E8E6E0" strokeWidth="0.5" />
      ))}
      <polygon points={bgPoints} fill="none" stroke="#D1D5DB" strokeWidth="1" />
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
          stroke="#E8E6E0" strokeWidth="0.5" />
      ))}
      <polygon points={dataPoints} fill="rgba(0,255,136,0.2)" stroke="#00FF88" strokeWidth="2" />
      {angles.map((a, i) => {
        const lx = cx + (r + 16) * Math.cos(a)
        const ly = cy + (r + 16) * Math.sin(a)
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
            fontSize="9" fontWeight="bold" fill="#6B7280">
            {LAYER_NAMES[i]}
          </text>
        )
      })}
    </svg>
  )
}

// ── GradeBadge ───────────────────────────────────────
function GradeBadge({ grade, size = 'md' }: { grade: string; size?: 'sm' | 'md' }) {
  const s = GRADE_STYLE[grade] ?? GRADE_STYLE.D
  const cls = size === 'sm'
    ? `${s.bg} ${s.text} text-[11px] font-black px-1.5 py-0.5 rounded`
    : `${s.bg} ${s.text} text-[13px] font-black px-2 py-0.5 rounded-lg`
  return <span className={cls}>{grade}</span>
}

// ── ScoreBar ─────────────────────────────────────────
function ScoreBar({ score, label, weight }: { score: number; label: string; weight: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className="w-[52px] text-[#6B7280] font-bold shrink-0">{label}</span>
      <div className="flex-1 h-[6px] bg-[#F0EEE8] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{
          width: `${Math.min(score, 100)}%`,
          backgroundColor: scoreColor(score),
        }} />
      </div>
      <span className="w-[28px] text-right font-black tabular-nums" style={{ color: scoreColor(score) }}>
        {score}
      </span>
      <span className="w-[28px] text-[10px] text-[#aaa]">{weight}</span>
    </div>
  )
}

// ── 상세 확장 패널 ───────────────────────────────────
function DetailPanel({ item }: { item: DiscoveryItem }) {
  const scores = LAYER_KEYS.map(k => item[k] as number)
  const sd = item.supply_details
  const ed = item.earnings_details
  const td = item.technical_details
  const gd = item.global_details
  const od = item.order_details

  return (
    <div className="bg-[#FAFAF8] border-t border-[#E8E6E0] px-4 py-4">
      {/* 시나리오 */}
      {item.scenario && (
        <div className="fx-card-green mb-4">
          <div className="text-[13px] font-black text-[#1A1A2E] mb-1.5">투자 시나리오</div>
          <p className="text-[13px] text-[#555] leading-relaxed whitespace-pre-line">{item.scenario}</p>
        </div>
      )}

      {/* summary 태그 */}
      {item.summary && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.summary.split('|').map((s, i) => (
            <span key={i} className="bg-[#E8F5E9] text-[#00843D] text-[11px] font-bold px-2 py-0.5 rounded-full">
              {s.trim()}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* 좌: 레이더 차트 */}
        <div className="w-full md:w-[200px] shrink-0">
          <RadarChart scores={scores} />
          <div className="text-center mt-2">
            <GradeBadge grade={item.grade} />
            <span className="text-[20px] font-black ml-2" style={{ color: scoreColor(item.total_score) }}>
              {item.total_score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* 우: 점수 막대 + 상세 */}
        <div className="flex-1 space-y-3">
          {/* 점수 막대 */}
          <div className="space-y-1.5">
            {LAYER_NAMES.map((name, i) => (
              <ScoreBar key={name} label={name} score={scores[i]} weight={LAYER_WEIGHTS[i]} />
            ))}
          </div>

          {/* 레이어별 상세 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
            {/* 테마 */}
            {item.theme_keywords && item.theme_keywords.length > 0 && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">테마</div>
                <div className="flex flex-wrap gap-1">
                  {item.theme_keywords.map(t => (
                    <span key={t} className="bg-[#E8F5E9] text-[#00843D] px-1.5 py-0.5 rounded font-bold text-[11px]">
                      #{t.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 수주 */}
            {od && od.count != null && od.count > 0 && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">수주</div>
                <div className="text-[#555] space-y-0.5">
                  <div>수주 {od.count}건{od.total_amount ? `, 총 ${fmtCap(Math.round(od.total_amount / 100000000))}` : ''}</div>
                  {od.items && od.items.length > 0 && od.items.slice(0, 2).map((it, i) => (
                    <div key={i} className="text-[10px] text-[#888]">{it.date} {it.title}</div>
                  ))}
                </div>
              </div>
            )}

            {/* 실적 */}
            {ed && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">실적</div>
                <div className="text-[#555] space-y-0.5">
                  {ed.op_yoy != null && (
                    <div>영업이익 YoY <span className="font-bold" style={{ color: ed.op_yoy >= 0 ? '#D62728' : '#1565C0' }}>
                      {ed.op_yoy >= 0 ? '+' : ''}{ed.op_yoy.toFixed(0)}%
                    </span></div>
                  )}
                  {ed.latest_op != null && (
                    <div className="text-[10px] text-[#888]">최근 영업이익: {(ed.latest_op / 100000000).toFixed(0)}억</div>
                  )}
                </div>
              </div>
            )}

            {/* 수급 */}
            {sd && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">수급</div>
                <div className="text-[#555] space-y-0.5">
                  {sd.foreign_net != null && (
                    <div>외인 {sd.foreign_net >= 0 ? '+' : ''}{sd.foreign_net.toLocaleString()}백만</div>
                  )}
                  {sd.institution_net != null && (
                    <div>기관 {sd.institution_net >= 0 ? '+' : ''}{sd.institution_net.toLocaleString()}백만</div>
                  )}
                  {sd.dual_buy && <div className="text-[#D62728] font-bold">쌍끌이 매수</div>}
                  {sd.dual_sell && <div className="text-[#1565C0] font-bold">쌍끌이 매도</div>}
                </div>
              </div>
            )}

            {/* 기술적 */}
            {td && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">기술적</div>
                <div className="text-[#555] space-y-0.5">
                  {td.alignment && <div className="font-bold">{td.alignment}</div>}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {td.rsi != null && <span className="bg-[#F0EDE8] px-1 py-0.5 rounded">RSI {td.rsi.toFixed(0)}</span>}
                    {td.adx != null && <span className="bg-[#F0EDE8] px-1 py-0.5 rounded">ADX {td.adx.toFixed(0)}</span>}
                    {td.volume_ratio != null && <span className="bg-[#F0EDE8] px-1 py-0.5 rounded">거래량 {td.volume_ratio.toFixed(1)}x</span>}
                    {td.bb_pct != null && <span className="bg-[#F0EDE8] px-1 py-0.5 rounded">BB% {td.bb_pct.toFixed(0)}</span>}
                  </div>
                  {td.patterns && td.patterns.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {td.patterns.map((p, i) => (
                        <span key={i} className="text-[10px] bg-[#E8F5E9] text-[#00843D] px-1 py-0.5 rounded font-bold">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 글로벌 */}
            {gd && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">글로벌</div>
                <div className="text-[#555] space-y-0.5">
                  {gd.relevant_symbols && gd.relevant_symbols.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {gd.relevant_symbols.slice(0, 5).map(s => (
                        <span key={s} className="text-[10px] bg-[#EEF4FF] text-[#3B82F6] px-1 py-0.5 rounded font-bold">{s}</span>
                      ))}
                    </div>
                  )}
                  {gd.bullish_count != null && gd.total_tracked != null && (
                    <div>{gd.bullish_count}/{gd.total_tracked} 강세 ({gd.global_bullish_ratio?.toFixed(0) ?? '—'}%)</div>
                  )}
                  {gd.positive_surprises != null && gd.positive_surprises > 0 && (
                    <div>실적 서프라이즈 {gd.positive_surprises}건</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 필터 버튼 ────────────────────────────────────────
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[12px] md:text-[13px] font-bold transition-colors whitespace-nowrap ${
        active
          ? 'bg-[#00FF88] text-[#1A1A2E]'
          : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white border border-[#E8E6E0]'
      }`}
    >
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

  // 필터 상태
  const [fGrade, setFGrade] = useState<string>('all')
  const [fMarket, setFMarket] = useState<string>('all')
  const [fCategory, setFCategory] = useState<string>('all')
  const [fTheme, setFTheme] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('total_score')

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

  // 클라이언트 필터 + 정렬
  const filtered = useMemo(() => {
    let result = items
    if (fGrade !== 'all') result = result.filter(i => i.grade === fGrade)
    else result = result.filter(i => i.grade !== 'D')
    if (fMarket !== 'all') result = result.filter(i => i.market === fMarket)
    if (fCategory !== 'all') result = result.filter(i => i.category === fCategory)
    if (fTheme !== 'all') result = result.filter(i => i.theme_keywords?.some(k => k.includes(fTheme)))

    const key = sortBy as keyof DiscoveryItem
    result = [...result].sort((a, b) => {
      const av = (a[key] as number) ?? 0
      const bv = (b[key] as number) ?? 0
      return bv - av
    })
    return result
  }, [items, fGrade, fMarket, fCategory, fTheme, sortBy])

  // 테마 목록 (데이터 기반 동적)
  const availableThemes = useMemo(() => {
    const set = new Set<string>()
    items.forEach(i => i.theme_keywords?.forEach(k => set.add(k)))
    const ordered = THEME_LIST.filter(t => set.has(t))
    set.forEach(t => { if (!ordered.includes(t)) ordered.push(t) })
    return ordered
  }, [items])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="h-10 bg-gray-200 rounded-xl" />
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 pb-8 space-y-4">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[20px] md:text-[24px] font-black text-[#1A1A2E]">종목 발굴</h1>
          <p className="text-[12px] md:text-[13px] text-[#888]">6중 필터 AI 종목 스크리닝 — 테마·수주·실적·수급·기술적·글로벌</p>
        </div>
        {date && (
          <div className="text-[12px] text-[#888] shrink-0">
            {date} 기준 · <span className="text-[#00843D] font-bold">FLOWX 정보봇</span>
          </div>
        )}
      </div>

      {/* 요약 카드 */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['S', 'A', 'B'] as const).map(g => {
            const s = GRADE_STYLE[g]
            return (
              <button key={g} onClick={() => setFGrade(fGrade === g ? 'all' : g)}
                className={`fx-card text-center cursor-pointer transition-all ${fGrade === g ? 'ring-2 ring-[#00FF88]' : ''}`}>
                <GradeBadge grade={g} />
                <div className="text-[28px] md:text-[32px] font-black text-[#1A1A2E] mt-1">{summary[g]}</div>
                <div className="text-[11px] text-[#888]">{s.label}</div>
              </button>
            )
          })}
          <div className="fx-card text-center">
            <span className="text-[12px] font-bold text-[#888]">전체</span>
            <div className="text-[28px] md:text-[32px] font-black text-[#1A1A2E] mt-1">{summary.total}</div>
            <div className="text-[11px] text-[#888]">분석 종목</div>
          </div>
        </div>
      )}

      {/* 필터 바 */}
      <div className="fx-card space-y-2">
        {/* 등급 */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[12px] font-bold text-[#888] w-[40px] shrink-0">등급</span>
          {['all', 'S', 'A', 'B', 'C'].map(g => (
            <FilterChip key={g} label={g === 'all' ? '전체' : g}
              active={fGrade === g} onClick={() => setFGrade(g)} />
          ))}
        </div>
        {/* 시장 */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[12px] font-bold text-[#888] w-[40px] shrink-0">시장</span>
          {[['all', '전체'], ['KOSPI', 'KOSPI'], ['KOSDAQ', 'KOSDAQ']].map(([k, l]) => (
            <FilterChip key={k} label={l} active={fMarket === k} onClick={() => setFMarket(k)} />
          ))}
        </div>
        {/* 카테고리 */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[12px] font-bold text-[#888] w-[40px] shrink-0">규모</span>
          {[['all', '전체'], ['large_cap', '대형주'], ['mid_cap', '중형주'], ['small_cap', '소형주'], ['micro_cap', '초소형']].map(([k, l]) => (
            <FilterChip key={k} label={l} active={fCategory === k} onClick={() => setFCategory(k)} />
          ))}
        </div>
        {/* 테마 */}
        {availableThemes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[12px] font-bold text-[#888] w-[40px] shrink-0">테마</span>
            <FilterChip label="전체" active={fTheme === 'all'} onClick={() => setFTheme('all')} />
            {availableThemes.map(t => (
              <FilterChip key={t} label={t.replace(/_/g, ' ')} active={fTheme === t} onClick={() => setFTheme(t)} />
            ))}
          </div>
        )}
      </div>

      {/* 정렬 */}
      <div className="flex items-center gap-2 text-[12px]">
        <span className="text-[#888] font-bold">정렬</span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="border border-[#E8E6E0] rounded-lg px-2 py-1 text-[12px] font-bold text-[#1A1A2E] bg-white">
          <option value="total_score">총점순</option>
          <option value="theme_score">테마순</option>
          <option value="order_score">수주순</option>
          <option value="earnings_score">실적순</option>
          <option value="supply_score">수급순</option>
          <option value="technical_score">기술적순</option>
          <option value="global_score">글로벌순</option>
          <option value="market_cap">시총순</option>
        </select>
        <span className="text-[#aaa] ml-auto">{filtered.length}종목</span>
      </div>

      {/* 메인 테이블 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p className="text-[16px] font-bold mb-2">종목 발굴 데이터 없음</p>
          <p className="text-[13px]">정보봇이 평일 17:35에 데이터를 업로드하면 표시됩니다</p>
        </div>
      ) : (
        <div className="border border-[#E8E6E0] rounded-xl overflow-hidden bg-white">
          {/* 헤더 (md 이상) */}
          <div className="hidden md:grid grid-cols-[40px_1fr_80px_60px_70px_50px_50px_50px_50px_50px_50px_60px] gap-1 px-3 py-2 bg-[#F5F4F0] text-[11px] font-bold text-[#888] border-b border-[#E8E6E0]">
            <span>등급</span><span>종목명</span><span>섹터</span><span>시장</span>
            <span className="text-right">시총</span>
            {LAYER_NAMES.map(n => <span key={n} className="text-center">{n}</span>)}
            <span className="text-right">총점</span>
          </div>

          {/* 행 */}
          {filtered.map(item => (
            <div key={item.ticker}>
              <button
                onClick={() => setExpanded(expanded === item.ticker ? null : item.ticker)}
                className={`w-full text-left transition-colors hover:bg-[#FAFAF8] ${
                  expanded === item.ticker ? 'bg-[#F5F4F0]' : ''
                }`}
              >
                {/* 데스크톱 */}
                <div className="hidden md:grid grid-cols-[40px_1fr_80px_60px_70px_50px_50px_50px_50px_50px_50px_60px] gap-1 px-3 py-2.5 items-center border-b border-[#F0EDE8] text-[13px]">
                  <GradeBadge grade={item.grade} size="sm" />
                  <div>
                    <Link
                      href={`/stock/${item.ticker}`}
                      onClick={e => e.stopPropagation()}
                      className="font-black text-[#1A1A2E] hover:text-[#00FF88] transition-colors"
                    >
                      {item.name}
                    </Link>
                    <span className="text-[11px] text-[#aaa] ml-1">{item.ticker}</span>
                    {item.theme_keywords && item.theme_keywords.length > 0 && (
                      <span className="text-[10px] text-[#00843D] ml-1.5">
                        {item.theme_keywords[0].replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-[#6B7280]">{item.sector}</span>
                  <span className="text-[11px] text-[#888]">{item.market}</span>
                  <span className="text-right text-[12px] font-bold text-[#1A1A2E] tabular-nums">{fmtCap(item.market_cap)}</span>
                  {LAYER_KEYS.map(k => {
                    const v = item[k] as number
                    return (
                      <span key={k} className="text-center text-[12px] font-bold tabular-nums" style={{ color: scoreColor(v) }}>
                        {v}
                      </span>
                    )
                  })}
                  <span className="text-right text-[14px] font-black tabular-nums" style={{ color: scoreColor(item.total_score) }}>
                    {item.total_score.toFixed(1)}
                  </span>
                </div>

                {/* 모바일 */}
                <div className="md:hidden px-3 py-3 border-b border-[#F0EDE8]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <GradeBadge grade={item.grade} size="sm" />
                      <Link
                        href={`/stock/${item.ticker}`}
                        onClick={e => e.stopPropagation()}
                        className="font-black text-[14px] text-[#1A1A2E] hover:text-[#00FF88]"
                      >
                        {item.name}
                      </Link>
                      <span className="text-[11px] text-[#aaa]">{item.ticker}</span>
                    </div>
                    <span className="text-[16px] font-black tabular-nums" style={{ color: scoreColor(item.total_score) }}>
                      {item.total_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#888]">
                    <span>{item.sector}</span>
                    <span>{item.market}</span>
                    <span>{CATEGORY_LABEL[item.category] ?? item.category}</span>
                    <span>{fmtCap(item.market_cap)}</span>
                    <span className="ml-auto">{item.price.toLocaleString()}원</span>
                  </div>
                  {/* 미니 점수 바 */}
                  <div className="flex gap-1 mt-1.5">
                    {LAYER_KEYS.map(k => {
                      const v = item[k] as number
                      return (
                        <div key={k} className="flex-1">
                          <div className="h-[4px] bg-[#F0EEE8] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${Math.min(v, 100)}%`,
                              backgroundColor: scoreColor(v),
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </button>

              {/* 상세 확장 */}
              {expanded === item.ticker && <DetailPanel item={item} />}
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-[12px] text-[#bbb] py-1">
        본 정보는 투자 권유가 아니며 최종 판단은 투자자 본인에게 있습니다 · FLOWX 정보봇 6중 필터 분석
      </div>
    </div>
  )
}
