'use client'

import { useEffect, useState } from 'react'

// ── 타입 ────────────────────────────────────────────────────
interface DrilldownStock {
  etf: string
  etf_name: string
  etf_change: number
  ticker: string
  name: string
  close: number | null
  chg_1d: number | null
  chg_5d: number | null
  vol_ratio: number | null
  score: number
  rank_in_etf: number
}

interface SwingSignal {
  ticker: string
  name: string
  sector: string
  score: number
  grade: string
  close: number | null
  chg_1d: number | null
  chg_5d: number | null
  vol_ratio: number | null
  rsi: number | null
  reasons: string[]
}

interface DaytradingData {
  mode: string
  gap_signal: string
  gap_est_pct: number
  risk_level: number
  risk_score: number
  watch_sectors: string[]
  avoid_sectors: string[]
  reasons_good: string[]
  reasons_bad: string[]
  risk_flags: string[]
}

// ── 상수 ────────────────────────────────────────────────────
const ETF_EMOJI: Record<string, string> = {
  SOXX: '', XLK: '', XLF: '', XLC: '',
  XLV: '', XLI: '', XLE: '⛽', XLY: '', QQQ: '',
}
const MODE_COLOR: Record<string, string> = {
  AGGRESSIVE: '#00843D', NORMAL: '#1565C0', DEFENSIVE: '#B07D00', HALT: '#D62728',
  BULL_AGGRESSIVE: '#00843D', BULL_NORMAL: '#1565C0', BEAR_DEFENSIVE: '#B07D00', BEAR_CASH: '#D62728',
}
const MODE_DESC: Record<string, string> = {
  AGGRESSIVE: '조건 완화 — 적극 진입. 수급 A+ 빠르게 선점.',
  NORMAL: '기본 필터 — 수급 확인 후 진입. 비중 50% 이내.',
  DEFENSIVE: '조건 강화 — A+만, 손절 타이트, 슬롯 축소.',
  HALT: '진입 금지 — 극단 위험. 현금 보유 권장.',
  BULL_AGGRESSIVE: '조건 완화 — 적극 진입. 수급 A+ 빠르게 선점.',
  BULL_NORMAL: '강세 기조 — 기본 운영. 안정적 매매.',
  BEAR_DEFENSIVE: '약세 방어 — A+만, 손절 타이트, 슬롯 축소.',
  BEAR_CASH: '진입 금지 — 극단 위험. 현금 보유 권장.',
}

// ── 헬퍼 ────────────────────────────────────────────────────
const chgColor = (v: number | null) =>
  v == null ? '#888': v >= 0 ? '#D62728': '#1565C0'
const chgStr = (v: number | null, d = 2) =>
  v == null ? '—': `${v >= 0 ? '+': ''}${v.toFixed(d)}%`

function Sk({ h = 'h-4'}: { h?: string }) {
  return <div className={`animate-pulse rounded bg-[#E2E5EA] ${h} w-full`} />
}

// ── 진입 모드 카드 ──────────────────────────────────────────
function ModeCard({ dt }: { dt: DaytradingData }) {
  const color = MODE_COLOR[dt.mode] ?? '#888'
  return (
    <div className="fx-card px-4 py-4">
      <div className="text-[17px] font-bold text-[#1A1A2E] mb-3">스윙시스템 오늘의 진입 모드</div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div style={{ color }} className="text-[32px] font-bold font-mono">{dt.mode}</div>
          <div className="text-[13px] text-[#888] mt-1 max-w-xs">{MODE_DESC[dt.mode] ?? ''}</div>
        </div>
        <div className="text-right">
          <div className="text-[12px] text-[#888] font-bold mb-1">위험점수</div>
          <div className="text-[30px] font-bold font-mono text-[#1A1A2E]">
            {dt.risk_score}<span className="text-[14px] text-[#aaa]">/100</span>
          </div>
          <div className="flex gap-1 justify-end mt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-2.5 h-2.5 rounded-full"
                   style={{ background: i <= dt.risk_level ? color : '#E2E5EA'}} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#F0FFF4] rounded-lg p-3">
          <div className="text-[12px] font-bold text-[#1A1A2E] mb-2">✅ 좋은 신호</div>
          {dt.reasons_good?.slice(0, 2).map((r, i) => (
            <div key={i} className="text-[12px] text-[#555] mb-1">• {r}</div>
          ))}
        </div>
        <div className="bg-[#FFF8F8] rounded-lg p-3">
          <div className="text-[12px] font-bold text-[#1A1A2E] mb-2">⚠ 주의 신호</div>
          {dt.reasons_bad?.slice(0, 2).map((r, i) => (
            <div key={i} className="text-[12px] text-[#555] mb-1">• {r}</div>
          ))}
        </div>
      </div>

      {dt.risk_flags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {dt.risk_flags.map((f, i) => (
            <span key={i} className="text-[12px] font-bold bg-[#FFEEEE] text-[#C0392B] px-2 py-0.5 rounded-full">{f}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ETF 드릴다운 블록 ───────────────────────────────────────
function EtfDrillBlock({ etf, stocks }: { etf: string; stocks: DrilldownStock[] }) {
  const first = stocks[0]
  if (!first) return null
  const up = first.etf_change >= 0
  const emoji = ETF_EMOJI[etf] ?? ''

  return (
    <div className="fx-card px-0 py-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3"
           style={{ background: up ? '#FFF5F5': '#F0F4FF', borderBottom: '1px solid #F0EEE8'}}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <div className="text-[16px] font-bold text-[#1A1A2E]">{etf} · {first.etf_name}</div>
            <div className="text-[12px] text-[#888]">ETF 강세 → 구성 종목 자동 분석</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[26px] font-bold font-mono" style={{ color: chgColor(first.etf_change) }}>
            {chgStr(first.etf_change)}
          </div>
          <div className="text-[11px] text-[#888]">ETF 오늘 등락</div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[#F8F7F3] text-[11px] font-bold text-[#888] tracking-wider uppercase border-b border-[#E2E5EA]">
          <div className="w-5 text-center">#</div>
          <div className="flex-1">종목</div>
          <div className="w-20 text-right">가격 / 1일</div>
          <div className="w-16 text-right">5일</div>
          <div className="w-16 text-right">거래량</div>
          <div className="w-16 text-right">점수</div>
        </div>

        {stocks.slice(0, 8).map((s, i) => (
          <div key={s.ticker}
               className="flex items-center gap-3 px-4 py-2.5 border-b border-[#F0EEE8] last:border-0 hover:bg-[#FAFAF8] transition-colors">
            <div className="w-5 text-center text-[13px] font-bold text-[#aaa]">{i + 1}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-[#1A1A2E]">{s.name || s.ticker}</span>
                <span className="text-[12px] text-[#888]">{s.name ? s.ticker : ''}</span>
              </div>
            </div>
            <div className="w-20 text-right">
              <div className="text-[14px] font-bold text-[#1A1A2E]">
                ${s.close != null ? s.close.toFixed(2) : '—'}
              </div>
              <div className="text-[13px] font-bold" style={{ color: chgColor(s.chg_1d) }}>
                {chgStr(s.chg_1d)}
              </div>
            </div>
            <div className="w-16 text-right text-[13px] font-bold" style={{ color: chgColor(s.chg_5d) }}>
              {chgStr(s.chg_5d, 1)}
            </div>
            <div className="w-16 text-right text-[13px] font-bold"
                 style={{ color: s.vol_ratio != null && s.vol_ratio >= 2 ? '#D62728': '#888'}}>
              {s.vol_ratio != null ? `${s.vol_ratio.toFixed(1)}x` : '—'}
            </div>
            <div className="w-16">
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-[#F0EEE8] rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                       style={{ width: `${s.score}%`, background: s.score >= 70 ? '#D62728': s.score >= 55 ? '#B07D00': '#888'}} />
                </div>
                <span className="text-[12px] font-bold text-[#1A1A2E]">{s.score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── A+/A 스윙 종목 ──────────────────────────────────────────
function SwingPicksPanel({ stocks }: { stocks: SwingSignal[] }) {
  const aPlus = stocks.filter(s => s.grade === 'A+')
  const a = stocks.filter(s => s.grade === 'A')

  return (
    <div className="fx-card px-4 py-4">
      <div className="text-[20px] font-bold text-[#1A1A2E] mb-1">⚡ 오늘의 스윙 후보</div>
      <div className="text-[13px] text-[#888] mb-4">S&P 500 전종목 스캔 — 단기 진입 우선순위</div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[13px] font-bold bg-[#FFEBEB] text-[#C0392B] px-2 py-0.5 rounded">A+</div>
            <span className="text-[13px] font-bold text-[#1A1A2E]">최우선 — 지금 바로</span>
            <span className="text-[12px] text-[#888]">{aPlus.length}개</span>
          </div>
          {aPlus.slice(0, 5).map(s => (
            <div key={s.ticker} className="flex items-center gap-3 py-2 border-b border-[#F0EEE8] last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#1A1A2E]">{s.name || s.ticker}</span>
                  <span className="text-[12px] text-[#888]">{s.name ? s.ticker : ''}</span>
                  <span className="text-[11px] bg-[#F1F0EA] text-[#555] px-1.5 py-0.5 rounded font-bold">{s.sector}</span>
                </div>
                <div className="flex gap-2 mt-0.5">
                  {s.reasons?.slice(0, 2).map((r, i) => (
                    <span key={i} className="text-[11px] text-[#888]">• {r}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[14px] font-bold" style={{ color: chgColor(s.chg_1d) }}>{chgStr(s.chg_1d)}</div>
                <div className="text-[12px] text-[#888]">거래량 {s.vol_ratio?.toFixed(1) ?? '—'}x</div>
              </div>
              <div className="text-[15px] font-bold text-[#1A1A2E] w-8 text-right">{s.score}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[13px] font-bold bg-[#FFF0E6] text-[#B05000] px-2 py-0.5 rounded">A</div>
            <span className="text-[13px] font-bold text-[#1A1A2E]">관심 — 수급 확인 후</span>
            <span className="text-[12px] text-[#888]">{a.length}개</span>
          </div>
          {a.slice(0, 5).map(s => (
            <div key={s.ticker} className="flex items-center gap-3 py-2 border-b border-[#F0EEE8] last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#1A1A2E]">{s.name || s.ticker}</span>
                  <span className="text-[12px] text-[#888]">{s.name ? s.ticker : ''}</span>
                  <span className="text-[11px] bg-[#F1F0EA] text-[#555] px-1.5 py-0.5 rounded font-bold">{s.sector}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[14px] font-bold" style={{ color: chgColor(s.chg_1d) }}>{chgStr(s.chg_1d)}</div>
              </div>
              <div className="text-[15px] font-bold text-[#888] w-8 text-right">{s.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
export function UsSwingSystemView() {
  const [dt, setDt] = useState<DaytradingData | null>(null)
  const [drilldown, setDrilldown] = useState<Record<string, DrilldownStock[]>>({})
  const [swingPicks, setSwingPicks] = useState<SwingSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const [dtRes, ddRes, spRes] = await Promise.allSettled([
          fetch('/api/us-market/daytrading-overnight', { signal: controller.signal }),
          fetch('/api/us-market/sector-drilldown', { signal: controller.signal }),
          fetch('/api/us-market/stock-signals?limit=100', { signal: controller.signal }),
        ])

        if (dtRes.status === 'fulfilled'&& dtRes.value.ok) {
          const json = await dtRes.value.json()
          if (json.mode) setDt(json)
        }
        if (ddRes.status === 'fulfilled'&& ddRes.value.ok) {
          const json = await ddRes.value.json()
          const grouped: Record<string, DrilldownStock[]> = {}
          for (const row of (json.stocks ?? [])) {
            if (!grouped[row.etf]) grouped[row.etf] = []
            grouped[row.etf].push(row)
          }
          setDrilldown(grouped)
        }
        if (spRes.status === 'fulfilled'&& spRes.value.ok) {
          const json = await spRes.value.json()
          setSwingPicks(json.stocks ?? [])
        }
      } catch { /* abort */ }
      finally { setLoading(false) }
    })()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <Sk key={i} h="h-32" />)}
      </div>
    )
  }

  const etfOrder = Object.entries(drilldown)
    .sort((a, b) => (b[1][0]?.etf_change ?? 0) - (a[1][0]?.etf_change ?? 0))
    .map(([etf]) => etf)

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-[14px]">
      <div className="flex items-center gap-2">
        <div className="text-[22px] font-bold text-[#1A1A2E]"> 미국 스윙시스템</div>
        <div className="text-[13px] text-[#888] bg-[#F1F0EA] px-2 py-1 rounded font-bold">단기 1~3일</div>
      </div>

      {dt && <ModeCard dt={dt} />}

      {etfOrder.length > 0 && (
        <div>
          <div className="text-[18px] font-bold text-[#1A1A2E] mb-3">강세 ETF 구성 종목 드릴다운</div>
          <div className="text-[13px] text-[#888] mb-4">오늘 강하게 오른 ETF → 구성 종목 중 가장 강한 것을 자동 추출</div>
          <div className="space-y-4">
            {etfOrder.slice(0, 4).map(etf => (
              <EtfDrillBlock key={etf} etf={etf} stocks={drilldown[etf] ?? []} />
            ))}
          </div>
        </div>
      )}

      {swingPicks.length > 0 && <SwingPicksPanel stocks={swingPicks} />}

      {!dt && etfOrder.length === 0 && swingPicks.length === 0 && (
        <div className="text-center py-10">
          <div className="text-[#888] text-sm">스윙시스템 데이터 없음</div>
          <div className="text-[#aaa] text-xs mt-1">봇 실행 후 자동 표시됩니다</div>
        </div>
      )}
    </div>
  )
}
