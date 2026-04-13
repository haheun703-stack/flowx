'use client'

/* ══════════════════════════════════════════════════════════════
   AI 데이터센터 공급망 유니버스 — 완전판 (4개 섹션 통합)
   Section 1: 공급망 유니버스 맵 (비주얼 다이어그램 SVG)
   Section 2: 투자 타이밍 로드맵 (병목의 이동)
   Section 3: 리스크 시나리오 (4가지 위기)
   Section 4: 섹터 간 연쇄반응 맵 (인과관계 체인)
   ══════════════════════════════════════════════════════════════ */

import { useState } from 'react'

// ─── 타입 ───
interface Stock { name: string; type: 'big' | 'small' }

interface SupplyStep {
  step: number
  label: string
  color: string
  title: string
  sub: string
  stocks: Stock[]
}

interface Phase {
  num: number
  title: string
  color: string
  badge: string
  badgeBg: string
  blink?: boolean
  desc: string
  lesson: string
}

interface RiskScenario {
  id: string
  color: string
  title: string
  prob: string
  desc: string
  chain: ChainNode[]
  impacts: Impact[]
  tip: string
  tipLabel: string
}

interface ChainNode { text: string; type: 'trigger' | 'hit' | 'safe' | 'neutral' }
interface Impact { label: string; type: 'dead' | 'hurt' | 'ok' }

interface ChainReaction {
  num: number
  color: string
  title: string
  chain: ChainNode[]
  tip: string
}

interface Law { num: number; color: string; title: string; desc: string }

// ─── 데이터 ───
const SUPPLY_STEPS: SupplyStep[] = [
  {
    step: 1, label: 'STEP 1 — 연산', color: '#3b82f6', title: '반도체', sub: 'GPU / HBM / 패키징',
    stocks: [
      { name: 'SK하이닉스', type: 'big' }, { name: '삼성전자', type: 'big' },
      { name: '한미반도체', type: 'small' }, { name: 'ISC', type: 'small' },
      { name: '리노공업', type: 'small' }, { name: '네패스아크', type: 'small' },
      { name: '테크윙', type: 'small' }, { name: '삼성전기', type: 'small' },
    ],
  },
  {
    step: 2, label: 'STEP 2 — 에너지', color: '#f87171', title: '전력 / 원전', sub: '변압기 / 송배전 / SMR',
    stocks: [
      { name: '두산에너빌리티', type: 'big' }, { name: '한국전력', type: 'big' },
      { name: 'HD현대일렉트릭', type: 'small' }, { name: 'LS일렉트릭', type: 'small' },
      { name: '일진전기', type: 'small' }, { name: '대한전선', type: 'small' }, { name: '제룡전기', type: 'small' },
    ],
  },
  {
    step: 3, label: 'STEP 3 — 열관리', color: '#34d399', title: '냉각', sub: '액침냉각 / 열교환기',
    stocks: [
      { name: '한온시스템', type: 'big' }, { name: '삼성E&A', type: 'big' },
      { name: '에이텍', type: 'small' }, { name: '월덱스', type: 'small' },
    ],
  },
  {
    step: 4, label: 'STEP 4 — 연결', color: '#8b5cf6', title: '통신 / 광케이블', sub: '광인터커넥트 / 스위치',
    stocks: [
      { name: 'SK텔레콤', type: 'big' }, { name: 'KT', type: 'big' },
      { name: '우리로', type: 'small' }, { name: '옵티시스', type: 'small' }, { name: '오이솔루션', type: 'small' },
    ],
  },
  {
    step: 5, label: 'STEP 5 — 시설', color: '#eab308', title: '건설 / 인프라', sub: 'DC 시설 / 토목 / 전기',
    stocks: [
      { name: '삼성물산', type: 'big' }, { name: '현대건설', type: 'big' },
      { name: '케이피에프', type: 'small' }, { name: '서전기전', type: 'small' },
    ],
  },
  {
    step: 6, label: 'STEP 6 — 운영', color: '#f97316', title: '로봇 / 자동화', sub: 'DC 운영 / 산업용',
    stocks: [
      { name: '현대차', type: 'big' },
      { name: '레인보우로보틱스', type: 'small' }, { name: '두산로보틱스', type: 'small' },
    ],
  },
]

const BIG_TECHS = [
  { name: 'NVIDIA', abbr: 'NV', color: '#76b900' },
  { name: 'Google', abbr: 'G', color: '#4285f4' },
  { name: 'Microsoft', abbr: 'MS', color: '#00a4ef' },
  { name: 'Amazon', abbr: 'AM', color: '#ff9900' },
  { name: 'Meta', abbr: 'MT', color: '#1877f2' },
]

const PHASES: Phase[] = [
  { num: 1, title: 'PHASE 1: 반도체', color: '#60a5fa', badge: '이미 움직임 \u2713', badgeBg: 'rgba(96,165,250,.1)', desc: '병목: GPU 수급 부족 → HBM 폭발적 수요. SK하이닉스 +180%, 한미반도체 +250%.', lesson: '대형주가 먼저, 소부장은 3~6개월 후행' },
  { num: 2, title: 'PHASE 2: 전력 / 변압기', color: '#f87171', badge: '지금 피크 !', badgeBg: 'rgba(248,113,113,.15)', blink: true, desc: '병목: DC 전력 수요 175%↑, 변압기 납기 2년+. HD현대일렉트릭 +320%.', lesson: '수주잔고 확인! 실적은 2~3분기 후행' },
  { num: 3, title: 'PHASE 3: 냉각 + 건설', color: '#34d399', badge: '다음 차례 →', badgeBg: 'rgba(52,211,153,.1)', desc: '병목: GPU 1장 = 1,000W+ 발열. 전력의 40% 냉각 소모. 한온시스템 · 에이텍 · 삼성물산.', lesson: '아직 저평가 구간, 선제 진입 타이밍 (2026.4월 현재)' },
  { num: 4, title: 'PHASE 4~5: 통신 → 로봇', color: '#8b5cf6', badge: '준비~초기', badgeBg: 'rgba(139,92,246,.1)', desc: '광케이블 교체 수요 + DC 자동화. 우리로, 레인보우로보틱스 등.', lesson: '"이미 오른 섹터" 추격 말고 "다음 병목" 선점하라' },
]

const RISK_SCENARIOS: RiskScenario[] = [
  {
    id: 'A', color: '#ef4444', title: 'AI 버블 붕괴 — 빅테크 CAPEX 축소', prob: '확률 20~30%',
    desc: 'AI 수익화 지연 → 빅테크 실적 미스 → CAPEX 삭감 → 전 공급망 급락. SMIC CEO: "수요 없는 빈 껍데기 전락 우려"',
    chain: [
      { text: 'CAPEX 삭감', type: 'trigger' }, { text: 'GPU 주문 취소', type: 'hit' },
      { text: '반도체 재고↑', type: 'hit' }, { text: 'DC 건설 중단', type: 'hit' },
      { text: '기수주분 유지', type: 'safe' },
    ],
    impacts: [
      { label: '반도체 –40%', type: 'dead' }, { label: '로봇 –35%', type: 'dead' },
      { label: '건설 –20%', type: 'hurt' }, { label: '전력(기수주) –5%', type: 'ok' },
    ],
    tipLabel: '방어법', tip: 'PER 30배↑ 소부장 정리 / 수주잔고 2년+ 전력주 홀딩 / 현금 40%↑',
  },
  {
    id: 'B', color: '#f59e0b', title: '금리 인상 / 스태그플레이션', prob: '확률 35~45%',
    desc: '이란 전쟁 → 유가 $120+ → 인플레 재점화 → 금리 동결/인상 → 성장주 밸류에이션 붕괴',
    chain: [
      { text: '유가 $120+', type: 'trigger' }, { text: 'DC 건설비↑', type: 'hit' },
      { text: '프로젝트 지연', type: 'hit' }, { text: 'PER 압축', type: 'hit' },
      { text: '에너지주 수혜', type: 'safe' },
    ],
    impacts: [
      { label: '건설 –30%', type: 'dead' }, { label: '로봇 –25%', type: 'hurt' },
      { label: '반도체 –20%', type: 'hurt' }, { label: '에너지주 +20%', type: 'ok' },
    ],
    tipLabel: '방어법', tip: '에너지(S-Oil) 헤지 편입 / 배당주 리밸런싱 / 유가 $100 돌파 시 건설 절반 축소',
  },
  {
    id: 'C', color: '#8b5cf6', title: '미중 기술전쟁 격화', prob: '확률 40~50%',
    desc: '301조 관세 + 반도체 수출 규제 강화 → 한국 반도체 중국 매출 타격 → 방산 반사이익',
    chain: [
      { text: '수출 규제 강화', type: 'trigger' }, { text: '중국 매출↓', type: 'hit' },
      { text: '소부장 연쇄', type: 'hit' }, { text: '국내DC 가속', type: 'safe' },
      { text: '방산 +25%', type: 'safe' },
    ],
    impacts: [
      { label: '반도체(중국↑) –30%', type: 'dead' }, { label: '건설(국내DC) +10%', type: 'ok' },
      { label: '방산주 +25%', type: 'ok' },
    ],
    tipLabel: '방어법', tip: '중국 매출 30%↑ 종목 체크 / 미국향 기업 선호 / 방산 헤지 20%',
  },
  {
    id: 'D', color: '#f97316', title: '전력 공급 실패 — DC 건설 병목', prob: '확률 50~60%',
    desc: 'DC 건설 속도 > 전력 인프라 확충 → 계통 병목 → DC 가동 지연. 위기 = 전력주 기회!',
    chain: [
      { text: '전력 계통 병목', type: 'trigger' }, { text: 'DC 가동 지연', type: 'hit' },
      { text: '변압기 수주 폭증', type: 'safe' }, { text: '원전/SMR 가속', type: 'safe' },
    ],
    impacts: [
      { label: '건설 –10%', type: 'hurt' }, { label: '전력 +30%↑', type: 'ok' },
      { label: '원전/SMR +40%↑', type: 'ok' },
    ],
    tipLabel: '기회', tip: '가장 높은 확률(50~60%). 전력 병목 심화 → HD현대일렉트릭, 두산에너빌리티 추가 수혜',
  },
]

const CHAIN_REACTIONS: ChainReaction[] = [
  {
    num: 1, color: '#60a5fa', title: '트리거: NVIDIA 실적 서프라이즈',
    chain: [
      { text: 'NVIDIA +15%', type: 'trigger' },
      { text: 'SK하이닉스 +8%\nD+0~1', type: 'neutral' },
      { text: '한미반도체 +12%\nD+1~3', type: 'neutral' },
      { text: '전력주 +5%\nD+1~5', type: 'neutral' },
      { text: '냉각주 +3%\nD+5~14', type: 'neutral' },
    ],
    tip: '대형주(D+0) → 소부장(D+1~3) → 후방산업(D+5~14). 대형주 급등 보고 소부장 진입 = 타이밍!',
  },
  {
    num: 2, color: '#eab308', title: '트리거: 빅테크 "DC 100개 신규 건설" 발표',
    chain: [
      { text: 'CAPEX 확대', type: 'trigger' },
      { text: '삼성물산 +6%', type: 'neutral' },
      { text: '일진전기 +8%', type: 'neutral' },
      { text: '한온시스템 +3%', type: 'neutral' },
      { text: '우리로 +4%', type: 'neutral' },
    ],
    tip: '전력은 "병목 프리미엄"으로 건설보다 더 크게 반응할 때가 있음 (일진전기 +8% > 삼성물산 +6%)',
  },
  {
    num: 3, color: '#ef4444', title: '역방향: NVIDIA 가이던스 하향',
    chain: [
      { text: 'NVIDIA –12%', type: 'trigger' },
      { text: 'SK하이닉스 –10%', type: 'hit' },
      { text: '한미반도체 –15%', type: 'hit' },
      { text: '전력주 –5%', type: 'hit' },
      { text: '방산주 +2%', type: 'safe' },
    ],
    tip: '하락 시 소부장이 대형주보다 1.5배 더 빠진다 (레버리지 효과). 소부장은 양날의 검!',
  },
]

const LAWS: Law[] = [
  { num: 1, color: '#60a5fa', title: '선행 후행', desc: '대형주가 먼저, 소부장 1~7일 후행\n대형주 급등 → 소부장 진입 타이밍' },
  { num: 2, color: '#f87171', title: '감쇄의 법칙', desc: '트리거에서 멀수록 반응↓\n예외: 병목 섹터는 오히려 증폭' },
  { num: 3, color: '#eab308', title: '레버리지', desc: '소부장 = 대형주의 1.5~2배 진폭\n+15% 올라갈 때 –15%도 각오' },
  { num: 4, color: '#22c55e', title: '역상관', desc: 'AI 하락 → 방산/에너지 상승\n역상관 종목 20% 편입 = 보험' },
]

// ─── 서브 컴포넌트 ───

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="relative text-center py-8">
      <div className="absolute top-1/2 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#a78bfa33] to-transparent" />
      <span className="relative bg-white px-4 text-[14px] font-bold text-[#1A1A2E]">{title}</span>
    </div>
  )
}

function StockTag({ name, type }: Stock) {
  const dotColor = type === 'big' ? '#3b82f6' : '#f59e0b'
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-[#F5F4F0] border border-[#E8E6E0]">
      <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: dotColor }} />
      <span className={type === 'big' ? 'font-bold text-[#1A1A2E]' : 'text-[#374151]'}>{name}</span>
    </span>
  )
}

function ChainNodeBadge({ node }: { node: ChainNode }) {
  const styles: Record<string, string> = {
    trigger: 'bg-red-50 border-red-300 text-[#ef4444] font-bold',
    hit: 'bg-red-50/50 border-red-200 text-[#ef4444]',
    safe: 'bg-green-50/50 border-green-200 text-[#22c55e]',
    neutral: 'bg-[#F5F4F0] border-[#E8E6E0] text-[#374151]',
  }
  return (
    <span className={`inline-block text-[10px] px-2 py-1 rounded border whitespace-pre-line leading-tight ${styles[node.type] ?? styles.neutral}`}>
      {node.text}
    </span>
  )
}

function ImpactBadge({ impact }: { impact: Impact }) {
  const styles: Record<string, { bg: string; dotColor: string; text: string }> = {
    dead: { bg: 'bg-red-50', dotColor: '#ef4444', text: 'text-[#ef4444]' },
    hurt: { bg: 'bg-amber-50', dotColor: '#f59e0b', text: 'text-[#f59e0b]' },
    ok: { bg: 'bg-green-50', dotColor: '#22c55e', text: 'text-[#22c55e]' },
  }
  const s = styles[impact.type]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded ${s.bg} ${s.text}`}>
      <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: s.dotColor }} />
      {impact.label}
    </span>
  )
}

// ─── 섹션 1: 공급망 유니버스 맵 ───

function SupplyChainMap() {
  return (
    <div className="space-y-4">
      {/* 범례 */}
      <div className="flex gap-3 justify-center flex-wrap text-[11px] text-[#6B7280]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a78bfa]" />빅테크</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" />대형주</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" />소부장주</span>
      </div>

      {/* STEP 0: 빅테크 발주처 */}
      <div className="bg-[#F5F4F0] rounded-2xl p-4 border border-[#E8E6E0]">
        <p className="text-center text-[10px] font-bold text-[#9CA3AF] tracking-wider mb-3">STEP 0 — 최초 발주처</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {BIG_TECHS.map(t => (
            <div key={t.abbr} className="flex flex-col items-center gap-1">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                style={{ background: t.color }}
              >{t.abbr}</div>
              <span className="text-[10px] text-[#6B7280]">{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 화살표 */}
      <p className="text-center text-[10px] text-[#9CA3AF]">▼ CAPEX 발주 / 투자 ▼</p>

      {/* AI 데이터센터 허브 */}
      <div className="bg-white rounded-2xl border border-[#E8E6E0] p-5 text-center">
        <p className="text-[18px] font-black text-[#1A1A2E]">AI 데이터센터</p>
        <p className="text-[11px] text-[#6B7280] mt-1">GPU 수만 장 · 100MW+</p>
        <p className="text-[10px] text-[#9CA3AF] mt-2">▼ 구동에 필요한 6가지 ▼</p>
      </div>

      {/* STEP 1~3: 핵심 인프라 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SUPPLY_STEPS.slice(0, 3).map(s => (
          <SupplyStepCard key={s.step} step={s} />
        ))}
      </div>

      <p className="text-center text-[10px] text-[#9CA3AF]">▼ 인프라 구축 후 연결 · 운영 단계 ▼</p>

      {/* STEP 4~6: 연결 · 운영 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SUPPLY_STEPS.slice(3).map(s => (
          <SupplyStepCard key={s.step} step={s} />
        ))}
      </div>

      {/* 밸류체인 요약 */}
      <div className="bg-[#F5F4F0] rounded-2xl p-4 border border-[#E8E6E0] text-center">
        <p className="text-[12px] font-bold text-[#1A1A2E]">
          밸류체인 흐름: 빅테크 발주 → GPU 주문 → DC 건설 → 전력 확보 → 냉각 설치 → 광케이블 연결 → 운영 자동화
        </p>
        <p className="text-[10px] text-[#9CA3AF] mt-1">2030년까지 글로벌 DC 전력 수요 175% 증가 전망 (골드만삭스)</p>
      </div>
    </div>
  )
}

function SupplyStepCard({ step }: { step: SupplyStep }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E0] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: step.color }} />
      <p className="text-[9px] font-bold tracking-wider mb-2" style={{ color: step.color }}>{step.label}</p>
      <p className="text-[16px] font-black text-[#1A1A2E]">{step.title}</p>
      <p className="text-[10px] text-[#6B7280] mb-3">{step.sub}</p>
      <div className="flex flex-wrap gap-1">
        {step.stocks.map(s => <StockTag key={s.name} {...s} />)}
      </div>
    </div>
  )
}

// ─── 섹션 2: 투자 타이밍 로드맵 ───

function InvestmentRoadmap() {
  return (
    <div className="space-y-2">
      <p className="text-center text-[12px] text-[#6B7280] mb-3">
        GPU 병목이 풀리면 → 다음 병목이 투자 기회. 돈은 병목을 따라 이동한다.
      </p>
      {PHASES.map(p => (
        <div
          key={p.num}
          className="bg-white rounded-xl border border-[#E8E6E0] p-4"
          style={{ borderLeft: `3px solid ${p.color}` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ background: p.color }}
            >{p.num}</div>
            <span className="text-[14px] font-black text-[#1A1A2E]">{p.title}</span>
            <span
              className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${p.blink ? 'animate-pulse' : ''}`}
              style={{ background: p.badgeBg, color: p.color }}
            >{p.badge}</span>
          </div>
          <p className="text-[12px] text-[#6B7280] leading-relaxed">
            {p.desc}
            <br />
            <strong className="text-[#1A1A2E]">주린이 교훈: {p.lesson}</strong>
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── 섹션 3: 리스크 시나리오 ───

function RiskScenarios() {
  return (
    <div className="space-y-3">
      <p className="text-center text-[12px] text-[#6B7280] mb-3">
        주린이는 오를 때만 보지만, 프로는 빠질 때를 먼저 본다
      </p>

      {RISK_SCENARIOS.map(r => (
        <div
          key={r.id}
          className="bg-white rounded-xl border border-[#E8E6E0] overflow-hidden"
          style={{ borderLeft: `3px solid ${r.color}` }}
        >
          {/* 헤더 */}
          <div className="px-4 py-3 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
              style={{ background: r.color }}
            >{r.id}</div>
            <p className="text-[14px] font-black text-[#1A1A2E] flex-1">{r.title}</p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
              style={{ background: `${r.color}18`, color: r.color }}
            >{r.prob}</span>
          </div>

          {/* 바디 */}
          <div className="px-4 pb-4 space-y-3">
            <p className="text-[11px] text-[#6B7280] leading-relaxed">{r.desc}</p>

            {/* 연쇄 체인 */}
            <div className="flex items-center gap-1 flex-wrap">
              {r.chain.map((c, i) => (
                <span key={i} className="contents">
                  <ChainNodeBadge node={c} />
                  {i < r.chain.length - 1 && <span className="text-[11px] text-[#9CA3AF]">→</span>}
                </span>
              ))}
            </div>

            {/* 임팩트 */}
            <div className="flex flex-wrap gap-1">
              {r.impacts.map((imp, i) => <ImpactBadge key={i} impact={imp} />)}
            </div>

            {/* 팁 */}
            <div className="bg-[#F5F4F0] rounded-lg p-3 text-[11px] text-[#6B7280]">
              <strong className="text-[#1A1A2E]">{r.tipLabel}:</strong> {r.tip}
            </div>
          </div>
        </div>
      ))}

      {/* 방어/위험 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-white rounded-xl border border-[#E8E6E0] p-3" style={{ borderLeft: '3px solid #22c55e' }}>
          <p className="text-[13px] font-bold text-[#22c55e] mb-1">어떤 시나리오든 버티는 종목</p>
          <p className="text-[11px] text-[#6B7280]">수주잔고 2년+ <strong className="text-[#1A1A2E]">전력 인프라주</strong>, AI 무관 <strong className="text-[#1A1A2E]">방산주</strong></p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E6E0] p-3" style={{ borderLeft: '3px solid #ef4444' }}>
          <p className="text-[13px] font-bold text-[#ef4444] mb-1">어떤 시나리오든 위험한 종목</p>
          <p className="text-[11px] text-[#6B7280]">PER 30배+ <strong className="text-[#1A1A2E]">실적 미검증 소부장</strong>. 분기 흑자 전환 + 수주잔고 없으면 위험.</p>
        </div>
      </div>
    </div>
  )
}

// ─── 섹션 4: 섹터 간 연쇄반응 맵 ───

function ChainReactionMap() {
  return (
    <div className="space-y-3">
      <p className="text-center text-[12px] text-[#6B7280] mb-3">
        하나의 뉴스가 어떻게 종목까지 전파되는지, 인과관계 체인을 따라가세요
      </p>

      {CHAIN_REACTIONS.map(cr => (
        <div
          key={cr.num}
          className="bg-white rounded-xl border border-[#E8E6E0] p-4"
          style={{ borderLeft: `3px solid ${cr.color}` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: cr.color }}
            >{cr.num}</div>
            <p className="text-[14px] font-black text-[#1A1A2E]">{cr.title}</p>
          </div>

          <div className="flex items-center gap-1 flex-wrap mb-3">
            {cr.chain.map((c, i) => (
              <span key={i} className="contents">
                <ChainNodeBadge node={c} />
                {i < cr.chain.length - 1 && <span className="text-[11px] text-[#9CA3AF]">→</span>}
              </span>
            ))}
          </div>

          <div className="bg-[#F5F4F0] rounded-lg p-3 text-[11px] text-[#6B7280]">
            <strong className="text-[#1A1A2E]">법칙:</strong> {cr.tip}
          </div>
        </div>
      ))}

      {/* 4법칙 요약 */}
      <div className="bg-white rounded-xl border border-[#E8E6E0] p-4">
        <p className="text-[14px] font-black text-center text-[#1A1A2E] mb-3">주린이가 외워야 할 연쇄반응 4법칙</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {LAWS.map(l => (
            <div key={l.num} className="bg-[#F5F4F0] rounded-lg p-3 border border-[#E8E6E0]">
              <p className="text-[12px] font-bold mb-1" style={{ color: l.color }}>법칙 {l.num}: {l.title}</p>
              <p className="text-[10px] text-[#6B7280] leading-relaxed whitespace-pre-line">{l.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 메인: 아코디언 구조 ───

const SECTIONS = [
  { id: 'map', title: '공급망 유니버스 맵', Component: SupplyChainMap },
  { id: 'roadmap', title: '투자 타이밍 로드맵 — 병목의 이동', Component: InvestmentRoadmap },
  { id: 'risk', title: '리스크 시나리오 — 뭐가 터지면 어디가 무너지나', Component: RiskScenarios },
  { id: 'chain', title: '섹터 간 연쇄반응 — A가 오르면 B도 오른다', Component: ChainReactionMap },
] as const

export default function AiUniverseView() {
  const [openSection, setOpenSection] = useState<string | null>('map')

  function toggle(id: string) {
    setOpenSection(prev => (prev === id ? null : id))
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 space-y-2 pb-8">
      {/* 헤더 */}
      <div className="text-center mb-4">
        <h2 className="text-[20px] font-black text-[#1A1A2E]">AI 데이터센터 공급망 유니버스</h2>
        <p className="text-[12px] text-[#6B7280] mt-1">빅테크 발주 → 데이터센터 구축 → 6개 공급망 | 투자 타이밍 · 리스크 · 연쇄반응까지</p>
      </div>

      {/* 아코디언 */}
      {SECTIONS.map(({ id, title, Component }) => {
        const isOpen = openSection === id
        return (
          <div key={id} className="mb-1">
            <button
              onClick={() => toggle(id)}
              className="w-full flex items-center justify-between rounded-lg px-4 py-3 transition-colors"
              style={{
                background: isOpen ? '#ECEAE4' : '#F5F4F0',
                cursor: 'pointer',
              }}
            >
              <span className="text-[15px] font-black text-[#1A1A2E]">{title}</span>
              <span className="text-[12px] font-bold text-[#00CC6A]">
                {isOpen ? '접기 ▲' : '펼치기 ▼'}
              </span>
            </button>
            {isOpen && (
              <div className="rounded-xl mt-1 p-4 overflow-hidden bg-white border border-[#E8E6E0]">
                <Component />
              </div>
            )}
          </div>
        )
      })}

      {/* 면책 */}
      <p className="text-center text-[9px] text-[#9CA3AF] pt-4">
        본 자료는 투자 권유가 아닌 정보 제공 목적입니다 · 수치는 과거 패턴 기반 예시 · 종목 정보는 2026년 4월 기준 · FLOWX
      </p>
    </div>
  )
}
