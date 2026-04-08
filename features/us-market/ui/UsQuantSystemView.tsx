'use client'

import { useEffect, useState } from 'react'

// ── 타입 ────────────────────────────────────────────────────
interface QuantData {
  date: string
  strategy_mode: string
  macro_score: number
  position_limit: number
  hold_days_min: number
  hold_days_max: number
  sector_overweight: string[]
  sector_underweight: string[]
  etf_momentum: Record<string, number>
  soxx_5d: number | null
  yield_signal: string
  yield_level: number | null
  yield_trend: string
  yield_inverted: boolean
  dollar_signal: string
  dxy: number | null
  vix_env: string
  vix: number | null
  vix_note: string
  weekly_outlook: string
  entry_conditions: {
    min_grade: string
    min_foreign_buy_days: number
    stop_loss_pct: number
    note: string
  }
  /* v1 하위 호환 */
  mode?: string
  score?: number
  slots?: number
  summary?: string
}

interface StockSignal {
  ticker: string
  name: string
  sector: string
  score: number
  grade: string
  close: number | null
  chg_1d: number | null
  chg_5d: number | null
  chg_20d: number | null
  chg_60d: number | null
  vol_ratio: number | null
  rsi: number | null
  reasons: string[]
}

// ── 상수 ────────────────────────────────────────────────────
const STRATEGY_CONFIG: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  BULL_AGGRESSIVE: { label: '공격 매수', color: '#00843D', bg: '#E6F9EE', desc: '매크로 환경 최적. 슬롯 최대, 공격적 진입.'},
  BULL_NORMAL: { label: '기본 운영', color: '#1565C0', bg: '#E8F0FE', desc: '우호적 환경. A등급 이상 기본 필터 적용.'},
  NEUTRAL: { label: '선별 진입', color: '#888', bg: '#F1F0EA', desc: '중립 구간. A+만, 외인+기관 동반 필수.'},
  BEAR_DEFENSIVE: { label: '방어 운영', color: '#B07D00', bg: '#FFF8E6', desc: '불안한 환경. 조건 최강화, 슬롯 축소.'},
  BEAR_CASH: { label: '현금 보유', color: '#D62728', bg: '#FFEEEE', desc: '위험 구간. 신규 진입 사실상 금지.'},
}

const SECTOR_KR_TO_ETF: Record<string, string> = {
  '기술': 'XLK', '반도체': 'SOXX', '통신': 'XLC', '금융': 'XLF',
  '헬스케어': 'XLV', '산업재': 'XLI', '에너지': 'XLE',
  '경기소비재': 'XLY', '필수소비재': 'XLP',
}

const chgColor = (v: number | null) =>
  v == null ? '#888': v >= 0 ? '#D62728': '#1565C0'
const chgStr = (v: number | null, d = 2) =>
  v == null ? '—': `${v >= 0 ? '+': ''}${v.toFixed(d)}%`

function Sk({ h = 'h-4'}: { h?: string }) {
  return <div className={`animate-pulse rounded bg-[#E8E6E0] ${h} w-full`} />
}

// ── 매크로 환경 카드 ────────────────────────────────────────
function MacroCard({ qt }: { qt: QuantData }) {
  const mode = qt.strategy_mode ?? qt.mode ?? 'NEUTRAL'
  const cfg = STRATEGY_CONFIG[mode] ?? STRATEGY_CONFIG['NEUTRAL']
  const pct = qt.macro_score ?? qt.score ?? 0
  const slots = qt.position_limit ?? qt.slots ?? 0

  return (
    <div className="fx-card px-4 py-4">
      <div className="text-[17px] font-bold text-[#1A1A2E] mb-4">퀀트시스템 이번 주 매크로 환경</div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-[12px] text-[#888] font-bold mb-1">전략 모드</div>
          <div className="text-[24px] font-black" style={{ color: cfg.color }}>{cfg.label}</div>
          <div className="text-[12px] text-[#888] mt-1 leading-relaxed">{cfg.desc}</div>
        </div>
        <div>
          <div className="text-[12px] text-[#888] font-bold mb-1">최대 동시 보유</div>
          <div className="text-[30px] font-black text-[#1A1A2E]">{slots}종목</div>
          <div className="text-[13px] text-[#888] mt-1">{qt.hold_days_min ?? '—'}~{qt.hold_days_max ?? '—'}일 보유</div>
        </div>
        {qt.entry_conditions && (
          <div className="bg-[#F8F7F3] rounded-lg p-3">
            <div className="text-[12px] font-black text-[#1A1A2E] mb-2">진입 조건</div>
            <div className="text-[12px] text-[#555] leading-relaxed space-y-1">
              <div>최소 등급: <span className="font-black text-[#1A1A2E]">{qt.entry_conditions.min_grade ?? '—'}</span></div>
              <div>손절: <span className="font-black text-[#D62728]">{qt.entry_conditions.stop_loss_pct ?? '—'}%</span></div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[15px] font-bold text-[#1A1A2E] mb-1.5">
          <span>매크로 환경 점수</span>
          <span className="font-mono">{pct} / 100</span>
        </div>
        <div className="h-3 bg-[#F0EEE8] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
               style={{ width: `${pct}%`, background: pct >= 65 ? '#00843D': pct >= 45 ? '#888': '#B07D00'}} />
        </div>
        <div className="flex justify-between text-[11px] text-[#bbb] mt-1">
          <span>현금보유</span><span>방어</span><span>중립</span><span>기본</span><span>공격</span>
        </div>
      </div>

      {qt.yield_signal && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: '3년물 금리',
              value: qt.yield_level != null ? `${qt.yield_level.toFixed(2)}%` : '—',
              signal: qt.yield_signal,
              color: qt.yield_signal === 'LOW'? '#00843D': qt.yield_signal?.includes('HIGH') ? '#D62728': '#888',
              note: qt.yield_inverted ? '⚠ 장단기 역전 중': `추세: ${qt.yield_trend ?? '—'}`,
            },
            {
              label: 'DXY 달러',
              value: qt.dxy != null ? qt.dxy.toFixed(1) : '—',
              signal: qt.dollar_signal?.replace(/_/g, '') ?? '—',
              color: qt.dollar_signal === 'INFLOW_FAVORABLE'? '#00843D': qt.dollar_signal?.includes('OUTFLOW') ? '#D62728': '#888',
              note: qt.dxy != null && qt.dxy >= 104 ? '⚠ 외인 이탈 경고': '✅ 투자 환경 양호',
            },
            {
              label: 'VIX 공포',
              value: qt.vix != null ? qt.vix.toFixed(1) : '—',
              signal: qt.vix_env ?? '—',
              color: qt.vix_env === 'STABLE'? '#00843D': qt.vix_env === 'FEAR'|| qt.vix_env === 'PANIC'? '#D62728': '#B07D00',
              note: qt.vix_note?.slice(0, 30) ?? '',
            },
          ].map(({ label, value, signal, color, note }) => (
            <div key={label} className="bg-[#F8F7F3] rounded-lg p-3">
              <div className="text-[12px] font-black text-[#1A1A2E] mb-1">{label}</div>
              <div className="text-[24px] font-black font-mono" style={{ color }}>{value}</div>
              <div className="text-[11px] font-bold mt-1" style={{ color }}>{signal}</div>
              <div className="text-[11px] text-[#888] mt-0.5">{note}</div>
            </div>
          ))}
        </div>
      )}

      {(qt.weekly_outlook ?? qt.summary) && (
        <div className="mt-4 bg-[#F0F7FF] rounded-xl p-3 border-l-4" style={{ borderColor: cfg.color }}>
          <div className="text-[13px] font-black text-[#1A1A2E] mb-1">이번 주 전략</div>
          <div className="text-[13px] text-[#444] leading-relaxed">{qt.weekly_outlook ?? qt.summary}</div>
        </div>
      )}
    </div>
  )
}

// ── 섹터 로테이션 ───────────────────────────────────────────
function SectorRotationCard({ qt }: { qt: QuantData }) {
  const etfMomentum = qt.etf_momentum ?? {}
  const sorted = Object.entries(etfMomentum).sort((a, b) => b[1] - a[1])
  const overweight = qt.sector_overweight ?? []
  const underweight = qt.sector_underweight ?? []

  if (sorted.length === 0 && overweight.length === 0 && underweight.length === 0) return null

  return (
    <div className="fx-card px-4 py-4">
      <div className="text-[20px] font-bold text-[#1A1A2E] mb-1">섹터 로테이션 — 5일 모멘텀</div>
      <div className="text-[13px] text-[#888] mb-4">5일 누적 등락률 기준 — 지속적으로 강한 섹터에 자금이 몰리는 구조</div>

      {overweight.length > 0 && (
        <div className="mb-4">
          <div className="text-[15px] font-bold text-[#00843D] mb-2">▲ 이번 주 비중 확대 — 이 섹터 ETF 주목</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {overweight.map(s => {
              const etf = SECTOR_KR_TO_ETF[s]
              const mom = etf ? etfMomentum[etf] : null
              return (
                <div key={s} className="flex items-center gap-1.5 bg-[#F0FFF4] border border-[#AADDBB] rounded-lg px-3 py-2">
                  <span className="text-[15px] font-black text-[#1A1A2E]">{s}</span>
                  {etf && <span className="text-[12px] text-[#888]">({etf})</span>}
                  {mom != null && (
                    <span className="text-[13px] font-black" style={{ color: chgColor(mom) }}>
                      {chgStr(mom, 1)} 5일
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {underweight.length > 0 && (
        <div className="mb-4">
          <div className="text-[15px] font-bold text-[#D62728] mb-2">▼ 이번 주 회피 — 자금 이탈 중</div>
          <div className="flex flex-wrap gap-2">
            {underweight.map(s => (
              <div key={s} className="flex items-center gap-1.5 bg-[#FFEEEE] border border-[#FFBBBB] rounded-lg px-3 py-2">
                <span className="text-[15px] font-black text-[#C0392B]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="pt-3 border-t border-[#F0EEE8]">
          <div className="text-[13px] font-black text-[#1A1A2E] mb-2">섹터 ETF 5일 누적 등락률</div>
          <div className="space-y-1.5">
            {sorted.map(([etf, mom]) => {
              const maxAbs = Math.max(...sorted.map(([, v]) => Math.abs(v)), 5)
              const barPct = Math.min(Math.abs(mom) / maxAbs * 100, 100)
              return (
                <div key={etf} className="flex items-center gap-3">
                  <div className="w-10 text-[12px] font-black text-[#888] text-right">{etf}</div>
                  <div className="flex-1 h-4 bg-[#F0EEE8] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                         style={{ width: `${barPct}%`, background: mom >= 0 ? '#D62728': '#1565C0'}} />
                  </div>
                  <div className="w-14 text-[13px] font-black text-right" style={{ color: chgColor(mom) }}>
                    {chgStr(mom, 1)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 종목 리스트 ─────────────────────────────────────────────
function QuantPicksPanel({ stocks, qt }: { stocks: StockSignal[]; qt: QuantData }) {
  const ow = qt.sector_overweight ?? []
  const quantPicks = stocks
    .filter(s => s.grade === 'A+'|| s.grade === 'A')
    .filter(s => s.chg_20d != null && s.chg_20d > 0)
    .sort((a, b) => {
      const aInOw = ow.includes(a.sector) ? 1 : 0
      const bInOw = ow.includes(b.sector) ? 1 : 0
      if (aInOw !== bInOw) return bInOw - aInOw
      return b.score - a.score
    })

  if (quantPicks.length === 0) return null

  const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'A+': { bg: '#FFEBEB', text: '#C0392B', border: '#FFBBBB'},
    'A': { bg: '#FFF0E6', text: '#B05000', border: '#FFCCAA'},
  }

  return (
    <div className="fx-card px-0 py-0 overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-[#F0EEE8]">
        <div className="text-[20px] font-bold text-[#1A1A2E]">퀀트 스윙 후보 종목</div>
        <div className="text-[13px] text-[#888] mt-1">비중확대 섹터 + A+/A 등급 + 20일 모멘텀 양수 — {quantPicks.length}개</div>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 bg-[#F8F7F3] text-[11px] font-black text-[#888] tracking-wider uppercase border-b border-[#E8E6E0]">
        <div className="w-6">#</div>
        <div className="w-8">등급</div>
        <div className="flex-1">종목</div>
        <div className="w-20 text-right">가격 / 1일</div>
        <div className="w-16 text-right">5일</div>
        <div className="w-16 text-right">20일</div>
        <div className="w-16 text-right">60일</div>
        <div className="w-16 text-right">거래량</div>
        <div className="w-10 text-right">RSI</div>
        <div className="w-8 text-right">점수</div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '480px'}}>
        {quantPicks.slice(0, 30).map((s, i) => {
          const inOw = ow.includes(s.sector)
          const gc = GRADE_COLORS[s.grade]
          return (
            <div key={s.ticker}
                 className="flex items-center gap-3 px-4 py-2.5 border-b border-[#F0EEE8] last:border-0 hover:bg-[#FAFAF8] transition-colors"
                 style={{ background: inOw ? '#FFFFF8': undefined }}>
              <div className="w-6 text-[13px] font-black text-[#aaa]">{i + 1}</div>
              <div className="w-8 flex items-center justify-center text-[13px] font-black rounded"
                   style={{ background: gc?.bg, color: gc?.text, padding: '2px 5px', border: `1px solid ${gc?.border}` }}>
                {s.grade}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-black text-[#1A1A2E]">{s.ticker}</span>
                  <span className="text-[12px] text-[#888]">{s.name}</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: inOw ? '#E6F9EE': '#F1F0EA', color: inOw ? '#00843D': '#555'}}>
                    {inOw ? '▲ ': ''}{s.sector}
                  </span>
                </div>
                <div className="flex gap-2 mt-0.5">
                  {s.reasons?.slice(0, 2).map((r, ri) => (
                    <span key={ri} className="text-[11px] text-[#888]">• {r}</span>
                  ))}
                </div>
              </div>
              <div className="w-20 text-right">
                <div className="text-[14px] font-black text-[#1A1A2E]">
                  ${s.close != null ? s.close.toFixed(2) : '—'}
                </div>
                <div className="text-[13px] font-bold" style={{ color: chgColor(s.chg_1d) }}>
                  {chgStr(s.chg_1d)}
                </div>
              </div>
              <div className="w-16 text-right text-[13px] font-bold" style={{ color: chgColor(s.chg_5d) }}>{chgStr(s.chg_5d, 1)}</div>
              <div className="w-16 text-right text-[13px] font-bold" style={{ color: chgColor(s.chg_20d) }}>{chgStr(s.chg_20d, 1)}</div>
              <div className="w-16 text-right text-[13px] font-bold" style={{ color: chgColor(s.chg_60d) }}>{chgStr(s.chg_60d, 1)}</div>
              <div className="w-16 text-right text-[13px] font-bold"
                   style={{ color: s.vol_ratio != null && s.vol_ratio >= 2 ? '#D62728': '#888'}}>
                {s.vol_ratio != null ? `${s.vol_ratio.toFixed(1)}x` : '—'}
              </div>
              <div className="w-10 text-right text-[13px] font-bold text-[#1A1A2E]">
                {s.rsi != null ? s.rsi.toFixed(0) : '—'}
              </div>
              <div className="w-8 text-right text-[14px] font-black text-[#1A1A2E]">{s.score}</div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-2 border-t border-[#F0EEE8] bg-[#FAFAF8] flex items-center justify-between">
        <div className="text-[12px] text-[#aaa]">▲ 표시 = 비중확대 섹터 · 매일 08:00 자동 업데이트</div>
        <div className="text-[12px] font-bold text-[#888]">{quantPicks.length}개 중 상위 30개 표시</div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
export function UsQuantSystemView() {
  const [qt, setQt] = useState<QuantData | null>(null)
  const [stocks, setStocks] = useState<StockSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const [qtRes, spRes] = await Promise.allSettled([
          fetch('/api/us-market/quant-macro', { signal: controller.signal }),
          fetch('/api/us-market/stock-signals?limit=200', { signal: controller.signal }),
        ])
        if (qtRes.status === 'fulfilled'&& qtRes.value.ok) {
          const json = await qtRes.value.json()
          if (json.date) setQt(json)
        }
        if (spRes.status === 'fulfilled'&& spRes.value.ok) {
          const json = await spRes.value.json()
          setStocks(json.stocks ?? [])
        }
      } catch { /* abort */ }
      finally { setLoading(false) }
    })()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <Sk key={i} h="h-36" />)}
      </div>
    )
  }

  if (!qt) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-10 text-center">
        <div className="text-[#D62728] text-sm font-bold">퀀트시스템 데이터 없음</div>
        <div className="text-[#888] text-xs mt-1">퀀트봇 실행 후 다시 확인하세요</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-[14px]">
      <div className="flex items-center gap-2">
        <div className="text-[22px] font-black text-[#1A1A2E]"> 미국 퀀트시스템</div>
        <div className="text-[13px] text-[#888] bg-[#F1F0EA] px-2 py-1 rounded font-bold">중기 5~10일</div>
      </div>

      <MacroCard qt={qt} />
      <SectorRotationCard qt={qt} />
      <QuantPicksPanel stocks={stocks} qt={qt} />
    </div>
  )
}
