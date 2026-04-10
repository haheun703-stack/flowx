'use client'

import { useState } from 'react'
import type { AlphaCandidate } from './alpha-types'
import AlphaScannerCard from './AlphaScannerCard'

const GRADE_TABS = [
  { key: 'ALL', label: '전체', color: '' },
  { key: 'GOLD', label: 'GOLD', color: '#FFD700' },
  { key: 'SILVER', label: 'SILVER', color: '#C0C0C0' },
  { key: 'BRONZE', label: 'BRONZE', color: '#CD7F32' },
] as const

export default function AlphaScannerPanel({
  candidates,
  gradeSummary,
}: {
  candidates: AlphaCandidate[]
  gradeSummary: { GOLD: number; SILVER: number; BRONZE: number }
}) {
  const [filter, setFilter] = useState<string>('ALL')

  const filtered =
    filter === 'ALL' ? candidates : candidates.filter((c) => c.grade === filter)
  const total = candidates.length

  return (
    <div>
      {/* 헤더 + 등급 필터 */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-[#1A1A2E]">
            ★ 알파 스캐너
          </h2>
          <p className="text-[13px] text-[#6B7280]">
            5축 정량 분석 기반 저평가 종목 발굴
          </p>
        </div>

        <div className="flex gap-1 bg-[#F5F4F0] rounded-xl p-1 border border-[#E8E6E0]">
          {GRADE_TABS.map((t) => {
            const count =
              t.key === 'ALL'
                ? total
                : (gradeSummary[t.key as keyof typeof gradeSummary] ?? 0)
            const active = filter === t.key
            return (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${
                  active
                    ? 'bg-white shadow-sm text-[#1A1A2E]'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
              >
                {t.color && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                )}
                {t.label}
                <span className="text-[11px] text-[#9CA3AF]">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 카드 리스트 */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[#9CA3AF] text-[14px]">
          해당 등급의 종목이 없습니다
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c, i) => (
            <AlphaScannerCard key={c.ticker} c={c} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
