"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface WhyNow {
  technical: string[]
  macro: { reasoning: string; catalysts: string[]; confidence: string } | null
  entry: string | null
  safety: string | null
  warnings: string[]
  bonus_tags: { label: string; tag: string; bonus: number }[]
}

interface SignalItem {
  date: string
  signal_type: string
  grade: string
  score: number
  entry_price: number
  target_price: number
  stop_loss: number
  reasons: string[]
}

interface Technicals {
  ticker: string
  name: string
  date: string
  price: number
  volume: number
  ma5: number
  ma20: number
  ma60: number
  ma120: number
  rsi: number
  macd: number
  macd_signal: number
  macd_histogram: number
  adx: number
  bb_upper: number
  bb_lower: number
  bb_pct: number
  stoch_k: number
  stoch_d: number
  atr: number
  obv: number
  volume_ratio: number
  trix: number
  trix_signal: number
  tech_signal: string
  tech_score: number
}

interface Valuations {
  ticker: string
  name: string
  date: string
  price: number
  market_cap: number
  fair_value_1yr: number
  fair_value_2yr: number
  fair_value_3yr: number
  safety_margin: number
  per_value: number
  dcf_value: number
  rim_value: number
  peg_value: number
  ev_ebitda_value: number
  roe: number
  debt_to_equity: number
  per_5yr_avg: number
  eps_ttm: number
  revenue_growth: number
  earnings_stability: number
  latest_q_revenue: number
  latest_q_op_income: number
  latest_q_net_income: number
  op_margin: number
  revenue_yoy: number
  op_income_yoy: number
  valuation_signal: string
  valuation_score: number
}

interface MlPrediction {
  date: string
  pred_type: string
  code: string
  name: string
  prob_up: number
  prob_down: number
  decision: string
  top_factors: { factor: string; importance: number }[]
  base_price: number
  actual_result: string
  success: boolean | null
}

interface StockMaster {
  ticker: string
  name: string
  sector: string
  market: string
  market_cap: number
}

interface StockData {
  ticker: string
  master: StockMaster | null
  pick: {
    name: string
    grade: string
    total_score: number
    close: number
    rsi: number
    stoch_k: number
    foreign_5d: number
    inst_5d: number
    reasons: string[]
    entry_info?: { entry: number; stop: number; target: number }
    why_now?: WhyNow
  } | null
  jarvis_date: string | null
  why_now: WhyNow | null
  technicals: Technicals | null
  valuations: Valuations | null
  ml_prediction: MlPrediction | null
  signals: SignalItem[]
  briefing_mentions: { date: string; market_status: string }[]
}

const signColor = (v: number) =>
  v > 0 ? "text-[var(--green)]" : v < 0 ? "text-[var(--red)]" : "text-[var(--text-muted)]"

const gradeColor = (g: string) => {
  if (g.startsWith("S")) return "text-[var(--yellow)]"
  if (g.startsWith("A")) return "text-[var(--green)]"
  if (g.startsWith("B")) return "text-[var(--blue)]"
  if (g.startsWith("C")) return "text-yellow-400"
  return "text-[var(--text-muted)]"
}

const signalTypeColor = (t: string) => {
  switch (t) {
    case "BUY": return "bg-[var(--green)]/20 text-[var(--green)] border-[var(--green)]/30"
    case "FORCE_BUY": return "bg-[var(--green)]/20 text-[var(--green)] border-[var(--green)]/30"
    case "QUANT_SELL": return "bg-[var(--red)]/20 text-[var(--red)] border-[var(--red)]/30"
    case "WATCH": return "bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
    default: return "bg-gray-100 text-[var(--text-dim)] border-[var(--border)]"
  }
}

const fmtPrice = (v: number) => v?.toLocaleString() ?? "-"

export function StockDetailView({ ticker }: { ticker: string }) {
  const [data, setData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch(`/api/stock?ticker=${ticker}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((j) => {
        if (j.ml_prediction?.top_factors && typeof j.ml_prediction.top_factors === 'string') {
          try { j.ml_prediction.top_factors = JSON.parse(j.ml_prediction.top_factors) } catch { j.ml_prediction.top_factors = [] }
        }
        setData(j)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [ticker])

  if (loading) return <div className="text-[var(--text-muted)] text-center py-20">로딩 중...</div>
  if (!data) return <div className="text-[var(--text-muted)] text-center py-20">데이터 없음</div>

  const { master, pick, why_now, technicals, valuations, ml_prediction, signals, briefing_mentions } = data
  const stockName = pick?.name ?? master?.name ?? technicals?.name ?? valuations?.name ?? ticker

  return (
    <div className="space-y-6">
      {/* 종목 헤더 */}
      <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{stockName}</h2>
            <span className="text-sm font-mono text-[var(--text-muted)]">{ticker}</span>
            {master?.market && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-row)] text-[var(--text-dim)]">{master.market}</span>
            )}
            {master?.sector && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-row)] text-[var(--text-muted)]">{master.sector}</span>
            )}
            {pick?.grade && (
              <span className={`text-lg font-bold ${gradeColor(pick.grade)}`}>{pick.grade}</span>
            )}
          </div>
          <Link href={`/chart/${ticker}`} className="text-xs text-[var(--blue)] hover:underline">
            차트 보기 →
          </Link>
        </div>

        {pick && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">총점</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{pick.total_score.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">현재가</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{fmtPrice(pick.close)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">RSI</span>
              <span className={`text-lg font-bold ${pick.rsi > 70 ? "text-[var(--red)]" : pick.rsi < 30 ? "text-[var(--green)]" : "text-[var(--text-primary)]"}`}>{pick.rsi?.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">외인 5일</span>
              <span className={`text-lg font-bold ${signColor(pick.foreign_5d)}`}>{pick.foreign_5d > 0 ? "+" : ""}{pick.foreign_5d?.toFixed(0)}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">기관 5일</span>
              <span className={`text-lg font-bold ${signColor(pick.inst_5d)}`}>{pick.inst_5d > 0 ? "+" : ""}{pick.inst_5d?.toFixed(0)}</span>
            </div>
          </div>
        )}

        {pick?.entry_info && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-[var(--bg-row)] rounded-lg p-3 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block">진입가</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{fmtPrice(pick.entry_info.entry)}</span>
            </div>
            <div className="bg-[var(--bg-row)] rounded-lg p-3 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block">손절가</span>
              <span className="text-sm font-bold text-[var(--red)]">{fmtPrice(pick.entry_info.stop)}</span>
            </div>
            <div className="bg-[var(--bg-row)] rounded-lg p-3 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block">목표가</span>
              <span className="text-sm font-bold text-[var(--green)]">{fmtPrice(pick.entry_info.target)}</span>
            </div>
          </div>
        )}

        {pick?.reasons && pick.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {pick.reasons.map((r, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-row)] text-[var(--text-dim)]">{r}</span>
            ))}
          </div>
        )}
      </div>

      {/* 왜 지금 이 종목인가 */}
      {why_now && (
        <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">왜 지금 이 종목인가?</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 기술적 분석 */}
            {why_now.technical?.length > 0 && (
              <div className="bg-[var(--bg-row)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--blue)]/20 text-[var(--blue)] border border-[var(--blue)]/30">기술적</span>
                </div>
                <ul className="space-y-1">
                  {why_now.technical.map((t, i) => (
                    <li key={i} className="text-xs text-[var(--text-primary)] flex gap-1.5">
                      <span className="text-[var(--blue)] shrink-0">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 매크로 연동 */}
            {why_now.macro && (
              <div className="bg-[var(--bg-row)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--yellow)]/20 text-[var(--yellow)] border border-[var(--yellow)]/30">매크로</span>
                  <span className="text-[10px] text-[var(--text-muted)]">신뢰도: {why_now.macro.confidence}</span>
                </div>
                <p className="text-xs text-[var(--text-primary)] mb-2">{why_now.macro.reasoning}</p>
                {why_now.macro.catalysts?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {why_now.macro.catalysts.map((c, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--yellow)]/10 text-[var(--yellow)]">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 진입 조건 */}
            {why_now.entry && (
              <div className="bg-[var(--bg-row)] rounded-xl p-4">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--green)]/20 text-[var(--green)] border border-[var(--green)]/30">진입 조건</span>
                <p className="text-xs text-[var(--text-primary)] mt-2">{why_now.entry}</p>
              </div>
            )}

            {/* 안전성 */}
            {why_now.safety && (
              <div className="bg-[var(--bg-row)] rounded-xl p-4">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--purple)]/20 text-[var(--purple)] border border-[var(--purple)]/30">안전성</span>
                <p className="text-xs text-[var(--text-primary)] mt-2">{why_now.safety}</p>
              </div>
            )}
          </div>

          {/* 경고 */}
          {why_now.warnings?.length > 0 && (
            <div className="mt-4 bg-[var(--red)]/10 border border-[var(--red)]/20 rounded-xl p-3">
              <span className="text-[10px] text-[var(--red)] font-bold block mb-1">경고</span>
              {why_now.warnings.map((w, i) => (
                <p key={i} className="text-xs text-[var(--red)]/80">{w}</p>
              ))}
            </div>
          )}

          {/* 보너스 태그 */}
          {why_now.bonus_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {why_now.bonus_tags.map((b, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-[var(--bg-row)] text-[var(--text-primary)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">{b.label}</span>
                  <span className="ml-1 font-bold text-[var(--green)]">+{b.bonus}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 기술적 지표 */}
      {technicals && (
        <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">기술적 지표</h3>
            <div className="flex items-center gap-2">
              {technicals.tech_signal && (
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  technicals.tech_signal.includes("매수") || technicals.tech_signal.includes("반등")
                    ? "bg-[var(--green)]/20 text-[var(--green)] border-[var(--green)]/30"
                    : technicals.tech_signal.includes("매도") || technicals.tech_signal.includes("하락")
                    ? "bg-[var(--red)]/20 text-[var(--red)] border-[var(--red)]/30"
                    : "bg-gray-100 text-[var(--text-dim)] border-[var(--border)]"
                }`}>
                  {technicals.tech_signal}
                </span>
              )}
              <span className="text-[10px] text-[var(--text-muted)]">{technicals.date}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* RSI */}
            <div className="bg-[var(--bg-row)] rounded-lg p-3">
              <span className="text-[10px] text-[var(--text-muted)] block">RSI (14)</span>
              <span className={`text-lg font-bold font-mono ${
                technicals.rsi >= 70 ? "text-[var(--red)]" : technicals.rsi <= 30 ? "text-[var(--green)]" : "text-[var(--text-primary)]"
              }`}>{technicals.rsi.toFixed(1)}</span>
              <span className="text-[10px] text-[var(--text-muted)] block">
                {technicals.rsi >= 70 ? "과매수" : technicals.rsi <= 30 ? "과매도" : "중립"}
              </span>
            </div>

            {/* MACD */}
            <div className="bg-[var(--bg-row)] rounded-lg p-3">
              <span className="text-[10px] text-[var(--text-muted)] block">MACD</span>
              <span className={`text-lg font-bold font-mono ${signColor(technicals.macd_histogram)}`}>
                {technicals.macd_histogram > 0 ? "+" : ""}{technicals.macd_histogram.toFixed(2)}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] block">
                {technicals.macd_histogram > 0 ? "매수 신호" : "매도 신호"}
              </span>
            </div>

            {/* 볼린저밴드 %B */}
            <div className="bg-[var(--bg-row)] rounded-lg p-3">
              <span className="text-[10px] text-[var(--text-muted)] block">BB %B</span>
              <span className={`text-lg font-bold font-mono ${
                technicals.bb_pct >= 80 ? "text-[var(--red)]" : technicals.bb_pct <= 20 ? "text-[var(--green)]" : "text-[var(--text-primary)]"
              }`}>{technicals.bb_pct.toFixed(1)}%</span>
              <span className="text-[10px] text-[var(--text-muted)] block">
                {technicals.bb_pct >= 80 ? "상단 돌파" : technicals.bb_pct <= 20 ? "하단 이탈" : "밴드 내"}
              </span>
            </div>

            {/* ADX */}
            <div className="bg-[var(--bg-row)] rounded-lg p-3">
              <span className="text-[10px] text-[var(--text-muted)] block">ADX (추세강도)</span>
              <span className={`text-lg font-bold font-mono ${
                technicals.adx >= 25 ? "text-[var(--yellow)]" : "text-[var(--text-dim)]"
              }`}>{technicals.adx.toFixed(1)}</span>
              <span className="text-[10px] text-[var(--text-muted)] block">
                {technicals.adx >= 40 ? "강한 추세" : technicals.adx >= 25 ? "추세 진행" : "비추세"}
              </span>
            </div>
          </div>

          {/* 2단 상세 */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">Stoch K</span>
              <span className={`text-xs font-mono ${signColor(technicals.stoch_k - 50)}`}>{technicals.stoch_k.toFixed(1)}</span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">Stoch D</span>
              <span className={`text-xs font-mono ${signColor(technicals.stoch_d - 50)}`}>{technicals.stoch_d.toFixed(1)}</span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">ATR</span>
              <span className="text-xs font-mono text-[var(--text-primary)]">{technicals.atr.toFixed(0)}</span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">거래비</span>
              <span className={`text-xs font-mono ${technicals.volume_ratio > 1.5 ? "text-yellow-400" : "text-[var(--text-dim)]"}`}>
                x{technicals.volume_ratio.toFixed(1)}
              </span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">TRIX</span>
              <span className={`text-xs font-mono ${signColor(technicals.trix)}`}>{technicals.trix.toFixed(3)}</span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">종합점수</span>
              <span className={`text-xs font-mono font-bold ${signColor(technicals.tech_score)}`}>{technicals.tech_score.toFixed(1)}</span>
            </div>
          </div>

          {/* 이동평균선 */}
          <div className="flex gap-3 mt-3 text-[10px]">
            <span className="text-[var(--text-muted)]">이평선</span>
            <span className={technicals.price > technicals.ma5 ? "text-[var(--green)]" : "text-[var(--red)]"}>
              5일 {technicals.ma5.toLocaleString()}
            </span>
            <span className={technicals.price > technicals.ma20 ? "text-[var(--green)]" : "text-[var(--red)]"}>
              20일 {technicals.ma20.toLocaleString()}
            </span>
            <span className={technicals.price > technicals.ma60 ? "text-[var(--green)]" : "text-[var(--red)]"}>
              60일 {technicals.ma60.toLocaleString()}
            </span>
            <span className={technicals.price > technicals.ma120 ? "text-[var(--green)]" : "text-[var(--red)]"}>
              120일 {technicals.ma120.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 밸류에이션 */}
      {valuations && (
        <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">밸류에이션</h3>
            <div className="flex items-center gap-2">
              {valuations.valuation_signal && (
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  valuations.valuation_signal.includes("저평가") || valuations.valuation_signal.includes("우량")
                    ? "bg-[var(--green)]/20 text-[var(--green)] border-[var(--green)]/30"
                    : valuations.valuation_signal.includes("고평가") || valuations.valuation_signal.includes("위험")
                    ? "bg-[var(--red)]/20 text-[var(--red)] border-[var(--red)]/30"
                    : "bg-gray-100 text-[var(--text-dim)] border-[var(--border)]"
                }`}>
                  {valuations.valuation_signal}
                </span>
              )}
              <span className="text-[10px] text-[var(--text-muted)]">{valuations.date}</span>
            </div>
          </div>

          {/* 적정가 vs 현재가 */}
          <div className="bg-[var(--bg-row)] rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block">현재가</span>
                <span className="text-lg font-bold text-[var(--text-primary)]">{valuations.price.toLocaleString()}원</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-[var(--text-muted)] block">적정가 (1yr)</span>
                <span className="text-lg font-bold text-[var(--blue)]">{Math.round(valuations.fair_value_1yr).toLocaleString()}원</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] block">안전마진</span>
                <span className={`text-lg font-bold ${valuations.safety_margin > 0 ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                  {valuations.safety_margin > 0 ? "+" : ""}{valuations.safety_margin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* 5개 모델 */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[
              { label: "PER", val: valuations.per_value },
              { label: "DCF", val: valuations.dcf_value },
              { label: "RIM", val: valuations.rim_value },
              { label: "PEG", val: valuations.peg_value },
              { label: "EV/EBITDA", val: valuations.ev_ebitda_value },
            ].map((m) => (
              <div key={m.label} className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
                <span className="text-[10px] text-[var(--text-muted)] block">{m.label}</span>
                <span className={`text-xs font-mono ${m.val > valuations.price ? "text-[var(--green)]" : m.val > 0 ? "text-[var(--red)]" : "text-[var(--text-muted)]"}`}>
                  {m.val > 0 ? Math.round(m.val).toLocaleString() : "-"}
                </span>
              </div>
            ))}
          </div>

          {/* 펀더멘탈 */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">ROE</span>
              <span className={`text-xs font-mono font-bold ${valuations.roe >= 10 ? "text-[var(--green)]" : "text-[var(--text-dim)]"}`}>
                {valuations.roe.toFixed(1)}%
              </span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">D/E</span>
              <span className={`text-xs font-mono ${valuations.debt_to_equity > 100 ? "text-[var(--red)]" : "text-[var(--text-primary)]"}`}>
                {valuations.debt_to_equity.toFixed(0)}%
              </span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">영업이익률</span>
              <span className={`text-xs font-mono ${signColor(valuations.op_margin)}`}>{valuations.op_margin.toFixed(1)}%</span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">매출 YoY</span>
              <span className={`text-xs font-mono ${signColor(valuations.revenue_yoy)}`}>
                {valuations.revenue_yoy > 0 ? "+" : ""}{valuations.revenue_yoy.toFixed(1)}%
              </span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">매출성장</span>
              <span className={`text-xs font-mono ${signColor(valuations.revenue_growth)}`}>
                {valuations.revenue_growth > 0 ? "+" : ""}{valuations.revenue_growth.toFixed(1)}%
              </span>
            </div>
            <div className="text-center p-2 bg-[var(--bg-row)]/80 rounded">
              <span className="text-[10px] text-[var(--text-muted)] block">종합점수</span>
              <span className={`text-xs font-mono font-bold ${signColor(valuations.valuation_score)}`}>
                {valuations.valuation_score.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ML 예측 */}
      {ml_prediction && (
        <div className="bg-[var(--bg-panel)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">AI 예측 (XGBoost)</h3>
            <span className="text-[10px] text-[var(--text-muted)]">{ml_prediction.date}</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* 판정 */}
            <div className="bg-[var(--bg-row)] rounded-xl p-4 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block mb-1">판정</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${
                ml_prediction.decision.includes("매수") || ml_prediction.decision.includes("레버리지") || ml_prediction.decision.includes("상승")
                  ? "bg-[var(--green)]/20 text-[var(--green)] border-[var(--green)]/30"
                  : ml_prediction.decision.includes("인버스") || ml_prediction.decision.includes("하락")
                  ? "bg-[var(--red)]/20 text-[var(--red)] border-[var(--red)]/30"
                  : "bg-gray-100 text-[var(--text-dim)] border-[var(--border)]"
              }`}>
                {ml_prediction.decision}
              </span>
            </div>

            {/* 상승 확률 */}
            <div className="bg-[var(--bg-row)] rounded-xl p-4 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block mb-1">상승 확률</span>
              <span className={`text-2xl font-bold font-mono ${
                ml_prediction.prob_up >= 0.6 ? "text-[var(--green)]" : ml_prediction.prob_up <= 0.4 ? "text-[var(--red)]" : "text-[var(--text-primary)]"
              }`}>
                {(ml_prediction.prob_up * 100).toFixed(1)}%
              </span>
            </div>

            {/* 기준가 */}
            <div className="bg-[var(--bg-row)] rounded-xl p-4 text-center">
              <span className="text-[10px] text-[var(--text-muted)] block mb-1">기준가</span>
              <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                {ml_prediction.base_price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 주요 팩터 */}
          {ml_prediction.top_factors?.length > 0 && (
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block mb-2">주요 예측 팩터</span>
              <div className="flex flex-wrap gap-1.5">
                {ml_prediction.top_factors.slice(0, 8).map((f, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-row)] text-[var(--text-dim)] border border-[var(--border)]">
                    {f.factor}
                    <span className="ml-1 text-[var(--blue)] font-mono">{(f.importance * 100).toFixed(0)}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 적중 결과 (있을 경우) */}
          {ml_prediction.actual_result && (
            <div className="mt-3 text-[10px] text-[var(--text-muted)]">
              실제 결과: <span className={ml_prediction.success ? "text-[var(--green)]" : "text-[var(--red)]"}>
                {ml_prediction.actual_result} {ml_prediction.success ? "(적중)" : "(미적중)"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 시그널 이력 */}
      {signals.length > 0 && (
        <div className="bg-[var(--bg-panel)] rounded-xl overflow-hidden border border-[var(--border)]">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <span className="text-sm font-bold text-[var(--text-primary)]">시그널 이력</span>
            <span className="text-xs text-[var(--text-muted)] ml-2">최근 {signals.length}건</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                  <th className="text-left py-2.5 px-4">날짜</th>
                  <th className="text-center px-3">타입</th>
                  <th className="text-center px-3">등급</th>
                  <th className="text-right px-3">점수</th>
                  <th className="text-right px-3">진입가</th>
                  <th className="text-right px-3">목표가</th>
                  <th className="text-right px-3">손절가</th>
                  <th className="text-left px-3">근거</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s, i) => (
                  <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-row)]/80">
                    <td className="py-2 px-4 text-[var(--text-dim)]">{s.date}</td>
                    <td className="text-center px-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${signalTypeColor(s.signal_type)}`}>{s.signal_type}</span>
                    </td>
                    <td className={`text-center px-3 font-bold ${gradeColor(s.grade)}`}>{s.grade}</td>
                    <td className="text-right px-3 font-mono text-[var(--text-primary)]">{s.score}</td>
                    <td className="text-right px-3 text-[var(--text-primary)]">{fmtPrice(s.entry_price)}</td>
                    <td className="text-right px-3 text-[var(--green)]">{fmtPrice(s.target_price)}</td>
                    <td className="text-right px-3 text-[var(--red)]">{fmtPrice(s.stop_loss)}</td>
                    <td className="px-3 text-[var(--text-muted)] max-w-[200px] truncate">{(s.reasons ?? []).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 브리핑 언급 */}
      {briefing_mentions.length > 0 && (
        <div className="bg-[var(--bg-panel)] rounded-xl p-5 border border-[var(--border)]">
          <span className="text-sm font-bold text-[var(--text-primary)]">모닝 브리핑 언급</span>
          <div className="flex gap-2 mt-2">
            {briefing_mentions.map((b, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded bg-[var(--bg-row)] text-[var(--text-dim)]">
                {b.date} · {b.market_status}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* pick이 없는 경우 */}
      {!pick && signals.length === 0 && (
        <div className="bg-[var(--bg-panel)] rounded-xl p-8 border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)]">이 종목에 대한 퀀트 분석 데이터가 없습니다.</p>
          <Link href={`/chart/${ticker}`} className="text-sm text-[var(--blue)] hover:underline mt-2 inline-block">
            차트에서 확인하기 →
          </Link>
        </div>
      )}
    </div>
  )
}
