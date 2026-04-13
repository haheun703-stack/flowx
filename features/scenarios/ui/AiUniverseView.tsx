'use client'

/* ══════════════════════════════════════════════════════════════
   AI 데이터센터 공급망 유니버스 — 비주얼 다이어그램 버전
   전체가 하나의 거대한 SVG 다이어그램
   빅테크(5개) → 데이터센터(서버랙) → 6개 섹터 → 종목 태그
   ══════════════════════════════════════════════════════════════ */

export default function AiUniverseView() {
  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 pb-8">
      {/* SVG 전용 스타일 */}
      <style dangerouslySetInnerHTML={{ __html: `
        .au-node-fill{fill:#ffffff;stroke:rgba(0,0,0,0.1)}
        .au-tag-bg{fill:#ffffff;stroke:rgba(0,0,0,0.1)}
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
        <h2 className="text-[20px] font-black text-[#1A1A2E]">AI 데이터센터 공급망 유니버스</h2>
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

      {/* 메인 SVG 다이어그램 */}
      <svg width="100%" viewBox="0 0 780 1260" xmlns="http://www.w3.org/2000/svg" className="max-w-[820px] mx-auto block">

        {/* ─── Defs ─── */}
        <defs>
          <marker id="au-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1.5L8 5L2 8.5" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <filter id="au-gl"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* ─── 연결선 ─── */}
        {/* 빅테크 → 데이터센터 */}
        <line x1="130" y1="95" x2="310" y2="195" stroke="#a78bfa" strokeWidth="2" className="au-fl" opacity=".45" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="260" y1="95" x2="340" y2="195" stroke="#a78bfa" strokeWidth="2" className="au-fl" opacity=".45" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="390" y1="95" x2="380" y2="195" stroke="#a78bfa" strokeWidth="2.5" className="au-fl" opacity=".55" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="520" y1="95" x2="400" y2="195" stroke="#a78bfa" strokeWidth="2" className="au-fl" opacity=".45" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="650" y1="95" x2="430" y2="195" stroke="#a78bfa" strokeWidth="2" className="au-fl" opacity=".45" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />

        {/* 데이터센터 → 1차 공급망 */}
        <line x1="330" y1="310" x2="140" y2="430" stroke="#60a5fa" strokeWidth="2.5" className="au-fl" opacity=".5" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="390" y1="320" x2="390" y2="430" stroke="#f87171" strokeWidth="2.5" className="au-fl" opacity=".5" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="450" y1="310" x2="640" y2="430" stroke="#34d399" strokeWidth="2.5" className="au-fl" opacity=".5" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />

        {/* 1차 → 2차 공급망 */}
        <line x1="140" y1="540" x2="140" y2="730" stroke="#8b5cf6" strokeWidth="2" className="au-fl2" opacity=".4" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="390" y1="540" x2="390" y2="730" stroke="#eab308" strokeWidth="2" className="au-fl2" opacity=".4" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />
        <line x1="640" y1="540" x2="640" y2="730" stroke="#f97316" strokeWidth="2" className="au-fl2" opacity=".4" filter="url(#au-gl)" markerEnd="url(#au-arrow)" />

        {/* 횡적 연결 */}
        <path d="M210,485 Q270,460 310,485" fill="none" stroke="#a78bfa" strokeWidth="1" opacity=".2" strokeDasharray="3 4" />
        <path d="M460,485 Q540,460 570,485" fill="none" stroke="#a78bfa" strokeWidth="1" opacity=".2" strokeDasharray="3 4" />
        <path d="M210,785 Q270,760 310,785" fill="none" stroke="#a78bfa" strokeWidth="1" opacity=".2" strokeDasharray="3 4" />
        <path d="M460,785 Q540,760 570,785" fill="none" stroke="#a78bfa" strokeWidth="1" opacity=".2" strokeDasharray="3 4" />

        {/* 펄스 점 */}
        <circle className="au-pd" cx="250" cy="150" r="3.5" fill="#a78bfa" />
        <circle className="au-pd" cx="410" cy="150" r="3.5" fill="#a78bfa" style={{ animationDelay: '.3s' }} />
        <circle className="au-pd" cx="235" cy="370" r="3" fill="#60a5fa" style={{ animationDelay: '.5s' }} />
        <circle className="au-pd" cx="390" cy="375" r="3" fill="#f87171" style={{ animationDelay: '.7s' }} />
        <circle className="au-pd" cx="545" cy="370" r="3" fill="#34d399" style={{ animationDelay: '.9s' }} />
        <circle className="au-pd" cx="140" cy="635" r="3" fill="#8b5cf6" style={{ animationDelay: '.4s' }} />
        <circle className="au-pd" cx="390" cy="635" r="3" fill="#eab308" style={{ animationDelay: '.6s' }} />
        <circle className="au-pd" cx="640" cy="635" r="3" fill="#f97316" style={{ animationDelay: '.8s' }} />

        {/* ─── LAYER 0: 빅테크 ─── */}
        <rect className="au-surface" x="50" y="18" width="680" height="85" rx="14" opacity=".5" />
        <text className="au-txt-m" x="390" y="38" textAnchor="middle" fontSize="10" fontWeight="600" letterSpacing="1">STEP 0 — 최초 발주처</text>

        {/* NVIDIA */}
        <g className="au-hovg" transform="translate(130,70)">
          <circle r="22" fill="#76b900" opacity=".85" /><circle r="22" fill="none" stroke="#76b900" strokeWidth="1" opacity=".4" className="au-pd2" />
          <text textAnchor="middle" y="4" fontSize="10" fontWeight="700" fill="#fff">NV</text>
          <text className="au-txt-s" textAnchor="middle" y="38" fontSize="9">NVIDIA</text>
        </g>
        {/* Google */}
        <g className="au-hovg" transform="translate(260,70)">
          <circle r="22" fill="#4285f4" opacity=".85" /><circle r="22" fill="none" stroke="#4285f4" strokeWidth="1" opacity=".4" className="au-pd2" style={{ animationDelay: '.2s' }} />
          <text textAnchor="middle" y="4" fontSize="10" fontWeight="700" fill="#fff">G</text>
          <text className="au-txt-s" textAnchor="middle" y="38" fontSize="9">Google</text>
        </g>
        {/* Microsoft */}
        <g className="au-hovg" transform="translate(390,70)">
          <circle r="22" fill="#00a4ef" opacity=".85" /><circle r="22" fill="none" stroke="#00a4ef" strokeWidth="1" opacity=".4" className="au-pd2" style={{ animationDelay: '.4s' }} />
          <text textAnchor="middle" y="4" fontSize="10" fontWeight="700" fill="#fff">MS</text>
          <text className="au-txt-s" textAnchor="middle" y="38" fontSize="9">Microsoft</text>
        </g>
        {/* Amazon */}
        <g className="au-hovg" transform="translate(520,70)">
          <circle r="22" fill="#ff9900" opacity=".85" /><circle r="22" fill="none" stroke="#ff9900" strokeWidth="1" opacity=".4" className="au-pd2" style={{ animationDelay: '.6s' }} />
          <text textAnchor="middle" y="4" fontSize="10" fontWeight="700" fill="#fff">AM</text>
          <text className="au-txt-s" textAnchor="middle" y="38" fontSize="9">Amazon</text>
        </g>
        {/* Meta */}
        <g className="au-hovg" transform="translate(650,70)">
          <circle r="22" fill="#1877f2" opacity=".85" /><circle r="22" fill="none" stroke="#1877f2" strokeWidth="1" opacity=".4" className="au-pd2" style={{ animationDelay: '.8s' }} />
          <text textAnchor="middle" y="4" fontSize="10" fontWeight="700" fill="#fff">MT</text>
          <text className="au-txt-s" textAnchor="middle" y="38" fontSize="9">Meta</text>
        </g>

        <text className="au-txt-m" x="390" y="140" textAnchor="middle" fontSize="9">▼ CAPEX 발주 / 투자 ▼</text>

        {/* ─── LAYER 1: AI 데이터센터 ─── */}
        <g transform="translate(390,255)">
          <rect x="-110" y="-60" width="220" height="120" rx="16" className="au-node-fill" strokeWidth="1.5" />
          <rect x="-110" y="-60" width="220" height="120" rx="16" fill="none" stroke="#60a5fa" strokeWidth="1" opacity=".3" className="au-pd2" />
          {/* 서버랙 */}
          <rect x="-90" y="-45" width="70" height="90" rx="6" className="au-surface" stroke="#60a5fa" strokeWidth="1" opacity=".6" />
          <rect x="-82" y="-38" width="54" height="12" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          <rect x="-82" y="-22" width="54" height="12" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          <rect x="-82" y="-6" width="54" height="12" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          <rect x="-82" y="10" width="54" height="12" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          <rect x="-82" y="26" width="54" height="12" rx="2" fill="#60a5fa" opacity=".08" stroke="#60a5fa" strokeWidth=".3" />
          {/* LED */}
          <circle cx="-34" cy="-32" r="2.5" fill="#3b82f6" className="au-pd" />
          <circle cx="-34" cy="-16" r="2.5" fill="#22c55e" className="au-pd" style={{ animationDelay: '.3s' }} />
          <circle cx="-34" cy="0" r="2.5" fill="#3b82f6" className="au-pd" style={{ animationDelay: '.5s' }} />
          <circle cx="-34" cy="16" r="2.5" fill="#22c55e" className="au-pd" style={{ animationDelay: '.7s' }} />
          <circle cx="-34" cy="32" r="2.5" fill="#3b82f6" className="au-pd" style={{ animationDelay: '.9s' }} />
          <text className="au-txt-p" x="30" y="-22" fontSize="16" fontWeight="700">AI 데이터센터</text>
          <text className="au-txt-s" x="30" y="-4" fontSize="10">GPU 수만 장 · 100MW+</text>
          <text className="au-txt-s" x="30" y="12" fontSize="10">24시간 풀가동</text>
          <text className="au-txt-m" x="30" y="36" fontSize="9">▼ 구동에 필요한 6가지 ▼</text>
        </g>

        {/* ─── STEP 1: 반도체 ─── */}
        <g transform="translate(140,485)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity=".4" />
          {/* 칩 */}
          <rect x="-22" y="-22" width="44" height="44" rx="6" fill="#60a5fa" opacity=".1" stroke="#60a5fa" strokeWidth=".8" />
          <rect x="-13" y="-13" width="26" height="26" rx="3" fill="#60a5fa" opacity=".25" />
          <text textAnchor="middle" y="2" fontSize="9" fontWeight="700" fill="#60a5fa" opacity=".7">AI</text>
          {/* 핀 */}
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
        {/* 반도체 종목 */}
        <g className="au-hovg"><rect className="au-tag-bg" x="14" y="588" width="82" height="20" rx="5" strokeWidth=".5" /><circle cx="24" cy="598" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="31" y="602" fontSize="10" fontWeight="600">SK하이닉스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="100" y="588" width="72" height="20" rx="5" strokeWidth=".5" /><circle cx="110" cy="598" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="117" y="602" fontSize="10" fontWeight="600">삼성전자</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="14" y="612" width="82" height="20" rx="5" strokeWidth=".5" /><circle cx="24" cy="622" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="31" y="626" fontSize="10">한미반도체</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="100" y="612" width="40" height="20" rx="5" strokeWidth=".5" /><circle cx="110" cy="622" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="117" y="626" fontSize="10">ISC</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="144" y="612" width="62" height="20" rx="5" strokeWidth=".5" /><circle cx="154" cy="622" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="161" y="626" fontSize="10">리노공업</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="14" y="636" width="74" height="20" rx="5" strokeWidth=".5" /><circle cx="24" cy="646" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="31" y="650" fontSize="10">네패스아크</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="92" y="636" width="58" height="20" rx="5" strokeWidth=".5" /><circle cx="102" cy="646" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="109" y="650" fontSize="10">테크윙</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="154" y="636" width="58" height="20" rx="5" strokeWidth=".5" /><circle cx="164" cy="646" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="171" y="650" fontSize="10">삼성전기</text></g>

        {/* ─── STEP 2: 전력/원전 ─── */}
        <g transform="translate(390,485)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#f87171" strokeWidth="1.2" opacity=".4" />
          {/* 원전 냉각탑 */}
          <path d="M-18,28 Q-18,-4 -10,-24 L-4,-24 Q4,-4 4,28 Z" fill="#f87171" opacity=".1" stroke="#f87171" strokeWidth=".8" />
          <path d="M8,28 Q8,-4 16,-24 L22,-24 Q30,-4 30,28 Z" fill="#f87171" opacity=".1" stroke="#f87171" strokeWidth=".8" />
          {/* 번개 */}
          <path d="M-6,-30 L-14,-6 L-4,-6 L-10,18 L6,-10 L-2,-10 L4,-30 Z" fill="#f87171" opacity=".4" />
          {/* 수증기 */}
          <path d="M-10,-30 Q-6,-38 -2,-30" fill="none" stroke="#f87171" strokeWidth="1" opacity=".25" />
          <path d="M14,-30 Q18,-38 22,-30" fill="none" stroke="#f87171" strokeWidth="1" opacity=".25" />
          <text className="au-txt-m" textAnchor="middle" y="-62" fontSize="9" fontWeight="600" fill="#f87171">STEP 2 — 에너지</text>
          <text className="au-txt-p" textAnchor="middle" y="68" fontSize="14" fontWeight="700">전력 / 원전</text>
          <text className="au-txt-s" textAnchor="middle" y="82" fontSize="9">변압기 / 송배전 / SMR</text>
        </g>
        {/* 전력 종목 */}
        <g className="au-hovg"><rect className="au-tag-bg" x="302" y="588" width="92" height="20" rx="5" strokeWidth=".5" /><circle cx="312" cy="598" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="319" y="602" fontSize="10" fontWeight="600">두산에너빌리티</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="398" y="588" width="62" height="20" rx="5" strokeWidth=".5" /><circle cx="408" cy="598" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="415" y="602" fontSize="10" fontWeight="600">한국전력</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="290" y="612" width="104" height="20" rx="5" strokeWidth=".5" /><circle cx="300" cy="622" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="307" y="626" fontSize="10">HD현대일렉트릭</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="398" y="612" width="72" height="20" rx="5" strokeWidth=".5" /><circle cx="408" cy="622" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="415" y="626" fontSize="10">LS일렉트릭</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="302" y="636" width="58" height="20" rx="5" strokeWidth=".5" /><circle cx="312" cy="646" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="319" y="650" fontSize="10">일진전기</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="364" y="636" width="58" height="20" rx="5" strokeWidth=".5" /><circle cx="374" cy="646" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="381" y="650" fontSize="10">대한전선</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="426" y="636" width="58" height="20" rx="5" strokeWidth=".5" /><circle cx="436" cy="646" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="443" y="650" fontSize="10">제룡전기</text></g>

        {/* ─── STEP 3: 냉각 ─── */}
        <g transform="translate(640,485)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#34d399" strokeWidth="1.2" opacity=".4" />
          {/* 눈꽃 */}
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
        <g className="au-hovg"><rect className="au-tag-bg" x="580" y="588" width="72" height="20" rx="5" strokeWidth=".5" /><circle cx="590" cy="598" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="597" y="602" fontSize="10" fontWeight="600">한온시스템</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="656" y="588" width="70" height="20" rx="5" strokeWidth=".5" /><circle cx="666" cy="598" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="673" y="602" fontSize="10" fontWeight="600">삼성E&amp;A</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="586" y="612" width="52" height="20" rx="5" strokeWidth=".5" /><circle cx="596" cy="622" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="603" y="626" fontSize="10">에이텍</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="642" y="612" width="52" height="20" rx="5" strokeWidth=".5" /><circle cx="652" cy="622" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="659" y="626" fontSize="10">월덱스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="698" y="612" width="46" height="20" rx="5" strokeWidth=".5" /><circle cx="708" cy="622" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="715" y="626" fontSize="10">고영</text></g>

        {/* 구분 라벨 */}
        <text className="au-txt-m" x="390" y="700" textAnchor="middle" fontSize="9">▼ 인프라 구축 후 연결 · 운영 단계 ▼</text>

        {/* ─── STEP 4: 통신 ─── */}
        <g transform="translate(140,785)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#8b5cf6" strokeWidth="1.2" opacity=".4" />
          {/* 광섬유 */}
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
        <g className="au-hovg"><rect className="au-tag-bg" x="20" y="888" width="72" height="20" rx="5" strokeWidth=".5" /><circle cx="30" cy="898" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="37" y="902" fontSize="10" fontWeight="600">SK텔레콤</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="96" y="888" width="36" height="20" rx="5" strokeWidth=".5" /><circle cx="106" cy="898" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="113" y="902" fontSize="10" fontWeight="600">KT</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="136" y="888" width="76" height="20" rx="5" strokeWidth=".5" /><circle cx="146" cy="898" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="153" y="902" fontSize="10" fontWeight="600">LG유플러스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="20" y="912" width="52" height="20" rx="5" strokeWidth=".5" /><circle cx="30" cy="922" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="37" y="926" fontSize="10">우리로</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="76" y="912" width="62" height="20" rx="5" strokeWidth=".5" /><circle cx="86" cy="922" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="93" y="926" fontSize="10">옵티시스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="142" y="912" width="72" height="20" rx="5" strokeWidth=".5" /><circle cx="152" cy="922" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="159" y="926" fontSize="10">오이솔루션</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="42" y="936" width="52" height="20" rx="5" strokeWidth=".5" /><circle cx="52" cy="946" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="59" y="950" fontSize="10">쏠리드</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="98" y="936" width="72" height="20" rx="5" strokeWidth=".5" /><circle cx="108" cy="946" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="115" y="950" fontSize="10">에치에프알</text></g>

        {/* ─── STEP 5: 건설 ─── */}
        <g transform="translate(390,785)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#eab308" strokeWidth="1.2" opacity=".4" />
          {/* 빌딩 + 크레인 */}
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
        <g className="au-hovg"><rect className="au-tag-bg" x="310" y="888" width="62" height="20" rx="5" strokeWidth=".5" /><circle cx="320" cy="898" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="327" y="902" fontSize="10" fontWeight="600">삼성물산</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="376" y="888" width="62" height="20" rx="5" strokeWidth=".5" /><circle cx="386" cy="898" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="393" y="902" fontSize="10" fontWeight="600">현대건설</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="316" y="912" width="72" height="20" rx="5" strokeWidth=".5" /><circle cx="326" cy="922" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="333" y="926" fontSize="10">케이피에프</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="392" y="912" width="62" height="20" rx="5" strokeWidth=".5" /><circle cx="402" cy="922" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="409" y="926" fontSize="10">서전기전</text></g>

        {/* ─── STEP 6: 로봇 ─── */}
        <g transform="translate(640,785)">
          <rect x="-55" y="-55" width="110" height="110" rx="16" className="au-node-fill" strokeWidth="1" />
          <rect x="-55" y="-55" width="110" height="110" rx="16" fill="none" stroke="#f97316" strokeWidth="1.2" opacity=".4" />
          {/* 로봇팔 */}
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
        <g className="au-hovg"><rect className="au-tag-bg" x="580" y="888" width="54" height="20" rx="5" strokeWidth=".5" /><circle cx="590" cy="898" r="3.5" fill="#3b82f6" /><text className="au-txt-p" x="597" y="902" fontSize="10" fontWeight="600">현대차</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="574" y="912" width="96" height="20" rx="5" strokeWidth=".5" /><circle cx="584" cy="922" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="591" y="926" fontSize="10">레인보우로보틱스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="674" y="912" width="82" height="20" rx="5" strokeWidth=".5" /><circle cx="684" cy="922" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="691" y="926" fontSize="10">두산로보틱스</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="590" y="936" width="62" height="20" rx="5" strokeWidth=".5" /><circle cx="600" cy="946" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="607" y="950" fontSize="10">로보스타</text></g>
        <g className="au-hovg"><rect className="au-tag-bg" x="656" y="936" width="62" height="20" rx="5" strokeWidth=".5" /><circle cx="666" cy="946" r="3.5" fill="#f59e0b" /><text className="au-txt-p" x="673" y="950" fontSize="10">뉴로메카</text></g>

        {/* ─── 밸류체인 흐름도 ─── */}
        <rect className="au-surface" x="50" y="990" width="680" height="100" rx="14" opacity=".5" />
        <text className="au-txt-p" textAnchor="middle" x="390" y="1012" fontSize="12" fontWeight="600">밸류체인 흐름도 — 전체 순서</text>

        <rect x="60" y="1024" width="72" height="22" rx="6" fill="#a78bfa" opacity=".15" stroke="#a78bfa" strokeWidth=".5" />
        <text textAnchor="middle" x="96" y="1039" fontSize="9" fontWeight="500" fill="#a78bfa">0. 빅테크 발주</text>
        <text className="au-txt-m" x="136" y="1039" fontSize="11">→</text>
        <rect x="148" y="1024" width="68" height="22" rx="6" fill="#60a5fa" opacity=".1" stroke="#60a5fa" strokeWidth=".5" />
        <text textAnchor="middle" x="182" y="1039" fontSize="9" fill="#60a5fa">1. GPU 주문</text>
        <text className="au-txt-m" x="220" y="1039" fontSize="11">→</text>
        <rect x="232" y="1024" width="60" height="22" rx="6" fill="#eab308" opacity=".1" stroke="#eab308" strokeWidth=".5" />
        <text textAnchor="middle" x="262" y="1039" fontSize="9" fill="#eab308">5. DC 건설</text>
        <text className="au-txt-m" x="296" y="1039" fontSize="11">→</text>
        <rect x="308" y="1024" width="60" height="22" rx="6" fill="#f87171" opacity=".1" stroke="#f87171" strokeWidth=".5" />
        <text textAnchor="middle" x="338" y="1039" fontSize="9" fill="#f87171">2. 전력 확보</text>
        <text className="au-txt-m" x="372" y="1039" fontSize="11">→</text>
        <rect x="384" y="1024" width="60" height="22" rx="6" fill="#34d399" opacity=".1" stroke="#34d399" strokeWidth=".5" />
        <text textAnchor="middle" x="414" y="1039" fontSize="9" fill="#34d399">3. 냉각 설치</text>
        <text className="au-txt-m" x="448" y="1039" fontSize="11">→</text>
        <rect x="460" y="1024" width="76" height="22" rx="6" fill="#8b5cf6" opacity=".1" stroke="#8b5cf6" strokeWidth=".5" />
        <text textAnchor="middle" x="498" y="1039" fontSize="9" fill="#8b5cf6">4. 광케이블 연결</text>
        <text className="au-txt-m" x="540" y="1039" fontSize="11">→</text>
        <rect x="552" y="1024" width="76" height="22" rx="6" fill="#f97316" opacity=".1" stroke="#f97316" strokeWidth=".5" />
        <text textAnchor="middle" x="590" y="1039" fontSize="9" fill="#f97316">6. 운영 자동화</text>

        <text className="au-txt-m" textAnchor="middle" x="390" y="1072" fontSize="9">2030년까지 글로벌 DC 전력 수요 175% 증가 전망 (골드만삭스) · 국내 DC 시장 2028년 10조원 돌파</text>

        {/* 면책 */}
        <text className="au-txt-m" textAnchor="middle" x="390" y="1120" fontSize="8" opacity=".5">본 자료는 투자 권유가 아닌 정보 제공 목적입니다 · FLOWX</text>
        <text className="au-txt-m" textAnchor="middle" x="390" y="1134" fontSize="8" opacity=".4">종목 정보는 2026년 4월 기준이며 변동될 수 있습니다</text>
      </svg>
    </div>
  )
}
