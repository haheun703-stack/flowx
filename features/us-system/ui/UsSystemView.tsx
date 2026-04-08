'use client'

import { useEffect, useState } from 'react'

/* ── 야간 필터 타입 ── */
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

/* ── 퀀트 매크로 타입 ── */
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

/* ── 모드 색상 ── */
function modeStyle(mode: string | null) {
  switch (mode) {
    case 'HALT': case 'BEAR_CASH':
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' }
    case 'DEFENSIVE': case 'BEAR_DEFENSIVE':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' }
    case 'AGGRESSIVE': case 'BULL_AGGRESSIVE':
      return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' }
    case 'BULL_NORMAL':
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' }
    default:
      return { bg: '#F5F4F0', text: '#1A1A2E', border: '#E8E6E0' }
  }
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

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
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
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* ═══ 헤더 ═══ */}
      <div className="bg-white rounded-xl border-2 border-[#00FF88] px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-[var(--text-primary)] font-mono tracking-wide">
              US SYSTEM
            </h2>
            <p className="text-[11px] text-[var(--text-dim)] font-mono mt-0.5">
              미국장 야간 분석 → 한국장 진입 전략 자동 결정
            </p>
          </div>
          <div className="flex items-center gap-3">
            {overnight && (
              <span
                className="text-[13px] font-bold px-3 py-1.5 rounded-lg"
                style={modeStyle(overnight.mode)}
              >
                단타 {overnight.mode ?? '—'}
              </span>
            )}
            {quant && (
              <span
                className="text-[13px] font-bold px-3 py-1.5 rounded-lg"
                style={modeStyle(quant.mode)}
              >
                퀀트 {quant.mode ?? '—'}
              </span>
            )}
            <span className="text-[12px] text-[var(--text-dim)] font-mono">
              {overnight?.date ?? quant?.date ?? ''}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ 단타봇 야간 필터 ═══ */}
      {overnight && (
        <section className="bg-white rounded-xl border border-[var(--border)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇺🇸</span>
              <h2 className="text-[17px] font-bold text-[#1A1A2E]">야간 필터 (단타봇)</h2>
              <span
                className="text-[13px] font-bold px-2.5 py-1 rounded-full"
                style={modeStyle(overnight.mode)}
              >
                {overnight.mode ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-[#6B7280] font-mono">
              <span>갭: {overnight.gap_signal} ({overnight.gap_est_pct != null ? `${overnight.gap_est_pct >= 0 ? '+' : ''}${overnight.gap_est_pct.toFixed(2)}%` : '—'})</span>
              <span>위험: {overnight.risk_level ?? '—'}/5</span>
            </div>
          </div>

          {/* 지표 4개 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[
              { label: '나스닥', val: overnight.nasdaq_change, pct: true },
              { label: 'SOXX', val: overnight.soxx_change, pct: true },
              { label: 'VIX', val: overnight.vix, raw: true },
              { label: 'DXY', val: overnight.dxy, raw: true },
            ].map(({ label, val, pct, raw }) => (
              <div key={label} className="bg-[#F5F4F0] rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-[#6B7280] font-mono">{label}</div>
                <div
                  className="text-[16px] font-mono font-bold"
                  style={{
                    color: raw
                      ? (label === 'VIX' && val != null && val >= 25 ? '#F59E0B' : '#1A1A2E')
                      : val == null ? '#9CA3AF'
                      : val >= 0 ? '#dc2626' : '#2563eb',
                  }}
                >
                  {val == null ? '—' : pct ? `${val >= 0 ? '+' : ''}${val.toFixed(2)}%` : val.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Fear & Greed + 위험 플래그 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-[#F5F4F0] rounded-lg px-4 py-3">
              <div className="text-[10px] text-[#6B7280] font-mono mb-1">Fear & Greed</div>
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-mono font-bold text-[#1A1A2E]">
                  {overnight.fear_greed ?? '—'}
                </span>
                <span className="text-[12px] font-mono text-[#6B7280]">
                  {overnight.fear_greed_label ?? ''}
                </span>
              </div>
            </div>
            <div className="bg-[#F5F4F0] rounded-lg px-4 py-3">
              <div className="text-[10px] text-[#6B7280] font-mono mb-1">위험 플래그</div>
              {overnight.risk_flags?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {overnight.risk_flags.map((f, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-50 text-[#DC2626] border border-red-100">
                      {f}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] font-mono text-[#16A34A]">특이 위험 없음</span>
              )}
            </div>
          </div>

          {/* 긍정/부정 + 릴레이 + 섹터 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {overnight.reasons_good?.length > 0 && (
              <div>
                <div className="text-[10px] text-[#16A34A] font-mono font-bold mb-1">긍정 요인</div>
                <div className="space-y-1">
                  {overnight.reasons_good.map((r, i) => (
                    <div key={i} className="text-[11px] font-mono text-[#1A1A2E] px-2 py-1.5 rounded bg-green-50 border border-green-100">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {overnight.reasons_bad?.length > 0 && (
              <div>
                <div className="text-[10px] text-[#DC2626] font-mono font-bold mb-1">부정 요인</div>
                <div className="space-y-1">
                  {overnight.reasons_bad.map((r, i) => (
                    <div key={i} className="text-[11px] font-mono text-[#1A1A2E] px-2 py-1.5 rounded bg-red-50 border border-red-100">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              {overnight.relay_picks?.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] text-[#2563EB] font-mono font-bold mb-1">릴레이 종목</div>
                  {overnight.relay_picks.map((p, i) => (
                    <div key={i} className="text-[11px] font-mono text-[#1A1A2E] px-2 py-1.5 rounded bg-blue-50 border border-blue-100 mb-1">
                      {p.name}{p.reason ? ` — ${p.reason}` : ''}
                    </div>
                  ))}
                </div>
              )}
              {overnight.watch_sectors?.length > 0 && (
                <div className="mb-1">
                  <span className="text-[10px] text-[#16A34A] font-mono font-bold">주목 섹터: </span>
                  <span className="text-[11px] font-mono text-[#1A1A2E]">{overnight.watch_sectors.join(', ')}</span>
                </div>
              )}
              {overnight.avoid_sectors?.length > 0 && (
                <div>
                  <span className="text-[10px] text-[#DC2626] font-mono font-bold">회피 섹터: </span>
                  <span className="text-[11px] font-mono text-[#1A1A2E]">{overnight.avoid_sectors.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {overnight.kr_impact && (
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <div className="text-[10px] text-[#6B7280] font-mono font-bold mb-1">한국장 영향 요약</div>
              <div className="text-[11px] font-mono text-[#1A1A2E] leading-relaxed">{overnight.kr_impact}</div>
            </div>
          )}
        </section>
      )}

      {/* ═══ 퀀트봇 매크로 필터 ═══ */}
      {quant && (
        <section className="bg-white rounded-xl border border-[var(--border)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h2 className="text-[17px] font-bold text-[#1A1A2E]">매크로 필터 (퀀트봇)</h2>
              <span
                className="text-[13px] font-bold px-2.5 py-1 rounded-full"
                style={modeStyle(quant.mode)}
              >
                {quant.mode ?? '—'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-[#6B7280] font-mono">
              <span>점수: {quant.score ?? '—'}/100</span>
              <span>슬롯: {quant.slots ?? '—'}개</span>
              <span>보유: {quant.hold_days_min ?? '—'}~{quant.hold_days_max ?? '—'}일</span>
            </div>
          </div>

          {quant.summary && (
            <div className="text-[12px] font-mono text-[#1A1A2E] leading-relaxed bg-[#F5F4F0] rounded-lg px-4 py-3">
              {quant.summary}
            </div>
          )}
        </section>
      )}

      {/* 퀀트 매크로 데이터 없을 때 */}
      {!quant && (
        <div className="bg-[#F5F4F0] rounded-xl border border-dashed border-[#E8E6E0] px-5 py-6 text-center">
          <div className="text-[13px] text-[#6B7280] font-mono">
            퀀트 매크로 필터 — quant_us_macro 테이블 준비 중
          </div>
          <div className="text-[11px] text-[#9CA3AF] font-mono mt-1">
            Supabase DDL 실행 후 자동 표시됩니다
          </div>
        </div>
      )}
    </div>
  )
}
