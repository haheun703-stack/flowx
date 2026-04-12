'use client'

import { Group1_MarketStructure } from './groups/Group1_MarketStructure'
import { Group2_InflationRates } from './groups/Group2_InflationRates'
import { Group3_AiSemi } from './groups/Group3_AiSemi'
import { Group4_Geopolitics } from './groups/Group4_Geopolitics'
import { Group5_KoreaReality } from './groups/Group5_KoreaReality'
import { Group6_Synthesis } from './groups/Group6_Synthesis'

const SECTIONS = [
  { id: 'market', label: '1부', title: '글로벌 시장', sub: '지금 세계 경제는 어디로?', Component: Group1_MarketStructure },
  { id: 'inflation', label: '2부', title: '물가·금리·환율', sub: '경제의 체온을 재봅시다', Component: Group2_InflationRates },
  { id: 'ai-semi', label: '3부', title: 'AI & 반도체', sub: '세계를 바꾸는 두 가지 힘', Component: Group3_AiSemi },
  { id: 'geopolitics', label: '4부', title: '전쟁과 돈', sub: '지정학이 바꾸는 투자 지도', Component: Group4_Geopolitics },
  { id: 'korea', label: '5부', title: '한국의 현실', sub: '위기 속 기회를 찾다', Component: Group5_KoreaReality },
  { id: 'synthesis', label: '6부', title: '종합 분석', sub: '코리아 디스카운트 & JACKPOT 시그널', Component: Group6_Synthesis },
] as const

export default function MacroDashboardView() {
  return (
    <div className="min-h-screen" style={{ background: '#f6f5f1' }}>
      {/* ── 헤더 ── */}
      <header className="pt-12 pb-8 text-center">
        <h1 className="text-[clamp(28px,5vw,48px)] font-black text-[#1a1a2e] leading-tight tracking-tight">
          FLOWX 거시경제 대시보드
        </h1>
        <p className="mt-2 text-[15px] text-[#888] max-w-xl mx-auto">
          28개 핵심 차트로 보는 글로벌 경제 — 주린이도 이해할 수 있도록 구성했습니다
        </p>

        {/* 탐색 탭 */}
        <nav className="mt-6 flex flex-wrap justify-center gap-2 px-4">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 rounded-full text-sm font-bold border border-[#e0ddd8] bg-white text-[#1a1a2e] hover:bg-[#00FF88] hover:text-[#1a1a2e] hover:border-[#00FF88] transition-colors"
            >
              {s.label}. {s.title}
            </a>
          ))}
        </nav>
      </header>

      {/* ── 섹션 렌더링 ── */}
      <main className="max-w-[1400px] mx-auto px-3 md:px-6 pb-20 space-y-16">
        {SECTIONS.map(({ id, label, title, sub, Component }) => (
          <section key={id} id={id}>
            {/* 섹션 타이틀 */}
            <div className="mb-8 border-l-4 border-[#00FF88] pl-5">
              <div className="text-xs font-mono tracking-[3px] text-[#7c3aed] uppercase mb-1">
                {label}
              </div>
              <h2 className="text-[clamp(22px,3vw,32px)] font-black text-[#1a1a2e]">
                {title}
              </h2>
              <p className="text-sm text-[#888] mt-0.5">{sub}</p>
            </div>

            {/* 차트 */}
            <div className="space-y-6">
              <Component />
            </div>
          </section>
        ))}

        {/* 푸터 */}
        <footer className="text-center text-xs text-[#aaa] font-mono pt-8 border-t border-[#e0ddd8]">
          FLOWX 거시경제 대시보드 · 데이터 출처: BLS, Fed, OECD, Bloomberg, 통계청, KDI, Apollo Chief Economist
          <br />
          본 자료는 투자 권유가 아닌 참고용 분석 자료입니다.
        </footer>
      </main>
    </div>
  )
}
