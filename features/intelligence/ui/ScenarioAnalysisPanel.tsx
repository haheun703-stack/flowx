'use client'

import { useState } from 'react'
import { useIntelligenceScenarios, type ScenarioItem, type ScenarioOption } from '../api/useIntelligence'

/** 시나리오 이름 → 쉬운 한국어 + 부제 매핑 */
const SCENARIO_LABEL_KO: Record<string, string> = {
  'Soft Landing': '연착륙',
  'Hard Landing': '경착륙',
  'Stagflation': '스태그플레이션',
  'Reflation': '리플레이션',
  'Goldilocks': '골디락스',
  'Rate Cut Rally': '금리 인하 랠리',
  'Rate Hike Shock': '금리 인상 충격',
  'Trade War': '무역전쟁',
  'Recession': '경기침체',
  'Recovery': '경기회복',
  'Credit Crunch': '신용경색',
  'Tech Bubble': '기술주 거품',
  'Oil Shock': '유가 충격',
  'USD Surge': '달러 강세',
  'USD Weakness': '달러 약세',
}

const SCENARIO_SUBTITLES: Record<string, string> = {
  'Soft Landing': '경기 과열 없이 안정적 둔화',
  'Hard Landing': '급격한 경기 위축, 실업 증가',
  'Stagflation': '물가 상승 + 경기 침체 동시 발생',
  'Reflation': '경기 부양으로 인한 물가 재상승',
  'Goldilocks': '과열도 침체도 아닌 적정 성장',
  'Rate Cut Rally': '금리 인하 기대감으로 주가 상승',
  'Rate Hike Shock': '예상 밖 금리 인상으로 시장 급락',
  'Trade War': '관세 보복으로 글로벌 교역 위축',
  'Recession': '2분기 연속 마이너스 성장',
  'Recovery': '경기 저점 통과 후 반등 국면',
  'Credit Crunch': '금융기관 대출 축소로 유동성 경색',
  'Tech Bubble': '기술주 과대평가 후 급격한 조정',
  'Oil Shock': '원유 가격 급등으로 인플레이션 압력',
  'USD Surge': '달러 강세로 수출기업 타격',
  'USD Weakness': '달러 약세로 원자재·신흥국 수혜',
}

/** 시나리오 방향 이모지 + 쉬운 말 */
function getDirectionInfo(impact: string): { emoji: string; color: string; label: string } {
  if (impact.includes('+')) return { emoji: '🟢', color: '#10b981', label: '상승' }
  if (impact.includes('-')) return { emoji: '🔴', color: '#ef4444', label: '하락' }
  return { emoji: '🟡', color: '#f59e0b', label: '보합' }
}

/** 시나리오 이름 한글화 */
function getScenarioLabel(name: string): string {
  return SCENARIO_LABEL_KO[name] ?? name
}

function getScenarioSubtitle(name: string): string | null {
  return SCENARIO_SUBTITLES[name] ?? null
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
      <div className="px-3 py-3">
        {/* 이모지 + 이름 + 확률 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{dir.emoji}</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-[#e2e8f0] font-bold">{getScenarioLabel(sc.name)}</span>
            {getScenarioSubtitle(sc.name) && (
              <div className="text-[11px] text-[#64748b] mt-0.5">{getScenarioSubtitle(sc.name)}</div>
            )}
          </div>
          <span className="text-2xl sm:text-3xl font-black tabular-nums shrink-0" style={{ color: dir.color }}>
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
