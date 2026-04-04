'use client'

import { useEffect, useState } from 'react'
import QuantHeroCard from './QuantHeroCard'
import PreMarketScanner from './PreMarketScanner'
import PowerScoreTop10 from './PowerScoreTop10'
import EventCalendarPanel from './EventCalendarPanel'
import BottomFishingPanel from './BottomFishingPanel'
import SmartMoneyTracking from './SmartMoneyTracking'
import CrashBounceView from './CrashBounceView'

// ─── 타입 (JarvisControlTower에서 필요한 부분만) ───

interface PickItem {
  ticker: string
  name: string
  grade: string
  total_score: number
  sources: string[]
  n_sources: number
  close: number
  rsi: number
  stoch_k: number
  foreign_5d: number
  inst_5d: number
  reasons: string[]
  entry_price?: number
  stop_loss?: number
  target_price?: number
}

interface JarvisData {
  picks: {
    target_date_label?: string
    mode_label?: string
    total_candidates?: number
    stats?: Record<string, number>
    picks?: PickItem[]
  } | null
  brain: {
    regime?: string
    direction?: string
    vix?: number
    vix_grade?: string
    cash_ratio?: number
    recommendation?: string
    danger_mode?: string
  } | null
  shield: {
    status?: string
    sector_concentration?: number
    max_drawdown?: number
  } | null
  market_guide?: {
    summary?: string
    strategy?: string
    hot_sectors?: { sector: string; ret_5: number }[]
    cold_sectors?: { sector: string; ret_5: number }[]
    vix?: number
    vix_grade?: string
    cash_ratio?: number
    danger_mode?: string
  } | null
  etf_picks?: {
    regime?: string
    allocation?: Record<string, number>
    accelerations?: {
      sector: string
      rank_change: number
      score: number
      ret_5d: number
    }[]
  } | null
  killer_picks?: {
    portfolio_suggestion?: {
      defense_pct?: number
      offense_pct?: number
      defense?: { name: string; ticker: string; pct: number }[]
      offense?: { name: string; ticker: string; pct: number }[]
    }
  } | null
  updated_at?: string | null
  date?: string | null
}

// ─── 메인 시스템 페이지 ───

export default function SystemPage() {
  const [data, setData] = useState<JarvisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'quant' | 'swing'>('quant')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/quant-jarvis', { signal: controller.signal })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setData(null)
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-6">
        <div className="h-16 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  const brain = data?.brain
  const guide = data?.market_guide
  const picks = data?.picks?.picks ?? []
  const etf = data?.etf_picks
  const portfolio = data?.killer_picks?.portfolio_suggestion

  // 판단 텍스트: brain → market_guide 폴백
  const verdict = guide?.summary ?? brain?.recommendation ?? '-'
  const regime = brain?.regime ?? ''
  const hotSectors = guide?.hot_sectors ?? []
  const coldSectors = guide?.cold_sectors ?? []
  const cashPct = brain?.cash_ratio ?? guide?.cash_ratio
  const recommendation = guide?.strategy ?? brain?.direction ?? '-'
  const vix = brain?.vix ?? guide?.vix
  const vixGrade = brain?.vix_grade ?? guide?.vix_grade
  const dangerMode = brain?.danger_mode ?? guide?.danger_mode

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">
      {/* 상단 그라데이션 라인 (퀀트=보라, 스윙=녹색) */}
      <div
        className="h-[2px] rounded-full"
        style={{ background: tab === 'quant'
          ? 'linear-gradient(90deg, #7C3AED, #A78BFA 30%, #7C3AED 60%, #A78BFA)'
          : 'linear-gradient(90deg, #00FF88, #4ADE80 30%, #00FF88 60%, #4ADE80)'
        }}
      />

      {/* Quant / Swing 서브탭 */}
      <div className="flex items-center gap-1 bg-[#F5F4F0] rounded-xl p-1 border border-[#E8E6E0] w-fit">
        {(['quant', 'swing'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-[15px] font-bold transition-colors whitespace-nowrap ${
              tab === t
                ? 'bg-[#00FF88] text-[#1A1A2E]'
                : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white'
            }`}
          >
            {t === 'quant' ? '퀀트시스템' : '급락반등'}
          </button>
        ))}
        {data?.date && (
          <span className="text-[13px] text-[#9CA3AF] ml-3">
            {data.date}
          </span>
        )}
      </div>

      {/* 급락반등 탭 */}
      {tab === 'swing' && <CrashBounceView />}

      {/* 퀀트시스템 탭 */}
      {tab === 'quant' && (
        <>
          {/* Row 1: 오늘의 작전 — 퀀트 히어로 */}
          <section>
            <QuantHeroCard
              verdict={verdict}
              regime={regime}
              recommendation={recommendation}
              vix={vix}
              vixGrade={vixGrade}
              cashPct={cashPct}
              dangerMode={dangerMode}
              brainScore={(data?.brain as Record<string, unknown>)?.score as number | undefined}
              hotSectors={hotSectors}
              coldSectors={coldSectors}
              date={data?.date}
            />
          </section>

          {/* Row 2: 미국장 → 한국장 릴레이 */}
          <section>
            <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">미국장 → 한국장 릴레이</h2>
            <PreMarketScanner />
          </section>

          {/* Row 3: FlowX 파워 스코어 TOP 10 */}
          {picks.length > 0 && (
            <section>
              <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">FlowX 파워 스코어 TOP 10</h2>
              <PowerScoreTop10 picks={picks} />
            </section>
          )}

          {/* Row 4: 이벤트 캘린더 + 저점 사냥기 */}
          <section>
            <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">이벤트 캘린더 & 저점 사냥기</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EventCalendarPanel />
              <BottomFishingPanel />
            </div>
          </section>

          {/* Row 5: 스마트 머니 추적 */}
          {picks.length > 0 && (
            <section>
              <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">스마트 머니 추적</h2>
              <SmartMoneyTracking picks={picks} />
            </section>
          )}
          {/* Row 6: 포트폴리오 배분 + 섹터 온도 */}
          {(etf || portfolio || hotSectors.length > 0 || coldSectors.length > 0) && (
        <section>
          <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-3">포트폴리오 배분 & 섹터 온도</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 좌: 포트폴리오 배분 (방어/공격 바) */}
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5">
              {portfolio ? (
                <>
                  <h4 className="text-[14px] font-bold text-[#1A1A2E] mb-3">포트폴리오 제안</h4>
                  {/* 방어/공격 가로 바 */}
                  <div className="flex h-5 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-[#059669] flex items-center justify-center text-[12px] font-bold text-white"
                      style={{ width: `${portfolio.defense_pct ?? 50}%` }}
                    >
                      방어 {portfolio.defense_pct ?? 0}%
                    </div>
                    <div
                      className="bg-[#DC2626] flex items-center justify-center text-[12px] font-bold text-white"
                      style={{ width: `${portfolio.offense_pct ?? 50}%` }}
                    >
                      공격 {portfolio.offense_pct ?? 0}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    {portfolio.defense?.map((d) => (
                      <div key={d.ticker} className="flex justify-between text-[14px]">
                        <span className="font-bold text-[#1A1A2E]">{d.name}</span>
                        <span className="text-[#059669] font-bold tabular-nums">{d.pct}%</span>
                      </div>
                    ))}
                    {portfolio.offense?.map((o) => (
                      <div key={o.ticker} className="flex justify-between text-[14px]">
                        <span className="font-bold text-[#1A1A2E]">{o.name}</span>
                        <span className="text-[#DC2626] font-bold tabular-nums">{o.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : etf?.allocation ? (
                <>
                  <h4 className="text-[14px] font-bold text-[#1A1A2E] mb-3">
                    자산배분 ({etf.regime ?? '-'})
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(etf.allocation).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-3">
                        <span className="text-[14px] font-bold text-[#1A1A2E] w-[80px] truncate">{k}</span>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#7C3AED]"
                            style={{ width: `${Math.min(v, 100)}%` }}
                          />
                        </div>
                        <span className="text-[14px] font-bold text-[#1A1A2E] w-[36px] text-right tabular-nums">
                          {v}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-[#6B7280]">포트폴리오 데이터 없음</p>
              )}
            </div>

            {/* 우: 섹터 온도 */}
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5">
              <h4 className="text-[15px] font-bold text-[#1A1A2E] mb-3">섹터 온도</h4>
              {etf?.accelerations && etf.accelerations.length > 0 ? (
                <div className="space-y-2">
                  {etf.accelerations.map((a) => {
                    const temp = a.ret_5d >= 3 ? 'HOT' : a.ret_5d >= 0 ? 'WARMING' : 'COLD'
                    const tempColor = temp === 'HOT' ? '#DC2626' : temp === 'WARMING' ? '#D97706' : '#3B82F6'
                    return (
                      <div key={a.sector} className="flex items-center gap-2">
                        <span
                          className="text-[12px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: `${tempColor}15`, color: tempColor }}
                        >
                          {temp}
                        </span>
                        <span className="text-[14px] font-bold text-[#1A1A2E] flex-1 truncate">{a.sector}</span>
                        <span
                          className="text-[14px] font-bold tabular-nums"
                          style={{ color: a.ret_5d >= 0 ? '#059669' : '#DC2626' }}
                        >
                          {a.ret_5d >= 0 ? '+' : ''}{a.ret_5d.toFixed(1)}%
                        </span>
                        <span className="text-[13px] text-[#6B7280] tabular-nums">
                          점수 {a.score.toFixed(0)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (hotSectors.length > 0 || coldSectors.length > 0) ? (
                <div className="space-y-2">
                  {hotSectors.map((s) => (
                    <div key={s.sector} className="flex items-center gap-2">
                      <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] shrink-0">HOT</span>
                      <span className="text-[14px] font-bold text-[#1A1A2E] flex-1">{s.sector}</span>
                      <span className="text-[14px] font-bold text-[#059669] tabular-nums">+{s.ret_5.toFixed(1)}%</span>
                    </div>
                  ))}
                  {coldSectors.map((s) => (
                    <div key={s.sector} className="flex items-center gap-2">
                      <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#3B82F6] shrink-0">COLD</span>
                      <span className="text-[14px] font-bold text-[#1A1A2E] flex-1">{s.sector}</span>
                      <span className="text-[14px] font-bold text-[#DC2626] tabular-nums">{s.ret_5.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#6B7280]">섹터 데이터 없음</p>
              )}
            </div>
          </div>
          </section>
          )}
        </>
      )}
    </div>
  )
}
