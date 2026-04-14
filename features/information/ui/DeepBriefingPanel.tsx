'use client'

import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'

/* ── Types ── */

interface KeyNumber {
  label: string
  value: string
  change: string
  context: string
}

interface HiddenSignal {
  signal: string
  detail: string
  importance: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface RiskFactor {
  risk: string
  probability: 'HIGH' | 'MEDIUM' | 'LOW'
  impact: string
}

interface WatchItem {
  ticker: string
  name: string
  reason: string
  direction: 'BUY' | 'SELL' | 'WATCH'
}

interface SourceItem {
  title: string
  url: string
}

interface DeepBriefing {
  date: string
  session: string
  geopolitics: string | null
  macro_economy: string | null
  sector_analysis: string | null
  investment_strategy: string | null
  key_numbers: KeyNumber[]
  hidden_signals: HiddenSignal[]
  risk_factors: RiskFactor[]
  watchlist: WatchItem[]
  sources: SourceItem[]
  summary: string | null
  market_sentiment: string | null
}

/* ── Helpers ── */

const SENTIMENT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  BULLISH: { bg: 'bg-green-50', text: 'text-green-700', label: 'BULLISH' },
  BEARISH: { bg: 'bg-red-50', text: 'text-red-700', label: 'BEARISH' },
  NEUTRAL: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'NEUTRAL' },
  CAUTIOUS: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'CAUTIOUS' },
}

const IMPORTANCE_ICON: Record<string, string> = {
  HIGH: '\u{1F534}',   // 🔴
  MEDIUM: '\u{1F7E1}', // 🟡
  LOW: '\u{1F7E2}',    // 🟢
}

const DIRECTION_BADGE: Record<string, { icon: string; color: string }> = {
  BUY: { icon: '\u{1F7E2} BUY', color: 'text-green-600' },
  SELL: { icon: '\u{1F534} SELL', color: 'text-red-600' },
  WATCH: { icon: '\u{1F441} WATCH', color: 'text-gray-600' },
}

const SECTION_TABS = [
  { key: 'geopolitics', label: '\u{1F30D} \uc9c0\uc815\ud559' },
  { key: 'macro_economy', label: '\u{1F4C8} \ub9e4\ud06c\ub85c' },
  { key: 'sector_analysis', label: '\u{1F3ED} \uc139\ud130' },
  { key: 'investment_strategy', label: '\u{1F4A1} \uc804\ub7b5' },
] as const

type SectionKey = (typeof SECTION_TABS)[number]['key']

function isChangePositive(change: string): boolean | null {
  if (!change) return null
  if (change.startsWith('+') || change.includes('\u25B2')) return true
  if (change.startsWith('-') || change.includes('\u25BC')) return false
  return null
}

/* ── Component ── */

export function DeepBriefingPanel() {
  const [data, setData] = useState<DeepBriefing | null>(null)
  const [loading, setLoading] = useState(true)
  const [sectionTab, setSectionTab] = useState<SectionKey>('geopolitics')

  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/information/deep-briefing', { signal: ac.signal })
      .then(r => r.json())
      .then(d => setData(d.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="text-center py-16 text-[#9ca3b8] text-[14px]">
        심층 브리핑 불러오는 중...
      </div>
    )
  }

  /* ── Empty ── */
  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="text-[32px] mb-2">{'\u{1F4CA}'}</div>
        <div className="text-[14px] text-[#5b6178]">심층 브리핑 준비 중입니다</div>
        <div className="text-[12px] text-[#9ca3b8] mt-1">
          매일 AM 08:18, PM 16:08에 업데이트됩니다
        </div>
      </div>
    )
  }

  const sentiment = SENTIMENT_STYLE[data.market_sentiment ?? ''] ?? SENTIMENT_STYLE.NEUTRAL
  const sectionContent = data[sectionTab] as string | null

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* ── 3-1. 상단: 요약 + 센티먼트 ── */}
      <div>
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <h3 className="text-[17px] font-black text-[#1A1A2E]">
            심층 브리핑
          </h3>
          <span className="text-[12px] text-[#9ca3b8]">
            {data.date} {data.session}
          </span>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${sentiment.bg} ${sentiment.text}`}
          >
            {sentiment.label}
          </span>
        </div>
        {data.summary && (
          <p className="text-[14px] text-[#3a3f52] leading-relaxed">{data.summary}</p>
        )}
      </div>

      {/* ── 3-2. 핵심 수치 카드 ── */}
      {data.key_numbers.length > 0 && (
        <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
          <div className="flex gap-3 min-w-max">
            {data.key_numbers.map((kn, i) => {
              const pos = isChangePositive(kn.change)
              return (
                <div
                  key={i}
                  className="min-w-[140px] bg-[#fafafa] border border-[#e5e7ef] rounded-xl p-3.5 flex-shrink-0"
                >
                  <div className="text-[11px] text-[#9ca3b8] font-medium mb-1">{kn.label}</div>
                  <div className="text-[18px] font-black text-[#1A1A2E]">{kn.value}</div>
                  <div
                    className={`text-[12px] font-bold mt-0.5 ${
                      pos === true ? 'text-red-500' : pos === false ? 'text-blue-500' : 'text-[#9ca3b8]'
                    }`}
                  >
                    {kn.change}
                  </div>
                  {kn.context && (
                    <div className="text-[10px] text-[#9ca3b8] mt-1 leading-tight">{kn.context}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 3-3. 4섹션 탭 ── */}
      <div>
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {SECTION_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setSectionTab(t.key)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors whitespace-nowrap ${
                sectionTab === t.key
                  ? 'bg-[#00FF88] text-[#1A1A2E] border-[#00FF88]'
                  : 'bg-white text-[#5b6178] border-[#e5e7ef] hover:border-[#00FF88]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {sectionContent ? (
          <div className="prose prose-sm max-w-none text-[13px] leading-relaxed text-[#3a3f52] [&_table]:text-[12px] [&_table]:border-collapse [&_th]:bg-[#f5f4f0] [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:border [&_th]:border-[#e5e7ef] [&_td]:px-3 [&_td]:py-1.5 [&_td]:border [&_td]:border-[#e5e7ef] [&_h1]:text-[16px] [&_h2]:text-[15px] [&_h3]:text-[14px] [&_strong]:text-[#1A1A2E] [&_ul]:pl-4 [&_ol]:pl-4 overflow-x-auto">
            <Markdown>{sectionContent}</Markdown>
          </div>
        ) : (
          <div className="text-center py-8 text-[#9ca3b8] text-[13px]">
            해당 섹션 데이터가 없습니다
          </div>
        )}
      </div>

      {/* ── 3-4. 숨은 시그널 ── */}
      {data.hidden_signals.length > 0 && (
        <div className="bg-[#fafafa] border border-[#e5e7ef] rounded-xl p-4">
          <h4 className="text-[14px] font-bold text-[#1A1A2E] mb-3">
            {'\u{1F50D}'} 남들이 모르는 숨은 시그널
          </h4>
          <div className="space-y-2.5">
            {data.hidden_signals.map((hs, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[13px] shrink-0 mt-0.5">
                  {IMPORTANCE_ICON[hs.importance] ?? IMPORTANCE_ICON.LOW}
                </span>
                <span className="text-[11px] font-bold text-[#5b6178] shrink-0 w-[36px] mt-0.5">
                  {hs.importance}
                </span>
                <div>
                  <span className="text-[13px] font-bold text-[#1A1A2E]">{hs.signal}</span>
                  <div className="text-[12px] text-[#5b6178] mt-0.5">{hs.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3-5. 리스크 팩터 ── */}
      {data.risk_factors.length > 0 && (
        <div className="bg-white border border-[#e5e7ef] rounded-xl overflow-hidden">
          <div className="bg-[#f5f4f0] px-4 py-2.5 border-b border-[#e5e7ef]">
            <h4 className="text-[13px] font-bold text-[#1A1A2E]">{'\u26A0\uFE0F'} 리스크 팩터</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#e5e7ef] bg-[#fafafa]">
                  <th className="text-left px-4 py-2 font-semibold text-[#5b6178]">리스크</th>
                  <th className="text-center px-3 py-2 font-semibold text-[#5b6178] w-[70px]">확률</th>
                  <th className="text-left px-4 py-2 font-semibold text-[#5b6178]">영향</th>
                </tr>
              </thead>
              <tbody>
                {data.risk_factors.map((rf, i) => (
                  <tr key={i} className="border-b border-[#f0f0f0] last:border-0">
                    <td className="px-4 py-2.5 text-[#1A1A2E] font-medium">{rf.risk}</td>
                    <td className="text-center px-3 py-2.5">
                      <span className="text-[11px]">
                        {IMPORTANCE_ICON[rf.probability] ?? ''} {rf.probability}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#5b6178]">{rf.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3-6. 워치리스트 ── */}
      {data.watchlist.length > 0 && (
        <div className="bg-white border border-[#e5e7ef] rounded-xl overflow-hidden">
          <div className="bg-[#f5f4f0] px-4 py-2.5 border-b border-[#e5e7ef]">
            <h4 className="text-[13px] font-bold text-[#1A1A2E]">{'\u{1F4CB}'} 워치리스트</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#e5e7ef] bg-[#fafafa]">
                  <th className="text-left px-4 py-2 font-semibold text-[#5b6178]">종목</th>
                  <th className="text-left px-3 py-2 font-semibold text-[#5b6178]">사유</th>
                  <th className="text-center px-3 py-2 font-semibold text-[#5b6178] w-[80px]">방향</th>
                </tr>
              </thead>
              <tbody>
                {data.watchlist.map((w, i) => {
                  const dir = DIRECTION_BADGE[w.direction] ?? DIRECTION_BADGE.WATCH
                  const isKr = /^\d{6}$/.test(w.ticker)
                  const href = isKr ? `/stock/${w.ticker}` : null
                  return (
                    <tr key={i} className="border-b border-[#f0f0f0] last:border-0">
                      <td className="px-4 py-2.5">
                        {href ? (
                          <a href={href} className="text-blue-600 hover:underline font-medium">
                            {w.name || w.ticker}
                          </a>
                        ) : (
                          <span className="font-medium text-[#1A1A2E]">{w.name || w.ticker}</span>
                        )}
                        {w.name && <span className="text-[11px] text-[#9CA3AF] ml-1">{w.ticker}</span>}
                      </td>
                      <td className="px-3 py-2.5 text-[#5b6178]">{w.reason}</td>
                      <td className={`text-center px-3 py-2.5 font-bold text-[11px] ${dir.color}`}>
                        {dir.icon}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3-7. 소스 ── */}
      {data.sources.length > 0 && (
        <div className="pt-2">
          <div className="text-[10px] text-[#9ca3b8]">
            <span className="font-medium">참고 소스: </span>
            {data.sources.map((s, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {s.title}
                </a>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 면책 ── */}
      <div className="text-center pt-3 border-t border-[#f0f0f0]">
        <p className="text-[10px] text-[#9ca3b8]">
          본 심층 브리핑은 AI가 생성한 시장 분석 참고 자료이며, 투자 판단의 책임은 본인에게 있습니다
        </p>
      </div>
    </div>
  )
}
