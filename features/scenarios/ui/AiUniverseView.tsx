'use client'

/* ══════════════════════════════════════════════════════════════
   AI 데이터센터 공급망 유니버스 — 비주얼 다이어그램 버전
   ══════════════════════════════════════════════════════════════ */

import InvestmentGuideView from './InvestmentGuideView'

export default function AiUniverseView() {
  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 pb-8">
      <style dangerouslySetInnerHTML={{ __html: `
        .au-node-fill{fill:#ffffff;stroke:rgba(0,0,0,0.1)}
        .au-tag-bg{fill:#ffffff;stroke:rgba(0,0,0,0.12)}
        .au-txt-p{fill:#1a1a2e}
        .au-txt-s{fill:#5f5e5a}
        .au-txt-m{fill:#9ca3af}
        .au-surface{fill:#f0ede8}
        @keyframes au-fd{to{stroke-dashoffset:-24}}
        @keyframes au-p{0%,100%{opacity:.3}50%{opacity:.9}}
        @keyframes au-p2{0%,100%{opacity:.5}50%{opacity:1}}
        @media(prefers-reduced-motion:reduce){.au-fl,.au-fl2,.au-pd,.au-pd2{animation:none!important}}
        .au-fl{stroke-dasharray:6 6;animation:au-fd 1.2s linear infinite}
        .au-fl2{stroke-dasharray:4 4;animation:au-fd 1.6s linear infinite}
        .au-pd{animation:au-p 2s ease-in-out infinite}
        .au-pd2{animation:au-p2 2.5s ease-in-out infinite}
        .au-hovg{cursor:pointer}
        .au-hovg:hover{opacity:.85}
      ` }} />

      {/* 헤더 */}
      <div className="text-center mb-2">
        <h2 className="text-[20px] font-bold text-[#1A1A2E]">AI 데이터센터 공급망 유니버스</h2>
        <p className="text-[12px] text-[#6B7280] mt-1">빅테크 발주 → 데이터센터 구축 → 6개 공급망 흐름을 한눈에</p>
      </div>

      {/* 범례 */}
      <div className="flex gap-3 justify-center flex-wrap text-[11px] text-[#6B7280] mb-2">
        <span className="flex items-center gap-1"><span className="w-[7px] h-[7px] rounded-full bg-[#a78bfa]" />빅테크(발주처)</span>
        <span className="flex items-center gap-1"><span className="w-[7px] h-[7px] rounded-full bg-[#3b82f6]" />대형주</span>
        <span className="flex items-center gap-1"><span className="w-[7px] h-[7px] rounded-full bg-[#f59e0b]" />소부장주</span>
        <span className="flex items-center gap-1">
          <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3 3" /></svg>
          공급흐름
        </span>
      </div>

      {/* 메인 SVG */}
      <svg width="100%" viewBox="0 0 780 1340" xmlns="http://www.w3.org/2000/svg" className="max-w-[820px] mx-auto block">
        <defs>
          <marker id="au-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1.5L8 5L2 8.5" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <filter id="au-gl"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* ─── 연결선 ─── */}
        {/* 빅테크 → 데이터센터 */}
        <line x1="130" y1="105" x2="300" y2="202" stroke="#a78bfa" strokeWidth="2" className="au-fl" opacity=".45" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="260" y1="105" x2="330" y2="202" stroke="#a78bfa" strokeWidth="2" className="au-fl" opacity=".45" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="390" y1="105" x2="380" y2="202" stroke="#a78bfa" strokeWidth="2.5" className="au-fl" opacity=".55" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="520" y1="105" x2="420" y2="202" stroke="#a78bfa" strokeWidth="2" className="au-fl" opacity=".45" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="650" y1="105" x2="450" y2="202" stroke="#a78bfa" strokeWidth="2" className="au-fl" opacity=".45" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />

        {/* 데이터센터 → 1차 공급망 */}
        <line x1="320" y1="340" x2="140" y2="450" stroke="#60a5fa" strokeWidth="2.5" className="au-fl" opacity=".5" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="390" y1="345" x2="390" y2="450" stroke="#f87171" strokeWidth="2.5" className="au-fl" opacity=".5" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="460" y1="340" x2="640" y2="450" stroke="#34d399" strokeWidth="2.5" className="au-fl" opacity=".5" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />

        {/* 1차 → 2차 공급망 */}
        <line x1="140" y1="570" x2="140" y2="760" stroke="#8b5cf6" strokeWidth="2" className="au-fl2" opacity=".4" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="390" y1="570" x2="390" y2="760" stroke="#eab308" strokeWidth="2" className="au-fl2" opacity=".4" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="640" y1="570" x2="640" y2="760" stroke="#f97316" strokeWidth="2" className="au-fl2" opacity=".4" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />

        {/* ★ 횡적 포물선 (진하게) */}
        <path d="M210,510 Q275,470 320,510" fill="none" stroke="#60a5fa" strokeWidth="2.5" opacity=".55" strokeDasharray="5 4" filter="url(#au-gl)" />
        <path d="M460,510 Q540,470 575,510" fill="none" stroke="#34d399" strokeWidth="2.5" opacity=".55" strokeDasharray="5 4" filter="url(#au-gl)" />
        <path d="M210,815 Q275,775 320,815" fill="none" stroke="#8b5cf6" strokeWidth="2.5" opacity=".55" strokeDasharray="5 4" filter="url(#au-gl)" />
        <path d="M460,815 Q540,775 575,815" fill="none" stroke="#f97316" strokeWidth="2.5" opacity=".55" strokeDasharray="5 4" filter="url(#au-gl)" />

        {/* 펄스 점 */}
        <circle className="au-pd" cx="250" cy="160" r="3.5" fill="#a78bfa" />
        <circle className="au-pd" cx="410" cy="160" r="3.5" fill="#a78bfa" style={{ animationDelay: '.3s' }} />
        <circle className="au-pd" cx="235" cy="390" r="3" fill="#60a5fa" style={{ animationDelay: '.5s' }} />
        <circle className="au-pd" cx="390" cy="395" r="3" fill="#f87171" style={{ animationDelay: '.7s' }} />
        <circle className="au-pd" cx="545" cy="390" r="3" fill="#34d399" style={{ animationDelay: '.9s' }} />
        <circle className="au-pd" cx="140" cy="665" r="3" fill="#8b5cf6" style={{ animationDelay: '.4s' }} />
        <circle className="au-pd" cx="390" cy="665" r="3" fill="#eab308" style={{ animationDelay: '.6s' }} />
        <circle className="au-pd" cx="640" cy="665" r="3" fill="#f97316" style={{ animationDelay: '.8s' }} />

        {/* ─── LAYER 0: 빅테크 (원 키움 r=30, 폰트 14) ─── */}
        <rect className="au-surface" x="50" y="5" width="680" height="115" rx="14" opacity=".5" />
        <text className="au-txt-m" x="390" y="28" textAnchor="middle" fontSize="10" fontWeight="600" letterSpacing="1">STEP 0 — 최초 발주처</text>

        <g className="au-hovg" transform="translate(130,72)">
          <circle r="30" fill="#76b900" opacity=".9" /><circle r="30" fill="none" stroke="#76b900" strokeWidth="1.5" opacity=".4" className="au-pd2" />
          <text textAnchor="middle" y="5" fontSize="14" fontWeight="800" fill="#fff">NV</text>
          <text className="au-txt-s" textAnchor="middle" y="48" fontSize="10">NVIDIA</text>
        </g>
        <g className="au-hovg" transform="translate(260,72)">
          <circle r="30" fill="#4285f4" opacity=".9" /><circle r="30" fill="none" stroke="#4285f4" strokeWidth="1.5" opacity=".4" className="au-pd2" style={{ animationDelay: '.2s' }} />
          <text textAnchor="middle" y="5" fontSize="14" fontWeight="800" fill="#fff">G</text>
          <text className="au-txt-s" textAnchor="middle" y="48" fontSize="10">Google</text>
        </g>
        <g className="au-hovg" transform="translate(390,72)">
          <circle r="30" fill="#00a4ef" opacity=".9" /><circle r="30" fill="none" stroke="#00a4ef" strokeWidth="1.5" opacity=".4" className="au-pd2" style={{ animationDelay: '.4s' }} />
          <text textAnchor="middle" y="5" fontSize="14" fontWeight="800" fill="#fff">MS</text>
          <text className="au-txt-s" textAnchor="middle" y="48" fontSize="10">Microsoft</text>
        </g>
        <g className="au-hovg" transform="translate(520,72)">
          <circle r="30" fill="#ff9900" opacity=".9" /><circle r="30" fill="none" stroke="#ff9900" strokeWidth="1.5" opacity=".4" className="au-pd2" style={{ animationDelay: '.6s' }} />
          <text textAnchor="middle" y="5" fontSize="14" fontWeight="800" fill="#fff">AM</text>
          <text className="au-txt-s" textAnchor="middle" y="48" fontSize="10">Amazon</text>
        </g>
        <g className="au-hovg" transform="translate(650,72)">
          <circle r="30" fill="#1877f2" opacity=".9" /><circle r="30" fill="none" stroke="#1877f2" strokeWidth="1.5" opacity=".4" className="au-pd2" style={{ animationDelay: '.8s' }} />
          <text textAnchor="middle" y="5" fontSize="14" fontWeight="800" fill="#fff">MT</text>
          <text className="au-txt-s" textAnchor="middle" y="48" fontSize="10">Meta</text>
        </g>

        <text className="au-txt-m" x="390" y="155" textAnchor="middle" fontSize="9">▼ CAPEX 발주 / 투자 ▼</text>

        {/* ─── LAYER 1: AI 데이터센터 ─── */}
        <g transform="translate(390,270)">
          <rect x="-140" y="-68" width="280" height="136" rx="16" className="au-node-fill" strokeWidth="1.5" />
          <rect x="-140" y="-68" width="280" height="136" rx="16" fill="none" stroke="#60a5fa" strokeWidth="1" opacity=".3" className="au-pd2" />
          <rect x="-120" y="-50" width="75" height="100" rx="6" className="au-surface" stroke="#60a5fa" strokeWidth="1" opacity=".6" />
          <rect x="-112" y="-42" width="58" height="14" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          <rect x="-112" y="-24" width="58" height="14" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          <rect x="-112" y="-6" width="58" height="14" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          <rect x="-112" y="12" width="58" height="14" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          <rect x="-112" y="30" width="58" height="14" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          <circle cx="-60" cy="-35" r="2.5" fill="#3b82f6" className="au-pd" />
          <circle cx="-60" cy="-17" r="2.5" fill="#22c55e" className="au-pd" style={{ animationDelay: '.3s' }} />
          <circle cx="-60" cy="1" r="2.5" fill="#3b82f6" className="au-pd" style={{ animationDelay: '.5s' }} />
          <circle cx="-60" cy="19" r="2.5" fill="#22c55e" className="au-pd" style={{ animationDelay: '.7s' }} />
          <circle cx="-60" cy="37" r="2.5" fill="#3b82f6" className="au-pd" style={{ animationDelay: '.9s' }} />
          <text className="au-txt-p" x="-20" y="-25" fontSize="18" fontWeight="800">AI 데이터센터</text>
          <text className="au-txt-s" x="-20" y="-4" fontSize="12">GPU 수만 장 · 100MW+</text>
          <text className="au-txt-s" x="-20" y="14" fontSize="12">24시간 풀가동</text>
          <text className="au-txt-m" x="-20" y="40" fontSize="10">▼ 구동에 필요한 6가지 ▼</text>
        </g>

        {/* ─── STEP 1: 반도체 ─── */}
        <g transform="translate(140,510)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity=".4" />
          <rect x="-22" y="-22" width="44" height="44" rx="6" fill="#60a5fa" opacity=".1" stroke="#60a5fa" strokeWidth=".8" />
          <rect x="-13" y="-13" width="26" height="26" rx="3" fill="#60a5fa" opacity=".25" />
          <text textAnchor="middle" y="2" fontSize="9" fontWeight="700" fill="#60a5fa" opacity=".7">AI</text>
          <line x1="-22" y1="-10" x2="-40" y2="-10" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="-22" y1="0" x2="-40" y2="0" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="-22" y1="10" x2="-40" y2="10" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="22" y1="-10" x2="40" y2="-10" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="22" y1="0" x2="40" y2="0" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="22" y1="10" x2="40" y2="10" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="-10" y1="-22" x2="-10" y2="-40" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="0" y1="-22" x2="0" y2="-40" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="10" y1="-22" x2="10" y2="-40" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="-10" y1="22" x2="-10" y2="40" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="0" y1="22" x2="0" y2="40" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <line x1="10" y1="22" x2="10" y2="40" stroke="#60a5fa" strokeWidth="1.5" opacity=".4" />
          <text className="au-txt-m" textAnchor="middle" y="-62" fontSize="9" fontWeight="600" fill="#60a5fa">STEP 1 — 연산</text>
          <text className="au-txt-p" textAnchor="middle" y="68" fontSize="14" fontWeight="700">반도체</text>
          <text className="au-txt-s" textAnchor="middle" y="82" fontSize="9">GPU / HBM / 패키징</text>
        </g>
        {/* 반도체 종목 (박스 넓힘) */}
        <g className="au-hovg"><rect className="au-tag-bg" x="12" y="614" width="96" height="24" rx="6" strokeWidth=".5" /><circle cx="24" cy="626" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="31" y="630" fontSize="10" fontWeight="600">SK하이닉스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="114" y="614" width="82" height="24" rx="6" strokeWidth=".5" /><circle cx="126" cy="626" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="133" y="630" fontSize="10" fontWeight="600">삼성전자</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="12" y="642" width="96" height="24" rx="6" strokeWidth=".5" /><circle cx="24" cy="654" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="31" y="658" fontSize="10">한미반도체</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="114" y="642" width="48" height="24" rx="6" strokeWidth=".5" /><circle cx="126" cy="654" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="133" y="658" fontSize="10">ISC</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="168" y="642" width="72" height="24" rx="6" strokeWidth=".5" /><circle cx="180" cy="654" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="187" y="658" fontSize="10">리노공업</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="12" y="670" width="88" height="24" rx="6" strokeWidth=".5" /><circle cx="24" cy="682" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="31" y="686" fontSize="10">네패스아크</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="106" y="670" width="68" height="24" rx="6" strokeWidth=".5" /><circle cx="118" cy="682" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="125" y="686" fontSize="10">테크윙</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="180" y="670" width="72" height="24" rx="6" strokeWidth=".5" /><circle cx="192" cy="682" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="199" y="686" fontSize="10">삼성전기</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="12" y="698" width="52" height="24" rx="6" strokeWidth=".5" /><circle cx="24" cy="710" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="31" y="714" fontSize="10">고영</text></g>

        {/* ─── STEP 2: 전력/원전 ─── */}
        <g transform="translate(390,510)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#f87171" strokeWidth="1.2" opacity=".4" />
          <path d="M-18,28 Q-18,-4 -10,-24 L-4,-24 Q4,-4 4,28 Z" fill="#f87171" opacity=".1" stroke="#f87171" strokeWidth=".8" />
          <path d="M8,28 Q8,-4 16,-24 L22,-24 Q30,-4 30,28 Z" fill="#f87171" opacity=".1" stroke="#f87171" strokeWidth=".8" />
          <path d="M-6,-30 L-14,-6 L-4,-6 L-10,18 L6,-10 L-2,-10 L4,-30 Z" fill="#f87171" opacity=".4" />
          <path d="M-10,-30 Q-6,-38 -2,-30" fill="none" stroke="#f87171" strokeWidth="1" opacity=".25" />
          <path d="M14,-30 Q18,-38 22,-30" fill="none" stroke="#f87171" strokeWidth="1" opacity=".25" />
          <text className="au-txt-m" textAnchor="middle" y="-62" fontSize="9" fontWeight="600" fill="#f87171">STEP 2 — 에너지</text>
          <text className="au-txt-p" textAnchor="middle" y="68" fontSize="14" fontWeight="700">전력 / 원전</text>
          <text className="au-txt-s" textAnchor="middle" y="82" fontSize="9">변압기 / 송배전 / SMR</text>
        </g>
        {/* 전력 종목 (박스 넓힘) */}
        <g className="au-hovg"><rect className="au-tag-bg" x="296" y="614" width="108" height="24" rx="6" strokeWidth=".5" /><circle cx="308" cy="626" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="315" y="630" fontSize="10" fontWeight="600">두산에너빌리티</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="410" y="614" width="76" height="24" rx="6" strokeWidth=".5" /><circle cx="422" cy="626" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="429" y="630" fontSize="10" fontWeight="600">한국전력</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="286" y="642" width="118" height="24" rx="6" strokeWidth=".5" /><circle cx="298" cy="654" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="305" y="658" fontSize="10">HD현대일렉트릭</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="410" y="642" width="86" height="24" rx="6" strokeWidth=".5" /><circle cx="422" cy="654" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="429" y="658" fontSize="10">LS일렉트릭</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="296" y="670" width="72" height="24" rx="6" strokeWidth=".5" /><circle cx="308" cy="682" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="315" y="686" fontSize="10">일진전기</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="374" y="670" width="72" height="24" rx="6" strokeWidth=".5" /><circle cx="386" cy="682" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="393" y="686" fontSize="10">대한전선</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="452" y="670" width="72" height="24" rx="6" strokeWidth=".5" /><circle cx="464" cy="682" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="471" y="686" fontSize="10">제룡전기</text></g>

        {/* ─── STEP 3: 냉각 ─── */}
        <g transform="translate(640,510)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#34d399" strokeWidth="1.2" opacity=".4" />
          <line x1="0" y1="-28" x2="0" y2="28" stroke="#34d399" strokeWidth="2" opacity=".45" />
          <line x1="-24" y1="-14" x2="24" y2="14" stroke="#34d399" strokeWidth="2" opacity=".45" />
          <line x1="-24" y1="14" x2="24" y2="-14" stroke="#34d399" strokeWidth="2" opacity=".45" />
          <circle cx="0" cy="0" r="5" fill="#34d399" opacity=".2" />
          <path d="M-26,8 Q-16,2 -6,8 Q4,14 14,8 Q24,2 30,8" fill="none" stroke="#34d399" strokeWidth="1.2" opacity=".25" />
          <path d="M-26,16 Q-16,10 -6,16 Q4,22 14,16 Q24,10 30,16" fill="none" stroke="#34d399" strokeWidth="1" opacity=".15" />
          <text className="au-txt-m" textAnchor="middle" y="-62" fontSize="9" fontWeight="600" fill="#34d399">STEP 3 — 열관리</text>
          <text className="au-txt-p" textAnchor="middle" y="68" fontSize="14" fontWeight="700">냉각</text>
          <text className="au-txt-s" textAnchor="middle" y="82" fontSize="9">액침냉각 / 열교환기</text>
        </g>
        {/* 냉각 종목 */}
        <g className="au-hovg"><rect className="au-tag-bg" x="574" y="614" width="86" height="24" rx="6" strokeWidth=".5" /><circle cx="586" cy="626" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="593" y="630" fontSize="10" fontWeight="600">한온시스템</text></g>
        {/* 삼성E&A는 건설/인프라 섹터로 이동 */}
        <g className="au-hovg"><rect className="au-tag-bg" x="574" y="642" width="62" height="24" rx="6" strokeWidth=".5" /><circle cx="586" cy="654" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="593" y="658" fontSize="10">에이텍</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="642" y="642" width="62" height="24" rx="6" strokeWidth=".5" /><circle cx="654" cy="654" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="661" y="658" fontSize="10">월덱스</text></g>
        {/* 고영은 반도체(검사장비) 섹터로 이동 */}

        {/* 구분 라벨 */}
        <text className="au-txt-m" x="390" y="730" textAnchor="middle" fontSize="9">▼ 인프라 구축 후 연결 · 운영 단계 ▼</text>

        {/* ─── STEP 4: 통신 ─── */}
        <g transform="translate(140,815)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#8b5cf6" strokeWidth="1.2" opacity=".4" />
          <path d="M-30,-14 Q-16,-28 0,-14 Q16,0 30,-14" fill="none" stroke="#8b5cf6" strokeWidth="2.5" opacity=".55" />
          <path d="M-30,0 Q-16,-14 0,0 Q16,14 30,0" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity=".35" />
          <path d="M-30,14 Q-16,0 0,14 Q16,28 30,14" fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity=".25" />
          <rect x="-36" y="-18" width="8" height="8" rx="2" fill="#8b5cf6" opacity=".4" />
          <rect x="28" y="-18" width="8" height="8" rx="2" fill="#8b5cf6" opacity=".4" />
          <circle cx="-16" cy="-21" r="2" fill="#8b5cf6" opacity=".5" className="au-pd" />
          <circle cx="16" cy="-7" r="2" fill="#8b5cf6" opacity=".5" className="au-pd" style={{ animationDelay: '.5s' }} />
          <text className="au-txt-m" textAnchor="middle" y="-62" fontSize="9" fontWeight="600" fill="#8b5cf6">STEP 4 — 연결</text>
          <text className="au-txt-p" textAnchor="middle" y="68" fontSize="14" fontWeight="700">통신 / 광케이블</text>
          <text className="au-txt-s" textAnchor="middle" y="82" fontSize="9">광인터커넥트 / 스위치</text>
        </g>
        {/* 통신 종목 */}
        <g className="au-hovg"><rect className="au-tag-bg" x="14" y="918" width="82" height="24" rx="6" strokeWidth=".5" /><circle cx="26" cy="930" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="33" y="934" fontSize="10" fontWeight="600">SK텔레콤</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="102" y="918" width="42" height="24" rx="6" strokeWidth=".5" /><circle cx="114" cy="930" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="121" y="934" fontSize="10" fontWeight="600">KT</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="150" y="918" width="88" height="24" rx="6" strokeWidth=".5" /><circle cx="162" cy="930" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="169" y="934" fontSize="10" fontWeight="600">LG유플러스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="14" y="946" width="62" height="24" rx="6" strokeWidth=".5" /><circle cx="26" cy="958" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="33" y="962" fontSize="10">우리로</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="82" y="946" width="72" height="24" rx="6" strokeWidth=".5" /><circle cx="94" cy="958" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="101" y="962" fontSize="10">옵티시스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="160" y="946" width="82" height="24" rx="6" strokeWidth=".5" /><circle cx="172" cy="958" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="179" y="962" fontSize="10">오이솔루션</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="36" y="974" width="62" height="24" rx="6" strokeWidth=".5" /><circle cx="48" cy="986" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="55" y="990" fontSize="10">쏠리드</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="104" y="974" width="86" height="24" rx="6" strokeWidth=".5" /><circle cx="116" cy="986" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="123" y="990" fontSize="10">에치에프알</text></g>

        {/* ─── STEP 5: 건설 ─── */}
        <g transform="translate(390,815)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#eab308" strokeWidth="1.2" opacity=".4" />
          <rect x="-16" y="-22" width="32" height="44" rx="3" fill="#eab308" opacity=".1" stroke="#eab308" strokeWidth=".8" />
          <rect x="-10" y="-16" width="8" height="6" rx="1" fill="#eab308" opacity=".2" />
          <rect x="2" y="-16" width="8" height="6" rx="1" fill="#eab308" opacity=".2" />
          <rect x="-10" y="-6" width="8" height="6" rx="1" fill="#eab308" opacity=".2" />
          <rect x="2" y="-6" width="8" height="6" rx="1" fill="#eab308" opacity=".2" />
          <rect x="-10" y="4" width="8" height="6" rx="1" fill="#eab308" opacity=".2" />
          <rect x="2" y="4" width="8" height="6" rx="1" fill="#eab308" opacity=".2" />
          <rect x="-4" y="14" width="8" height="8" rx="1" fill="#eab308" opacity=".35" />
          <line x1="24" y1="-36" x2="24" y2="22" stroke="#eab308" strokeWidth="2" opacity=".35" />
          <line x1="24" y1="-36" x2="-8" y2="-36" stroke="#eab308" strokeWidth="2" opacity=".35" />
          <line x1="-8" y1="-36" x2="-8" y2="-22" stroke="#eab308" strokeWidth="1" opacity=".25" strokeDasharray="2 2" />
          <text className="au-txt-m" textAnchor="middle" y="-62" fontSize="9" fontWeight="600" fill="#eab308">STEP 5 — 시설</text>
          <text className="au-txt-p" textAnchor="middle" y="68" fontSize="14" fontWeight="700">건설 / 인프라</text>
          <text className="au-txt-s" textAnchor="middle" y="82" fontSize="9">DC 시설 / 토목 / 전기</text>
        </g>
        {/* 건설 종목 */}
        <g className="au-hovg"><rect className="au-tag-bg" x="306" y="918" width="76" height="24" rx="6" strokeWidth=".5" /><circle cx="318" cy="930" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="325" y="934" fontSize="10" fontWeight="600">삼성물산</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="388" y="918" width="76" height="24" rx="6" strokeWidth=".5" /><circle cx="400" cy="930" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="407" y="934" fontSize="10" fontWeight="600">현대건설</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="314" y="946" width="86" height="24" rx="6" strokeWidth=".5" /><circle cx="326" cy="958" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="333" y="962" fontSize="10">케이피에프</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="406" y="946" width="76" height="24" rx="6" strokeWidth=".5" /><circle cx="418" cy="958" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="425" y="962" fontSize="10">서전기전</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="314" y="974" width="82" height="24" rx="6" strokeWidth=".5" /><circle cx="326" cy="986" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="333" y="990" fontSize="10" fontWeight="600">삼성E&amp;A</text></g>

        {/* ─── STEP 6: 로봇 ─── */}
        <g transform="translate(640,815)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#f97316" strokeWidth="1.2" opacity=".4" />
          <circle cx="0" cy="20" r="8" fill="#f97316" opacity=".12" stroke="#f97316" strokeWidth=".8" />
          <line x1="0" y1="12" x2="-14" y2="-8" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" opacity=".4" />
          <line x1="-14" y1="-8" x2="10" y2="-24" stroke="#f97316" strokeWidth="3" strokeLinecap="round" opacity=".4" />
          <circle cx="-14" cy="-8" r="4" fill="#f97316" opacity=".2" />
          <circle cx="10" cy="-24" r="5" fill="#f97316" opacity=".25" />
          <line x1="10" y1="-24" x2="4" y2="-34" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity=".3" />
          <line x1="10" y1="-24" x2="18" y2="-33" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity=".3" />
          <circle cx="6" cy="-30" r="1.5" fill="#f97316" className="au-pd" opacity=".4" />
          <text className="au-txt-m" textAnchor="middle" y="-62" fontSize="9" fontWeight="600" fill="#f97316">STEP 6 — 운영</text>
          <text className="au-txt-p" textAnchor="middle" y="68" fontSize="14" fontWeight="700">로봇 / 자동화</text>
          <text className="au-txt-s" textAnchor="middle" y="82" fontSize="9">DC 운영 / 산업용</text>
        </g>
        {/* 로봇 종목 */}
        <g className="au-hovg"><rect className="au-tag-bg" x="580" y="918" width="66" height="24" rx="6" strokeWidth=".5" /><circle cx="592" cy="930" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="599" y="934" fontSize="10" fontWeight="600">현대차</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="570" y="946" width="110" height="24" rx="6" strokeWidth=".5" /><circle cx="582" cy="958" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="589" y="962" fontSize="10">레인보우로보틱스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="686" y="946" width="92" height="24" rx="6" strokeWidth=".5" /><circle cx="698" cy="958" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="705" y="962" fontSize="10">두산로보틱스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="586" y="974" width="72" height="24" rx="6" strokeWidth=".5" /><circle cx="598" cy="986" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="605" y="990" fontSize="10">로보스타</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="664" y="974" width="72" height="24" rx="6" strokeWidth=".5" /><circle cx="676" cy="986" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="683" y="990" fontSize="10">뉴로메카</text></g>

        {/* ─── 밸류체인 흐름도 (가운데 정렬, 글씨 키움+진하게, 2줄) ─── */}
        <rect className="au-surface" x="40" y="1030" width="700" height="140" rx="14" opacity=".5" />
        <text className="au-txt-p" textAnchor="middle" x="390" y="1058" fontSize="15" fontWeight="800">밸류체인 흐름도 — 전체 순서</text>

        {/* Row 1 */}
        <rect x="68" y="1072" width="92" height="28" rx="7" fill="#a78bfa" opacity=".18" stroke="#a78bfa" strokeWidth=".8" />
        <text textAnchor="middle" x="114" y="1091" fontSize="11" fontWeight="700" fill="#a78bfa">0. 빅테크 발주</text>
        <text className="au-txt-p" x="166" y="1091" fontSize="13" fontWeight="700">→</text>
        <rect x="180" y="1072" width="78" height="28" rx="7" fill="#60a5fa" opacity=".12" stroke="#60a5fa" strokeWidth=".8" />
        <text textAnchor="middle" x="219" y="1091" fontSize="11" fontWeight="700" fill="#60a5fa">1. GPU 주문</text>
        <text className="au-txt-p" x="264" y="1091" fontSize="13" fontWeight="700">→</text>
        <rect x="278" y="1072" width="76" height="28" rx="7" fill="#eab308" opacity=".12" stroke="#eab308" strokeWidth=".8" />
        <text textAnchor="middle" x="316" y="1091" fontSize="11" fontWeight="700" fill="#eab308">5. DC 건설</text>
        <text className="au-txt-p" x="360" y="1091" fontSize="13" fontWeight="700">→</text>
        <rect x="374" y="1072" width="76" height="28" rx="7" fill="#f87171" opacity=".12" stroke="#f87171" strokeWidth=".8" />
        <text textAnchor="middle" x="412" y="1091" fontSize="11" fontWeight="700" fill="#f87171">2. 전력 확보</text>
        <text className="au-txt-p" x="456" y="1091" fontSize="13" fontWeight="700">→</text>
        <rect x="470" y="1072" width="76" height="28" rx="7" fill="#34d399" opacity=".12" stroke="#34d399" strokeWidth=".8" />
        <text textAnchor="middle" x="508" y="1091" fontSize="11" fontWeight="700" fill="#34d399">3. 냉각 설치</text>
        <text className="au-txt-p" x="552" y="1091" fontSize="13" fontWeight="700">→</text>
        {/* Row 1 마지막 2개 */}
        <rect x="566" y="1072" width="92" height="28" rx="7" fill="#8b5cf6" opacity=".12" stroke="#8b5cf6" strokeWidth=".8" />
        <text textAnchor="middle" x="612" y="1091" fontSize="11" fontWeight="700" fill="#8b5cf6">4. 광케이블</text>
        <text className="au-txt-p" x="664" y="1091" fontSize="13" fontWeight="700">→</text>
        <rect x="678" y="1072" width="52" height="28" rx="7" fill="#f97316" opacity=".12" stroke="#f97316" strokeWidth=".8" />
        <text textAnchor="middle" x="704" y="1091" fontSize="11" fontWeight="700" fill="#f97316">6. 운영</text>

        <text className="au-txt-s" textAnchor="middle" x="390" y="1128" fontSize="10" fontWeight="600">2030년까지 글로벌 DC 전력 수요 175% 증가 전망 (골드만삭스) · 국내 DC 시장 2028년 10조원 돌파</text>
        <text className="au-txt-m" textAnchor="middle" x="390" y="1148" fontSize="10">전력 병목이 해소돼야 → 냉각 · 통신 · 로봇 차례가 온다</text>

        {/* 면책 */}
        <text className="au-txt-m" textAnchor="middle" x="390" y="1210" fontSize="8" opacity=".5">본 자료는 투자 권유가 아닌 정보 제공 목적입니다 · FLOWX</text>
        <text className="au-txt-m" textAnchor="middle" x="390" y="1224" fontSize="8" opacity=".4">종목 정보는 2026년 4월 기준이며 변동될 수 있습니다</text>
      </svg>

      {/* 투자 가이드: 타이밍 · 리스크 · 연쇄반응 (접는 타입 X — 모두 펼침) */}
      <InvestmentGuideView />
    </div>
  )
}
