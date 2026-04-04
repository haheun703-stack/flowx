'use client'

import type { ActiveScenario, DeepAnalysis, ScenarioPhase } from '../types'

// ─── 시나리오별 그라데이션 매핑 ───

function getGradient(name: string): { bg: string; border: string; messageColor: string } {
  const lower = name.toLowerCase()
  if (lower.includes('전쟁') || lower.includes('위기') || lower.includes('분쟁') || lower.includes('이란'))
    return { bg: 'linear-gradient(135deg, #FEF2F2, #FFFBEB)', border: '#DC2626', messageColor: '#991B1B' }
  if (lower.includes('기술') || lower.includes('ipo') || lower.includes('ai') || lower.includes('반도체'))
    return { bg: 'linear-gradient(135deg, #EDE9FE, #EFF6FF)', border: '#7C3AED', messageColor: '#5B21B6' }
  // 경제/정책 (기본)
  return { bg: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)', border: '#2563EB', messageColor: '#1E40AF' }
}

function scoreBadge(score: number) {
  if (score >= 80) return 'bg-[#991B1B]'
  if (score >= 60) return 'bg-[#DC2626]'
  if (score >= 40) return 'bg-[#F59E0B]'
  return 'bg-[#9CA3AF]'
}

// ─── Phase 프로그레스 바 ───

function PhaseBar({ chain, currentPhase }: { chain: ScenarioPhase[]; currentPhase: number }) {
  if (!chain?.length) return null

  return (
    <div className="flex gap-1 mt-4">
      {chain.map((ph) => {
        const isDone = ph.phase < currentPhase
        const isCurrent = ph.phase === currentPhase

        return (
          <div key={ph.phase} className="flex-1 text-center min-w-0">
            <div
              className="h-[8px] rounded-full mb-1"
              style={{
                backgroundColor: isDone ? '#DC2626' : isCurrent ? '#F59E0B' : '#E8E6E0',
              }}
            />
            <p
              className="text-[16px] font-bold leading-tight truncate"
              style={{ color: isCurrent ? '#F59E0B' : '#6B7280' }}
            >
              {isCurrent ? `▶ P${ph.phase} 지금` : `P${ph.phase}`}
            </p>
            <p className="text-[14px] text-[#9CA3AF] leading-tight truncate">
              {ph.name.split('(')[0].trim()}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ─── HOT/COLD 뱃지 ───

function SectorBadges({ hot, cold }: { hot: string[]; cold: string[] }) {
  if (!hot.length && !cold.length) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {hot.map(s => (
        <span key={s} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-[#DC2626] border border-red-200">
          HOT {s}
        </span>
      ))}
      {cold.map(s => (
        <span key={s} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
          COLD {s}
        </span>
      ))}
    </div>
  )
}

// ─── 메인 히어로 카드 ───

interface HeroCardProps {
  scenario: ActiveScenario
  analysis?: DeepAnalysis
}

export default function HeroCard({ scenario, analysis }: HeroCardProps) {
  const { bg, border, messageColor } = getGradient(scenario.name)

  // 핵심 메시지: logic → 상황, reasons[0] → 액션
  const situationMsg = scenario.logic || '시나리오 분석 진행 중'
  const actionMsg = scenario.reasons?.[0] || ''

  // 주간 변화 (현재 데이터에 score_change 없으면 미표시)
  const sc = scenario as ActiveScenario & { score_change?: number; prev_phase?: number }
  const scoreChange = sc.score_change ?? null
  const phaseChanged = sc.prev_phase != null && sc.prev_phase !== scenario.current_phase

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: bg,
        border: `2px solid ${border}`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* 좌측: 메인 정보 */}
        <div className="flex-1 min-w-0">
          {/* 시나리오명 + 점수 + Phase/D+ */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-[22px] font-bold text-[#1A1A2E] leading-tight">
              {scenario.name}
            </h2>
            <span className={`text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full ${scoreBadge(scenario.score)}`}>
              {scenario.score}점
            </span>
          </div>

          <p className="text-[10px] text-[#6B7280] mt-1">
            Phase {scenario.current_phase}/{scenario.total_phases} · D+{scenario.days_active}
          </p>

          {/* 핵심 메시지 1줄: 상황 */}
          <p className="text-[15px] font-bold mt-3 leading-snug" style={{ color: messageColor }}>
            {situationMsg}
          </p>

          {/* 핵심 메시지 2줄: 액션 */}
          {actionMsg && (
            <p className="text-[15px] font-bold text-[#059669] mt-1 leading-snug">
              {actionMsg}
            </p>
          )}

          {/* HOT/COLD 뱃지 */}
          <SectorBadges hot={scenario.hot_sectors} cold={scenario.cold_sectors} />
        </div>

        {/* 우측: 이번 주 변화 박스 */}
        {(scoreChange !== null || phaseChanged) && (
          <div
            className="shrink-0 rounded-xl px-4 py-3 text-center"
            style={{
              background: '#FFF',
              border: '1px solid #E8E6E0',
              minWidth: 100,
            }}
          >
            <p className="text-[10px] text-[#6B7280] font-medium mb-1">이번 주 변화</p>
            {scoreChange !== null && (
              <p
                className="text-[13px] font-bold"
                style={{ color: scoreChange >= 0 ? '#16A34A' : '#DC2626' }}
              >
                {scoreChange >= 0 ? '+' : ''}{scoreChange}
              </p>
            )}
            {phaseChanged && (
              <p className="text-[11px] font-bold text-[#D97706] mt-0.5">
                P{sc.prev_phase}→P{scenario.current_phase} 전환!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Phase 바 */}
      <PhaseBar chain={scenario.chain} currentPhase={scenario.current_phase} />
    </div>
  )
}
