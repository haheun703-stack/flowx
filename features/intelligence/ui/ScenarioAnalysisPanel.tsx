'use client'

import { useState } from 'react'
import { useIntelligenceScenarios, type ScenarioItem, type ScenarioOption } from '../api/useIntelligence'

const TIER_STYLE: Record<string, string> = {
  FREE: 'text-[#00ff88] border-[#00ff88]/30',
  SIGNAL: 'text-[#f59e0b] border-[#f59e0b]/30',
  VIP: 'text-[#a855f7] border-[#a855f7]/30',
}

const TOPIC_LABEL: Record<string, string> = {
  geopolitical: '지정학',
  policy_us: '미국정책',
  chain_fire: '체인발화',
  policy_kr: '한국정책',
  earnings: '실적시즌',
  macro_shift: '매크로',
  default: '일반',
}

function ProbabilityBar({ probability, color }: { probability: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#1a2535] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${probability}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color }}>{probability}%</span>
    </div>
  )
}

function ScenarioCard({ sc, index }: { sc: ScenarioOption; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const colors = ['#00ff88', '#0ea5e9', '#f59e0b', '#ff3b5c']
  const color = colors[index % colors.length]

  const impactColor = sc.kospi_impact.includes('+') ? '#ff3b5c'
    : sc.kospi_impact.includes('-') ? '#0ea5e9'
    : '#64748b'

  return (
    <div className="border border-[#2a2a3a] rounded bg-[#0d1117] hover:border-[#2a2a3a]/80 transition-colors">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[13px] text-[#e2e8f0] font-bold flex-1">{sc.name}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-bold ${TIER_STYLE[sc.tier] ?? TIER_STYLE.FREE}`}>
            {sc.tier}
          </span>
        </div>
        <ProbabilityBar probability={sc.probability} color={color} />
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[11px] text-[#8a8a8a]">KOSPI</span>
          <span className="text-[12px] font-bold" style={{ color: impactColor }}>{sc.kospi_impact}</span>
          <span className="text-[10px] text-[#555] ml-auto">{sc.timeline}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[#2a2a3a] pt-2 space-y-2">
          <div className="text-[11px] text-[#cbd5e1] leading-relaxed">{sc.description}</div>

          {sc.affected_sectors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] text-[#555] mr-1">영향섹터</span>
              {sc.affected_sectors.map(s => (
                <span key={s} className="text-[9px] text-[#f59e0b] border border-[#f59e0b]/20 px-1 rounded-sm">{s}</span>
              ))}
            </div>
          )}

          {sc.stock_impacts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] text-[#555] mr-1">종목</span>
              {sc.stock_impacts.map(si => (
                <span key={si.ticker} className={`text-[9px] px-1 rounded-sm border ${
                  si.direction === '+' ? 'text-[#ff3b5c] border-[#ff3b5c]/20'
                    : si.direction === '-' ? 'text-[#0ea5e9] border-[#0ea5e9]/20'
                    : 'text-[#64748b] border-[#64748b]/20'
                }`}>
                  {si.direction}{si.name}
                </span>
              ))}
            </div>
          )}

          <div className="text-[11px] text-[#00ff88] font-bold">
            ACTION: {sc.action}
          </div>
        </div>
      )}
    </div>
  )
}

function ScenarioRow({ item }: { item: ScenarioItem }) {
  const scenarios = item.scenarios ?? []

  return (
    <div className="space-y-2">
      {/* 질문 헤더 */}
      <div className="px-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border font-bold ${TIER_STYLE[item.tier] ?? TIER_STYLE.FREE}`}>
            {item.session}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-sm border border-[#2a2a3a] text-[#8a8a8a] font-bold">
            {TOPIC_LABEL[item.topic_type] ?? item.topic_type}
          </span>
          {item.regime && (
            <span className="text-[9px] text-[#555]">레짐: {item.regime}</span>
          )}
          <span className="text-[10px] text-[#555] ml-auto">{item.date}</span>
        </div>
        <div className="text-[15px] text-[#e2e8f0] font-bold leading-snug">{item.question}</div>
        {item.outcome_tagged && (
          <div className={`text-[11px] mt-1 font-bold ${item.hit ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}>
            {item.hit ? 'HIT' : 'MISS'} → {item.actual_outcome}
          </div>
        )}
      </div>

      {/* 시나리오 카드들 */}
      {scenarios.map((sc, i) => (
        <ScenarioCard key={sc.name} sc={sc} index={i} />
      ))}
    </div>
  )
}

export function ScenarioAnalysisPanel() {
  const [sessionFilter, setSessionFilter] = useState<'AM' | 'PM' | undefined>(undefined)
  const { data, isLoading } = useIntelligenceScenarios(sessionFilter)
  const items = data?.items ?? []
  const hitSummary = data?.hit_summary

  return (
    <div className="flex flex-col h-full text-xs" style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">시나리오 시어터</span>
          {hitSummary && hitSummary.total_tagged > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm border border-[#00ff88]/30 text-[#00ff88] font-bold">
              적중 {hitSummary.hit_rate_pct}%
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {([undefined, 'AM', 'PM'] as const).map(f => (
            <button key={f ?? 'ALL'}
              onClick={() => setSessionFilter(f)}
              className={`text-[10px] px-2 py-0.5 rounded-sm border font-bold transition-colors ${
                sessionFilter === f
                  ? 'text-[#e2e8f0] border-[#a855f7]/50 bg-[#a855f7]/10'
                  : 'text-[#555] border-[#2a2a3a] hover:text-[#8a8a8a]'
              }`}>
              {f ?? '전체'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-[20px] bg-[#1a2535] animate-pulse rounded w-3/4" />
              <div className="h-[80px] bg-[#1a2535] animate-pulse rounded" />
              <div className="h-[80px] bg-[#1a2535] animate-pulse rounded" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">
            시나리오 데이터 없음 — Supabase 테이블 생성 필요
          </div>
        ) : (
          items.map(item => <ScenarioRow key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}
