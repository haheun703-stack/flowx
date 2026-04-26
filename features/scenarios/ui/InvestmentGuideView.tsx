'use client'

/* ══════════════════════════════════════════════════════════════
   AI 데이터센터 투자 가이드 — 타이밍 · 리스크 · 연쇄반응
   접는 타입 X — 모든 섹션 펼침 상태
   ══════════════════════════════════════════════════════════════ */

export default function InvestmentGuideView() {
  return (
    <div className="max-w-[860px] mx-auto mt-8">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes au-bk{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes au-fd2{to{stroke-dashoffset:-16}}
        .au-bk{animation:au-bk 1.2s ease-in-out infinite}
        .au-fl3{stroke-dasharray:5 5;animation:au-fd2 1s linear infinite}
        @media(prefers-reduced-motion:reduce){.au-bk,.au-fl3{animation:none!important}}
      ` }} />

      {/* ═══════════════════════════════════════════════════════════
          PART 1 — 투자 타이밍 로드맵
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] pt-6 text-center">
        <h3 className="text-[16px] font-bold text-[#1A1A2E]">PART 1 — 투자 타이밍 로드맵</h3>
        <p className="text-[11px] text-[#9CA3AF] mt-1 mb-4">GPU 병목이 풀리면 → 다음 병목이 투자 기회. 돈은 병목을 따라 이동한다.</p>
      </div>

      <svg width="100%" viewBox="0 0 700 920" xmlns="http://www.w3.org/2000/svg" className="max-w-[740px] mx-auto block">
        <defs>
          <marker id="au-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1.5L8 5L2 8.5" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* 시간축 */}
        <line x1="80" y1="50" x2="80" y2="860" stroke="#d1d5db" strokeWidth="1.5" />
        <circle cx="80" cy="70" r="4" fill="#9ca3af" />
        <text className="au-txt-s" x="60" y="74" textAnchor="end" fontSize="11" fontWeight="600">2024</text>
        <circle cx="80" cy="230" r="4" fill="#9ca3af" />
        <text className="au-txt-s" x="60" y="234" textAnchor="end" fontSize="11" fontWeight="600">2025</text>
        <circle cx="80" cy="420" r="4" fill="#9ca3af" />
        <text className="au-txt-s" x="60" y="424" textAnchor="end" fontSize="11" fontWeight="600">2026</text>
        <circle cx="80" cy="620" r="4" fill="#9ca3af" />
        <text className="au-txt-s" x="60" y="624" textAnchor="end" fontSize="11" fontWeight="600">2027</text>
        <circle cx="80" cy="790" r="4" fill="#9ca3af" />
        <text className="au-txt-s" x="60" y="794" textAnchor="end" fontSize="11" fontWeight="600">2028</text>

        {/* 현재 위치 */}
        <line x1="68" y1="450" x2="690" y2="450" stroke="#ef4444" strokeWidth="1" strokeDasharray="6 4" opacity=".5" />
        <rect x="10" y="440" width="56" height="20" rx="4" fill="#ef4444" />
        <text fill="#fff" x="38" y="454" textAnchor="middle" fontSize="10" fontWeight="600">현재</text>
        <circle cx="80" cy="450" r="6" fill="#ef4444" stroke="#fff" strokeWidth="2">
          <animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* PHASE 1: 반도체 */}
        <rect x="110" y="60" width="260" height="130" rx="12" className="au-surface" opacity=".7" stroke="#60a5fa" strokeWidth="1" />
        <rect x="120" y="70" width="80" height="18" rx="4" fill="#60a5fa" opacity=".2" />
        <text fill="#60a5fa" x="160" y="83" textAnchor="middle" fontSize="9" fontWeight="600">이미 움직임 ✓</text>
        <line x1="80" y1="100" x2="110" y2="100" stroke="#60a5fa" strokeWidth="2" />
        <text className="au-txt-p" x="120" y="110" fontSize="13" fontWeight="700">PHASE 1: 반도체</text>
        <text className="au-txt-s" x="120" y="128" fontSize="10">병목: GPU 수급 부족 → HBM 폭발적 수요</text>
        <text fill="#60a5fa" x="120" y="150" fontSize="10" fontWeight="500">SK하이닉스 +634% · 한미반도체 +378%</text>
        <text className="au-txt-m" x="120" y="170" fontSize="9">주린이 교훈: 대형주가 먼저, 소부장은 3~6개월 후행</text>
        <path d="M240,195 L240,222" fill="none" stroke="#60a5fa" strokeWidth="2" className="au-fl3" markerEnd="url(#au-arr2)" />
        <text className="au-txt-m" x="260" y="216" fontSize="9">병목 이동 ▼</text>

        {/* PHASE 2: 전력 / 변압기 */}
        <rect x="130" y="230" width="280" height="130" rx="12" className="au-surface" opacity=".7" stroke="#f87171" strokeWidth="1.5" />
        <rect x="140" y="240" width="68" height="18" rx="4" fill="#f87171" opacity=".25" />
        <text fill="#f87171" x="174" y="253" textAnchor="middle" fontSize="9" fontWeight="700" className="au-bk">지금 피크 !</text>
        <line x1="80" y1="280" x2="130" y2="280" stroke="#f87171" strokeWidth="2" />
        <text className="au-txt-p" x="140" y="278" fontSize="13" fontWeight="700">PHASE 2: 전력 / 변압기</text>
        <text className="au-txt-s" x="140" y="296" fontSize="10">병목: DC 전력 수요 175%↑, 변압기 납기 2년+</text>
        <text fill="#f87171" x="140" y="318" fontSize="10" fontWeight="500">HD현대일렉트릭 +1,177% · 일진전기 +670%</text>
        <text className="au-txt-m" x="140" y="340" fontSize="9">주린이 교훈: 수주잔고 확인! 실적은 2~3분기 후행</text>
        <path d="M270,365 L270,392" fill="none" stroke="#f87171" strokeWidth="2" className="au-fl3" markerEnd="url(#au-arr2)" />
        <text className="au-txt-m" x="290" y="386" fontSize="9">병목 이동 ▼</text>

        {/* PHASE 3: 냉각 + 건설 */}
        <rect x="150" y="400" width="290" height="120" rx="12" className="au-surface" opacity=".7" stroke="#34d399" strokeWidth="1" />
        <rect x="160" y="410" width="62" height="18" rx="4" fill="#34d399" opacity=".2" />
        <text fill="#34d399" x="191" y="423" textAnchor="middle" fontSize="9" fontWeight="600">다음 차례 →</text>
        <line x1="80" y1="445" x2="150" y2="445" stroke="#34d399" strokeWidth="2" />
        <text className="au-txt-p" x="160" y="445" fontSize="13" fontWeight="700">PHASE 3: 냉각 + 건설</text>
        <text className="au-txt-s" x="160" y="463" fontSize="10">병목: GPU 1장=1,000W+ 발열, 전력 40% 냉각 소모</text>
        <text fill="#34d399" x="160" y="483" fontSize="10" fontWeight="500">한온시스템 · 에이텍 · 삼성물산 · 현대건설</text>
        <text className="au-txt-m" x="160" y="503" fontSize="9">주린이 교훈: 아직 저평가 구간, 선제 진입 타이밍</text>
        <path d="M290,525 L290,552" fill="none" stroke="#34d399" strokeWidth="2" className="au-fl3" markerEnd="url(#au-arr2)" />

        {/* PHASE 4: 광케이블 / 통신 */}
        <rect x="170" y="560" width="290" height="110" rx="12" className="au-surface" opacity=".7" stroke="#8b5cf6" strokeWidth="1" />
        <rect x="180" y="570" width="50" height="18" rx="4" fill="#8b5cf6" opacity=".2" />
        <text fill="#8b5cf6" x="205" y="583" textAnchor="middle" fontSize="9" fontWeight="600">준비 중</text>
        <line x1="80" y1="605" x2="170" y2="605" stroke="#8b5cf6" strokeWidth="1.5" />
        <text className="au-txt-p" x="180" y="605" fontSize="13" fontWeight="700">PHASE 4: 광케이블 / 통신</text>
        <text className="au-txt-s" x="180" y="623" fontSize="10">병목: 구리→광 전환, DC 내부 인터커넥트 교체</text>
        <text fill="#8b5cf6" x="180" y="645" fontSize="10" fontWeight="500">우리로 · 옵티시스 · 오이솔루션</text>
        <path d="M310,675 L310,702" fill="none" stroke="#8b5cf6" strokeWidth="2" className="au-fl3" markerEnd="url(#au-arr2)" />

        {/* PHASE 5: 로봇 / DC 자동화 */}
        <rect x="190" y="710" width="290" height="100" rx="12" className="au-surface" opacity=".7" stroke="#f97316" strokeWidth="1" />
        <rect x="200" y="720" width="44" height="18" rx="4" fill="#f97316" opacity=".2" />
        <text fill="#f97316" x="222" y="733" textAnchor="middle" fontSize="9" fontWeight="600">초기</text>
        <line x1="80" y1="750" x2="190" y2="750" stroke="#f97316" strokeWidth="1.5" />
        <text className="au-txt-p" x="200" y="755" fontSize="13" fontWeight="700">PHASE 5: 로봇 / DC 자동화</text>
        <text className="au-txt-s" x="200" y="773" fontSize="10">DC 완공 → 운영 효율화 = 자동화 수요 폭증</text>
        <text fill="#f97316" x="200" y="793" fontSize="10" fontWeight="500">레인보우로보틱스 · 두산로보틱스 · 뉴로메카</text>

        {/* 우측 인사이트: 주린이 기억 3가지 */}
        <rect className="au-surface" x="420" y="60" width="260" height="120" rx="10" opacity=".6" />
        <text className="au-txt-p" x="436" y="84" fontSize="12" fontWeight="700">주린이가 기억할 3가지</text>
        <text className="au-txt-s" x="436" y="106" fontSize="10">1. 대형주가 먼저, 소부장은 3~6개월 후행</text>
        <text className="au-txt-s" x="436" y="124" fontSize="10">2. 수주잔고 → 매출 인식까지 2~3분기 걸림</text>
        <text className="au-txt-s" x="436" y="142" fontSize="10">{"3. \"이미 오른 섹터\" 추격 말고 \"다음 병목\" 선점"}</text>
        <text fill="#ef4444" x="436" y="168" fontSize="10" fontWeight="600">→ 지금(2026.4월): 냉각+건설이 다음 차례</text>

        {/* 우측 인사이트: 병목 이동 법칙 */}
        <rect className="au-surface" x="420" y="200" width="260" height="160" rx="10" opacity=".6" />
        <text className="au-txt-p" x="436" y="224" fontSize="12" fontWeight="700">병목의 이동 법칙</text>
        <text className="au-txt-m" x="436" y="242" fontSize="9">하나가 풀리면 → 다음이 막힌다 → 거기에 돈이 몰린다</text>

        <rect x="436" y="256" width="54" height="20" rx="4" fill="#60a5fa" opacity=".2" stroke="#60a5fa" strokeWidth=".5" />
        <text fill="#60a5fa" x="463" y="270" textAnchor="middle" fontSize="9" fontWeight="500">GPU</text>
        <text className="au-txt-m" x="496" y="270" fontSize="10">→</text>
        <rect x="508" y="256" width="54" height="20" rx="4" fill="#60a5fa" opacity=".15" stroke="#60a5fa" strokeWidth=".5" />
        <text fill="#60a5fa" x="535" y="270" textAnchor="middle" fontSize="9">메모리</text>
        <text className="au-txt-m" x="568" y="270" fontSize="10">→</text>
        <rect x="580" y="256" width="54" height="20" rx="4" fill="#f87171" opacity=".15" stroke="#f87171" strokeWidth=".5" />
        <text fill="#f87171" x="607" y="270" textAnchor="middle" fontSize="9">전력</text>

        <rect x="436" y="286" width="54" height="20" rx="4" fill="#34d399" opacity=".15" stroke="#34d399" strokeWidth=".5" />
        <text fill="#34d399" x="463" y="300" textAnchor="middle" fontSize="9">냉각</text>
        <text className="au-txt-m" x="496" y="300" fontSize="10">→</text>
        <rect x="508" y="286" width="54" height="20" rx="4" fill="#8b5cf6" opacity=".15" stroke="#8b5cf6" strokeWidth=".5" />
        <text fill="#8b5cf6" x="535" y="300" textAnchor="middle" fontSize="9">네트워크</text>
        <text className="au-txt-m" x="568" y="300" fontSize="10">→</text>
        <rect x="580" y="286" width="54" height="20" rx="4" fill="#f97316" opacity=".15" stroke="#f97316" strokeWidth=".5" />
        <text fill="#f97316" x="607" y="300" textAnchor="middle" fontSize="9">자동화</text>

        <text className="au-txt-m" x="436" y="332" fontSize="9">{"\"초기 AI 병목은 GPU. 이제는 다르다."}</text>
        <text className="au-txt-m" x="436" y="346" fontSize="9">GPU가 풀리면 메모리가, 네트워크가 해결되면</text>
        <text className="au-txt-m" x="436" y="360" fontSize="9">{"냉각이 한계를 드러낸다.\""}</text>

        <text className="au-txt-m" x="350" y="860" textAnchor="middle" fontSize="8" opacity=".5">본 자료는 투자 권유가 아닌 정보 제공 목적입니다 · FLOWX</text>
      </svg>


      {/* ═══════════════════════════════════════════════════════════
          PART 2 — 리스크 시나리오
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] mt-10 pt-6 text-center">
        <h3 className="text-[16px] font-bold text-[#1A1A2E]">PART 2 — 리스크 시나리오</h3>
        <p className="text-[11px] text-[#9CA3AF] mt-1 mb-2">주린이는 오를 때만 보지만, 프로는 빠질 때를 먼저 본다</p>
      </div>

      {/* 범례 */}
      <div className="flex gap-3 justify-center flex-wrap text-[10px] text-[#5f5e5a] mb-3">
        <span className="flex items-center gap-1"><span className="w-[7px] h-[7px] rounded-full bg-[#ef4444]" />직격탄 (–30%↑)</span>
        <span className="flex items-center gap-1"><span className="w-[7px] h-[7px] rounded-full bg-[#f59e0b]" />타격 (–15%~)</span>
        <span className="flex items-center gap-1"><span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />방어 / 수혜</span>
      </div>

      {/* 시나리오 A: AI 버블 붕괴 */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] mb-2.5 overflow-hidden" style={{ borderLeft: '3px solid #ef4444' }}>
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0 bg-[#ef4444]">A</div>
          <div className="text-[13px] font-bold text-[#1A1A2E]">AI 버블 붕괴 — 빅테크 CAPEX 축소</div>
          <div className="ml-auto shrink-0 text-[10px] px-2 py-0.5 rounded bg-[rgba(239,68,68,0.1)] text-[#ef4444] font-semibold">확률 20~30%</div>
        </div>
        <div className="px-3.5 pb-3">
          <p className="text-[11px] leading-relaxed text-[#5f5e5a] mb-2.5">
            AI 수익화 지연 → 빅테크 실적 미스 → CAPEX 삭감 → 전 공급망 급락.<br />
            SMIC co-CEO 조해군(Zhao Haijun): &quot;10년치 용량을 1~2년 만에 구축... 수요 없는 빈 껍데기 전락 우려&quot;
          </p>
          <div className="flex items-center gap-1 flex-wrap mb-2.5">
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#ef4444] font-semibold">CAPEX 삭감</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">GPU 주문 취소</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">반도체 재고↑</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">DC 건설 중단</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] text-[#22c55e]">기수주분 유지</span>
          </div>
          <div className="flex gap-1 flex-wrap mb-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(239,68,68,0.1)] text-[#ef4444]"><span className="w-[5px] h-[5px] rounded-full bg-[#ef4444]" />반도체 –40%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(239,68,68,0.1)] text-[#ef4444]"><span className="w-[5px] h-[5px] rounded-full bg-[#ef4444]" />로봇 –35%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"><span className="w-[5px] h-[5px] rounded-full bg-[#f59e0b]" />건설 –20%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(34,197,94,0.06)] text-[#22c55e]"><span className="w-[5px] h-[5px] rounded-full bg-[#22c55e]" />전력(기수주) –5%</span>
          </div>
          <div className="rounded-lg bg-[#F5F4F0] px-3 py-2.5 text-[10px] leading-relaxed">
            <strong className="text-[#1A1A2E]">방어법:</strong>{' '}
            <span className="text-[#5f5e5a]">PER 30배↑ 소부장 정리 / 수주잔고 2년+ 전력주 홀딩 / 현금 40%↑ 확보</span>
          </div>
        </div>
      </div>

      {/* 시나리오 B: 금리 인상 / 스태그플레이션 */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] mb-2.5 overflow-hidden" style={{ borderLeft: '3px solid #f59e0b' }}>
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0 bg-[#f59e0b]">B</div>
          <div className="text-[13px] font-bold text-[#1A1A2E]">금리 인상 / 스태그플레이션</div>
          <div className="ml-auto shrink-0 text-[10px] px-2 py-0.5 rounded bg-[rgba(245,158,11,0.1)] text-[#f59e0b] font-semibold">확률 35~45%</div>
        </div>
        <div className="px-3.5 pb-3">
          <p className="text-[11px] leading-relaxed text-[#5f5e5a] mb-2.5">
            이란 전쟁 → 유가 $120+ → 인플레 재점화 → 금리 동결/인상 → 성장주 밸류에이션 붕괴.<br />
            DC 건설 자금 조달 비용 급증 → 프로젝트 지연 → 성장주 전반 조정
          </p>
          <div className="flex items-center gap-1 flex-wrap mb-2.5">
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#ef4444] font-semibold">유가 $120+</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">DC 건설비↑</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">프로젝트 지연</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">PER 압축</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] text-[#22c55e]">에너지주 수혜</span>
          </div>
          <div className="flex gap-1 flex-wrap mb-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(239,68,68,0.1)] text-[#ef4444]"><span className="w-[5px] h-[5px] rounded-full bg-[#ef4444]" />건설 –30%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"><span className="w-[5px] h-[5px] rounded-full bg-[#f59e0b]" />로봇 –25%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"><span className="w-[5px] h-[5px] rounded-full bg-[#f59e0b]" />반도체 –20%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(34,197,94,0.06)] text-[#22c55e]"><span className="w-[5px] h-[5px] rounded-full bg-[#22c55e]" />에너지주 +20%</span>
          </div>
          <div className="rounded-lg bg-[#F5F4F0] px-3 py-2.5 text-[10px] leading-relaxed">
            <strong className="text-[#1A1A2E]">방어법:</strong>{' '}
            <span className="text-[#5f5e5a]">에너지(S-Oil) 헤지 편입 / 배당주 리밸런싱 / 유가 $100 돌파 시 건설 절반 축소</span>
          </div>
        </div>
      </div>

      {/* 시나리오 C: 미중 기술전쟁 격화 */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] mb-2.5 overflow-hidden" style={{ borderLeft: '3px solid #8b5cf6' }}>
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0 bg-[#8b5cf6]">C</div>
          <div className="text-[13px] font-bold text-[#1A1A2E]">미중 기술전쟁 격화 — 수출 규제 확대</div>
          <div className="ml-auto shrink-0 text-[10px] px-2 py-0.5 rounded bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] font-semibold">확률 40~50%</div>
        </div>
        <div className="px-3.5 pb-3">
          <p className="text-[11px] leading-relaxed text-[#5f5e5a] mb-2.5">
            301조 관세 + 반도체 수출 규제 강화 → 한국 반도체 중국 매출 타격 → 방산 반사이익<br />
            한국 상호관세 25%→15%(2025.8 협상)→미 대법원 위법 판결(2026.2), 법적 불확실성 지속
          </p>
          <div className="flex items-center gap-1 flex-wrap mb-2.5">
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#ef4444] font-semibold">수출 규제 강화</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">중국 매출↓</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">소부장 연쇄</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] text-[#22c55e]">국내DC 가속</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] text-[#22c55e]">방산 +25%</span>
          </div>
          <div className="flex gap-1 flex-wrap mb-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(239,68,68,0.1)] text-[#ef4444]"><span className="w-[5px] h-[5px] rounded-full bg-[#ef4444]" />반도체(중국↑) –30%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(34,197,94,0.06)] text-[#22c55e]"><span className="w-[5px] h-[5px] rounded-full bg-[#22c55e]" />건설(국내DC) +10%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(34,197,94,0.06)] text-[#22c55e]"><span className="w-[5px] h-[5px] rounded-full bg-[#22c55e]" />방산주 +25%</span>
          </div>
          <div className="rounded-lg bg-[#F5F4F0] px-3 py-2.5 text-[10px] leading-relaxed">
            <strong className="text-[#1A1A2E]">방어법:</strong>{' '}
            <span className="text-[#5f5e5a]">중국 매출 30%↑ 종목 체크 / 미국향 기업 선호 / 방산 헤지 20%</span>
          </div>
        </div>
      </div>

      {/* 시나리오 D: 전력 공급 실패 */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] mb-2.5 overflow-hidden" style={{ borderLeft: '3px solid #f97316' }}>
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0 bg-[#f97316]">D</div>
          <div className="text-[13px] font-bold text-[#1A1A2E]">전력 공급 실패 — DC 건설 병목</div>
          <div className="ml-auto shrink-0 text-[10px] px-2 py-0.5 rounded bg-[rgba(249,115,22,0.1)] text-[#f97316] font-bold">확률 50~60%</div>
        </div>
        <div className="px-3.5 pb-3">
          <p className="text-[11px] leading-relaxed text-[#5f5e5a] mb-2.5">
            DC 건설 속도 {'>'} 전력 인프라 확충 → 계통 병목 → DC 가동 지연.<br />
            이건 위기이자 기회! 전력 병목이 심해질수록 → 전력 인프라 기업 수혜 극대화
          </p>
          <div className="flex items-center gap-1 flex-wrap mb-2.5">
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#ef4444] font-semibold">전력 계통 병목</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">DC 가동 지연</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] text-[#22c55e]">변압기 수주 폭증</span>
            <span className="text-[11px] text-[#9CA3AF]">→</span>
            <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] text-[#22c55e]">원전/SMR 가속</span>
          </div>
          <div className="flex gap-1 flex-wrap mb-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"><span className="w-[5px] h-[5px] rounded-full bg-[#f59e0b]" />건설 –10%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(34,197,94,0.06)] text-[#22c55e]"><span className="w-[5px] h-[5px] rounded-full bg-[#22c55e]" />전력 +30%↑</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-[rgba(34,197,94,0.06)] text-[#22c55e]"><span className="w-[5px] h-[5px] rounded-full bg-[#22c55e]" />원전/SMR +40%↑</span>
          </div>
          <div className="rounded-lg bg-[#F5F4F0] px-3 py-2.5 text-[10px] leading-relaxed">
            <strong className="text-[#1A1A2E]">기회:</strong>{' '}
            <span className="text-[#5f5e5a]">가장 높은 확률(50~60%). 전력 병목 심화 → HD현대일렉트릭, 두산에너빌리티 추가 수혜</span>
          </div>
        </div>
      </div>

      {/* 방어/위험 요약 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-2">
        <div className="rounded-xl border border-[rgba(0,0,0,0.08)] p-3" style={{ borderLeft: '3px solid #22c55e' }}>
          <div className="text-[12px] font-bold text-[#22c55e] mb-1.5">어떤 시나리오든 버티는 종목</div>
          <p className="text-[10px] leading-relaxed text-[#5f5e5a]">
            수주잔고 2년+ <strong className="text-[#1A1A2E]">전력 인프라주</strong> (HD현대일렉트릭, LS일렉트릭)<br />
            AI 무관 <strong className="text-[#1A1A2E]">방산주</strong> (한화에어로, LIG넥스원)
          </p>
        </div>
        <div className="rounded-xl border border-[rgba(0,0,0,0.08)] p-3" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="text-[12px] font-bold text-[#ef4444] mb-1.5">어떤 시나리오든 위험한 종목</div>
          <p className="text-[10px] leading-relaxed text-[#5f5e5a]">
            PER 30배+ <strong className="text-[#1A1A2E]">실적 미검증 소부장</strong><br />
            분기 흑자 전환 + 수주잔고 없으면 위험
          </p>
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════════
          PART 3 — 섹터 간 연쇄반응
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] mt-10 pt-6 text-center">
        <h3 className="text-[16px] font-bold text-[#1A1A2E]">PART 3 — 섹터 간 연쇄반응</h3>
        <p className="text-[11px] text-[#9CA3AF] mt-1 mb-4">하나의 뉴스가 어떻게 종목까지 전파되는지, 인과관계 체인을 따라가세요<br />※ PART 1(산업 파급)은 년 단위, PART 3(주가 반응)은 일 단위 — 측정 척도가 다릅니다</p>
      </div>

      {/* 예시 1: NVIDIA 실적 서프라이즈 */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] p-3.5 mb-2" style={{ borderLeft: '3px solid #60a5fa' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-full bg-[#60a5fa] flex items-center justify-center text-white text-[11px] font-bold">1</div>
          <div className="text-[13px] font-bold text-[#1A1A2E]">트리거: NVIDIA 실적 서프라이즈</div>
        </div>
        <div className="flex items-center gap-1 flex-wrap mb-2.5">
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#ef4444] font-semibold">NVIDIA +15%</span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] border" style={{ background: 'rgba(96,165,250,.08)', borderColor: 'rgba(96,165,250,.3)', color: '#60a5fa' }}>SK하이닉스 +8%<br /><span className="text-[8px]">D+0~1</span></span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] border" style={{ background: 'rgba(96,165,250,.05)', borderColor: 'rgba(96,165,250,.2)', color: '#60a5fa' }}>한미반도체 +12%<br /><span className="text-[8px]">D+1~3</span></span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] border" style={{ background: 'rgba(248,113,113,.05)', borderColor: 'rgba(248,113,113,.2)' }}>전력주 +5%<br /><span className="text-[8px]">D+1~5</span></span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] border" style={{ background: 'rgba(52,211,153,.05)', borderColor: 'rgba(52,211,153,.2)' }}>냉각주 +3%<br /><span className="text-[8px]">D+5~14</span></span>
        </div>
        <div className="rounded-lg bg-[#F5F4F0] px-3 py-2.5 text-[10px] leading-relaxed">
          <strong className="text-[#1A1A2E]">법칙:</strong>{' '}
          <span className="text-[#5f5e5a]">대형주(D+0) → 소부장(D+1~3) → 후방산업(D+5~14). 대형주 급등 보고 소부장 진입 = 타이밍!</span>
        </div>
      </div>

      {/* 예시 2: DC 100개 신규 건설 */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] p-3.5 mb-2" style={{ borderLeft: '3px solid #eab308' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-full bg-[#eab308] flex items-center justify-center text-white text-[11px] font-bold">2</div>
          <div className="text-[13px] font-bold text-[#1A1A2E]">트리거: 빅테크 &quot;DC 100개 신규 건설&quot; 발표</div>
        </div>
        <div className="flex items-center gap-1 flex-wrap mb-2.5">
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#ef4444] font-semibold">CAPEX 확대</span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] border" style={{ background: 'rgba(234,179,8,.08)', borderColor: 'rgba(234,179,8,.3)', color: '#eab308' }}>삼성물산 +6%</span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] border" style={{ background: 'rgba(248,113,113,.05)', borderColor: 'rgba(248,113,113,.2)' }}>일진전기 +8%</span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] border" style={{ background: 'rgba(52,211,153,.05)', borderColor: 'rgba(52,211,153,.2)' }}>한온시스템 +3%</span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] border" style={{ background: 'rgba(139,92,246,.05)', borderColor: 'rgba(139,92,246,.2)' }}>우리로 +4%</span>
        </div>
        <div className="rounded-lg bg-[#F5F4F0] px-3 py-2.5 text-[10px] leading-relaxed">
          <strong className="text-[#1A1A2E]">예외 법칙:</strong>{' '}
          <span className="text-[#5f5e5a]">전력은 &quot;병목 프리미엄&quot;으로 건설보다 더 크게 반응할 때가 있음 (일진전기 +8% {'>'} 삼성물산 +6%)</span>
        </div>
      </div>

      {/* 예시 3: NVIDIA 가이던스 하향 */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] p-3.5 mb-2" style={{ borderLeft: '3px solid #ef4444' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-full bg-[#ef4444] flex items-center justify-center text-white text-[11px] font-bold">3</div>
          <div className="text-[13px] font-bold text-[#1A1A2E]">역방향: NVIDIA 가이던스 하향</div>
        </div>
        <div className="flex items-center gap-1 flex-wrap mb-2.5">
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.12)] text-[#ef4444] font-semibold">NVIDIA –12%</span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">SK하이닉스 –10%</span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444]">한미반도체 –15%</span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] border" style={{ background: 'rgba(239,68,68,.03)', borderColor: 'rgba(239,68,68,.15)', color: '#ef4444' }}>전력주 –5%</span>
          <span className="text-[11px] text-[#9CA3AF]">→</span>
          <span className="text-[10px] px-2 py-0.5 rounded-[5px] whitespace-nowrap border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] text-[#22c55e]">방산주 +2%</span>
        </div>
        <div className="rounded-lg bg-[#F5F4F0] px-3 py-2.5 text-[10px] leading-relaxed">
          <strong className="text-[#1A1A2E]">핵심:</strong>{' '}
          <span className="text-[#5f5e5a]">하락 시 소부장이 대형주보다 1.5배 더 빠진다 (레버리지 효과). 소부장은 양날의 검!</span>
        </div>
      </div>

      {/* 연쇄반응 4법칙 */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F5F4F0] p-3.5 mt-3">
        <div className="text-[13px] font-bold text-center text-[#1A1A2E] mb-2.5">주린이가 외워야 할 연쇄반응 4법칙</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-2.5">
            <div className="text-[11px] font-semibold text-[#60a5fa] mb-1">법칙 1: 선행 후행</div>
            <p className="text-[10px] leading-relaxed text-[#5f5e5a]">대형주가 먼저, 소부장 1~7일 후행<br />대형주 급등 → 소부장 진입 타이밍</p>
          </div>
          <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-2.5">
            <div className="text-[11px] font-semibold text-[#f87171] mb-1">법칙 2: 감쇄의 법칙</div>
            <p className="text-[10px] leading-relaxed text-[#5f5e5a]">트리거에서 멀수록 반응↓<br />예외: 병목 섹터는 오히려 증폭</p>
          </div>
          <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-2.5">
            <div className="text-[11px] font-semibold text-[#eab308] mb-1">법칙 3: 레버리지</div>
            <p className="text-[10px] leading-relaxed text-[#5f5e5a]">소부장 = 대형주의 1.5~2배 진폭<br />+15% 올라갈 때 –15%도 각오</p>
          </div>
          <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-2.5">
            <div className="text-[11px] font-semibold text-[#22c55e] mb-1">법칙 4: 역상관</div>
            <p className="text-[10px] leading-relaxed text-[#5f5e5a]">AI 하락 → 방산/에너지 상승<br />역상관 종목 20% 편입 = 보험</p>
          </div>
        </div>
      </div>

      {/* 면책 */}
      <div className="text-center pt-6 pb-2">
        <p className="text-[9px] text-[#9CA3AF] opacity-50">
          본 자료는 투자 권유가 아닌 정보 제공 목적입니다 · 수치는 과거 패턴 기반 예시<br />
          종목 정보는 2026년 4월 기준이며 변동될 수 있습니다 · FLOWX
        </p>
      </div>
    </div>
  )
}
