'use client'

import type { AlphaCandidate } from './alpha-types'

/* ── 상수 ── */

const GRADE_STYLE: Record<string, { color: string; border: string; label: string }> = {
  GOLD:   { color: '#B8860B', border: '#FFD700', label: 'GOLD' },
  SILVER: { color: '#71717A', border: '#C0C0C0', label: 'SILVER' },
  BRONZE: { color: '#92400E', border: '#CD7F32', label: 'BRONZE' },
}

const SCORE_AXES = [
  { key: 'value' as const, label: '가치', max: 30, color: '#D97706' },
  { key: 'quality' as const, label: '품질', max: 25, color: '#2563EB' },
  { key: 'earnings' as const, label: '실적', max: 20, color: '#16A34A' },
  { key: 'drawdown' as const, label: '낙폭', max: 15, color: '#EA580C' },
  { key: 'peer_value' as const, label: '동종비교', max: 10, color: '#7C3AED' },
]

const EARNINGS_KR: Record<string, { label: string; color: string }> = {
  ACCELERATING:  { label: '가속 성장', color: '#16A34A' },
  STABLE:        { label: '안정', color: '#2563EB' },
  DETERIORATING: { label: '악화', color: '#DC2626' },
}

/* ── 유틸 ── */

function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

function fmtCap(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`
  return `${v.toLocaleString()}억`
}

function supplyLabel(type: string): string {
  if (type === 'DUAL_INFLOW') return '쌍끌이수급'
  if (type.includes('외인')) return '외인수급'
  if (type.includes('기관')) return '기관수급'
  return '수급'
}

/* ── 컴포넌트 ── */

export default function AlphaScannerCard({ c, rank }: { c: AlphaCandidate; rank: number }) {
  const g = GRADE_STYLE[c.grade] ?? GRADE_STYLE.BRONZE
  const ev = EARNINGS_KR[c.earnings_verdict] ?? { label: c.earnings_verdict, color: '#6B7280' }
  const rankIcon = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : null

  /* target_levels: 가격 내림차순 */
  const targets = [...(c.target_levels ?? [])].sort((a, b) => b.price - a.price)

  /* 가격 방법론 태그 */
  const tags: string[] = []
  const pm = c.price_methods ?? {}
  if (pm.intrinsic) tags.push('DCF/RIM')
  if (pm.sector_per) tags.push('섹터PER')
  if (pm.recovery_52w) tags.push('52주회복')
  if (pm.supply_boost) tags.push(supplyLabel(pm.supply_boost.type))
  if (pm.atr) tags.push('ATR')
  if (pm.fibonacci) tags.push('피보나치')

  /* 피보나치 바 */
  const fibRange = c.high_252 - c.low_252
  const pricePctOnFib = fibRange > 0 ? ((c.close - c.low_252) / fibRange) * 100 : 50
  const fib = pm.fibonacci

  return (
    <div
      className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: g.border }}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-4 pb-3 border-b border-[#E8E6E0]">
        <div className="flex items-center gap-3 mb-1">
          {rankIcon && <span className="text-[20px]">{rankIcon}</span>}
          <span
            className="text-[13px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: g.color, backgroundColor: `${g.border}20` }}
          >
            {g.label}
          </span>
          <span className="text-[15px] font-bold text-[#1A1A2E]">
            {c.total_score.toFixed(1)}점
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[17px] font-bold text-[#1A1A2E]">{c.name}</span>
          <span className="text-[13px] text-[#9CA3AF]">({c.ticker})</span>
          <span className="text-[13px] text-[#6B7280]">섹터: {c.sector}</span>
          <span className="text-[13px] text-[#6B7280]">시총: {fmtCap(c.market_cap_억)}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 좌: 5축 점수 */}
          <div>
            <p className="text-[13px] font-bold text-[#6B7280] mb-3">5축 점수</p>
            <div className="space-y-2">
              {SCORE_AXES.map(({ key, label, max, color }) => {
                const val = c.scores?.[key] ?? 0
                const pct = Math.min((val / max) * 100, 100)
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[13px] text-[#1A1A2E] w-[60px] shrink-0">{label}</span>
                    <div className="flex-1 h-4 bg-[#F5F4F0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <span
                      className="text-[12px] font-bold tabular-nums w-[52px] text-right"
                      style={{ color }}
                    >
                      {val.toFixed(1)}/{max}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 우: 가격 레벨 (역산 엔진) */}
          <div>
            <p className="text-[13px] font-bold text-[#6B7280] mb-3">가격 레벨 (역산 엔진)</p>
            <div className="space-y-1.5 text-[13px]">
              {/* 목표가 (내림차순) */}
              {targets.map((t, i) => {
                const pct = ((t.price - c.close) / c.close) * 100
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[#6B7280] w-[60px] shrink-0">
                      {targets.length - i}차 목표
                    </span>
                    <span className="font-bold text-[#1A1A2E] tabular-nums flex-1">
                      {fmtPrice(t.price)}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF] truncate max-w-[80px]">
                      ({t.label})
                    </span>
                    <span className="font-bold text-[#16A34A] tabular-nums w-[52px] text-right">
                      +{pct.toFixed(1)}%
                    </span>
                  </div>
                )
              })}

              {/* 현재가 */}
              <div className="flex items-center gap-2 py-1 px-2 bg-[#F5F4F0] rounded-lg">
                <span className="text-[#1A1A2E] font-bold">← 현재가</span>
                <span className="font-bold text-[#1A1A2E] tabular-nums">
                  {fmtPrice(c.close)}
                </span>
              </div>

              {/* 진입가 */}
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280] w-[60px] shrink-0">진입가</span>
                <span className="font-bold text-[#1A1A2E] tabular-nums flex-1">
                  {fmtPrice(c.entry_price)}
                </span>
                <span className="text-[11px] text-[#9CA3AF]" />
                <span className="font-bold text-[#DC2626] tabular-nums w-[52px] text-right">
                  {(((c.entry_price - c.close) / c.close) * 100).toFixed(1)}%
                </span>
              </div>

              {/* 손절가 */}
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280] w-[60px] shrink-0">손절가</span>
                <span className="font-bold text-[#DC2626] tabular-nums flex-1">
                  {fmtPrice(c.stop_loss)}
                </span>
                <span className="text-[11px] text-[#9CA3AF]" />
                <span className="font-bold text-[#DC2626] tabular-nums w-[52px] text-right">
                  {(((c.stop_loss - c.close) / c.close) * 100).toFixed(1)}%
                </span>
              </div>

              {/* 손익비 */}
              <div className="font-bold text-[#1A1A2E] pt-1">
                손익비 R:R = 1:{c.rr_ratio.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* ── 피보나치 위치 바 (구간별 색상) ── */}
        {fibRange > 0 && (() => {
          const f382Pct = fib ? ((fib.fib_382 - c.low_252) / fibRange) * 100 : 38.2
          const f618Pct = fib ? ((fib.fib_618 - c.low_252) / fibRange) * 100 : 61.8
          const curPct = Math.max(Math.min(pricePctOnFib, 97), 3)

          return (
            <div className="mt-4">
              <p className="text-[12px] text-[#6B7280] mb-2">피보나치 위치</p>

              {/* 바 본체 */}
              <div className="relative h-6 rounded-full overflow-hidden flex">
                {/* 위험 구간: 52주저 ~ 0.382 */}
                <div
                  className="h-full"
                  style={{ width: `${f382Pct}%`, backgroundColor: '#FEE2E2' }}
                />
                {/* 중립 구간: 0.382 ~ 0.618 */}
                <div
                  className="h-full"
                  style={{ width: `${f618Pct - f382Pct}%`, backgroundColor: '#FEF9C3' }}
                />
                {/* 안전 구간: 0.618 ~ 52주고 */}
                <div
                  className="h-full"
                  style={{ width: `${100 - f618Pct}%`, backgroundColor: '#DCFCE7' }}
                />

                {/* 0.382 구획선 */}
                <div
                  className="absolute top-0 h-full w-[2px] bg-[#DC2626]/40"
                  style={{ left: `${f382Pct}%` }}
                />
                {/* 0.618 구획선 */}
                <div
                  className="absolute top-0 h-full w-[2px] bg-[#16A34A]/40"
                  style={{ left: `${f618Pct}%` }}
                />

                {/* 현재가 마커 */}
                <div
                  className="absolute top-1/2 w-[12px] h-[12px] rounded-full bg-[#1A1A2E] border-2 border-white shadow"
                  style={{ left: `${curPct}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>

              {/* 라벨 행 */}
              <div className="relative h-5 mt-1 text-[11px]">
                <span className="absolute left-0 text-[#9CA3AF]">
                  {fmtPrice(c.low_252)}
                </span>
                <span
                  className="absolute text-[#DC2626] font-bold -translate-x-1/2"
                  style={{ left: `${f382Pct}%` }}
                >
                  0.382
                </span>
                <span
                  className="absolute text-[#1A1A2E] font-bold -translate-x-1/2 -top-[18px]"
                  style={{ left: `${curPct}%` }}
                >
                  ▼{fmtPrice(c.close)}
                </span>
                <span
                  className="absolute text-[#16A34A] font-bold -translate-x-1/2"
                  style={{ left: `${f618Pct}%` }}
                >
                  0.618
                </span>
                <span className="absolute right-0 text-[#9CA3AF]">
                  {fmtPrice(c.high_252)}
                </span>
              </div>
            </div>
          )
        })()}

        {/* ── 태그 (가격 방법론) ── */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((t) => (
              <span
                key={t}
                className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F5F4F0] text-[#6B7280]"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* ── 펀더멘탈 ── */}
        <div className="flex flex-wrap gap-4 mt-3 text-[13px]">
          <span className="text-[#6B7280]">
            PER <strong className="text-[#1A1A2E]">{c.per.toFixed(1)}</strong>
          </span>
          <span className="text-[#6B7280]">
            PBR <strong className="text-[#1A1A2E]">{c.pbr.toFixed(1)}</strong>
          </span>
          <span className="text-[#6B7280]">
            배당 <strong className="text-[#1A1A2E]">{c.div_yield.toFixed(1)}%</strong>
          </span>
          {c.op_margin_pct != null && (
            <span className="text-[#6B7280]">
              영업이익률 <strong className="text-[#1A1A2E]">{c.op_margin_pct.toFixed(1)}%</strong>
            </span>
          )}
        </div>

        {/* ── 실적 + 동종 할인 ── */}
        <div className="flex flex-wrap gap-4 mt-1 text-[13px]">
          <span className="text-[#6B7280]">
            실적: <strong style={{ color: ev.color }}>{ev.label}</strong>
          </span>
          {c.peer_discount_pct !== 0 && (
            <span className="text-[#6B7280]">
              업종 대비{' '}
              <strong className="text-[#2563EB]">
                {Math.abs(c.peer_discount_pct).toFixed(1)}% 할인
              </strong>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
