'use client'

import { useState } from 'react'
import type { ActiveScenario, SupplyConflict, ScenarioPhase } from '../types'

function scoreColor(score: number) {
  if (score >= 60) return 'text-[var(--up)] bg-red-50 border-red-200'
  if (score >= 40) return 'text-[var(--yellow)] bg-yellow-50 border-yellow-200'
  return 'text-[var(--text-dim)] bg-gray-50 border-[var(--border)]'
}

function PhaseTimeline({ chain, currentPhase }: { chain: ScenarioPhase[]; currentPhase: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {chain.map((ph, i) => {
        const isCurrent = ph.phase === currentPhase
        const isPast = ph.phase < currentPhase
        return (
          <div key={ph.phase} className="flex items-center">
            {i > 0 && <div className={`w-4 h-0.5 ${isPast ? 'bg-gray-400' : isCurrent ? 'bg-blue-500' : 'bg-gray-200'}`} />}
            <div className="flex flex-col items-center min-w-[60px]">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? 'bg-blue-600 text-white' : isPast ? 'bg-gray-400 text-white' : 'bg-gray-200 text-[var(--text-muted)]'}`}>
                {ph.phase}
              </div>
              <p className={`text-[10px] mt-1 text-center leading-tight ${isCurrent ? 'text-[var(--down)]' : 'text-[var(--text-muted)]'}`}>
                {ph.name.split('(')[0].trim()}
              </p>
            </div>
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

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
        const open = expanded[sc.id] ?? false
        const scConflicts = conflictMap[sc.id] || []
        return (
          <div key={sc.id} className={`rounded-lg border ${scoreColor(sc.score)} p-4`}>
            <button className="w-full text-left flex items-center justify-between" onClick={() => setExpanded((p) => ({ ...p, [sc.id]: !p[sc.id] }))}>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">{sc.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-[var(--text-primary)]">P{sc.current_phase}/{sc.total_phases}</span>
                <span className="text-xs text-[var(--text-muted)]">D+{sc.days_active}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold">{sc.score}점</span>
                <span className="text-[var(--text-muted)] text-sm">{open ? '\u25B2' : '\u25BC'}</span>
              </div>
            </button>

            {scConflicts.map((cf, i) => (
              <div key={i} className="mt-2 text-xs bg-red-50 border border-red-200 rounded px-3 py-1.5 text-[var(--up)]">{cf.warning}</div>
            ))}

            <div className="mt-3 space-y-2">
              <p className="text-sm text-[var(--text-dim)]">{sc.phase_name}</p>
              <div className="flex gap-4">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">HOT</span>
                  <SectorPills sectors={sc.hot_sectors} type="hot" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">COLD</span>
                  <SectorPills sectors={sc.cold_sectors} type="cold" />
                </div>
              </div>
            </div>

            {open && (
              <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-3">
                <PhaseTimeline chain={sc.chain} currentPhase={sc.current_phase} />
                {sc.logic && <p className="text-sm text-[var(--text-primary)] bg-gray-50 rounded px-3 py-2">{sc.logic}</p>}
                {sc.reasons.length > 0 && (
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block mb-1">근거</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sc.reasons.map((r, i) => <span key={i} className="text-xs text-[var(--text-dim)] bg-gray-100 px-2 py-0.5 rounded">{r}</span>)}
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
                      {sc.etf.map((e) => <span key={e} className="text-xs text-[var(--down)] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">{e}</span>)}
                    </div>
                  </div>
                )}
                {sc.next_phase_name && (
                  <div className="border border-dashed border-[var(--border)] rounded-lg p-3 bg-gray-50">
                    <p className="text-xs text-[var(--text-muted)] mb-1">다음 Phase 프리뷰</p>
                    <p className="text-sm text-[var(--text-primary)]">{sc.next_phase_name}</p>
                    {sc.next_hot.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {sc.next_hot.map((s) => <span key={s} className="text-xs text-[var(--text-dim)] bg-gray-100 px-2 py-0.5 rounded">{s}</span>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
