'use client'

interface Props {
  defensePct: number
  offensePct: number
  allocation: Record<string, number>
}

export default function AlphaPortfolio({ defensePct, offensePct, allocation }: Props) {
  const entries = Object.entries(allocation)

  return (
    <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-5">
      <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-4">자산 배분 제안</h3>

      {/* 방어 / 공격 바 */}
      <div className="flex h-6 rounded-full overflow-hidden mb-4">
        <div
          className="bg-[#059669] flex items-center justify-center text-[12px] font-bold text-white"
          style={{ width: `${defensePct}%` }}
        >
          방어 {defensePct}%
        </div>
        <div
          className="bg-[#DC2626] flex items-center justify-center text-[12px] font-bold text-white"
          style={{ width: `${offensePct}%` }}
        >
          공격 {offensePct}%
        </div>
      </div>

      {/* 자산군별 비중 */}
      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map(([name, pct]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-[14px] font-bold text-[#1A1A2E] w-[56px] shrink-0">
                {name}
              </span>
              <div className="flex-1 h-4 bg-[#F5F4F0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#7C3AED]"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className="text-[14px] font-bold text-[#1A1A2E] w-[36px] text-right tabular-nums">
                {pct}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-[#9CA3AF]">자산 배분 데이터 없음</p>
      )}
    </div>
  )
}
