'use client'

import { useEffect, useState, useMemo } from 'react'
import { CONTAINER, CARD } from '@/shared/lib/card-styles'

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
  theme_details: Record<string, unknown> | null
  order_score: number
  order_details: Record<string, unknown> | null
  earnings_score: number
  earnings_details: Record<string, unknown> | null
  supply_score: number
  supply_details: Record<string, unknown> | null
  technical_score: number
  technical_details: Record<string, unknown> | null
  global_score: number
  global_details: Record<string, unknown> | null
  total_score: number
  grade: string
  summary: string | null
  category: string
}

interface Summary {
  S: number; A: number; B: number; C: number; D: number; total: number
}

// ── 상수 ─────────────────────────────────────────────
const GRADE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  S: { bg: 'bg-[#FFD700]', text: 'text-[#1A1A2E]', label: '최고 확신' },
  A: { bg: 'bg-[#FF4444]', text: 'text-white',     label: '매우 유망' },
  B: { bg: 'bg-[#FF8800]', text: 'text-white',     label: '관심 종목' },
  C: { bg: 'bg-[#888888]', text: 'text-white',     label: '잠재력' },
  D: { bg: 'bg-[#CCCCCC]', text: 'text-[#555]',    label: '관망' },
}

const CATEGORY_LABEL: Record<string, string> = {
  large_cap: '대형주', mid_cap: '중형주', small_cap: '소형주', micro_cap: '소형주2',
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

  // 격자선 (20%, 40%, 60%, 80%)
  const grids = [0.2, 0.4, 0.6, 0.8].map(pct =>
    angles.map(a => `${cx + r * pct * Math.cos(a)},${cy + r * pct * Math.sin(a)}`).join(' ')
  )

  const dataPoints = angles.map((a, i) => {
    const v = Math.min(scores[i] ?? 0, 100) / 100
    return `${cx + r * v * Math.cos(a)},${cy + r * v * Math.sin(a)}`
  }).join(' ')

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[180px] mx-auto">
      {/* 격자 */}
      {grids.map((g, i) => (
        <polygon key={i} points={g} fill="none" stroke="#E8E6E0" strokeWidth="0.5" />
      ))}
      <polygon points={bgPoints} fill="none" stroke="#D1D5DB" strokeWidth="1" />

      {/* 축선 */}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
          stroke="#E8E6E0" strokeWidth="0.5" />
      ))}

      {/* 데이터 */}
      <polygon points={dataPoints} fill="rgba(0,255,136,0.2)" stroke="#00FF88" strokeWidth="2" />

      {/* 라벨 */}
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
  const sd = item.supply_details as { foreign_5d?: number; inst_5d?: number; dual_buy?: boolean; consec_days?: number } | null
  const ed = item.earnings_details as { op_yoy?: number; op_qoq?: number; revenue_yoy?: number } | null
  const td = item.technical_details as { rsi?: number; macd_signal?: string; alignment?: string; adx?: number } | null
  const gd = item.global_details as { analyst_consensus?: string; earnings_surprise?: number; supply_chain?: string[] } | null
  const od = item.order_details as { count?: number; total_amount?: number } | null

  return (
    <div className="bg-[#FAFAF8] border-t border-[#E8E6E0] px-4 py-4">
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
                <div className="text-[#555]">
                  수주 {od.count}건{od.total_amount ? `, 총 ${fmtCap(Math.round(od.total_amount / 100000000))}` : ''}
                </div>
              </div>
            )}

            {/* 실적 */}
            {ed && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">실적</div>
                <div className="text-[#555] space-y-0.5">
                  {ed.op_yoy != null && <div>영업이익 YoY {ed.op_yoy >= 0 ? '+' : ''}{ed.op_yoy.toFixed(0)}%</div>}
                  {ed.op_qoq != null && <div>영업이익 QoQ {ed.op_qoq >= 0 ? '+' : ''}{ed.op_qoq.toFixed(0)}%</div>}
                  {ed.revenue_yoy != null && <div>매출 YoY {ed.revenue_yoy >= 0 ? '+' : ''}{ed.revenue_yoy.toFixed(0)}%</div>}
                </div>
              </div>
            )}

            {/* 수급 */}
            {sd && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">수급</div>
                <div className="text-[#555] space-y-0.5">
                  {sd.foreign_5d != null && <div>외인 5일 {sd.foreign_5d >= 0 ? '+' : ''}{sd.foreign_5d.toLocaleString()}억</div>}
                  {sd.inst_5d != null && <div>기관 5일 {sd.inst_5d >= 0 ? '+' : ''}{sd.inst_5d.toLocaleString()}억</div>}
                  {sd.dual_buy && <div className="text-[#D62728] font-bold">쌍끌이 매수</div>}
                  {sd.consec_days != null && sd.consec_days >= 3 && <div>연속 {sd.consec_days}일</div>}
                </div>
              </div>
            )}

            {/* 기술적 */}
            {td && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">기술적</div>
                <div className="text-[#555]">
                  {[td.alignment, td.rsi != null ? `RSI ${td.rsi.toFixed(0)}` : null, td.macd_signal, td.adx != null ? `ADX ${td.adx.toFixed(0)}` : null]
                    .filter(Boolean).join(' | ')}
                </div>
              </div>
            )}

            {/* 글로벌 */}
            {gd && (
              <div className="bg-white rounded-lg p-2 border border-[#E8E6E0]">
                <div className="font-black text-[#1A1A2E] mb-1">글로벌</div>
                <div className="text-[#555] space-y-0.5">
                  {gd.analyst_consensus && <div>{gd.analyst_consensus}</div>}
                  {gd.earnings_surprise != null && <div>실적 서프라이즈 {gd.earnings_surprise >= 0 ? '+' : ''}{gd.earnings_surprise.toFixed(0)}%</div>}
                  {gd.supply_chain && gd.supply_chain.length > 0 && <div>연관: {gd.supply_chain.slice(0, 3).join(', ')}</div>}
                </div>
              </div>
            )}
          </div>

          {/* AI 코멘트 */}
          {item.summary && (
            <div className="bg-[#F0F7FF] rounded-lg p-2 border-l-4 border-[#0ea5e9] text-[12px] text-[#444]">
              {item.summary}
            </div>
          )}
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
  const [expanded, setExpanded] = useState<string | null>(null) // ticker

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
    else result = result.filter(i => i.grade !== 'D') // 기본: D 제외
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
    // THEME_LIST 순서 우선, 추가 테마는 뒤에
    const ordered = THEME_LIST.filter(t => set.has(t))
    set.forEach(t => { if (!ordered.includes(t)) ordered.push(t) })
    return ordered
  }, [items])

  if (loading) {
    return (
      <div className={`${CONTAINER} pt-6 space-y-4`}>
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
    <div className={`${CONTAINER} pt-6 pb-8 space-y-4`}>
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-[20px] md:text-[24px] font-black text-[#1A1A2E]">종목 발굴</h1>
          <p className="text-[12px] md:text-[13px] text-[#888]">6중 필터 AI 종목 스크리닝 — 테마·수주·실적·수급·기술적·글로벌</p>
        </div>
        {date && (
          <div className="text-[12px] text-[#888] shrink-0">
            {date} 기준 · <span className="text-[#00843D] font-bold">● 정보봇 자동수집</span>
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
                className={`${CARD.S} text-center cursor-pointer transition-all min-h-0 ${fGrade === g ? 'ring-2 ring-[#00FF88]' : ''}`}>
                <GradeBadge grade={g} />
                <div className="text-[28px] md:text-[32px] font-black text-[#1A1A2E] mt-1">{summary[g]}</div>
                <div className="text-[11px] text-[#888]">{s.label}</div>
              </button>
            )
          })}
          <div className={`${CARD.S} text-center min-h-0`}>
            <span className="text-[12px] font-bold text-[#888]">전체</span>
            <div className="text-[28px] md:text-[32px] font-black text-[#1A1A2E] mt-1">{summary.total}</div>
            <div className="text-[11px] text-[#888]">분석 종목</div>
          </div>
        </div>
      )}

      {/* 필터 바 */}
      <div className="space-y-2">
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
          {[['all', '전체'], ['large_cap', '대형주'], ['mid_cap', '중형주'], ['small_cap', '소형주'], ['micro_cap', '소형주2']].map(([k, l]) => (
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
                    <span className="font-black text-[#1A1A2E]">{item.name}</span>
                    <span className="text-[11px] text-[#aaa] ml-1">{item.ticker}</span>
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
                      <span className="font-black text-[14px] text-[#1A1A2E]">{item.name}</span>
                      <span className="text-[11px] text-[#aaa]">{item.ticker}</span>
                    </div>
                    <span className="text-[16px] font-black tabular-nums" style={{ color: scoreColor(item.total_score) }}>
                      {item.total_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#888]">
                    <span>{item.sector}</span>
                    <span>{item.market}</span>
                    <span>{fmtCap(item.market_cap)}</span>
                    <span className="ml-auto">{item.price.toLocaleString()}원</span>
                  </div>
                  {/* 미니 점수 바 */}
                  <div className="flex gap-1 mt-1.5">
                    {LAYER_KEYS.map((k, i) => {
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
