'use client'

import { useEffect, useState } from 'react'

/* ── 타입 ── */
interface Pick {
  code: string; name: string; grade: string; score: number
  entry_price: number; target_price: number; stop_price: number
  hold_days: number; conviction: string; catalyst: string
  rr_ratio: number; regime: string; supply_score: number
  tv_pattern: string; nat_power_grade: string
}

interface EtfPick {
  code: string; name: string; category: string; signal: string
  entry: number; sl: number; tp: number; reason: string; holding_days: number
}

interface WatchItem {
  code: string; name: string; reason: string; trigger: string; grade: string; score: number
}

interface NxtTarget {
  code: string; name: string; sector: string; tier: string
  priority: number; supply_score: number; is_etf: boolean
}

interface SwingData {
  date: string
  brain_verdict: string; brain_pct: number; brain_reason: string
  regime: string; regime_severity: number; regime_desc: string
  alloc_swing: number; alloc_gold_etf: number; alloc_inverse: number
  alloc_group_etf: number; alloc_small_cap: number; alloc_cash: number
  picks: Pick[]; etf_picks: EtfPick[]; watchlist: WatchItem[]
  nxt_signal: string; nxt_signal_text: string; nxt_score: number
  nxt_reason: string; nxt_targets: NxtTarget[]
  vix: number; nasdaq_pct: number; usdkrw: number
  oil_pct: number; gold_pct: number; silver_pct: number
  analysis: Record<string, string>; portfolio: Record<string, number>
  smart_money_score: number; smart_money_signal: string
  stress_index: number; stress_level: string
  rotation_signal: string; liquidity_score: number; market_comment: string
}

/* ── BRAIN 색상 ── */
const VERDICT_STYLE: Record<string, { color: string; bg: string }> = {
  '공격': { color: 'text-[var(--up)]', bg: 'bg-red-50 border-red-200' },
  '표준': { color: 'text-[var(--green)]', bg: 'bg-green-50 border-green-200' },
  '방어': { color: 'text-[var(--down)]', bg: 'bg-blue-50 border-blue-200' },
  '관망': { color: 'text-[var(--text-dim)]', bg: 'bg-gray-50 border-[var(--border)]' },
}

const REGIME_STYLE: Record<string, string> = {
  MOMENTUM: 'text-[var(--up)]',
  NORMAL: 'text-[var(--green)]',
  CAUTION: 'text-[var(--yellow)]',
  PANIC: 'text-red-500',
}

export default function SwingDashboardView() {
  const [data, setData] = useState<SwingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/swing-dashboard', { signal: controller.signal })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        setData(json.data)
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
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-6 gap-2">{[1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg" />)}</div>
        <div className="h-48 bg-gray-100 rounded-lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 text-center py-12">
        <p className="text-[var(--text-muted)]">스윙시스템 데이터가 아직 없습니다.</p>
        <p className="text-[var(--text-muted)] text-sm mt-1">매일 16:40 업데이트됩니다.</p>
      </div>
    )
  }

  const verdict = VERDICT_STYLE[data.brain_verdict] ?? VERDICT_STYLE['관망']

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-bold">스윙시스템 대시보드</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">BRAIN AI 판단 + 자산배분 + 추천종목</p>
        </div>
        <span className="text-[var(--text-muted)] text-sm">{data.date}</span>
      </div>

      {/* ── BRAIN 판단 + 레짐 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-lg border p-5 ${verdict.bg}`}>
          <p className="text-[var(--text-muted)] text-xs mb-1">BRAIN 판단</p>
          <div className="flex items-baseline gap-3">
            <span className={`text-3xl font-bold ${verdict.color}`}>{data.brain_verdict}</span>
            <span className={`text-xl font-mono ${verdict.color}`}>{data.brain_pct}%</span>
          </div>
          {data.brain_reason && <p className="text-[var(--text-dim)] text-sm mt-2">{data.brain_reason}</p>}
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-gray-50 p-5">
          <p className="text-[var(--text-muted)] text-xs mb-1">시장 레짐</p>
          <div className="flex items-baseline gap-3">
            <span className={`text-2xl font-bold ${REGIME_STYLE[data.regime] ?? 'text-[var(--text-dim)]'}`}>{data.regime}</span>
            <span className="text-[var(--text-muted)] text-sm">심각도 {data.regime_severity}/5</span>
          </div>
          {data.regime_desc && <p className="text-[var(--text-dim)] text-sm mt-2">{data.regime_desc}</p>}
        </div>
      </div>

      {/* ── 자산 배분 ── */}
      <section>
        <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">자산 배분</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <AllocCard label="BH 스윙" pct={data.alloc_swing} color="text-[var(--up)]" />
          <AllocCard label="금 ETF" pct={data.alloc_gold_etf} color="text-[var(--yellow)]" />
          <AllocCard label="인버스" pct={data.alloc_inverse} color="text-[var(--down)]" />
          <AllocCard label="그룹 ETF" pct={data.alloc_group_etf} color="text-[var(--green)]" />
          <AllocCard label="소형주" pct={data.alloc_small_cap} color="text-purple-600" />
          <AllocCard label="현금" pct={data.alloc_cash} color="text-[var(--text-primary)]" />
        </div>
      </section>

      {/* ── 시장 지표 ── */}
      <section>
        <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">시장 지표</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <MetricCard label="VIX" value={data.vix.toFixed(1)} color={data.vix >= 25 ? 'text-[var(--up)]' : data.vix >= 18 ? 'text-[var(--yellow)]' : 'text-[var(--green)]'} />
          <MetricCard label="NASDAQ" value={`${data.nasdaq_pct >= 0 ? '+' : ''}${data.nasdaq_pct.toFixed(2)}%`} color={data.nasdaq_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'} />
          <MetricCard label="USD/KRW" value={data.usdkrw.toFixed(0)} color="text-[var(--text-primary)]" />
          <MetricCard label="유가" value={`${data.oil_pct >= 0 ? '+' : ''}${data.oil_pct.toFixed(2)}%`} color={data.oil_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'} />
          <MetricCard label="금" value={`${data.gold_pct >= 0 ? '+' : ''}${data.gold_pct.toFixed(2)}%`} color={data.gold_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'} />
          <MetricCard label="은" value={`${data.silver_pct >= 0 ? '+' : ''}${data.silver_pct.toFixed(2)}%`} color={data.silver_pct >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'} />
        </div>
      </section>

      {/* ── 센서 데이터 ── */}
      <section>
        <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">센서</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SensorCard label="스마트머니" value={data.smart_money_score.toFixed(1)} sub={data.smart_money_signal} color={data.smart_money_signal === 'RISK_ON' ? 'text-[var(--up)]' : data.smart_money_signal === 'RISK_OFF' ? 'text-[var(--down)]' : 'text-[var(--text-dim)]'} />
          <SensorCard label="스트레스" value={data.stress_index.toFixed(1)} sub={data.stress_level} color={data.stress_level === 'HIGH' ? 'text-[var(--up)]' : data.stress_level === 'ELEVATED' ? 'text-[var(--yellow)]' : 'text-[var(--green)]'} />
          <SensorCard label="유동성" value={data.liquidity_score.toFixed(1)} sub="" color={data.liquidity_score >= 0 ? 'text-[var(--green)]' : 'text-[var(--up)]'} />
          {data.rotation_signal && (
            <div className="rounded-lg border border-[var(--border)] bg-gray-50 p-4">
              <p className="text-[var(--text-muted)] text-xs">섹터 로테이션</p>
              <p className="text-[var(--yellow)] text-sm font-medium mt-1">{data.rotation_signal}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 추천종목 ── */}
      {data.picks?.length > 0 && (
        <section>
          <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">추천 종목</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
                  <th className="text-left py-2 px-2">종목</th>
                  <th className="text-center py-2 px-2">등급</th>
                  <th className="text-right py-2 px-2">점수</th>
                  <th className="text-right py-2 px-2">진입가</th>
                  <th className="text-right py-2 px-2">목표가</th>
                  <th className="text-right py-2 px-2">손절가</th>
                  <th className="text-right py-2 px-2">R:R</th>
                  <th className="text-right py-2 px-2">보유일</th>
                  <th className="text-left py-2 px-2">촉매</th>
                </tr>
              </thead>
              <tbody>
                {data.picks.map((p) => (
                  <tr key={p.code} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                    <td className="py-2.5 px-2">
                      <span className="text-[var(--text-primary)] font-medium">{p.name}</span>
                      <span className="text-[var(--text-muted)] text-xs ml-1.5">{p.code}</span>
                    </td>
                    <td className="text-center py-2.5 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded border ${gradeStyle(p.grade)}`}>{p.grade}</span>
                    </td>
                    <td className="text-right py-2.5 px-2">
                      <span className={`font-bold font-mono ${p.score >= 70 ? 'text-[var(--up)]' : p.score >= 50 ? 'text-[var(--yellow)]' : 'text-[var(--text-dim)]'}`}>{p.score}</span>
                    </td>
                    <td className="text-right py-2.5 px-2 text-[var(--text-primary)] font-mono">{p.entry_price?.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 text-[var(--up)] font-mono">{p.target_price?.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 text-[var(--down)] font-mono">{p.stop_price?.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 text-[var(--yellow)] font-mono">{p.rr_ratio?.toFixed(1)}</td>
                    <td className="text-right py-2.5 px-2 text-[var(--text-dim)] font-mono">{p.hold_days}일</td>
                    <td className="text-left py-2.5 px-2 text-[var(--text-muted)] text-xs max-w-[200px] truncate">{p.catalyst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── ETF 추천 ── */}
      {data.etf_picks?.length > 0 && (
        <section>
          <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">ETF 추천</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
                  <th className="text-left py-2 px-2">ETF</th>
                  <th className="text-center py-2 px-2">카테고리</th>
                  <th className="text-center py-2 px-2">시그널</th>
                  <th className="text-right py-2 px-2">진입</th>
                  <th className="text-right py-2 px-2">손절</th>
                  <th className="text-right py-2 px-2">목표</th>
                  <th className="text-right py-2 px-2">보유일</th>
                  <th className="text-left py-2 px-2">사유</th>
                </tr>
              </thead>
              <tbody>
                {data.etf_picks.map((e) => (
                  <tr key={e.code} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                    <td className="py-2.5 px-2">
                      <span className="text-[var(--text-primary)] font-medium">{e.name}</span>
                      <span className="text-[var(--text-muted)] text-xs ml-1.5">{e.code}</span>
                    </td>
                    <td className="text-center py-2.5 px-2 text-[var(--text-dim)] text-xs">{e.category}</td>
                    <td className="text-center py-2.5 px-2">
                      <span className="text-xs px-2 py-0.5 rounded border border-green-200 bg-green-50 text-[var(--green)]">{e.signal}</span>
                    </td>
                    <td className="text-right py-2.5 px-2 text-[var(--text-primary)] font-mono">{e.entry?.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 text-[var(--down)] font-mono">{e.sl?.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 text-[var(--up)] font-mono">{e.tp?.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 text-[var(--text-dim)] font-mono">{e.holding_days}일</td>
                    <td className="text-left py-2.5 px-2 text-[var(--text-muted)] text-xs max-w-[200px] truncate">{e.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── 워치리스트 ── */}
      {data.watchlist?.length > 0 && (
        <section>
          <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">워치리스트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.watchlist.map((w) => (
              <div key={w.code} className="rounded-lg border border-[var(--border)] bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[var(--text-primary)] font-medium">{w.name} <span className="text-[var(--text-muted)] text-xs">{w.code}</span></span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${gradeStyle(w.grade)}`}>{w.grade}</span>
                </div>
                <p className="text-[var(--text-muted)] text-xs">{w.reason}</p>
                {w.trigger && <p className="text-[var(--yellow)] text-xs mt-1">트리거: {w.trigger}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── NXT 야간매매 ── */}
      {data.nxt_signal_text && (
        <section>
          <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">NXT 야간매매</h2>
          <div className="rounded-lg border border-[var(--border)] bg-gray-50 p-5">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-2xl">{data.nxt_signal}</span>
              <span className="text-[var(--text-primary)] text-lg font-bold">{data.nxt_signal_text}</span>
              <span className={`font-mono font-bold ${data.nxt_score >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                {data.nxt_score >= 0 ? '+' : ''}{data.nxt_score.toFixed(1)}
              </span>
            </div>
            {data.nxt_reason && <p className="text-[var(--text-dim)] text-sm mb-3">{data.nxt_reason}</p>}
            {data.nxt_targets?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {data.nxt_targets.map((t) => (
                  <div key={t.code} className="rounded border border-[var(--border)] bg-gray-50 p-2.5">
                    <p className="text-[var(--text-primary)] text-sm font-medium">{t.name}</p>
                    <p className="text-[var(--text-muted)] text-xs">{t.sector} · {t.tier}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 분석 보고서 ── */}
      {data.analysis && Object.keys(data.analysis).length > 0 && (
        <section>
          <h2 className="text-[var(--text-primary)] text-lg font-bold mb-3">분석 보고서</h2>
          <div className="space-y-3">
            {Object.entries(data.analysis).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-[var(--border)] bg-gray-50 p-4">
                <p className="text-[var(--text-dim)] text-xs font-bold mb-1">{formatAnalysisKey(key)}</p>
                <p className="text-[var(--text-primary)] text-sm whitespace-pre-wrap">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 마켓 코멘트 ── */}
      {data.market_comment && (
        <section className="pb-8">
          <div className="rounded-lg border border-[var(--border)] bg-gray-50 p-5">
            <p className="text-[var(--text-dim)] text-xs mb-2">마켓 코멘트</p>
            <p className="text-[var(--text-primary)] text-sm whitespace-pre-wrap">{data.market_comment}</p>
          </div>
        </section>
      )}
    </div>
  )
}

/* ── 헬퍼 컴포넌트 ── */
function AllocCard({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-gray-50 p-3 text-center">
      <p className="text-[var(--text-muted)] text-xs">{label}</p>
      <p className={`${color} text-xl font-bold font-mono mt-1`}>{pct}%</p>
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-gray-50 p-3 text-center">
      <p className="text-[var(--text-muted)] text-xs">{label}</p>
      <p className={`${color} text-lg font-bold font-mono mt-1`}>{value}</p>
    </div>
  )
}

function SensorCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-gray-50 p-4">
      <p className="text-[var(--text-muted)] text-xs">{label}</p>
      <p className={`${color} text-xl font-bold font-mono mt-1`}>{value}</p>
      {sub && <p className={`${color} text-xs mt-0.5`}>{sub}</p>}
    </div>
  )
}

function gradeStyle(grade: string): string {
  if (grade === 'S' || grade === 'A+') return 'bg-red-50 border-red-200 text-[var(--up)]'
  if (grade === 'A') return 'bg-orange-50 border-orange-200 text-orange-600'
  if (grade === 'B+' || grade === 'B') return 'bg-yellow-50 border-yellow-200 text-[var(--yellow)]'
  return 'bg-gray-50 border-[var(--border)] text-[var(--text-dim)]'
}

function formatAnalysisKey(key: string): string {
  const map: Record<string, string> = {
    macro_summary: '매크로 요약',
    commodity_summary: '원자재 요약',
    sector_summary: '섹터 요약',
    flow_summary: '수급 요약',
    risk_summary: '리스크 요약',
  }
  return map[key] ?? key
}
