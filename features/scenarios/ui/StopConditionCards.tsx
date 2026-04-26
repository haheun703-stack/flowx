'use client'

import type { Beneficiary } from '../types'

// ─── 멈출 조건 카드 (인사이트 재설계) ───

interface StopConditionCardsProps {
  beneficiaries: Beneficiary[]
}

function extractStopConditions(beneficiaries: Beneficiary[]) {
  const seen = new Set<string>()
  const withStop: { name: string; beneficiary: string }[] = []
  const noStop: { beneficiary: string }[] = []

  for (const b of beneficiaries) {
    const condition = b.stop_condition?.trim()
    if (!condition || condition === '없음' || condition === '-') {
      noStop.push({ beneficiary: b.name })
      continue
    }
    if (seen.has(condition)) continue
    seen.add(condition)
    withStop.push({ name: condition, beneficiary: b.name })
  }

  return { withStop, noStop }
}

// ─── 위험도 게이지 ───

function DangerGauge({ total, noStopCount }: { total: number; noStopCount: number }) {
  // 멈출 조건 없는 비율이 높을수록 위험
  const dangerRatio = total > 0 ? noStopCount / total : 0
  const pct = Math.round(dangerRatio * 100)
  const level = pct >= 60 ? '극도 위험' : pct >= 40 ? '높은 위험' : pct >= 20 ? '주의' : '안전'
  const barColor = pct >= 60 ? '#DC2626' : pct >= 40 ? '#EA580C' : pct >= 20 ? '#D97706' : '#16A34A'
  const bgColor = pct >= 60 ? '#FEF2F2' : pct >= 40 ? '#FFF7ED' : pct >= 20 ? '#FFFBEB' : '#F0FDF4'

  return (
    <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: bgColor, border: `1px solid ${barColor}20` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[20px]">🛑</span>
          <span className="text-[15px] font-bold text-[#1A1A2E]">시나리오 장기화 위험도</span>
        </div>
        <span
          className="text-[13px] font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: barColor, color: '#FFF' }}
        >
          {level}
        </span>
      </div>

      {/* 게이지 바 */}
      <div className="relative h-5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: barColor }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold text-white drop-shadow">
            {noStopCount}/{total} 수혜자에 멈출 조건 없음
          </span>
        </div>
      </div>

      <p className="text-[11px] text-[#6B7280] mt-2 text-center">
        멈출 조건이 없는 수혜자가 많을수록 시나리오가 장기화될 가능성이 높습니다
      </p>
    </div>
  )
}

export default function StopConditionCards({ beneficiaries }: StopConditionCardsProps) {
  if (!beneficiaries?.length) return null

  const { withStop, noStop } = extractStopConditions(beneficiaries)
  if (withStop.length === 0 && noStop.length === 0) return null

  const total = beneficiaries.length

  return (
    <div>
      {/* ─── 위험도 게이지 ─── */}
      <DangerGauge total={total} noStopCount={noStop.length} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ─── 좌: 브레이크 없는 수혜자 (위험) ─── */}
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[16px]">🔴</span>
            <span className="text-[14px] font-bold" style={{ color: '#DC2626' }}>
              브레이크 없는 수혜자
            </span>
            <span className="text-[12px] font-bold px-2 py-0.5 rounded-full ml-auto"
              style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
              {noStop.length}명
            </span>
          </div>

          {noStop.length > 0 ? (
            <div className="space-y-2">
              {noStop.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2.5 shadow">
                  <span className="text-[14px]">⚠️</span>
                  <span className="text-[13px] font-bold text-[#1A1A2E]">{c.beneficiary}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto"
                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                    멈출 수 없음
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[#6B7280] text-center py-3">모든 수혜자에 멈출 조건이 있습니다</p>
          )}

          {noStop.length > 0 && (
            <p className="text-[11px] font-bold mt-3 text-center" style={{ color: '#DC2626' }}>
              이들의 이익 구조에 제동 장치가 없어 시나리오 장기화의 핵심 동력입니다
            </p>
          )}
        </div>

        {/* ─── 우: 아직 미충족인 멈출 조건 ─── */}
        <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[16px]">🟡</span>
            <span className="text-[14px] font-bold" style={{ color: '#92400E' }}>
              아직 미충족인 멈출 조건
            </span>
            <span className="text-[12px] font-bold px-2 py-0.5 rounded-full ml-auto"
              style={{ backgroundColor: '#FEF9C3', color: '#92400E' }}>
              {withStop.length}개
            </span>
          </div>

          {withStop.length > 0 ? (
            <div className="space-y-2">
              {withStop.map((c, i) => (
                <div key={i} className="bg-white rounded-lg px-3 py-2.5 shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#1A1A2E] leading-snug">{c.name}</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">관련: {c.beneficiary}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#FEF9C3', color: '#92400E' }}>
                      미충족
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[#6B7280] text-center py-3">멈출 조건 데이터가 없습니다</p>
          )}

          {withStop.length > 0 && (
            <p className="text-[11px] font-bold mt-3 text-center" style={{ color: '#92400E' }}>
              이 조건 중 하나라도 충족되면 시나리오 점수 하락 → 포지션 재검토
            </p>
          )}
        </div>
      </div>

      {/* ─── 하단 핵심 인사이트 ─── */}
      <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="flex items-start gap-3">
          <span className="text-[18px] shrink-0">💡</span>
          <div>
            <p className="text-[13px] font-bold text-white mb-1">투자 인사이트</p>
            <p className="text-[12px] text-[#A5B4C3] leading-relaxed">
              {noStop.length > 0 && withStop.length > 0
                ? `${noStop.length}명의 수혜자에게는 멈출 조건이 아예 없고, ${withStop.length}개의 멈출 조건도 모두 미충족 상태입니다. 시나리오가 끝날 외부 트리거가 부족하므로 관련 종목의 모멘텀이 당분간 유지될 가능성이 높습니다.`
                : noStop.length > 0
                  ? `모든 수혜자에게 멈출 조건이 없습니다. 외부 충격 없이는 시나리오가 자연 종료될 가능성이 매우 낮습니다.`
                  : `${withStop.length}개의 멈출 조건이 존재하지만 모두 미충족입니다. 하나라도 충족되면 시나리오 전환 시그널로 활용하세요.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
