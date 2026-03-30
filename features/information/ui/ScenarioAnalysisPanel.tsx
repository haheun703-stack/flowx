'use client'

import { useState } from 'react'
import { useInformationScenarios, type ScenarioItem, type ScenarioOption } from '../api/useInformation'

// ─── 시장체제 한국어 매핑 ───
const REGIME_KR: Record<string, string> = {
  RISK_ON: '위험선호', RISK_OFF: '위험회피', EUPHORIA: '과열',
  NEUTRAL: '중립', CAPITULATION: '투매', RECOVERY: '회복',
  RECESSION: '침체', GOLDILOCKS: '골디락스', WAR_INFLATION: '전쟁 물가상승',
  STAGFLATION: '저성장 물가상승',
}

// ─── tier 한국어 매핑 ───
const TIER_KR: Record<string, { label: string; color: string; bg: string; border: string }> = {
  FREE:   { label: '무료', color: '#16a34a', bg: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.2)' },
  SIGNAL: { label: '시그널', color: '#7c3aed', bg: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.2)' },
  VIP:    { label: '프리미엄', color: '#d97706', bg: 'rgba(217,119,6,0.06)', border: 'rgba(217,119,6,0.2)' },
}

// ─── topic_type 한국어 매핑 ───
const TOPIC_TYPE_KR: Record<string, string> = {
  geopolitical: '지정학', policy_us: '미국 정책', chain_fire: '체인 발화',
  policy_kr: '한국 정책', macro_shift: '매크로 전환', earnings: '실적 시즌',
  trade_war: '무역전쟁', tariff: '관세', monetary: '통화정책',
  fiscal: '재정정책', energy: '에너지', tech: '기술',
  default: '시장 전반',
}

/** 텍스트 내 영어/전문용어 → 한국어 치환 */
const TEXT_REPLACE: [RegExp, string][] = [
  // 영어 regime 코드 → 한국어
  [/\bRECOVERY\b/g, '회복'],
  [/\bWAR_INFLATION\b/g, '전쟁 물가상승'],
  [/\bSTAGFLATION\b/g, '저성장 물가상승'],
  [/\bCAPITULATION\b/g, '투매'],
  [/\bGOLDILOCKS\b/g, '골디락스'],
  [/\bRISK_ON\b/g, '위험선호'],
  [/\bRISK_OFF\b/g, '위험회피'],
  [/\bEUPHORIA\b/g, '과열'],
  [/\bNEUTRAL\b/g, '중립'],
  [/\bRECESSION\b/g, '침체'],
  // 전문용어 → 쉬운 한국어
  [/레짐/g, '시장국면'],
  [/확신도/g, '확신도'],
  // 영어 괄호 제거: "긴장 완화 (De-escalation)" → "긴장 완화"
  [/\s*\([A-Za-z\s\-]+\)\s*/g, ' '],
]

function localizeText(text: string): string {
  let result = text
  for (const [pattern, replacement] of TEXT_REPLACE) {
    result = result.replace(pattern, replacement)
  }
  return result.trim()
}

/** KOSPI 영향 방향 색상 */
function getImpactStyle(impact: string): { color: string; bg: string } {
  if (impact.includes('+')) return { color: '#dc2626', bg: 'rgba(220,38,38,0.06)' }
  if (impact.includes('-')) return { color: '#2563eb', bg: 'rgba(37,99,235,0.06)' }
  return { color: '#d97706', bg: 'rgba(217,119,6,0.06)' }
}

/** 확률 비례 카드 너비 */
function getCardWidth(probability: number, totalScenarios: number): string {
  const minWidth = 15
  const remaining = 100 - minWidth * totalScenarios
  const proportional = (probability / 100) * remaining + minWidth
  return `${proportional}%`
}

/** 확률 바 (수평 게이지바) */
function ProbGauge({ probability }: { probability: number }) {
  const pct = Math.max(probability, 5)
  const alpha = Math.min(0.15 + probability / 200, 0.5)
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: `rgba(99,102,241,${alpha})` }}
      />
    </div>
  )
}

/** 가로 시나리오 카드 */
function HorizontalScenarioCard({ sc, totalScenarios }: { sc: ScenarioOption; totalScenarios: number }) {
  const [expanded, setExpanded] = useState(false)
  const style = getImpactStyle(sc.kospi_impact)

  // affected_sectors를 문자열→배열 처리
  const sectors: string[] = typeof sc.affected_sectors === 'string'
    ? (sc.affected_sectors as string).split(',').map(s => s.trim()).filter(Boolean)
    : (sc.affected_sectors ?? [])

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="flex-shrink-0 text-left border border-[var(--border)] rounded-lg bg-white hover:border-[var(--border-bright)] transition-colors shadow-sm overflow-hidden"
      style={{ width: getCardWidth(sc.probability, totalScenarios), minWidth: '140px' }}
    >
      <div className="px-3 py-3 flex flex-col h-full">
        {/* 시나리오 이름 */}
        <div className="text-sm font-bold text-[var(--text-primary)] leading-snug mb-1">
          {localizeText(sc.name)}
        </div>

        {/* 확률 (크게) */}
        <div className="text-3xl font-black tabular-nums my-1" style={{ color: style.color }}>
          {sc.probability}%
        </div>

        {/* 확률 게이지바 */}
        <ProbGauge probability={sc.probability} />

        {/* KOSPI 영향 */}
        <div className="mt-3 px-2 py-1.5 rounded text-center text-xs font-bold" style={{ backgroundColor: style.bg, color: style.color }}>
          KOSPI {sc.kospi_impact}
        </div>

        {/* 영향 섹터 */}
        {sectors.length > 0 && (
          <div className="mt-2 text-[11px] text-[var(--text-dim)] leading-relaxed text-center truncate">
            {sectors.join(', ')}
          </div>
        )}

        {/* 타임라인 */}
        {sc.timeline && (
          <div className="mt-1 text-[10px] text-[var(--text-muted)] text-center">{sc.timeline}</div>
        )}
      </div>

      {/* 확장 영역 */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-[var(--border)] pt-2 space-y-2">
          <div className="text-xs text-[var(--text-primary)] leading-relaxed">{sc.description}</div>

          {sc.stock_impacts?.length > 0 && (
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
  const scenarios = item.scenarios ?? []
  const regimeKr = item.regime ? (REGIME_KR[item.regime] ?? item.regime) : null
  const topicKr = TOPIC_TYPE_KR[item.topic_type] ?? TOPIC_TYPE_KR.default
  const tierStyle = TIER_KR[item.tier] ?? TIER_KR.FREE

  return (
    <div className="space-y-3">
      {/* 헤더: 질문 + regime + topic + tier + 적중 배지 */}
      <div className="flex items-start gap-2 px-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-bold"
              style={{ color: tierStyle.color, backgroundColor: tierStyle.bg, border: `1px solid ${tierStyle.border}` }}
            >
              {tierStyle.label}
            </span>
            {regimeKr && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                시장체제: {regimeKr}
              </span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-[var(--text-dim)] border border-[var(--border)] font-bold">
              {topicKr}
            </span>
            {item.outcome_tagged && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                item.hit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {item.hit ? '적중' : '빗나감'}
              </span>
            )}
          </div>
          <div className="text-sm text-[var(--text-primary)] font-bold leading-snug">
            ❓ {localizeText(item.question)}
          </div>
        </div>
      </div>

      {/* 가로 카드 배치 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {scenarios.map((sc, idx) => (
          <HorizontalScenarioCard
            key={`${sc.name}-${idx}`}
            sc={sc}
            totalScenarios={scenarios.length}
          />
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

  // 최신 항목의 regime
  const latestRegime = items[0]?.regime
  const regimeLabel = latestRegime ? (REGIME_KR[latestRegime] ?? latestRegime) : null

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="text-base font-bold text-[var(--text-primary)] tracking-wider">시나리오 확률</span>
          {regimeLabel && (
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
              시장체제: {regimeLabel}
            </span>
          )}
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
              <div className="h-24 bg-gray-200 animate-pulse rounded" />
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
