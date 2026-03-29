'use client'

import { useState } from 'react'
import { useInformationScenarios, type ScenarioItem, type ScenarioOption } from '../api/useInformation'

/**
 * 시나리오 이름 → 쉬운 한국어 + 부제 매핑
 * DB에서 한국어/영어 둘 다 올 수 있음
 * 키 매칭: trim + 부분 포함(includes) 폴백
 */
const LABEL_ENTRIES: [string, string][] = [
  // 영어
  ['Soft Landing', '연착륙'],
  ['Hard Landing', '경착륙'],
  ['Stagflation', '스태그플레이션'],
  ['Reflation', '리플레이션'],
  ['Goldilocks', '골디락스'],
  ['Rate Cut Rally', '금리 인하 랠리'],
  ['Rate Hike Shock', '금리 인상 충격'],
  ['Trade War', '무역전쟁'],
  ['Recession', '경기침체'],
  ['Recovery', '경기회복'],
  ['Credit Crunch', '신용경색'],
  ['Tech Bubble', '기술주 거품'],
  ['Oil Shock', '유가 충격'],
  ['USD Surge', '달러 강세'],
  ['USD Weakness', '달러 약세'],
  // 한국어 전문용어 → 쉬운 말
  ['비둘기파 서프라이즈', '예상 밖 금리 인하'],
  ['매파 서프라이즈', '예상 밖 금리 인상'],
  ['예상대로', '시장 예상 부합'],
  ['컨센서스', '시장 예상 부합'],
  ['비둘기파 기조', '금리 인하 기조'],
  ['매파 기조', '금리 인상 기조'],
  ['한국 직접 타격', '한국 직접 타격'],
  ['디스인플레이션', '물가 상승 둔화'],
  ['디플레이션', '물가 하락'],
  ['스태그플레이션', '물가↑ 성장↓ 동시'],
  ['리세션', '경기침체'],
  ['테이퍼링', '유동성 축소'],
  ['양적완화', '유동성 공급 확대'],
  ['양적긴축', '유동성 회수'],
  ['피벗', '금리 방향 전환'],
  ['블랙스완', '예측 불가 대형 악재'],
  ['데드캣바운스', '일시 반등 후 재하락'],
  ['베어마켓 랠리', '하락장 속 반등'],
  ['숏스퀴즈', '공매도 청산 급등'],
  ['캐피튤레이션', '투매(패닉 매도)'],
  ['리밸런싱', '포트폴리오 재조정'],
]

const SUBTITLE_ENTRIES: [string, string][] = [
  ['Soft Landing', '경기 과열 없이 안정적 둔화'],
  ['Hard Landing', '급격한 경기 위축, 실업 증가'],
  ['Stagflation', '물가 상승 + 경기 침체 동시 발생'],
  ['Reflation', '경기 부양으로 인한 물가 재상승'],
  ['Goldilocks', '과열도 침체도 아닌 적정 성장'],
  ['Rate Cut Rally', '금리 인하 기대감으로 주가 상승'],
  ['Rate Hike Shock', '예상 밖 금리 인상으로 시장 급락'],
  ['Trade War', '관세 보복으로 글로벌 교역 위축'],
  ['Recession', '2분기 연속 마이너스 성장'],
  ['Recovery', '경기 저점 통과 후 반등 국면'],
  ['Credit Crunch', '금융기관 대출 축소로 유동성 경색'],
  ['Tech Bubble', '기술주 과대평가 후 급격한 조정'],
  ['Oil Shock', '원유 가격 급등으로 인플레이션 압력'],
  ['USD Surge', '달러 강세로 수출기업 타격'],
  ['USD Weakness', '달러 약세로 원자재·신흥국 수혜'],
  ['비둘기파 서프라이즈', '연준이 예상보다 금리를 낮춰 주식·채권 급등'],
  ['매파 서프라이즈', '연준이 예상보다 금리를 올려 주식 급락'],
  ['예상대로', '시장이 예상한 대로 결정, 큰 변동 없음'],
  ['컨센서스', '시장이 예상한 대로 결정, 큰 변동 없음'],
  ['비둘기파 기조', '앞으로 금리를 낮출 가능성이 높은 상황'],
  ['매파 기조', '앞으로 금리를 올릴 가능성이 높은 상황'],
  ['한국 직접 타격', '한국 경제에 직접적 충격이 오는 시나리오'],
  ['디스인플레이션', '물가가 여전히 오르지만 상승 속도가 느려짐'],
  ['디플레이션', '물가가 지속적으로 하락, 경기 위축 신호'],
  ['테이퍼링', '중앙은행이 채권 매입 규모를 서서히 줄임'],
  ['양적완화', '중앙은행이 돈을 풀어 경기 부양'],
  ['양적긴축', '중앙은행이 보유 채권을 줄여 돈을 회수'],
  ['피벗', '금리 인상→인하 또는 인하→인상으로 방향 전환'],
  ['블랙스완', '아무도 예상 못한 대형 충격 (전쟁, 팬데믹 등)'],
  ['데드캣바운스', '급락 후 기술적 반등, 추세 전환 아님'],
  ['베어마켓 랠리', '하락장에서 일시적 반등, 추가 하락 가능'],
  ['숏스퀴즈', '공매도 세력이 손절하며 주가 급등'],
  ['캐피튤레이션', '공포에 질린 투자자들이 한꺼번에 매도'],
  ['리밸런싱', '자산 배분 비율을 원래대로 되돌리는 매매'],
]

/** 시나리오 방향 이모지 + 쉬운 말 */
function getDirectionInfo(impact: string): { emoji: string; color: string; label: string } {
  if (impact.includes('+')) return { emoji: '🟢', color: '#dc2626', label: '상승' }
  if (impact.includes('-')) return { emoji: '🔴', color: '#2563eb', label: '하락' }
  return { emoji: '🟡', color: '#d97706', label: '보합' }
}

const LABEL_MAP = new Map(LABEL_ENTRIES)
const SUBTITLE_MAP = new Map(SUBTITLE_ENTRIES)

/** 시나리오 이름 한글화 — 정확 매칭 → 부분 매칭(includes) 폴백 */
function getScenarioLabel(name: string): string {
  const n = name.trim()
  const exact = LABEL_MAP.get(n)
  if (exact) return exact
  for (const [k, v] of LABEL_MAP) {
    if (n.includes(k) || k.includes(n)) return v
  }
  return name
}

function getScenarioSubtitle(name: string): string | null {
  const n = name.trim()
  const exact = SUBTITLE_MAP.get(n)
  if (exact) return exact
  for (const [k, v] of SUBTITLE_MAP) {
    if (n.includes(k) || k.includes(n)) return v
  }
  return null
}

/** 확률 바 (가로 채우기) */
function ProbBar({ probability, color, label }: { probability: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-500 flex items-center"
          style={{ width: `${Math.max(probability, 8)}%`, backgroundColor: color + '20' }}
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
      className="w-full text-left border border-[var(--border)] rounded-lg bg-white hover:border-[var(--border-bright)] transition-colors shadow-sm"
    >
      <div className="px-3 py-3">
        {/* 이모지 + 이름 + 확률 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{dir.emoji}</span>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-[var(--text-primary)] font-bold">{getScenarioLabel(sc.name)}</span>
            {getScenarioSubtitle(sc.name) && <div className="text-[11px] text-[var(--text-dim)] mt-0.5">{getScenarioSubtitle(sc.name)}</div>}
          </div>
          <span className="text-2xl sm:text-3xl font-black tabular-nums shrink-0" style={{ color: dir.color }}>
            {sc.probability}%
          </span>
        </div>
        {/* 확률 바 */}
        <ProbBar probability={sc.probability} color={dir.color} label={dir.label} />
        {/* KOSPI 영향 */}
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className="text-[var(--text-dim)]">KOSPI</span>
          <span className="font-bold" style={{ color: dir.color }}>{sc.kospi_impact}</span>
          {sc.timeline && <span className="text-[var(--text-muted)] ml-auto">{sc.timeline}</span>}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-[var(--border)] pt-2 space-y-2">
          <div className="text-xs text-[var(--text-primary)] leading-relaxed">{sc.description}</div>

          {sc.stock_impacts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sc.stock_impacts.map(si => (
                <span key={si.ticker} className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                  si.direction === '+' ? 'text-[var(--up)] border-[var(--up)]/20 bg-[var(--up-bg)]'
                    : si.direction === '-' ? 'text-[var(--down)] border-[var(--down)]/20 bg-[var(--down-bg)]'
                    : 'text-[var(--text-dim)] border-[var(--border)]'
                }`}>
                  {si.direction === '+' ? '▲' : si.direction === '-' ? '▼' : '─'} {si.name}
                </span>
              ))}
            </div>
          )}

          <div className="text-xs font-bold px-2 py-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <span className="text-[15px] text-[var(--text-primary)] font-bold leading-snug flex-1">
          {item.question}
        </span>
        {item.outcome_tagged && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            item.hit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {item.hit ? '적중' : '빗나감'}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {(item.scenarios ?? []).map((sc, idx) => (
          <SimpleScenarioCard key={`${sc.name}-${idx}`} sc={sc} />
        ))}
      </div>
    </div>
  )
}

export function ScenarioAnalysisPanel() {
  const [sessionFilter, setSessionFilter] = useState<'AM' | 'PM' | undefined>(undefined)
  const { data, isLoading } = useInformationScenarios(sessionFilter)
  const items = data?.items ?? []
  const hitSummary = data?.hit_summary

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="text-base font-bold text-[var(--text-primary)] tracking-wider">시나리오 확률</span>
          {hitSummary && hitSummary.total_tagged > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-700 bg-emerald-50 font-bold">
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
                  ? 'text-[var(--text-primary)] bg-purple-50 border border-purple-200'
                  : 'text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text-dim)]'
              }`}>
              {f ?? '전체'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-16 bg-gray-200 animate-pulse rounded" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
            시나리오 데이터 없음
          </div>
        ) : (
          items.map(item => <ScenarioGroup key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}
