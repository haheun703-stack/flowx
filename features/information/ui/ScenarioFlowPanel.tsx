'use client'

import { useState } from 'react'
import { useMacroDaily } from '@/features/macro/api/useMacroDashboard'
import { useInformationSupplyDemand } from '../api/useInformation'

// ─── 타입 ───

interface Scenario {
  name: string
  prob: number
  color: string
  bgColor: string
  impact: string
  action: string
}

interface Condition {
  name: string
  threshold: string
  current: string
  met: 'yes' | 'no' | 'pending'
}

interface TabData {
  question: string
  startLabel: string
  startColor: string
  startBorder: string
  scenarios: Scenario[]
  conditions: Condition[]
}

// ─── 정적 시나리오 데이터 (스펙 §4) ───

function buildScenarioData(usdkrw: number, vix: number, foreignStreak: number): Record<string, TabData> {
  return {
    market: {
      question: '시장이 살짝 회복 중인데... 계속 오를까?',
      startLabel: '지금 여기',
      startColor: '#EFF6FF',
      startBorder: '#93C5FD',
      scenarios: [
        { name: '계속 오른다', prob: 50, color: '#16A34A', bgColor: '#ECFDF5', impact: 'KOSPI 보합~소폭 상승', action: '반도체 ETF 분할 매수. 현금 40% 유지.' },
        { name: '다시 흔들린다', prob: 30, color: '#D97706', bgColor: '#FFFBEB', impact: 'KOSPI ±2~3%', action: '신규 매수 중단, 손절 -5% 타이트하게.' },
        { name: '갑자기 폭락', prob: 20, color: '#DC2626', bgColor: '#FEF2F2', impact: 'KOSPI -5% 이상', action: '현금 70%+ 확보, 인버스 헤지. 패닉 매도 금지!' },
      ],
      conditions: [
        { name: '외국인 매수 전환', threshold: '3일 연속 순매수', current: foreignStreak >= 3 ? `${foreignStreak}일 순매수` : `${Math.abs(foreignStreak)}일 순매도 중`, met: foreignStreak >= 3 ? 'yes' : 'no' },
        { name: 'KOSPI 저평가', threshold: 'PBR 0.9배 이하', current: '0.87배', met: 'yes' },
        { name: '환율 안정', threshold: '1,400원 이하', current: `${usdkrw.toFixed(0)}원`, met: usdkrw <= 1400 ? 'yes' : 'no' },
      ],
    },
    fomc: {
      question: '다음 주 FOMC — 금리 어떻게 될까?',
      startLabel: 'FOMC 대기',
      startColor: '#EDE9FE',
      startBorder: '#C4B5FD',
      scenarios: [
        { name: '예상대로 동결', prob: 45, color: '#16A34A', bgColor: '#ECFDF5', impact: 'KOSPI 보합', action: '기존 포지션 유지. 실적주 관심.' },
        { name: '깜짝 금리 인하', prob: 25, color: '#2563EB', bgColor: '#EFF6FF', impact: 'KOSPI +1~3%', action: '성장주/기술주 비중 확대!' },
        { name: '깜짝 금리 인상', prob: 20, color: '#DC2626', bgColor: '#FEF2F2', impact: 'KOSPI -2~4%', action: '방어주 전환, 현금 비중 60%.' },
        { name: '한국 직접 타격', prob: 10, color: '#991B1B', bgColor: '#FEF2F2', impact: 'KOSPI -3~5%', action: '인버스 ETF 헤지, 수출주 매도.' },
      ],
      conditions: [
        { name: 'CME FedWatch 동결 확률', threshold: '80% 이상', current: '85%', met: 'yes' },
        { name: '미국 실업률', threshold: '4.0% 이하 유지', current: '3.8%', met: 'yes' },
        { name: '미국 CPI', threshold: '전월 대비 하락', current: '발표 대기(D-7)', met: 'pending' },
      ],
    },
    tariff: {
      question: '미국 관세 — 한국 수출주 괜찮을까?',
      startLabel: '관세 이슈',
      startColor: '#FEF3C7',
      startBorder: '#FCD34D',
      scenarios: [
        { name: '예상 범위 내 관세', prob: 40, color: '#16A34A', bgColor: '#ECFDF5', impact: 'KOSPI 보합', action: '수출주 분할 매수 검토.' },
        { name: '관세 완화 / 협상 성공', prob: 25, color: '#2563EB', bgColor: '#EFF6FF', impact: 'KOSPI +3~5%', action: '자동차/반도체 적극 매수!' },
        { name: '관세 확대 (추가 타격)', prob: 25, color: '#DC2626', bgColor: '#FEF2F2', impact: 'KOSPI -3~5%', action: '수출주 비중 축소, 내수주 전환.' },
        { name: '보복 관세 (무역전쟁)', prob: 10, color: '#991B1B', bgColor: '#FEF2F2', impact: 'KOSPI -5%+', action: '전량 현금화 고려. 인버스 헤지.' },
      ],
      conditions: [
        { name: '한미 협상 진전', threshold: '실무 합의', current: '협의 중', met: 'pending' },
        { name: '반도체 면제', threshold: '면제 확정', current: '가능성 높음', met: 'yes' },
        { name: '자동차 관세', threshold: '25% 이하', current: '25% 유지', met: 'no' },
      ],
    },
  }
}

// ─── 플로우 트리 SVG ───

function FlowTreeSVG({ data }: { data: TabData }) {
  const scenarios = data.scenarios
  const count = scenarios.length
  const W = 700, H = count <= 3 ? 230 : 280
  const nodeH = 52, gap = 12

  // Y 위치 계산
  const totalH = count * nodeH + (count - 1) * gap
  const startY = (H - totalH) / 2
  const scenarioYs = scenarios.map((_, i) => startY + i * (nodeH + gap))

  // 시작 노드
  const sX = 10, sY = H / 2 - 30, sW = 115, sH = 60
  // 시나리오 노드
  const scX = 240, scW = 155
  // 액션 노드
  const acX = 510, acW = 180

  // 화살표 굵기: 확률 비례
  const getStroke = (prob: number) => {
    if (prob >= 40) return 3.5
    if (prob >= 25) return 2.5
    if (prob >= 15) return 1.8
    return 1.2
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 300 }}>
      {/* 시작 노드 */}
      <rect x={sX} y={sY} width={sW} height={sH} rx="10" fill={data.startColor} stroke={data.startBorder} strokeWidth="1.5" />
      <text x={sX + sW / 2} y={sY + 22} textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="system-ui">{data.startLabel}</text>
      <text x={sX + sW / 2} y={sY + 40} textAnchor="middle" fontSize="11" fill="#1A1A2E" fontWeight="700" fontFamily="system-ui">현재 상태</text>

      {scenarios.map((sc, i) => {
        const yMid = scenarioYs[i] + nodeH / 2
        const startMidY = sY + sH / 2
        const stroke = getStroke(sc.prob)

        return (
          <g key={sc.name}>
            {/* 시작→시나리오 화살표 */}
            <path
              d={`M ${sX + sW} ${startMidY} C ${sX + sW + 40} ${startMidY} ${scX - 40} ${yMid} ${scX} ${yMid}`}
              fill="none" stroke={sc.color} strokeWidth={stroke} opacity={0.5}
            />
            {/* 화살촉 */}
            <polygon
              points={`${scX},${yMid - 4} ${scX - 8},${yMid} ${scX},${yMid + 4}`}
              fill={sc.color} opacity={0.5}
              transform={`rotate(180, ${scX - 4}, ${yMid})`}
            />
            {/* 확률 라벨 */}
            <text x={(sX + sW + scX) / 2} y={yMid - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill={sc.color} fontFamily="system-ui">
              {sc.prob}%
            </text>

            {/* 시나리오 노드 */}
            <rect
              x={scX} y={scenarioYs[i]} width={scW} height={nodeH} rx="8"
              fill={sc.bgColor} stroke={sc.color}
              strokeWidth={i === 0 ? 2 : 1}
              className={i === 0 ? 'animate-pulse' : ''}
            />
            <text x={scX + 10} y={scenarioYs[i] + 20} fontSize="11" fontWeight="700" fill="#1A1A2E" fontFamily="system-ui">
              {sc.name}
            </text>
            <text x={scX + 10} y={scenarioYs[i] + 38} fontSize="9" fill="#6B7280" fontFamily="system-ui">
              {sc.impact}
            </text>

            {/* 시나리오→액션 화살표 */}
            <line x1={scX + scW} y1={yMid} x2={acX} y2={yMid} stroke="#D1D5DB" strokeWidth="1.5" />
            <polygon points={`${acX},${yMid - 3} ${acX - 6},${yMid} ${acX},${yMid + 3}`} fill="#D1D5DB" transform={`rotate(180, ${acX - 3}, ${yMid})`} />

            {/* 액션 노드 */}
            <rect x={acX} y={scenarioYs[i]} width={acW} height={nodeH} rx="8" fill="#FFF" stroke={sc.color} strokeWidth="1" opacity="0.8" />
            <text x={acX + 10} y={scenarioYs[i] + 18} fontSize="9" fontWeight="700" fill={sc.color} fontFamily="system-ui">
              이렇게 하세요
            </text>
            <text x={acX + 10} y={scenarioYs[i] + 34} fontSize="8.5" fill="#4B5563" fontFamily="system-ui">
              {sc.action.length > 28 ? sc.action.slice(0, 28) + '…' : sc.action}
            </text>
            {sc.action.length > 28 && (
              <text x={acX + 10} y={scenarioYs[i] + 46} fontSize="8.5" fill="#4B5563" fontFamily="system-ui">
                {sc.action.slice(28, 56)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── 전환 조건 모니터링 ───

function TransitionConditions({ conditions }: { conditions: Condition[] }) {
  const metCount = conditions.filter(c => c.met === 'yes').length
  const verdicts = ['아직 이르다', '아직 이르다', '전환 임박 — 주시 필요!', '유입 전환 가능성 높음!']
  const verdictColors = ['#D97706', '#D97706', '#059669', '#16A34A']

  return (
    <div className="mt-4 p-4 rounded-xl border-2 border-[#16a34a]/30 bg-white">
      <div className="text-[13px] font-bold text-[#059669] mb-3">
        지금 → 다음 단계, 무엇이 바뀌면 전환될까?
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {conditions.map(c => {
          const icon = c.met === 'yes' ? '✓' : c.met === 'no' ? '✕' : '△'
          const iconColor = c.met === 'yes' ? '#16A34A' : c.met === 'no' ? '#DC2626' : '#D97706'
          const bg = c.met === 'yes' ? '#ECFDF5' : c.met === 'pending' ? '#FFFBEB' : '#F5F4F0'

          return (
            <div key={c.name} className="p-3 rounded-lg" style={{ backgroundColor: bg }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#1A1A2E]">{c.name}</span>
                <span className="text-[13px] font-bold" style={{ color: iconColor }}>{icon}</span>
              </div>
              <div className="text-[10px] text-gray-500 mb-1">기준: {c.threshold}</div>
              <div className="text-[11px] font-semibold text-[#1A1A2E]">현재: {c.current}</div>
              {/* 프로그레스 바 */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: c.met === 'yes' ? '100%' : c.met === 'pending' ? '50%' : '15%',
                    backgroundColor: iconColor,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {/* 판정 */}
      <div
        className="mt-3 p-2 rounded-lg text-center text-[12px] font-bold"
        style={{ backgroundColor: '#FFFBEB', color: verdictColors[Math.min(metCount, 3)] }}
      >
        판정: 3개 중 {metCount}개 충족 — {verdicts[Math.min(metCount, 3)]}
      </div>
    </div>
  )
}

// ─── 주간 변화 + 이벤트 ───

function WeeklyChangeAndEvents() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
      {/* 좌: 지난주 대비 변화 */}
      <div className="p-3 rounded-lg bg-[#F5F4F0]">
        <div className="text-[12px] font-bold text-[#1A1A2E] mb-2">지난주 대비 뭐가 바뀌었나?</div>
        <div className="space-y-1.5">
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#16A34A]">↑ 좋아진 것:</span>{' '}
            <span className="text-[#374151]">KOSPI 반등, 기관 순매수 전환</span>
          </div>
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#DC2626]">↓ 나빠진 것:</span>{' '}
            <span className="text-[#374151]">환율 1,500원 돌파, 유가 급등</span>
          </div>
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#D97706]">→ 유지:</span>{' '}
            <span className="text-[#374151]">외국인 순매도 지속, VIX 경계 수준</span>
          </div>
        </div>
      </div>

      {/* 우: 다음 주 이벤트 */}
      <div className="p-3 rounded-lg bg-[#F5F4F0]">
        <div className="text-[12px] font-bold text-[#1A1A2E] mb-2">다음 주 주목 이벤트</div>
        <div className="space-y-1.5">
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#DC2626]">D-4</span>{' '}
            <span className="text-[#374151]">FOMC — 금리 동결 예상. 결과에 따라 확률 변동.</span>
          </div>
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#D97706]">D-7</span>{' '}
            <span className="text-[#374151]">CPI — 물가 하회 시 기술주 반등 기대.</span>
          </div>
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#6B7280]">D-11</span>{' '}
            <span className="text-[#374151]">삼전 실적 — 실적 전 주가 패턴 관심.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 패널 ───

const TABS = [
  { key: 'market', label: '시장 전망' },
  { key: 'fomc', label: 'FOMC' },
  { key: 'tariff', label: '관세' },
] as const

type TabKey = typeof TABS[number]['key']

export function ScenarioFlowPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>('market')
  const { data: macroData } = useMacroDaily()
  const { data: supplyData } = useInformationSupplyDemand()

  const usdkrw = macroData?.items?.find(i => i.symbol === 'USDKRW')?.value ?? 1400
  const vix = macroData?.items?.find(i => i.symbol === 'VIX')?.value ?? 20
  const foreignStreak = supplyData?.foreign_streak ?? 0

  const allData = buildScenarioData(usdkrw, vix, foreignStreak)
  const tabData = allData[activeTab]

  return (
    <div className="fx-card-green">
      {/* 타이틀 */}
      <div className="mb-1">
        <div className="text-[15px] font-black text-[#1A1A2E]">지금 시장은 어디에 있을까?</div>
        <div className="text-[12px] text-[#6B7280] mt-0.5">AI가 매일 시장 흐름을 분석하고, 앞으로 뭐가 일어날지 예측해요</div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-4">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="text-[10px] px-2.5 py-1 rounded-md font-semibold transition-colors"
            style={{
              backgroundColor: activeTab === t.key ? '#00FF88' : '#F0EDE8',
              color: activeTab === t.key ? '#0A3D23' : '#6B7280',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 질문 */}
      <div className="text-[13px] font-bold text-[#1A1A2E] mb-3 px-1">
        ❓ {tabData.question}
      </div>

      {/* 플로우 트리 SVG */}
      <div className="bg-[#FAFAF8] rounded-xl border border-[#F0EDE8] p-3">
        <FlowTreeSVG data={tabData} />
      </div>

      {/* 전환 조건 모니터링 */}
      <TransitionConditions conditions={tabData.conditions} />

      {/* 주간 변화 + 이벤트 */}
      <WeeklyChangeAndEvents />

      {/* 면책 */}
      <div className="text-[9px] text-[#C4C1BA] text-center mt-3">
        위 시나리오 분석은 AI 기반 참고 자료이며, 투자 조언이 아닙니다. 전환 조건이 충족되면 확률이 자동 변경돼요.
      </div>
    </div>
  )
}
