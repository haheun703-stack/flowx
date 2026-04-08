'use client'

import type { UsMarketDaily } from '../types'

function YieldBar({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  if (value == null) return null
  const danger = value >= 4.5
  const warn = value >= 4.0 && value < 4.5
  const color = danger ? '#dc2626' : warn ? '#f59e0b' : '#16a34a'

  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
      <div className="flex items-center gap-2">
        {highlight && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#16a34a]">
            핵심
          </span>
        )}
        <span className="text-[12px] text-[var(--text-muted)] font-mono">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min((value / 6) * 100, 100)}%`, background: color }}
          />
        </div>
        <span className="text-[14px] font-mono font-semibold w-12 text-right" style={{ color }}>
          {value.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

function SpreadRow({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null
  const inverted = value < 0
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-[var(--text-dim)] font-mono">{label}</span>
      <span className="text-[12px] font-mono font-semibold" style={{ color: inverted ? '#dc2626' : '#16a34a' }}>
        {inverted && '⚠️ '}{value > 0 ? '+' : ''}{value.toFixed(3)}%
        {inverted && <span className="text-[10px] ml-1 text-[#dc2626]">역전</span>}
      </span>
    </div>
  )
}

function FearGauge({ score, label }: { score: number | null; label: string | null }) {
  if (score == null) return <div className="text-[var(--text-dim)] text-sm">데이터 없음</div>

  const color =
    score <= 20 ? '#dc2626' :
    score <= 40 ? '#f59e0b' :
    score <= 60 ? '#6B7280' :
    score <= 75 ? '#16a34a' :
                  '#059669'

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <span className="text-[36px] font-mono font-bold" style={{ color }}>{score}</span>
        <span className="text-[13px] text-[var(--text-muted)] mb-2">/ 100</span>
      </div>
      <div
        className="relative h-2.5 rounded-full overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #dc2626 0%, #f59e0b 25%, #9CA3AF 50%, #16a34a 75%, #059669 100%)' }}
      >
        <div
          className="absolute top-0 w-3 h-2.5 bg-white rounded-full shadow-lg border border-gray-300"
          style={{ left: `calc(${score}% - 6px)` }}
        />
      </div>
      <div className="text-[13px] font-semibold" style={{ color }}>{label ?? '—'}</div>
      <div className="text-[11px] text-[var(--text-dim)] font-mono">
        {score <= 20 && '극단 공포 → 과매도, 반등 주시'}
        {score > 20 && score <= 40 && '공포 구간 → 조심스러운 매수 기회'}
        {score > 40 && score <= 60 && '중립 → 방향성 확인 필요'}
        {score > 60 && score <= 75 && '탐욕 구간 → 차익실현 준비'}
        {score > 75 && '극단 탐욕 → 과매수, 조정 경계'}
      </div>
    </div>
  )
}

export function UsRatePanel({ data }: { data: UsMarketDaily }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 좌: 금리 패널 */}
      <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 space-y-1 shadow-sm">
        <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-3">
          미국 국채 금리
        </div>
        <YieldBar label="3년물 (핵심)" value={data.us_3y_yield} highlight />
        <YieldBar label="2년물" value={data.us_2y_yield} />
        <YieldBar label="10년물" value={data.us_10y_yield} />
        <div className="pt-2 space-y-0.5">
          <div className="text-[10px] text-[var(--text-dim)] font-mono mb-1.5">
            장단기 스프레드 (음수 = 경기침체 신호)
          </div>
          <SpreadRow label="3년-10년" value={data.spread_3y_10y} />
          <SpreadRow label="2년-10년" value={data.spread_2y_10y} />
        </div>
        {data.us_3y_yield != null && (
          <div className="mt-3 text-[10px] font-mono px-2 py-1.5 rounded bg-gray-50 text-[var(--text-dim)] border border-[var(--border)]">
            {data.us_3y_yield >= 4.5
              ? '⚠️ 고금리 지속 → 성장주 밸류에이션 부담, 외인 이탈 위험'
              : data.us_3y_yield >= 4.0
              ? '🟡 금리 주의 구간 → KOSPI 외인 수급 모니터링 필요'
              : '🟢 금리 안정 → 신흥국 자금 유입 환경 양호'}
          </div>
        )}
      </div>

      {/* 우: Fear & Greed */}
      <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 shadow-sm">
        <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-4">
          Fear &amp; Greed Index
        </div>
        <FearGauge score={data.fear_greed} label={data.fear_greed_label} />
        <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1.5">
          <div className="text-[10px] text-[var(--text-dim)] font-mono mb-1">기타 매크로</div>
          {[
            { label: 'WTI 유가', value: data.wti, suffix: '$' },
            { label: '금', value: data.gold, suffix: '$' },
            { label: 'DXY 달러', value: data.dxy, suffix: '' },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-[11px] text-[var(--text-dim)] font-mono">{label}</span>
              <span className="text-[12px] font-mono text-[var(--text-primary)]">
                {value != null ? `${suffix}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
