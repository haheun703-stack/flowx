'use client'

import type { Beneficiary } from '../types'

// ─── 멈출 조건 카드 (스펙 §7) ───
// 수혜자별 stop_condition에서 고유 조건 추출 → 주황 경고 카드

interface StopConditionCardsProps {
  beneficiaries: Beneficiary[]
}

function extractStopConditions(beneficiaries: Beneficiary[]) {
  const seen = new Set<string>()
  const conditions: { name: string; beneficiary: string; hasStop: boolean }[] = []

  for (const b of beneficiaries) {
    const condition = b.stop_condition?.trim()
    if (!condition || condition === '없음' || condition === '-') {
      conditions.push({ name: '멈출 조건 없음', beneficiary: b.name, hasStop: false })
      continue
    }
    if (seen.has(condition)) continue
    seen.add(condition)
    conditions.push({ name: condition, beneficiary: b.name, hasStop: true })
  }

  return conditions
}

export default function StopConditionCards({ beneficiaries }: StopConditionCardsProps) {
  if (!beneficiaries?.length) return null

  const conditions = extractStopConditions(beneficiaries)
  if (!conditions.length) return null

  const metCount = conditions.filter(c => !c.hasStop).length
  const allNoStop = metCount === conditions.length

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5">
      <h3 className="text-[15px] font-black text-[var(--text-primary)] mb-4">
        멈출 조건 체크
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {conditions.map((c, i) => (
          <div
            key={i}
            className="rounded-lg p-3.5"
            style={{
              backgroundColor: c.hasStop ? '#FFFBEB' : '#FEF2F2',
              border: `1px solid ${c.hasStop ? '#FDE68A' : '#FECACA'}`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[var(--text-primary)] leading-snug">
                  {c.name}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  관련: {c.beneficiary}
                </p>
              </div>
              <span
                className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: c.hasStop ? '#FEF9C3' : '#FEE2E2',
                  color: c.hasStop ? '#92400E' : '#991B1B',
                }}
              >
                {c.hasStop ? '미충족' : '없음'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 경고 */}
      <div className="mt-4 rounded-md p-3 text-center" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <p className="text-[12px] font-bold" style={{ color: '#92400E' }}>
          {allNoStop
            ? '주요 수혜자에 멈출 조건이 없습니다 — 시나리오 장기화 가능성이 높습니다'
            : '멈출 조건이 하나라도 충족되면 시나리오 점수가 하락하고 종목 포지션 재검토가 필요합니다'
          }
        </p>
      </div>
    </div>
  )
}
