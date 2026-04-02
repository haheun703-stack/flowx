'use client'

import type { ActiveScenario, SupplyConflict, ScenarioPhase } from '../types'

function scoreBadge(score: number) {
  if (score >= 80) return 'bg-[#991B1B] text-white'
  if (score >= 60) return 'bg-[#EF4444] text-white'
  if (score >= 40) return 'bg-[#F59E0B] text-white'
  return 'bg-[#9CA3AF] text-white'
}

// ─── Phase 프로그레스 바 (스펙 §1) ───

function PhaseProgressBar({ chain, currentPhase }: { chain: ScenarioPhase[]; currentPhase: number }) {
  if (!chain.length) return null

  return (
    <div className="flex gap-[3px] mt-3">
      {chain.map((ph) => {
        const isDone = ph.phase < currentPhase
        const isCurrent = ph.phase === currentPhase

        return (
          <div key={ph.phase} className="flex-1 text-center min-w-0">
            <div
              className="h-[10px] rounded-[5px] mb-1"
              style={{
                backgroundColor: isDone ? '#EF4444' : isCurrent ? '#F59E0B' : '#E8E6E0',
              }}
            />
            <p className="text-[8px] font-semibold text-[var(--text-primary)] leading-tight truncate">
              {isCurrent ? `▶ P${ph.phase} 현재` : `P${ph.phase}`}
            </p>
            <p className="text-[7px] text-[var(--text-muted)] leading-tight truncate">
              {ph.name.split('(')[0].trim()}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function SectorPills({ sectors, type }: { sectors: string[]; type: 'hot' | 'cold' }) {
  if (!sectors.length) return null
  const style = type === 'hot'
    ? 'text-[var(--up)] border-red-200 bg-red-50'
    : 'text-[var(--down)] border-blue-200 bg-blue-50'
  return (
    <div className="flex flex-wrap gap-1.5">
      {sectors.map((s) => (
        <span key={s} className={`text-xs px-2 py-0.5 rounded-full border ${style}`}>{s}</span>
      ))}
    </div>
  )
}

export default function ScenarioCard({ scenarios, conflicts }: { scenarios: ActiveScenario[]; conflicts: SupplyConflict[] }) {
  if (!scenarios.length) {
    return <p className="text-[var(--text-muted)] text-sm">활성 시나리오가 없습니다.</p>
  }

  const conflictMap: Record<string, SupplyConflict[]> = {}
  for (const c of conflicts) {
    (conflictMap[c.scenario] ??= []).push(c)
  }

  return (
    <div className="space-y-4">
      {scenarios.map((sc) => {
        const scConflicts = conflictMap[sc.id] || []

        return (
          <div key={sc.id} className="rounded-xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
            {/* 헤더 */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-black text-[var(--text-primary)]">{sc.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-[var(--text-primary)] font-medium">
                    Phase {sc.current_phase}/{sc.total_phases}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">D+{sc.days_active}일 경과</span>
                </div>
                <span className={`text-sm font-black px-3 py-1 rounded-lg ${scoreBadge(sc.score)}`}>
                  {sc.score}점
                </span>
              </div>

              {/* HOT 섹터 */}
              {sc.hot_sectors.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">HOT:</span>
                  <SectorPills sectors={sc.hot_sectors} type="hot" />
                </div>
              )}

              {/* Phase 프로그레스 바 */}
              <PhaseProgressBar chain={sc.chain} currentPhase={sc.current_phase} />
            </div>

            {/* 충돌 경고 */}
            {scConflicts.map((cf, i) => (
              <div key={i} className="mx-5 mb-3 text-xs bg-red-50 border border-red-200 rounded px-3 py-1.5 text-[var(--up)]">
                {cf.warning}
              </div>
            ))}

            {/* 상세 정보 */}
            <div className="px-5 pb-4 space-y-3 border-t border-[var(--border)]/50 pt-3">
              <p className="text-sm text-[var(--text-dim)]">{sc.phase_name}</p>

              {sc.logic && (
                <p className="text-sm text-[var(--text-primary)] bg-gray-50 rounded-lg px-3 py-2" style={{ borderLeft: '3px solid #F59E0B' }}>
                  {sc.logic}
                </p>
              )}

              {sc.cold_sectors.length > 0 && (
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">COLD</span>
                  <SectorPills sectors={sc.cold_sectors} type="cold" />
                </div>
              )}

              {sc.reasons.length > 0 && (
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block mb-1">근거</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sc.reasons.map((r, i) => (
                      <span key={i} className="text-xs text-[var(--text-dim)] bg-gray-100 px-2 py-0.5 rounded">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {sc.hot_tickers.length > 0 && (
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block mb-1">HOT 종목</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sc.hot_tickers.map((t) => (
                      <span key={t.code} className="text-xs text-[var(--up)] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        {t.name}<span className="text-[var(--text-muted)] ml-1">{t.code}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {sc.etf.length > 0 && (
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block mb-1">관련 ETF</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sc.etf.map((e) => (
                      <span key={e} className="text-xs text-[var(--down)] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {sc.next_phase_name && (
                <div className="border border-dashed border-[var(--border)] rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-[var(--text-muted)] mb-1">다음 Phase 프리뷰</p>
                  <p className="text-sm text-[var(--text-primary)]">{sc.next_phase_name}</p>
                  {sc.next_hot.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {sc.next_hot.map((s) => (
                        <span key={s} className="text-xs text-[var(--text-dim)] bg-gray-100 px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
