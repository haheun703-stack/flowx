'use client'

import { useEffect, useState, useMemo } from 'react'

/* ── 타입 ── */
interface UsOvernight {
  date: string
  mode: string | null
  gap_signal: string | null
  gap_est_pct: number | null
  risk_level: number | null
  risk_score: number | null
  watch_sectors: string[]
  avoid_sectors: string[]
  relay_picks: { name: string; ticker?: string; reason?: string }[]
  reasons_bad: string[]
  reasons_good: string[]
  reason: string | null
  nasdaq_change: number | null
  soxx_change: number | null
  vix: number | null
  dxy: number | null
  fear_greed: number | null
  fear_greed_label: string | null
  kr_impact: string | null
  risk_flags: string[]
}

interface UsQuant {
  date: string
  mode: string | null
  score: number | null
  slots: number | null
  hold_days_min: number | null
  hold_days_max: number | null
  indicators: Record<string, unknown> | null
  sector_boost: Record<string, unknown> | null
  summary: string | null
}

/* ── 모드 설정 ── */
const MODE_CONFIG: Record<string, { bg: string; text: string; border: string; glow: string; label: string }> = {
  HALT:             { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', glow: 'rgba(220,38,38,0.15)', label: '거래 중지' },
  BEAR_CASH:        { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', glow: 'rgba(220,38,38,0.15)', label: '현금 비중↑' },
  DEFENSIVE:        { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', glow: 'rgba(217,119,6,0.12)', label: '방어적' },
  BEAR_DEFENSIVE:   { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', glow: 'rgba(217,119,6,0.12)', label: '약세 방어' },
  AGGRESSIVE:       { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', glow: 'rgba(22,163,74,0.12)', label: '공격적' },
  BULL_AGGRESSIVE:  { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0', glow: 'rgba(22,163,74,0.12)', label: '강세 공격' },
  BULL_NORMAL:      { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', glow: 'rgba(5,150,105,0.12)', label: '강세 표준' },
}

function getModeConfig(mode: string | null) {
  if (!mode) return { bg: '#F5F4F0', text: '#1A1A2E', border: '#E8E6E0', glow: 'transparent', label: '—' }
  return MODE_CONFIG[mode] ?? { bg: '#F5F4F0', text: '#1A1A2E', border: '#E8E6E0', glow: 'transparent', label: mode }
}

/* ── 리스크 미터 (5칸) ── */
function RiskMeter({ level }: { level: number | null }) {
  const lv = level ?? 0
  const colors = ['#16A34A', '#84CC16', '#EAB308', '#F97316', '#DC2626']
  return (
    <div className="flex items-center gap-1">
      {colors.map((c, i) => (
        <div
          key={i}
          className="rounded-sm transition-all"
          style={{
            width: 18, height: 8 + i * 3,
            background: i < lv ? c : '#E5E7EB',
            opacity: i < lv ? 1 : 0.3,
          }}
        />
      ))}
      <span className="text-[12px] font-mono font-bold ml-1.5" style={{ color: colors[Math.max(0, lv - 1)] }}>
        {lv}/5
      </span>
    </div>
  )
}

/* ── Fear & Greed 게이지 ── */
function FearGauge({ score, label }: { score: number | null; label: string | null }) {
  if (score == null) return null
  const color =
    score <= 20 ? '#DC2626' :
    score <= 40 ? '#F59E0B' :
    score <= 60 ? '#6B7280' :
    score <= 75 ? '#16A34A' : '#059669'

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-4 shadow-sm">
      <div className="text-[10px] text-[var(--text-dim)] font-mono tracking-wider uppercase mb-3">
        Fear & Greed Index
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-[32px] font-mono font-bold leading-none" style={{ color }}>{score}</span>
        <span className="text-[12px] text-[var(--text-muted)] mb-1 font-mono">/ 100</span>
      </div>
      <div
        className="relative h-2.5 rounded-full overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #DC2626 0%, #F59E0B 25%, #9CA3AF 50%, #16A34A 75%, #059669 100%)' }}
      >
        <div
          className="absolute top-0 w-3 h-2.5 bg-white rounded-full shadow-lg border border-gray-300"
          style={{ left: `calc(${score}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[9px] font-mono text-[var(--text-dim)]">
        <span>극도 공포</span><span>공포</span><span>중립</span><span>탐욕</span><span>극도 탐욕</span>
      </div>
      <div className="mt-2 text-[12px] font-bold font-mono" style={{ color }}>{label ?? '—'}</div>
    </div>
  )
}

/* ── 지표 카드 ── */
function MetricCard({ label, value, suffix, positive }: {
  label: string; value: number | null; suffix?: string; positive?: 'up' | 'down' | null
}) {
  const color = positive === 'up' ? '#dc2626' : positive === 'down' ? '#2563eb' : '#1A1A2E'
  const arrow = positive === 'up' ? '▲' : positive === 'down' ? '▼' : ''
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-3 shadow-sm text-center">
      <div className="text-[10px] text-[var(--text-dim)] font-mono tracking-wider uppercase mb-1">{label}</div>
      <div className="text-[20px] font-mono font-bold" style={{ color }}>
        {value == null ? '—' : (
          <>
            <span className="text-[14px] mr-0.5">{arrow}</span>
            {suffix === '%' ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%` : value.toFixed(2)}
          </>
        )}
      </div>
    </div>
  )
}

/* ── 퀀트 스코어 게이지 (반원) ── */
function ScoreGauge({ score }: { score: number | null }) {
  const s = score ?? 0
  const color =
    s >= 70 ? '#16A34A' :
    s >= 40 ? '#EAB308' : '#DC2626'
  const angle = (s / 100) * 180
  const rad = (angle * Math.PI) / 180
  const cx = 100, cy = 90, r = 70
  const x = cx + r * Math.cos(Math.PI - rad)
  const y = cy - r * Math.sin(Math.PI - rad)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-[180px]">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="40%" stopColor="#EAB308" />
            <stop offset="70%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {/* 배경 반원 */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round"
        />
        {/* 값 반원 */}
        {s > 0 && (
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${angle > 90 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)}`}
            fill="none" stroke="url(#scoreGrad)" strokeWidth="12" strokeLinecap="round"
          />
        )}
        {/* 포인터 */}
        <circle cx={x} cy={y} r="6" fill="white" stroke={color} strokeWidth="3" />
        {/* 중앙 값 */}
        <text x={cx} y={cy - 10} textAnchor="middle" className="text-[28px] font-mono font-bold" fill={color}>
          {s}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" className="text-[11px] font-mono" fill="#9CA3AF">
          / 100
        </text>
      </svg>
    </div>
  )
}

/* ── 갭 시그널 뱃지 ── */
function GapBadge({ signal, pct }: { signal: string | null; pct: number | null }) {
  if (!signal) return null
  const isUp = signal.includes('UP') || (pct != null && pct > 0)
  const isDown = signal.includes('DOWN') || (pct != null && pct < 0)
  const color = isUp ? '#dc2626' : isDown ? '#2563eb' : '#6B7280'
  const bg = isUp ? '#FEF2F2' : isDown ? '#EFF6FF' : '#F5F4F0'
  const arrow = isUp ? '↑' : isDown ? '↓' : '→'

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-mono font-bold"
      style={{ background: bg, color, border: `1px solid ${color}20` }}
    >
      <span className="text-[16px]">{arrow}</span>
      <span>{signal}</span>
      {pct != null && (
        <span className="text-[11px] font-normal opacity-80">
          ({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)
        </span>
      )}
    </div>
  )
}

export function UsSystemView() {
  const [overnight, setOvernight] = useState<UsOvernight | null>(null)
  const [quant, setQuant] = useState<UsQuant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      const [ovRes, qRes] = await Promise.allSettled([
        fetch('/api/us-overnight', { signal: controller.signal }),
        fetch('/api/us-quant-macro', { signal: controller.signal }),
      ])
      if (ovRes.status === 'fulfilled' && ovRes.value.ok) {
        const json = await ovRes.value.json()
        if (json.date) setOvernight(json)
      }
      if (qRes.status === 'fulfilled' && qRes.value.ok) {
        const json = await qRes.value.json()
        if (json.date) setQuant(json)
      }
      setLoading(false)
    })()
    return () => controller.abort()
  }, [])

  const ovMode = useMemo(() => getModeConfig(overnight?.mode ?? null), [overnight?.mode])
  const qMode = useMemo(() => getModeConfig(quant?.mode ?? null), [quant?.mode])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-32" />
        ))}
      </div>
    )
  }

  if (!overnight && !quant) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-10 text-center">
        <div className="text-[var(--text-muted)] text-sm font-mono">
          미국 시스템 데이터 없음 (매일 08:05~08:10 자동 갱신)
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

      {/* ═══ 히어로 헤더: 모드 2칸 나란히 ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 단타 모드 */}
        {overnight && (
          <div
            className="relative rounded-xl p-5 overflow-hidden"
            style={{
              background: ovMode.bg,
              border: `2px solid ${ovMode.border}`,
              boxShadow: `0 0 24px ${ovMode.glow}`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[10px] font-mono text-[var(--text-dim)] tracking-wider uppercase">
                  단타봇 · 야간 필터
                </div>
                <div className="text-[28px] font-mono font-black mt-1" style={{ color: ovMode.text }}>
                  {overnight.mode ?? '—'}
                </div>
                <div className="text-[11px] font-mono mt-0.5" style={{ color: ovMode.text, opacity: 0.7 }}>
                  {ovMode.label}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[11px] font-mono text-[var(--text-dim)]">{overnight.date}</span>
                <GapBadge signal={overnight.gap_signal} pct={overnight.gap_est_pct} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <RiskMeter level={overnight.risk_level} />
              {overnight.risk_score != null && (
                <span className="text-[11px] font-mono text-[var(--text-dim)]">
                  위험점수: <b className="text-[var(--text-primary)]">{overnight.risk_score}</b>
                </span>
              )}
            </div>
          </div>
        )}

        {/* 퀀트 모드 */}
        {quant && (
          <div
            className="relative rounded-xl p-5 overflow-hidden"
            style={{
              background: qMode.bg,
              border: `2px solid ${qMode.border}`,
              boxShadow: `0 0 24px ${qMode.glow}`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[10px] font-mono text-[var(--text-dim)] tracking-wider uppercase">
                  퀀트봇 · 매크로 필터
                </div>
                <div className="text-[28px] font-mono font-black mt-1" style={{ color: qMode.text }}>
                  {quant.mode ?? '—'}
                </div>
                <div className="text-[11px] font-mono mt-0.5" style={{ color: qMode.text, opacity: 0.7 }}>
                  {qMode.label}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[11px] font-mono text-[var(--text-dim)]">{quant.date}</span>
                <div className="flex items-center gap-2 text-[12px] font-mono">
                  <span className="text-[var(--text-dim)]">슬롯</span>
                  <span className="font-bold text-[var(--text-primary)]">{quant.slots ?? '—'}개</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ScoreGauge score={quant.score} />
              {(quant.hold_days_min != null || quant.hold_days_max != null) && (
                <div className="text-[11px] font-mono text-[var(--text-dim)]">
                  보유기간: <b className="text-[var(--text-primary)]">{quant.hold_days_min ?? '—'}~{quant.hold_days_max ?? '—'}일</b>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 퀀트 없을 때 빈칸 */}
        {!quant && overnight && (
          <div className="rounded-xl border-2 border-dashed border-[#E8E6E0] flex items-center justify-center p-5">
            <div className="text-center">
              <div className="text-[13px] text-[#9CA3AF] font-mono">퀀트 매크로 필터</div>
              <div className="text-[11px] text-[#C0BDB5] font-mono mt-1">quant_us_macro 테이블 준비 중</div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ 단타봇 상세 영역 ═══ */}
      {overnight && (
        <>
          {/* 지표 카드 4개 + Fear&Greed */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MetricCard
              label="나스닥"
              value={overnight.nasdaq_change}
              suffix="%"
              positive={overnight.nasdaq_change == null ? null : overnight.nasdaq_change >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="SOXX"
              value={overnight.soxx_change}
              suffix="%"
              positive={overnight.soxx_change == null ? null : overnight.soxx_change >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="VIX"
              value={overnight.vix}
              positive={overnight.vix != null && overnight.vix >= 25 ? 'up' : null}
            />
            <MetricCard
              label="DXY"
              value={overnight.dxy}
            />
            <FearGauge score={overnight.fear_greed} label={overnight.fear_greed_label} />
          </div>

          {/* 위험 플래그 */}
          {overnight.risk_flags?.length > 0 && (
            <div className="bg-[#FEF2F2] rounded-xl border border-red-200 px-4 py-3 shadow-sm">
              <div className="text-[10px] text-[#DC2626] font-mono font-bold tracking-wider uppercase mb-2">
                위험 플래그
              </div>
              <div className="flex flex-wrap gap-1.5">
                {overnight.risk_flags.map((f, i) => (
                  <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white text-[#DC2626] border border-red-100 shadow-sm">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 긍정/부정 요인 + 릴레이/섹터 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 긍정 요인 */}
            {overnight.reasons_good?.length > 0 && (
              <div className="bg-white rounded-xl border border-[var(--border)] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
                  <span className="text-[11px] text-[#16A34A] font-mono font-bold tracking-wider uppercase">
                    긍정 요인
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-dim)] ml-auto">{overnight.reasons_good.length}건</span>
                </div>
                <div className="space-y-1.5">
                  {overnight.reasons_good.map((r, i) => (
                    <div key={i} className="text-[11px] font-mono text-[#1A1A2E] px-3 py-2 rounded-lg bg-[#F0FDF4] border border-green-100">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 부정 요인 */}
            {overnight.reasons_bad?.length > 0 && (
              <div className="bg-white rounded-xl border border-[var(--border)] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  <span className="text-[11px] text-[#DC2626] font-mono font-bold tracking-wider uppercase">
                    부정 요인
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-dim)] ml-auto">{overnight.reasons_bad.length}건</span>
                </div>
                <div className="space-y-1.5">
                  {overnight.reasons_bad.map((r, i) => (
                    <div key={i} className="text-[11px] font-mono text-[#1A1A2E] px-3 py-2 rounded-lg bg-[#FEF2F2] border border-red-100">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 릴레이 + 섹터 */}
            <div className="bg-white rounded-xl border border-[var(--border)] p-4 shadow-sm space-y-4">
              {overnight.relay_picks?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                    <span className="text-[11px] text-[#2563EB] font-mono font-bold tracking-wider uppercase">
                      릴레이 종목
                    </span>
                  </div>
                  {overnight.relay_picks.map((p, i) => (
                    <div key={i} className="text-[11px] font-mono text-[#1A1A2E] px-3 py-2 rounded-lg bg-[#EFF6FF] border border-blue-100 mb-1.5">
                      <span className="font-bold">{p.name}</span>
                      {p.reason && <span className="text-[var(--text-dim)]"> — {p.reason}</span>}
                    </div>
                  ))}
                </div>
              )}

              {overnight.watch_sectors?.length > 0 && (
                <div>
                  <span className="text-[10px] text-[#16A34A] font-mono font-bold tracking-wider uppercase">주목 섹터</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {overnight.watch_sectors.map((s, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] border border-green-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {overnight.avoid_sectors?.length > 0 && (
                <div>
                  <span className="text-[10px] text-[#DC2626] font-mono font-bold tracking-wider uppercase">회피 섹터</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {overnight.avoid_sectors.map((s, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] border border-red-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 한국장 영향 요약 */}
          {overnight.kr_impact && (
            <div className="bg-white rounded-xl border-l-4 border-l-[#00FF88] border border-[var(--border)] px-5 py-4 shadow-sm">
              <div className="text-[10px] text-[var(--text-dim)] font-mono font-bold tracking-wider uppercase mb-2">
                한국장 영향 요약
              </div>
              <div className="text-[12px] font-mono text-[#1A1A2E] leading-relaxed">
                {overnight.kr_impact}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ 퀀트봇 상세 영역 ═══ */}
      {quant?.summary && (
        <div className="bg-white rounded-xl border-l-4 border-l-[#0EA5E9] border border-[var(--border)] px-5 py-4 shadow-sm">
          <div className="text-[10px] text-[#0EA5E9] font-mono font-bold tracking-wider uppercase mb-2">
            퀀트 매크로 분석
          </div>
          <div className="text-[12px] font-mono text-[#1A1A2E] leading-relaxed">
            {quant.summary}
          </div>
        </div>
      )}
    </div>
  )
}
