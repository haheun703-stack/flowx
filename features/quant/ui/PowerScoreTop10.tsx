'use client'

// ─── Row 4: FlowX Power Score TOP 10 (스펙 §7) ───
// 기존 picks 데이터를 Power Score 형태로 시각화

interface PickItem {
  ticker: string
  name: string
  grade: string
  total_score: number
  sources: string[]
  n_sources: number
  close: number
  rsi: number
  stoch_k: number
  foreign_5d: number
  inst_5d: number
  reasons: string[]
  entry_price?: number
  stop_loss?: number
  target_price?: number
}

interface PowerScoreTop10Props {
  picks: PickItem[]
}

function gradeStyle(score: number): { label: string; bg: string; text: string } {
  if (score >= 80) return { label: 'CONVICTION', bg: '#ECFDF5', text: '#059669' }
  if (score >= 60) return { label: 'NORMAL', bg: '#F3F4F6', text: '#6B7280' }
  return { label: 'WATCH', bg: '#FFFBEB', text: '#D97706' }
}

function rankColor(rank: number): string {
  if (rank === 1) return '#EAB308'
  if (rank === 2) return '#9CA3AF'
  if (rank === 3) return '#CD7F32'
  return '#E5E7EB'
}

function barGradient(score: number): string {
  if (score >= 80) return 'linear-gradient(90deg, #059669, #10B981)'
  if (score >= 60) return 'linear-gradient(90deg, #3B82F6, #60A5FA)'
  return 'linear-gradient(90deg, #D97706, #FBBF24)'
}

function formatKRW(n: number) {
  if (n >= 1_000_000) return `${(n / 10_000).toFixed(0)}만`
  return n.toLocaleString()
}

function expectedReturn(pick: PickItem): string | null {
  const entry = pick.entry_price ?? pick.close
  const target = pick.target_price
  if (!target || entry <= 0) return null
  const pct = ((target - entry) / entry) * 100
  return `+${pct.toFixed(1)}%`
}

export default function PowerScoreTop10({ picks }: PowerScoreTop10Props) {
  if (!picks?.length) {
    return <p className="text-[var(--text-muted)] text-sm">추천 종목 데이터가 없습니다.</p>
  }

  const sorted = [...picks]
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 10)

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-3 border-b border-[var(--border)]/50 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
          FlowX Power Score TOP 10
        </h3>
        <span className="text-[10px] text-[var(--text-muted)]">
          교차검증 기반 종합 점수
        </span>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-[var(--text-muted)]">
              <th className="px-3 py-2 text-left w-[40px]">#</th>
              <th className="px-3 py-2 text-left">종목</th>
              <th className="px-3 py-2 text-left w-[200px]">Power Score</th>
              <th className="px-3 py-2 text-center">신호</th>
              <th className="px-3 py-2 text-center">등급</th>
              <th className="px-3 py-2 text-right">현재가</th>
              <th className="px-3 py-2 text-right">기대수익</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((pick, i) => {
              const rank = i + 1
              const gs = gradeStyle(pick.total_score)
              const ret = expectedReturn(pick)

              return (
                <tr
                  key={pick.ticker}
                  className="border-b border-[var(--border)]/30 hover:bg-gray-50/50 transition-colors"
                >
                  {/* 순위 */}
                  <td className="px-3 py-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{
                        backgroundColor: rankColor(rank),
                        color: rank <= 3 ? '#fff' : '#6B7280',
                      }}
                    >
                      {rank}
                    </div>
                  </td>

                  {/* 종목명 + 소스 태그 */}
                  <td className="px-3 py-2.5">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">{pick.name}</span>
                      <span className="text-[var(--text-muted)] ml-1.5">{pick.ticker}</span>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {pick.sources.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-[var(--text-muted)]"
                        >
                          {s}
                        </span>
                      ))}
                      {pick.sources.length > 3 && (
                        <span className="text-[9px] text-[var(--text-muted)]">
                          +{pick.sources.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Power Score 바 */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(pick.total_score, 100)}%`,
                            background: barGradient(pick.total_score),
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums w-[36px] text-right">
                        {pick.total_score.toFixed(0)}
                      </span>
                    </div>
                  </td>

                  {/* 신호 개수 */}
                  <td className="px-3 py-2.5 text-center">
                    <span className="font-bold text-[var(--text-primary)]">{pick.n_sources}</span>
                    <span className="text-[var(--text-muted)]">개</span>
                  </td>

                  {/* 등급 뱃지 */}
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: gs.bg, color: gs.text }}
                    >
                      {gs.label}
                    </span>
                  </td>

                  {/* 현재가 */}
                  <td className="px-3 py-2.5 text-right font-mono text-[var(--text-primary)]">
                    {formatKRW(pick.close)}
                  </td>

                  {/* 기대수익률 */}
                  <td className="px-3 py-2.5 text-right">
                    {ret ? (
                      <span className="font-bold text-[#059669]">{ret}</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
