'use client'

import { useEffect, useState } from 'react'
import MarketAlertBanner from './MarketAlertBanner'
import MarketEnv4Box from './MarketEnv4Box'
import PreMarketScanner from './PreMarketScanner'
import PowerScoreTop10 from './PowerScoreTop10'
import EventCalendarPanel from './EventCalendarPanel'
import BottomFishingPanel from './BottomFishingPanel'
import SmartMoneyTracking from './SmartMoneyTracking'

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
  const riskLevel = data?.shield?.status ?? '-'
  const cashPct = brain?.cash_ratio ?? guide?.cash_ratio
  const recommendation = guide?.strategy ?? brain?.direction ?? '-'
  const vix = brain?.vix ?? guide?.vix
  const vixGrade = brain?.vix_grade ?? guide?.vix_grade
  const dangerMode = brain?.danger_mode ?? guide?.danger_mode

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-8">
      {/* Quant / Swing 서브탭 */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['quant', 'swing'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-md text-sm font-bold transition-all"
            style={{
              backgroundColor: tab === t ? '#059669' : 'transparent',
              color: tab === t ? '#fff' : '#6B7280',
            }}
          >
            {t === 'quant' ? 'Quant System' : 'Swing Trade'}
          </button>
        ))}
        {data?.date && (
          <span className="text-[10px] text-[var(--text-muted)] ml-3">
            {data.date}
          </span>
        )}
      </div>

      {/* Row 1: 시장 경고 배너 */}
      <section>
        <MarketAlertBanner
          verdict={verdict}
          regime={regime}
          hotSectors={hotSectors}
          coldSectors={coldSectors}
        />
      </section>

      {/* Row 2: 시장 환경 4박스 */}
      <section>
        <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">시장 환경</h2>
        <MarketEnv4Box
          verdict={verdict}
          riskLevel={riskLevel}
          cashPct={cashPct}
          recommendation={recommendation}
          vix={vix}
          vixGrade={vixGrade}
          dangerMode={dangerMode}
        />
      </section>

      {/* Row 3: US 프리마켓 스캐너 */}
      <section>
        <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">US 프리마켓 스캐너</h2>
        <PreMarketScanner />
      </section>

      {/* Row 4: Power Score TOP 10 */}
      {picks.length > 0 && (
        <section>
          <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">FlowX Power Score</h2>
          <PowerScoreTop10 picks={picks} />
        </section>
      )}

      {/* Row 5: 이벤트 캘린더 + 바닥잡이 */}
      <section>
        <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">이벤트 & 바닥잡이</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EventCalendarPanel />
          <BottomFishingPanel />
        </div>
      </section>

      {/* Row 6: 스마트머니 추적 */}
      {picks.length > 0 && (
        <section>
          <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">스마트머니 추적</h2>
          <SmartMoneyTracking picks={picks} />
        </section>
      )}

      {/* Row 7: ETF 전략 + 포트폴리오 */}
      {(etf || portfolio) && (
        <section>
          <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">ETF 전략 & 포트폴리오</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ETF 자산배분 */}
            {etf?.allocation && (
              <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5">
                <h4 className="text-xs font-bold text-[var(--text-primary)] mb-3">
                  자산배분 ({etf.regime ?? '-'})
                </h4>
                <div className="space-y-2">
                  {Object.entries(etf.allocation).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-muted)] w-[80px] truncate">{k}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#3B82F6]"
                          style={{ width: `${Math.min(v, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-primary)] w-[36px] text-right tabular-nums">
                        {v}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 포트폴리오 제안 */}
            {portfolio && (
              <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5">
                <h4 className="text-xs font-bold text-[var(--text-primary)] mb-3">
                  포트폴리오 제안
                </h4>
                <div className="flex gap-3 mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-bold">
                    방어 {portfolio.defense_pct ?? 0}%
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] font-bold">
                    공격 {portfolio.offense_pct ?? 0}%
                  </span>
                </div>
                <div className="space-y-1">
                  {portfolio.defense?.map((d) => (
                    <div key={d.ticker} className="flex justify-between text-xs">
                      <span className="text-[var(--text-primary)]">{d.name}</span>
                      <span className="text-[#059669] font-bold">{d.pct}%</span>
                    </div>
                  ))}
                  {portfolio.offense?.map((o) => (
                    <div key={o.ticker} className="flex justify-between text-xs">
                      <span className="text-[var(--text-primary)]">{o.name}</span>
                      <span className="text-[#DC2626] font-bold">{o.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ETF 가속 종목 */}
          {etf?.accelerations && etf.accelerations.length > 0 && (
            <div className="mt-4 bg-white rounded-xl border border-[var(--border)] shadow-sm p-5">
              <h4 className="text-xs font-bold text-[var(--text-primary)] mb-3">
                섹터 가속 ETF
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {etf.accelerations.map((a) => (
                  <div key={a.sector} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{a.sector}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-sm font-bold ${a.ret_5d >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                        {a.ret_5d >= 0 ? '+' : ''}{a.ret_5d.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        순위 {a.rank_change > 0 ? `+${a.rank_change}` : a.rank_change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Row 8: AI 포트폴리오 시뮬레이터 (COMING SOON) */}
      <section>
        <h2 className="text-[var(--text-primary)] text-xl font-bold mb-4">AI 포트폴리오 시뮬레이터</h2>
        <div className="rounded-xl border-2 border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-2xl mb-2">🤖</p>
          <p className="text-sm font-bold text-[var(--text-primary)] mb-1">COMING SOON</p>
          <p className="text-xs text-[var(--text-muted)]">
            AI가 실시간 시장 데이터를 기반으로 가상 포트폴리오를 운용합니다
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">
            예상 출시: 2026 Q2
          </p>
        </div>
      </section>
    </div>
  )
}
