'use client'

import { useEffect, useRef, useState } from 'react'

const SHOWCASES = [
  {
    title: '실시간 수급 X-Ray',
    desc: '외국인·기관·개인의 매수/매도 흐름을 실시간으로 추적합니다. 누가 사고, 누가 파는지 한 화면에서 확인하세요.',
    variant: 'investor' as const,
  },
  {
    title: 'AI 종목 스크리닝 시스템',
    desc: '머신러닝 모델이 매일 아침 8시에 선별 종목을 업데이트. 적중률, 수익률, 분석 근거를 투명하게 공개합니다.',
    variant: 'ai-recommend' as const,
  },
  {
    title: '섹터 히트맵 & 로테이션',
    desc: '13개 업종의 자금 흐름 변화를 히트맵으로 시각화. 어떤 섹터에 돈이 몰리고 빠지는지 직관적으로 파악하세요.',
    variant: 'heatmap' as const,
  },
]

export function FeatureShowcaseSection() {
  return (
    <section id="showcase" className="py-24 px-6 bg-[var(--landing-bg-secondary)]">
      <div className="max-w-[1200px] mx-auto space-y-24">
        {SHOWCASES.map((item, i) => (
          <ShowcaseRow key={item.title} item={item} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}

function ShowcaseRow({
  item,
  reverse,
}: {
  item: (typeof SHOWCASES)[number]
  reverse: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 ${
        visible ? 'landing-animate' : 'opacity-0'
      }`}
    >
      <div className="md:w-1/2 space-y-4">
        <h3 className="text-2xl font-semibold text-[var(--landing-text)]">{item.title}</h3>
        <p className="text-[var(--landing-text-sub)] leading-relaxed">{item.desc}</p>
      </div>
      <div className="md:w-1/2">
        <MockScreen variant={item.variant} />
      </div>
    </div>
  )
}

/* ── 브라우저 프레임 (라이트 그린) ── */
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#EDFFF4] border border-[#B8E8CC] overflow-hidden shadow-xl" style={{ aspectRatio: '4/3' }}>
      <div className="h-8 bg-[#D8F5E5] flex items-center gap-1.5 px-3 border-b border-[#B8E8CC]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-4 text-[10px] text-[#1A1A2E]/30 font-mono">flowx.kr/dashboard</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function MockScreen({ variant }: { variant: 'investor' | 'ai-recommend' | 'heatmap' }) {
  if (variant === 'investor') return <InvestorMock />
  if (variant === 'ai-recommend') return <AIRecommendMock />
  return <HeatmapMock />
}

/* 1) 수급 X-Ray */
function InvestorMock() {
  const bars = [
    { label: '삼성전자', f: 85, i: 40, p: -60 },
    { label: 'SK하이닉스', f: 70, i: 55, p: -50 },
    { label: 'LG에너지', f: 50, i: -20, p: 30 },
    { label: 'NAVER', f: -30, i: 45, p: 20 },
    { label: '현대차', f: 60, i: 35, p: -45 },
  ]
  return (
    <BrowserFrame>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-[#1A1A2E]/70 font-mono font-bold">KOSPI 투자자 수급 흐름</span>
        <span className="text-[8px] text-[#16A34A] font-mono font-bold">LIVE</span>
      </div>
      {/* 미니 차트 */}
      <div className="mb-3 flex items-end gap-[2px] h-16">
        {[30,35,33,38,36,42,40,45,48,44,50,52,48,55,53,58,60,56,62,65,60,58,63,68,70,65,72,75,78,80].map((v, i) => (
          <div key={i} className="flex-1 rounded-t" style={{ height: `${v}%`, background: v > 50 ? 'rgba(220,38,38,0.4)' : 'rgba(37,99,235,0.4)' }} />
        ))}
      </div>
      {/* 범례 */}
      <div className="flex gap-4 mb-3 text-[9px] font-mono text-[#1A1A2E]/60">
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-[#1A1A2E]" />외국인</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-[#EAB308]" />기관</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-[#16A34A]" />개인</span>
      </div>
      {/* 종목별 수급 */}
      <div className="space-y-2">
        {bars.map(b => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="text-[9px] text-[#1A1A2E]/60 font-mono w-16 shrink-0">{b.label}</span>
            <div className="flex-1 flex items-center gap-[1px] h-4">
              {b.f > 0 && <div className="h-3 rounded-r bg-[#1A1A2E]/70" style={{ width: `${Math.abs(b.f)}%` }} />}
              {b.i > 0 && <div className="h-3 rounded-r bg-[#EAB308]/70" style={{ width: `${Math.abs(b.i) * 0.6}%` }} />}
              {b.p < 0 && <div className="h-3 rounded-r bg-[#16A34A]/50" style={{ width: `${Math.abs(b.p) * 0.5}%` }} />}
            </div>
          </div>
        ))}
      </div>
    </BrowserFrame>
  )
}

/* 2) AI 스크리닝 */
function AIRecommendMock() {
  const stocks = [
    { rank: 1, name: '삼성전자', score: 87, signal: '적극매수', price: '72,400', target: '85,000' },
    { rank: 2, name: 'SK하이닉스', score: 82, signal: '매수', price: '185,500', target: '210,000' },
    { rank: 3, name: 'LG에너지솔루션', score: 78, signal: '매수', price: '380,000', target: '430,000' },
    { rank: 4, name: 'NAVER', score: 65, signal: '관심', price: '192,000', target: '220,000' },
    { rank: 5, name: '현대차', score: 74, signal: '매수', price: '245,000', target: '280,000' },
    { rank: 6, name: '카카오', score: 58, signal: '관심', price: '42,500', target: '50,000' },
  ]
  return (
    <BrowserFrame>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-[#1A1A2E]/70 font-mono font-bold">AI 선별 종목 (매수 시그널)</span>
        <span className="text-[9px] text-[#1A1A2E]/40 font-mono">2026-03-28</span>
      </div>
      <div className="grid text-[8px] text-[#1A1A2E]/40 font-mono pb-1 border-b border-[#B8E8CC] mb-1"
        style={{ gridTemplateColumns: '20px 1fr 50px 50px 44px 36px' }}>
        <span>#</span><span>종목</span><span className="text-right">현재가</span>
        <span className="text-right">목표가</span><span className="text-right">등급</span><span className="text-right">점수</span>
      </div>
      {stocks.map(s => (
        <div key={s.rank} className="grid items-center py-1.5 border-b border-[#B8E8CC]/50 text-[9px] font-mono"
          style={{ gridTemplateColumns: '20px 1fr 50px 50px 44px 36px' }}>
          <span className="text-[#1A1A2E]/40">{s.rank}</span>
          <span className="text-[#1A1A2E]/80 font-bold truncate">{s.name}</span>
          <span className="text-right text-[#1A1A2E]/60">{s.price}</span>
          <span className="text-right text-[#1A1A2E]/60">{s.target}</span>
          <span className="text-right">
            <span className={`px-1 py-0.5 rounded text-[7px] font-bold ${
              s.signal === '적극매수' ? 'bg-[#16A34A]/15 text-[#16A34A]' :
              s.signal === '매수' ? 'bg-[#2563EB]/15 text-[#2563EB]' :
              'bg-[#EAB308]/15 text-[#B45309]'
            }`}>{s.signal}</span>
          </span>
          <span className={`text-right font-bold ${s.score >= 70 ? 'text-[#16A34A]' : s.score >= 60 ? 'text-[#2563EB]' : 'text-[#B45309]'}`}>{s.score}</span>
        </div>
      ))}
      {/* 하단 적중률 */}
      <div className="flex gap-3 mt-3 pt-2 border-t border-[#B8E8CC]">
        {[
          { label: '적중률', value: '78%', color: 'text-[#16A34A]' },
          { label: '평균 수익률', value: '+5.2%', color: 'text-[#dc2626]' },
          { label: '활성 시그널', value: '12건', color: 'text-[#2563EB]' },
        ].map(m => (
          <div key={m.label} className="flex-1 bg-white rounded-lg p-2 text-center border border-[#B8E8CC]/50">
            <div className="text-[7px] text-[#1A1A2E]/40 font-mono">{m.label}</div>
            <div className={`text-[14px] font-bold font-mono ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>
    </BrowserFrame>
  )
}

/* 3) 섹터 히트맵 */
function HeatmapMock() {
  const sectors = [
    { name: '반도체', pct: '+3.2%', c: 'bg-red-200', tc: 'text-[#dc2626]' },
    { name: '자동차', pct: '+2.1%', c: 'bg-red-100', tc: 'text-[#dc2626]' },
    { name: '바이오', pct: '-1.5%', c: 'bg-blue-200', tc: 'text-[#2563EB]' },
    { name: '금융', pct: '+1.8%', c: 'bg-red-100', tc: 'text-[#dc2626]' },
    { name: '철강', pct: '+0.5%', c: 'bg-red-50', tc: 'text-[#dc2626]' },
    { name: '화학', pct: '-2.3%', c: 'bg-blue-200', tc: 'text-[#2563EB]' },
    { name: '전기전자', pct: '+2.8%', c: 'bg-red-200', tc: 'text-[#dc2626]' },
    { name: '건설', pct: '-0.8%', c: 'bg-blue-100', tc: 'text-[#2563EB]' },
    { name: '유통', pct: '+0.3%', c: 'bg-red-50', tc: 'text-[#dc2626]' },
    { name: '통신', pct: '-0.5%', c: 'bg-blue-100', tc: 'text-[#2563EB]' },
    { name: '운수', pct: '+1.4%', c: 'bg-red-100', tc: 'text-[#dc2626]' },
    { name: 'IT', pct: '+3.8%', c: 'bg-red-300', tc: 'text-[#dc2626]' },
  ]
  return (
    <BrowserFrame>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-[#1A1A2E]/70 font-mono font-bold">섹터별 등락 히트맵 (5일)</span>
        <span className="text-[8px] text-[#16A34A] font-mono font-bold">LIVE</span>
      </div>
      <div className="grid grid-cols-4 grid-rows-3 gap-1.5 mb-4">
        {sectors.map(s => (
          <div key={s.name} className={`${s.c} rounded-lg flex flex-col items-center justify-center py-3`}>
            <span className="text-[9px] text-[#1A1A2E]/60 font-mono font-bold">{s.name}</span>
            <span className={`text-[11px] font-bold font-mono ${s.tc}`}>{s.pct}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-[#B8E8CC] pt-2">
        <div className="text-[9px] text-[#1A1A2E]/50 font-mono mb-1.5">돈의 흐름 — 섹터 순위</div>
        <div className="space-y-1">
          {[
            { name: 'IT', score: 92, pct: '+3.8%' },
            { name: '반도체', score: 88, pct: '+3.2%' },
            { name: '전기전자', score: 81, pct: '+2.8%' },
          ].map((s, i) => (
            <div key={s.name} className="flex items-center gap-2 text-[9px] font-mono">
              <span className="text-[#1A1A2E]/30 w-3">{i + 1}</span>
              <span className="text-[#1A1A2E]/70 font-bold flex-1">{s.name}</span>
              <span className="text-[#16A34A] font-bold">{s.score}</span>
              <span className="text-[#dc2626]">{s.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  )
}
