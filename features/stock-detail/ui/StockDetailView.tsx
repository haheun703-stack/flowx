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

interface StockData {
  ticker: string
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
  signals: SignalItem[]
  briefing_mentions: { date: string; market_status: string }[]
}

const signColor = (v: number) =>
  v > 0 ? "text-[#00ff88]" : v < 0 ? "text-[#ff3b5c]" : "text-gray-500"

const gradeColor = (g: string) => {
  if (g.startsWith("S")) return "text-[#f59e0b]"
  if (g.startsWith("A")) return "text-[#00ff88]"
  if (g.startsWith("B")) return "text-[#0ea5e9]"
  if (g.startsWith("C")) return "text-yellow-400"
  return "text-gray-500"
}

const signalTypeColor = (t: string) => {
  switch (t) {
    case "BUY": return "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30"
    case "FORCE_BUY": return "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30"
    case "QUANT_SELL": return "bg-[#ff3b5c]/20 text-[#ff3b5c] border-[#ff3b5c]/30"
    case "WATCH": return "bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
    default: return "bg-gray-700/50 text-gray-400 border-gray-600"
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
      .then((j) => setData(j))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [ticker])

  if (loading) return <div className="text-gray-500 text-center py-20">로딩 중...</div>
  if (!data) return <div className="text-gray-500 text-center py-20">데이터 없음</div>

  const { pick, why_now, technicals, signals, briefing_mentions } = data

  return (
    <div className="space-y-6">
      {/* 종목 헤더 */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{pick?.name ?? ticker}</h2>
            <span className="text-sm font-mono text-gray-500">{ticker}</span>
            {pick?.grade && (
              <span className={`text-lg font-bold ${gradeColor(pick.grade)}`}>{pick.grade}</span>
            )}
          </div>
          <Link href={`/chart/${ticker}`} className="text-xs text-[#0ea5e9] hover:underline">
            차트 보기 →
          </Link>
        </div>

        {pick && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div>
              <span className="text-[10px] text-gray-500 block">총점</span>
              <span className="text-lg font-bold text-white">{pick.total_score.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">현재가</span>
              <span className="text-lg font-bold text-white">{fmtPrice(pick.close)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">RSI</span>
              <span className={`text-lg font-bold ${pick.rsi > 70 ? "text-[#ff3b5c]" : pick.rsi < 30 ? "text-[#00ff88]" : "text-white"}`}>{pick.rsi?.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">외인 5일</span>
              <span className={`text-lg font-bold ${signColor(pick.foreign_5d)}`}>{pick.foreign_5d > 0 ? "+" : ""}{pick.foreign_5d?.toFixed(0)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">기관 5일</span>
              <span className={`text-lg font-bold ${signColor(pick.inst_5d)}`}>{pick.inst_5d > 0 ? "+" : ""}{pick.inst_5d?.toFixed(0)}</span>
            </div>
          </div>
        )}

        {pick?.entry_info && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <span className="text-[10px] text-gray-500 block">진입가</span>
              <span className="text-sm font-bold text-white">{fmtPrice(pick.entry_info.entry)}</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <span className="text-[10px] text-gray-500 block">손절가</span>
              <span className="text-sm font-bold text-[#ff3b5c]">{fmtPrice(pick.entry_info.stop)}</span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <span className="text-[10px] text-gray-500 block">목표가</span>
              <span className="text-sm font-bold text-[#00ff88]">{fmtPrice(pick.entry_info.target)}</span>
            </div>
          </div>
        )}

        {pick?.reasons && pick.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {pick.reasons.map((r, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">{r}</span>
            ))}
          </div>
        )}
      </div>

      {/* 왜 지금 이 종목인가 */}
      {why_now && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">왜 지금 이 종목인가?</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 기술적 분석 */}
            {why_now.technical?.length > 0 && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30">기술적</span>
                </div>
                <ul className="space-y-1">
                  {why_now.technical.map((t, i) => (
                    <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                      <span className="text-[#0ea5e9] shrink-0">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 매크로 연동 */}
            {why_now.macro && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">매크로</span>
                  <span className="text-[10px] text-gray-500">신뢰도: {why_now.macro.confidence}</span>
                </div>
                <p className="text-xs text-gray-300 mb-2">{why_now.macro.reasoning}</p>
                {why_now.macro.catalysts?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {why_now.macro.catalysts.map((c, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 진입 조건 */}
            {why_now.entry && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30">진입 조건</span>
                <p className="text-xs text-gray-300 mt-2">{why_now.entry}</p>
              </div>
            )}

            {/* 안전성 */}
            {why_now.safety && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30">안전성</span>
                <p className="text-xs text-gray-300 mt-2">{why_now.safety}</p>
              </div>
            )}
          </div>

          {/* 경고 */}
          {why_now.warnings?.length > 0 && (
            <div className="mt-4 bg-[#ff3b5c]/10 border border-[#ff3b5c]/20 rounded-xl p-3">
              <span className="text-[10px] text-[#ff3b5c] font-bold block mb-1">경고</span>
              {why_now.warnings.map((w, i) => (
                <p key={i} className="text-xs text-[#ff3b5c]/80">{w}</p>
              ))}
            </div>
          )}

          {/* 보너스 태그 */}
          {why_now.bonus_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {why_now.bonus_tags.map((b, i) => (
                <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-gray-800 text-gray-300 border border-gray-700">
                  <span className="text-gray-500">{b.label}</span>
                  <span className="ml-1 font-bold text-[#00ff88]">+{b.bonus}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 기술적 지표 */}
      {technicals && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">기술적 지표</h3>
            <div className="flex items-center gap-2">
              {technicals.tech_signal && (
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  technicals.tech_signal.includes("매수") || technicals.tech_signal.includes("반등")
                    ? "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30"
                    : technicals.tech_signal.includes("매도") || technicals.tech_signal.includes("하락")
                    ? "bg-[#ff3b5c]/20 text-[#ff3b5c] border-[#ff3b5c]/30"
                    : "bg-gray-700/50 text-gray-400 border-gray-600"
                }`}>
                  {technicals.tech_signal}
                </span>
              )}
              <span className="text-[10px] text-gray-500">{technicals.date}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* RSI */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 block">RSI (14)</span>
              <span className={`text-lg font-bold font-mono ${
                technicals.rsi >= 70 ? "text-[#ff3b5c]" : technicals.rsi <= 30 ? "text-[#00ff88]" : "text-white"
              }`}>{technicals.rsi.toFixed(1)}</span>
              <span className="text-[10px] text-gray-600 block">
                {technicals.rsi >= 70 ? "과매수" : technicals.rsi <= 30 ? "과매도" : "중립"}
              </span>
            </div>

            {/* MACD */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 block">MACD</span>
              <span className={`text-lg font-bold font-mono ${signColor(technicals.macd_histogram)}`}>
                {technicals.macd_histogram > 0 ? "+" : ""}{technicals.macd_histogram.toFixed(2)}
              </span>
              <span className="text-[10px] text-gray-600 block">
                {technicals.macd_histogram > 0 ? "매수 신호" : "매도 신호"}
              </span>
            </div>

            {/* 볼린저밴드 %B */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 block">BB %B</span>
              <span className={`text-lg font-bold font-mono ${
                technicals.bb_pct >= 80 ? "text-[#ff3b5c]" : technicals.bb_pct <= 20 ? "text-[#00ff88]" : "text-white"
              }`}>{technicals.bb_pct.toFixed(1)}%</span>
              <span className="text-[10px] text-gray-600 block">
                {technicals.bb_pct >= 80 ? "상단 돌파" : technicals.bb_pct <= 20 ? "하단 이탈" : "밴드 내"}
              </span>
            </div>

            {/* ADX */}
            <div className="bg-gray-800/50 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 block">ADX (추세강도)</span>
              <span className={`text-lg font-bold font-mono ${
                technicals.adx >= 25 ? "text-[#f59e0b]" : "text-gray-400"
              }`}>{technicals.adx.toFixed(1)}</span>
              <span className="text-[10px] text-gray-600 block">
                {technicals.adx >= 40 ? "강한 추세" : technicals.adx >= 25 ? "추세 진행" : "비추세"}
              </span>
            </div>
          </div>

          {/* 2단 상세 */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <span className="text-[10px] text-gray-500 block">Stoch K</span>
              <span className={`text-xs font-mono ${signColor(technicals.stoch_k - 50)}`}>{technicals.stoch_k.toFixed(1)}</span>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <span className="text-[10px] text-gray-500 block">Stoch D</span>
              <span className={`text-xs font-mono ${signColor(technicals.stoch_d - 50)}`}>{technicals.stoch_d.toFixed(1)}</span>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <span className="text-[10px] text-gray-500 block">ATR</span>
              <span className="text-xs font-mono text-gray-300">{technicals.atr.toFixed(0)}</span>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <span className="text-[10px] text-gray-500 block">거래비</span>
              <span className={`text-xs font-mono ${technicals.volume_ratio > 1.5 ? "text-yellow-400" : "text-gray-400"}`}>
                x{technicals.volume_ratio.toFixed(1)}
              </span>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <span className="text-[10px] text-gray-500 block">TRIX</span>
              <span className={`text-xs font-mono ${signColor(technicals.trix)}`}>{technicals.trix.toFixed(3)}</span>
            </div>
            <div className="text-center p-2 bg-gray-800/30 rounded">
              <span className="text-[10px] text-gray-500 block">종합점수</span>
              <span className={`text-xs font-mono font-bold ${signColor(technicals.tech_score)}`}>{technicals.tech_score.toFixed(1)}</span>
            </div>
          </div>

          {/* 이동평균선 */}
          <div className="flex gap-3 mt-3 text-[10px]">
            <span className="text-gray-500">이평선</span>
            <span className={technicals.price > technicals.ma5 ? "text-[#00ff88]" : "text-[#ff3b5c]"}>
              5일 {technicals.ma5.toLocaleString()}
            </span>
            <span className={technicals.price > technicals.ma20 ? "text-[#00ff88]" : "text-[#ff3b5c]"}>
              20일 {technicals.ma20.toLocaleString()}
            </span>
            <span className={technicals.price > technicals.ma60 ? "text-[#00ff88]" : "text-[#ff3b5c]"}>
              60일 {technicals.ma60.toLocaleString()}
            </span>
            <span className={technicals.price > technicals.ma120 ? "text-[#00ff88]" : "text-[#ff3b5c]"}>
              120일 {technicals.ma120.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 시그널 이력 */}
      {signals.length > 0 && (
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-bold text-white">시그널 이력</span>
            <span className="text-xs text-gray-500 ml-2">최근 {signals.length}건</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500">
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
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-4 text-gray-400">{s.date}</td>
                    <td className="text-center px-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${signalTypeColor(s.signal_type)}`}>{s.signal_type}</span>
                    </td>
                    <td className={`text-center px-3 font-bold ${gradeColor(s.grade)}`}>{s.grade}</td>
                    <td className="text-right px-3 font-mono text-white">{s.score}</td>
                    <td className="text-right px-3 text-white">{fmtPrice(s.entry_price)}</td>
                    <td className="text-right px-3 text-[#00ff88]">{fmtPrice(s.target_price)}</td>
                    <td className="text-right px-3 text-[#ff3b5c]">{fmtPrice(s.stop_loss)}</td>
                    <td className="px-3 text-gray-500 max-w-[200px] truncate">{(s.reasons ?? []).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 브리핑 언급 */}
      {briefing_mentions.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <span className="text-sm font-bold text-white">모닝 브리핑 언급</span>
          <div className="flex gap-2 mt-2">
            {briefing_mentions.map((b, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded bg-gray-800 text-gray-400">
                {b.date} · {b.market_status}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* pick이 없는 경우 */}
      {!pick && signals.length === 0 && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <p className="text-gray-500">이 종목에 대한 퀀트 분석 데이터가 없습니다.</p>
          <Link href={`/chart/${ticker}`} className="text-sm text-[#0ea5e9] hover:underline mt-2 inline-block">
            차트에서 확인하기 →
          </Link>
        </div>
      )}
    </div>
  )
}
