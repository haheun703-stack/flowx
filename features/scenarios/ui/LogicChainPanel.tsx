'use client'

import type { ActiveScenario, DeepAnalysis } from '../types'

// ─── 보이지 않는 손의 논리 — 4단계 가로 체인 (v2: 크기 차등화 + 결론 깜빡임) ───

interface LogicChainProps {
  scenario: ActiveScenario
  analysis?: DeepAnalysis
}

const NODES: { key: string; label: string; bg: string; border: string; borderWidth: number; flex: string; pulse?: boolean }[] = [
  { key: 'trigger', label: '트리거', bg: '#FEF2F2', border: '#FECACA', borderWidth: 1, flex: '1' },
  { key: 'logic', label: '핵심 논리', bg: '#FFFBEB', border: '#FDE68A', borderWidth: 2, flex: '1.5' },
  { key: 'direction', label: '투자 방향', bg: '#F0FDF4', border: '#BBF7D0', borderWidth: 1, flex: '1' },
  { key: 'conclusion', label: '결론', bg: '#E8F5E9', border: '#00CC6A', borderWidth: 2, flex: '1', pulse: true },
]

function extractChainData(scenario: ActiveScenario, analysis?: DeepAnalysis) {
  const trigger = scenario.chain?.[0]?.name || scenario.name.split('(')[0].trim()
  const logic = scenario.logic || '분석 진행 중'
  const hotSectors = scenario.hot_sectors.slice(0, 3).join(', ')
  const direction = hotSectors ? `${hotSectors} 롱` : '분석 중'

  let conclusion = ''
  if (analysis?.beneficiaries?.length) {
    const topBeneficiary = analysis.beneficiaries[0]
    const hasStopCondition = analysis.beneficiaries.some(b => b.stop_condition && b.stop_condition !== '없음')
    conclusion = hasStopCondition ? '손해 제한, 이익 무제한' : `${topBeneficiary.name} 수혜 지속`
  } else {
    conclusion = scenario.score >= 60 ? '시나리오 유효 — 포지션 유지' : '관망 필요'
  }

  return { trigger, logic, direction, conclusion }
}

export default function LogicChainPanel({ scenario, analysis }: LogicChainProps) {
  const data = extractChainData(scenario, analysis)
  const values: Record<string, string> = {
    trigger: data.trigger,
    logic: data.logic,
    direction: data.direction,
    conclusion: data.conclusion,
  }

  return (
    <div>
      <div className="flex items-stretch gap-2">
        {NODES.map((node, i) => (
          <div key={node.key} className="flex items-stretch min-w-0" style={{ flex: node.flex }}>
            {/* 노드 */}
            <div
              className={`flex-1 rounded-lg p-3 text-center min-w-0 ${node.pulse ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: node.bg,
                border: `${node.borderWidth}px solid ${node.border}`,
              }}
            >
              <p className="text-[11px] font-black text-[#6B7280] mb-1 uppercase tracking-wider">
                {node.label}
              </p>
              <p className="text-[13px] font-bold text-[#1A1A2E] leading-snug break-words">
                {node.key === 'conclusion' && values[node.key].includes('이익 무제한') ? (
                  <span className="text-[#059669] font-bold">{values[node.key]}</span>
                ) : node.key === 'logic' && values[node.key].includes('하방 없음') ? (
                  <span className="text-[#DC2626] font-bold">{values[node.key]}</span>
                ) : (
                  values[node.key]
                )}
              </p>
            </div>

            {/* 화살표 */}
            {i < NODES.length - 1 && (
              <div className="flex items-center px-1 text-[#9CA3AF] text-lg font-light shrink-0">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
