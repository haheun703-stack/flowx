'use client'

import type { ScenarioETF } from '../types'

export default function ScenarioETFMap({ etfMap }: { etfMap: ScenarioETF[] }) {
  if (!etfMap.length) {
    return <p className="text-[var(--text-muted)] text-sm">ETF 매핑 데이터가 없습니다.</p>
  }

  const groups: Record<string, ScenarioETF[]> = {}
  for (const item of etfMap) {
    (groups[item.scenario_name] ??= []).push(item)
  }

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([name, phases]) => (
        <div key={name} className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">{name}</h4>
          <div className="space-y-2">
            {phases.map((ph) => (
              <div key={`${ph.scenario_id}-${ph.phase}`} className="flex items-start gap-3">
                <span className="text-xs text-[var(--text-muted)] min-w-[80px] pt-0.5">P{ph.phase} {ph.phase_name.split('(')[0].trim()}</span>
                <div className="flex flex-wrap gap-1.5">
                  {ph.etfs.map((etf) => (
                    <span key={etf} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[var(--down)] border border-blue-200">{etf}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
