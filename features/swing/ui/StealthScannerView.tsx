'use client'

import { useEffect, useState, useMemo } from 'react'
import { fmtCap } from '@/shared/lib/formatters'

/* ── 타입 ── */
interface StealthStock {
  code: string
  name: string
  sector: string
  score: number
  pattern: string
  dual_buy: boolean
  inst_avg: number
  frgn_avg: number
  chg_5d: number
  close: number
  cap: number
  category: '잠복' | '움직임'
}

interface StealthSummary {
  total_detected: number
  stealth_count: number
  moving_count: number
  surged_count: number
  top_stealth: string[]
}

interface StealthData {
  timestamp: string
  stealth: StealthStock[]
  moving: StealthStock[]
  summary: StealthSummary
}

/* ── 금액 포맷 ── */
function fmtMoney(val: number): string {
  const eok = val / 100
  if (eok >= 10000) return `${(eok / 10000).toFixed(1)}조`
  if (eok >= 1000) return `${(eok / 1000).toFixed(1)}천억`
  return `${Math.round(eok)}억`
}

function fmtPrice(val: number): string {
  return val.toLocaleString('ko-KR')
}

/* ── 점수 색상 ── */
function scoreStyle(score: number) {
  if (score >= 100) return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', label: '최강' }
  if (score >= 70) return { bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C', label: '강함' }
  return { bg: '#FEFCE8', border: '#FDE68A', text: '#CA8A04', label: '보통' }
}

/* ── 패턴 뱃지 ── */
function patternStyle(pattern: string) {
  if (pattern.includes('쌍매수')) return { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED' }
  if (pattern.includes('기관')) return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' }
  if (pattern.includes('외인')) return { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' }
  return { bg: '#F3F4F6', border: '#E5E7EB', text: '#6B7280' }
}

/* ── 종목 카드 ── */
function StealthCard({ stock }: { stock: StealthStock }) {
  const sc = scoreStyle(stock.score)
  const pt = patternStyle(stock.pattern)
  const isDual = stock.dual_buy

  return (
    <div
      className="bg-white rounded-xl px-4 py-3.5 shadow-sm transition-all hover:shadow-md"
      style={{
        border: isDual ? '2px solid #EAB308' : '1px solid var(--border, #E8E6E0)',
      }}
    >
      {/* 상단: 종목명 + 섹터 + 점수 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {isDual && <span className="text-[14px]" title="쌍매수 (기관+외인 동시)">&#9889;</span>}
          <span className="text-[14px] font-bold text-[var(--text-primary,#1A1A2E)] truncate">
            {stock.name}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5F4F0] text-[var(--text-muted,#6B7280)] shrink-0">
            {stock.sector}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
          >
            {sc.label}
          </span>
          <span className="text-[15px] font-mono font-bold" style={{ color: sc.text }}>
            {stock.score}
          </span>
        </div>
      </div>

      {/* 중간: 패턴 + 기관/외인 매수 */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded"
          style={{ background: pt.bg, color: pt.text, border: `1px solid ${pt.border}` }}
        >
          {stock.pattern}
        </span>
        <span className="text-[11px] font-mono text-[#DC2626] font-semibold">
          I+{fmtMoney(stock.inst_avg)}
        </span>
        <span className="text-[11px] font-mono text-[#2563EB] font-semibold">
          F+{fmtMoney(stock.frgn_avg)}
        </span>
      </div>

      {/* 하단: 현재가 + 5일 등락 + 시총 */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted,#6B7280)]">
        <span>{fmtPrice(stock.close)}원</span>
        <span
          className="font-semibold"
          style={{ color: stock.chg_5d >= 0 ? '#16A34A' : '#DC2626' }}
        >
          5일 {stock.chg_5d >= 0 ? '+' : ''}{stock.chg_5d.toFixed(1)}%
        </span>
        <span>시총 {fmtCap(stock.cap)}</span>
      </div>
    </div>
  )
}

/* ── 메인 뷰 ── */
export default function StealthScannerView() {
  const [data, setData] = useState<StealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState<'stealth' | 'moving'>('stealth')

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch('/api/swing-dashboard', { signal: controller.signal })
        if (!res.ok) throw new Error(`${res.status}`)
        const json = await res.json()
        const raw = json.data?.stealth_stocks
        if (raw && typeof raw === 'object' && raw.stealth) {
          setData(raw as StealthData)
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error('[StealthScanner]', e)
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  const stocks = useMemo(() => {
    if (!data) return []
    const list = subTab === 'stealth' ? data.stealth : data.moving
    return [...list].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (b.inst_avg + b.frgn_avg) - (a.inst_avg + a.frgn_avg)
    })
  }, [data, subTab])

  /* 로딩 */
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-24" />
          ))}
        </div>
      </div>
    )
  }

  /* 데이터 없음 */
  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-10 text-center">
        <div className="text-[var(--text-muted,#6B7280)] text-sm font-mono">
          선매집 데이터 없음 (장마감 후 갱신)
        </div>
      </div>
    )
  }

  const { summary, timestamp } = data

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-3 md:space-y-4">
      {/* 헤더 */}
      <div className="bg-white rounded-xl border-2 border-[#00FF88] px-5 py-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] md:text-[16px] font-bold text-[var(--text-primary,#1A1A2E)] font-mono tracking-wide">
              기관 선매집 탐지
            </h2>
            <p className="text-[11px] text-[var(--text-dim,#9CA3AF)] font-mono mt-0.5">
              기관과 외국인이 조용히 매수하고 있지만, 주가는 아직 움직이지 않은 &quot;장전된 스프링&quot; 종목
            </p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono">잠복</div>
              <div className="text-[15px] font-mono font-bold text-[#7C3AED]">{summary.stealth_count}</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono">움직임</div>
              <div className="text-[15px] font-mono font-bold text-[#2563EB]">{summary.moving_count}</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono">전체 탐지</div>
              <div className="text-[15px] font-mono font-bold text-[var(--text-primary)]">{summary.total_detected}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 서브 탭: 잠복 / 움직임 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <nav className="flex gap-1 bg-[#F5F4F0] rounded-lg p-1 border border-[#E8E6E0]">
          <button
            onClick={() => setSubTab('stealth')}
            className={`py-2 px-4 rounded-md text-[13px] font-bold transition-colors ${
              subTab === 'stealth'
                ? 'bg-[#7C3AED] text-white'
                : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white'
            }`}
          >
            잠복 ({summary.stealth_count})
          </button>
          <button
            onClick={() => setSubTab('moving')}
            className={`py-2 px-4 rounded-md text-[13px] font-bold transition-colors ${
              subTab === 'moving'
                ? 'bg-[#2563EB] text-white'
                : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white'
            }`}
          >
            움직임 ({summary.moving_count})
          </button>
        </nav>
        <span className="text-[11px] text-[var(--text-dim,#9CA3AF)] font-mono">
          마지막 스캔: {timestamp}
        </span>
      </div>

      {/* 카드 리스트 */}
      {stocks.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] text-sm font-mono py-8">
          {subTab === 'stealth' ? '잠복 종목 없음' : '움직임 종목 없음'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stocks.map((stock) => (
            <StealthCard key={stock.code} stock={stock} />
          ))}
        </div>
      )}

      {/* 쌍매수 범례 */}
      <div className="flex items-center gap-4 flex-wrap text-[10px] font-mono text-[var(--text-dim,#9CA3AF)] pt-2 border-t border-[var(--border,#E8E6E0)]">
        <span>&#9889; 금테 = 쌍매수(기관+외인 동시)</span>
        <span className="text-[#DC2626]">I = 기관 순매수</span>
        <span className="text-[#2563EB]">F = 외인 순매수</span>
        <span>점수순 정렬 (100+최강 / 70+강함 / 50+보통)</span>
      </div>
    </div>
  )
}
