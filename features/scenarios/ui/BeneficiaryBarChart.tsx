'use client'

import type { Beneficiary } from '../types'

function fmtBil(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`
  if (v >= 1) return `$${v.toFixed(1)}B`
  if (v > 0) return `$${(v * 1000).toFixed(0)}M`
  return '$0'
}

function getBarGradient(rank: number): string {
  if (rank === 0) return 'linear-gradient(0deg, #DC2626, #EF4444)'
  if (rank === 1) return 'linear-gradient(0deg, #F59E0B, #FCD34D)'
  return 'linear-gradient(0deg, #9CA3AF, #D1D5DB)'
}

export default function BeneficiaryVerticalBarChart({ beneficiaries }: { beneficiaries: Beneficiary[] }) {
  if (!beneficiaries?.length) return null

  const sorted = [...beneficiaries].sort((a, b) => b.earned_bil - a.earned_bil)
  const maxEarned = Math.max(...sorted.map(b => b.earned_bil), 0.01)

  const noStopCount = sorted
    .filter(b => b.earned_bil > 0)
    .slice(0, 3)
    .filter(b => !b.stop_condition || b.stop_condition === '없음' || b.stop_condition === '-')
    .length

  return (
    <div>
      <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-3">
        수혜자별 이익 구조 — 누가 돈을 벌고 있나?
      </h3>

      {/* 세로 막대 차트 */}
      <div className="flex items-end gap-4 justify-center" style={{ height: 180 }}>
        {sorted.map((b, i) => {
          const ratio = b.earned_bil / maxEarned
          const heightPct = b.earned_bil <= 0 ? 1 : Math.max(ratio * 90, 2)

          return (
            <div key={b.name} className="flex flex-col items-center flex-1 max-w-[80px]">
              {/* 금액 (상단) */}
              <p
                className="text-[10px] font-bold mb-1 tabular-nums"
                style={{ color: i === 0 ? '#DC2626' : i === 1 ? '#F59E0B' : '#6B7280' }}
              >
                {fmtBil(b.earned_bil)}
              </p>

              {/* 막대 */}
              <div
                className="w-full rounded-t-[6px]"
                style={{
                  height: `${heightPct}%`,
                  background: b.earned_bil <= 0 ? '#E8E6E0' : getBarGradient(i),
                  minHeight: 4,
                }}
              />

              {/* 이름 (하단) */}
              <p className="text-[9px] font-bold text-[#1A1A2E] mt-1 text-center truncate w-full">{b.name}</p>

              {/* 멈출 조건 */}
              <p className="text-[8px] text-center truncate w-full" style={{
                color: b.stop_condition && b.stop_condition !== '없음' && b.stop_condition !== '-'
                  ? '#D97706' : '#DC2626',
              }}>
                {b.stop_condition && b.stop_condition !== '없음' && b.stop_condition !== '-'
                  ? b.stop_condition
                  : '멈출 조건 없음'}
              </p>
            </div>
          )
        })}
      </div>

      {/* 핵심 인사이트 박스 */}
      {noStopCount >= 2 && (
        <div className="mt-4 rounded-lg p-3 text-center" style={{ backgroundColor: '#FEF2F2' }}>
          <p className="text-[12px] font-bold" style={{ color: '#991B1B' }}>
            전쟁을 끝낼 수 있는 자들이 전쟁에서 가장 큰 이익을 본다 → 전쟁 장기화 가능성 높음
          </p>
        </div>
      )}
    </div>
  )
}
