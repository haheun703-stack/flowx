'use client'

import { useState } from 'react'
import { useIntelligenceScenarios, type ScenarioItem, type ScenarioOption } from '../api/useIntelligence'

/** 시나리오 방향 이모지 + 쉬운 말 */
function getDirectionInfo(impact: string): { emoji: string; color: string; label: string } {
  if (impact.includes('+')) return { emoji: '🟢', color: '#10b981', label: '상승' }
  if (impact.includes('-')) return { emoji: '🔴', color: '#ef4444', label: '하락' }
  return { emoji: '🟡', color: '#f59e0b', label: '보합' }
}

/** 확률 바 (가로 채우기) */
function ProbBar({ probability, color, label }: { probability: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-6 bg-[#1a2535] rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-500 flex items-center"
          style={{ width: `${Math.max(probability, 8)}%`, backgroundColor: color + '40' }}
        >
          <span className="text-xs font-bold ml-2 whitespace-nowrap" style={{ color }}>
            {label} {probability}%
          </span>
        </div>
      </div>
    </div>
  )
}

/** 단순화된 시나리오 카드 */
function SimpleScenarioCard({ sc }: { sc: ScenarioOption }) {
  const [expanded, setExpanded] = useState(false)
  const dir = getDirectionInfo(sc.kospi_impact)

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left border border-[#2a2a3a] rounded-lg bg-[#0d1117] hover:border-[#3a3a4a] transition-colors"
    >
      <div className="px-3 py-2.5">
        {/* 이모지 + 이름 + 확률 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{dir.emoji}</span>
          <span className="text-sm text-[#e2e8f0] font-bold flex-1">{sc.name}</span>
          <span className="text-lg font-black tabular-nums" style={{ color: dir.color }}>
            {sc.probability}%
          </span>
        </div>
        {/* 확률 바 */}
        <ProbBar probability={sc.probability} color={dir.color} label={dir.label} />
        {/* KOSPI 영향 */}
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className="text-[#64748b]">KOSPI</span>
          <span className="font-bold" style={{ color: dir.color }}>{sc.kospi_impact}</span>
          {sc.timeline && <span className="text-[#555] ml-auto">{sc.timeline}</span>}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[#2a2a3a] pt-2 space-y-2">
          <div className="text-xs text-[#cbd5e1] leading-relaxed">{sc.description}</div>

          {sc.stock_impacts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sc.stock_impacts.map(si => (
                <span key={si.ticker} className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                  si.direction === '+' ? 'text-[#ff3b5c] border-[#ff3b5c]/20 bg-[#ff3b5c]/5'
                    : si.direction === '-' ? 'text-[#0ea5e9] border-[#0ea5e9]/20 bg-[#0ea5e9]/5'
                    : 'text-[#64748b] border-[#64748b]/20'
                }`}>
                  {si.direction === '+' ? '▲' : si.direction === '-' ? '▼' : '─'} {si.name}
                </span>
              ))}
            </div>
          )}

          <div className="text-xs font-bold px-2 py-1.5 rounded bg-[#10b981]/10 text-[#10b981]">
            💡 {sc.action}
          </div>
        </div>
      )}
    </button>
  )
}

function ScenarioGroup({ item }: { item: ScenarioItem }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[15px] text-[#e2e8f0] font-bold leading-snug flex-1">
          {item.question}
        </span>
        {item.outcome_tagged && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            item.hit ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'
          }`}>
            {item.hit ? '적중' : '빗나감'}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {(item.scenarios ?? []).map((sc) => (
          <SimpleScenarioCard key={sc.name} sc={sc} />
        ))}
      </div>
    </div>
  )
}

export function ScenarioAnalysisPanel() {
  const [sessionFilter, setSessionFilter] = useState<'AM' | 'PM' | undefined>(undefined)
  const { data, isLoading } = useIntelligenceScenarios(sessionFilter)
  const items = data?.items ?? []
  const hitSummary = data?.hit_summary

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider">시나리오 확률</span>
          {hitSummary && hitSummary.total_tagged > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#10b981]/30 text-[#10b981] font-bold">
              적중률 {hitSummary.hit_rate_pct}%
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {([undefined, 'AM', 'PM'] as const).map(f => (
            <button key={f ?? 'ALL'}
              onClick={() => setSessionFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-md font-bold transition-colors ${
                sessionFilter === f
                  ? 'text-[#e2e8f0] bg-[#a855f7]/20 border border-[#a855f7]/40'
                  : 'text-[#555] border border-[#2a2a3a] hover:text-[#8a8a8a]'
              }`}>
              {f ?? '전체'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-[#1a2535] animate-pulse rounded w-3/4" />
              <div className="h-16 bg-[#1a2535] animate-pulse rounded" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">
            시나리오 데이터 없음
          </div>
        ) : (
          items.map(item => <ScenarioGroup key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}
