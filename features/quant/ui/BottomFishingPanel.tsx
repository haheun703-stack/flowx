'use client'

// ─── Row 5 우: 바닥잡이 레이더 (스펙 §8, 플레이스홀더) ───

const STATIC_CANDIDATES = [
  { name: '한화솔루션', ticker: '009830', low52w: 18200, current: 19500, rebound: 72 },
  { name: 'SK이노베이션', ticker: '096770', low52w: 98000, current: 103500, rebound: 65 },
  { name: 'LG에너지솔루션', ticker: '373220', low52w: 350000, current: 372000, rebound: 58 },
]

export default function BottomFishingPanel() {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm h-full">
      <div className="px-4 py-3 border-b border-[var(--border)]/50 flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-[var(--text-primary)]">바닥잡이 레이더</h3>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#2563EB]">
          COMING SOON
        </span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-[12px] text-[var(--text-muted)] mb-2">
          52주 신저가 근접 + 펀더멘탈 OK 종목 (예시)
        </p>

        {STATIC_CANDIDATES.map((c) => {
          const dist = ((c.current - c.low52w) / c.low52w * 100).toFixed(1)
          return (
            <div
              key={c.ticker}
              className="rounded-lg p-3 bg-gray-50 border border-[var(--border)]/50"
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{c.name}</span>
                  <span className="text-[12px] text-[var(--text-muted)] ml-1">{c.ticker}</span>
                </div>
                <span className="text-[12px] font-bold text-[#059669]">
                  반등확률 {c.rebound}%
                </span>
              </div>
              <div className="flex gap-3 text-[12px] text-[var(--text-muted)]">
                <span>52주 저가: {c.low52w.toLocaleString()}</span>
                <span>현재: {c.current.toLocaleString()}</span>
                <span>저가 대비 +{dist}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-2 border-t border-[var(--border)]/50">
        <p className="text-[11px] text-[var(--text-muted)] text-center">
          실시간 데이터 연동 준비 중
        </p>
      </div>
    </div>
  )
}
