'use client'

/* ══════════════════════════════════════════════════════════════
   일론 머스크 생태계 유니버스
   Tesla · SpaceX · xAI · Starlink · Neuralink · Boring Company
   ══════════════════════════════════════════════════════════════ */

export default function MuskUniverseView() {
  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 pb-8">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mu-fd{to{stroke-dashoffset:-20}}
        @media(prefers-reduced-motion:reduce){.mu-fl{animation:none!important}}
        .mu-fl{animation:mu-fd 2.5s linear infinite}
        .mu-timeline{position:relative;padding:1rem 0}
        .mu-timeline::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,transparent,#1a5fb4,#0891b2,transparent);transform:translateX(-50%)}
        .mu-tl-item{position:relative;width:50%;padding:1rem 2.5rem}
        .mu-tl-item:nth-child(odd){margin-left:0;text-align:right;padding-right:2rem}
        .mu-tl-item:nth-child(even){margin-left:50%;text-align:left;padding-left:2rem}
        .mu-tl-dot{position:absolute;top:1.2rem;width:12px;height:12px;border-radius:50%;background:#1a5fb4;border:2px solid #fff;box-shadow:0 0 0 2px #1a5fb4}
        .mu-tl-item:nth-child(odd) .mu-tl-dot{right:-6px}
        .mu-tl-item:nth-child(even) .mu-tl-dot{left:-6px}
        .mu-tl-star .mu-tl-dot{background:#b8860b;width:14px;height:14px;box-shadow:0 0 0 3px rgba(184,134,11,0.3)}
        .mu-tl-star:nth-child(odd) .mu-tl-dot{right:-7px}
        .mu-tl-star:nth-child(even) .mu-tl-dot{left:-7px}
        .mu-tl-star .mu-tl-inner{border-color:rgba(184,134,11,0.3);background:#fefce8}
        .mu-tl-inner{background:#fff;border:1px solid #e5e7ef;border-radius:10px;padding:1rem 1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.04)}
        @media(max-width:768px){
          .mu-timeline::before{left:12px}
          .mu-tl-item{width:100%!important;margin-left:0!important;text-align:left!important;padding:0.6rem 0.8rem 0.6rem 2rem!important}
          .mu-tl-item .mu-tl-dot{left:6px!important;right:auto!important}
        }
      ` }} />

      {/* ═══════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════ */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(26,95,180,0.2)] bg-[rgba(26,95,180,0.06)] text-[14px] text-[#1a5fb4] font-semibold mb-3">
          🚀 2026 SpaceX IPO D-Day 접근 중
        </div>
        <h2 className="text-[24px] font-bold text-[#1A1A2E]">
          <span style={{ background: 'linear-gradient(135deg,#d92028,#7c3aed,#1a5fb4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>일론 머스크</span>{' '}
          생태계 유니버스
        </h2>
        <p className="text-[13px] text-[#6B7280] mt-1.5 max-w-[700px] mx-auto">
          Tesla · SpaceX · xAI · Starlink · Neuralink · Boring Company<br />
          6개 기업이 만드는 초연결 제국, 투자자를 위한 완전 해부도
        </p>

        <div className="flex gap-3 justify-center flex-wrap mt-4">
          <div className="bg-white border border-[#e5e7ef] rounded-xl px-5 py-3 shadow text-center">
            <div className="text-[20px] font-bold text-[#1a5fb4]">$1.75T</div>
            <div className="text-[11px] text-[#9ca3b8]">SpaceX IPO 목표 밸류</div>
          </div>
          <div className="bg-white border border-[#e5e7ef] rounded-xl px-5 py-3 shadow text-center">
            <div className="text-[20px] font-bold text-[#1a5fb4]">6</div>
            <div className="text-[11px] text-[#9ca3b8]">머스크 기업 수</div>
          </div>
          <div className="bg-white border border-[#e5e7ef] rounded-xl px-5 py-3 shadow text-center">
            <div className="text-[20px] font-bold text-[#1a5fb4]">$75B</div>
            <div className="text-[11px] text-[#9ca3b8]">IPO 조달 목표</div>
          </div>
          <div className="bg-white border border-[#e5e7ef] rounded-xl px-5 py-3 shadow text-center">
            <div className="text-[20px] font-bold text-[#1a5fb4]">26종+</div>
            <div className="text-[11px] text-[#9ca3b8]">미국·한국 수혜주</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — 머스크 생태계 유니버스 맵
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] pt-5 mb-4">
        <div className="inline-block text-[11px] font-bold tracking-widest px-3 py-1 rounded-md bg-[#ecfeff] text-[#0891b2] mb-2">SECTION 01</div>
        <h3 className="text-[18px] font-bold text-[#1A1A2E] mb-1">머스크 생태계 유니버스 맵</h3>
        <p className="text-[13px] text-[#5b6178] max-w-[700px] mb-3">일론 머스크를 중심으로 6개 기업이 하나의 초연결 생태계를 형성합니다. 각 기업은 독립적이면서도 기술·데이터·자원을 공유하며 시너지를 만들어냅니다.</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <svg viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg" className="block mx-auto" style={{ maxWidth: '1100px', width: '100%' }}>
          <defs>
            <filter id="mu-soft"><feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="rgba(0,0,0,0.08)" /></filter>
            <filter id="mu-card"><feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="rgba(0,0,0,0.07)" /></filter>
          </defs>

          {/* Orbit circles */}
          <circle cx="600" cy="440" r="180" fill="none" stroke="#e5e7ef" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="600" cy="440" r="300" fill="none" stroke="#eceef4" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="600" cy="440" r="380" fill="none" stroke="#f0f2f8" strokeWidth="1" strokeDasharray="3 8" />

          {/* Animated connection lines */}
          <line x1="600" y1="440" x2="250" y2="200" stroke="rgba(217,32,40,0.45)" strokeWidth="2.5" strokeDasharray="6 4"><animate attributeName="stroke-dashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite" /></line>
          <line x1="600" y1="440" x2="950" y2="200" stroke="rgba(26,95,180,0.45)" strokeWidth="2.5" strokeDasharray="6 4"><animate attributeName="stroke-dashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite" /></line>
          <line x1="600" y1="440" x2="180" y2="540" stroke="rgba(124,58,237,0.45)" strokeWidth="2.5" strokeDasharray="6 4"><animate attributeName="stroke-dashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite" /></line>
          <line x1="600" y1="440" x2="1020" y2="540" stroke="rgba(8,145,178,0.45)" strokeWidth="2.5" strokeDasharray="6 4"><animate attributeName="stroke-dashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite" /></line>
          <line x1="600" y1="440" x2="330" y2="760" stroke="rgba(219,39,119,0.4)" strokeWidth="2.5" strokeDasharray="6 4"><animate attributeName="stroke-dashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite" /></line>
          <line x1="600" y1="440" x2="870" y2="760" stroke="rgba(217,119,6,0.45)" strokeWidth="2.5" strokeDasharray="6 4"><animate attributeName="stroke-dashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite" /></line>
          <line x1="950" y1="200" x2="1020" y2="540" stroke="rgba(8,145,178,0.3)" strokeWidth="2" strokeDasharray="4 4"><animate attributeName="stroke-dashoffset" values="0;-16" dur="3s" repeatCount="indefinite" /></line>
          <line x1="180" y1="540" x2="1020" y2="540" stroke="rgba(124,58,237,0.2)" strokeWidth="1.5" strokeDasharray="3 6" />

          {/* CENTER — ELON MUSK */}
          <circle cx="600" cy="440" r="58" fill="white" stroke="#e5e7ef" strokeWidth="2" filter="url(#mu-card)" />
          <circle cx="600" cy="440" r="48" fill="white" stroke="#1a5fb4" strokeWidth="1.5" opacity="0.3" />
          <text x="600" y="432" textAnchor="middle" fill="#1a1d2e" fontFamily="Outfit,sans-serif" fontSize="12" fontWeight="900">ELON</text>
          <text x="600" y="450" textAnchor="middle" fill="#1a1d2e" fontFamily="Outfit,sans-serif" fontSize="12" fontWeight="900">MUSK</text>
          <text x="600" y="468" textAnchor="middle" fill="#9ca3b8" fontSize="9">지배력 중심</text>

          {/* TESLA */}
          <rect x="155" y="128" width="190" height="140" rx="16" fill="white" stroke="#d92028" strokeWidth="1.5" filter="url(#mu-card)" />
          <rect x="155" y="128" width="190" height="4" rx="2" fill="#d92028" />
          <text x="250" y="158" textAnchor="middle" fill="#d92028" fontFamily="Outfit,sans-serif" fontSize="15" fontWeight="900">TESLA</text>
          <text x="250" y="178" textAnchor="middle" fill="#5b6178" fontSize="10">전기차 · FSD · 옵티머스</text>
          <text x="250" y="198" textAnchor="middle" fill="#9ca3b8" fontSize="9">TSLA | 시총 ~$1.5T</text>
          <line x1="175" y1="212" x2="325" y2="212" stroke="#e5e7ef" strokeWidth="0.5" />
          <text x="250" y="230" textAnchor="middle" fill="#d92028" fontSize="9" fontWeight="600">🇺🇸 NASDAQ 상장</text>
          <text x="250" y="250" textAnchor="middle" fill="#9ca3b8" fontSize="8.5">에너지 · 로보택시 · AI 훈련</text>

          {/* SPACEX */}
          <rect x="855" y="128" width="190" height="140" rx="16" fill="white" stroke="#1a5fb4" strokeWidth="1.5" filter="url(#mu-card)" />
          <rect x="855" y="128" width="190" height="4" rx="2" fill="#1a5fb4" />
          <text x="950" y="158" textAnchor="middle" fill="#1a5fb4" fontFamily="Outfit,sans-serif" fontSize="14" fontWeight="900">SPACEX</text>
          <text x="950" y="178" textAnchor="middle" fill="#5b6178" fontSize="10">로켓 · 스타십 · 우주 DC</text>
          <text x="950" y="198" textAnchor="middle" fill="#9ca3b8" fontSize="9">목표 밸류 $1.75T</text>
          <line x1="875" y1="212" x2="1025" y2="212" stroke="#e5e7ef" strokeWidth="0.5" />
          <rect x="902" y="220" width="96" height="18" rx="4" fill="#fefce8" stroke="rgba(184,134,11,0.3)" strokeWidth="1" />
          <text x="950" y="233" textAnchor="middle" fill="#b8860b" fontSize="8.5" fontWeight="700">⭐ 2026.6 IPO</text>
          <text x="950" y="254" textAnchor="middle" fill="#9ca3b8" fontSize="8.5">xAI 합병 · $75B 조달</text>

          {/* xAI */}
          <rect x="85" y="478" width="190" height="120" rx="16" fill="white" stroke="#7c3aed" strokeWidth="1.5" filter="url(#mu-card)" />
          <rect x="85" y="478" width="190" height="4" rx="2" fill="#7c3aed" />
          <text x="180" y="510" textAnchor="middle" fill="#7c3aed" fontFamily="Outfit,sans-serif" fontSize="15" fontWeight="900">xAI</text>
          <text x="180" y="530" textAnchor="middle" fill="#5b6178" fontSize="10">Grok · AI 인프라</text>
          <text x="180" y="550" textAnchor="middle" fill="#9ca3b8" fontSize="9">SpaceX와 합병 완료</text>
          <line x1="105" y1="562" x2="255" y2="562" stroke="#e5e7ef" strokeWidth="0.5" />
          <text x="180" y="580" textAnchor="middle" fill="#7c3aed" fontSize="9" fontWeight="500">비상장 → SpaceX 내 편입</text>

          {/* STARLINK */}
          <rect x="925" y="478" width="190" height="120" rx="16" fill="white" stroke="#0891b2" strokeWidth="1.5" filter="url(#mu-card)" />
          <rect x="925" y="478" width="190" height="4" rx="2" fill="#0891b2" />
          <text x="1020" y="510" textAnchor="middle" fill="#0891b2" fontFamily="Outfit,sans-serif" fontSize="13" fontWeight="900">STARLINK</text>
          <text x="1020" y="530" textAnchor="middle" fill="#5b6178" fontSize="10">위성인터넷 · D2C</text>
          <text x="1020" y="550" textAnchor="middle" fill="#9ca3b8" fontSize="9">800만+ 가입자 | 매출 $10B+</text>
          <line x1="945" y1="562" x2="1095" y2="562" stroke="#e5e7ef" strokeWidth="0.5" />
          <text x="1020" y="580" textAnchor="middle" fill="#0891b2" fontSize="9" fontWeight="500">SpaceX 사업부 (캐시카우)</text>

          {/* NEURALINK */}
          <rect x="235" y="698" width="190" height="120" rx="16" fill="white" stroke="#db2777" strokeWidth="1.5" filter="url(#mu-card)" />
          <rect x="235" y="698" width="190" height="4" rx="2" fill="#db2777" />
          <text x="330" y="728" textAnchor="middle" fill="#db2777" fontFamily="Outfit,sans-serif" fontSize="13" fontWeight="900">NEURALINK</text>
          <text x="330" y="748" textAnchor="middle" fill="#5b6178" fontSize="10">뇌-컴퓨터 인터페이스</text>
          <text x="330" y="768" textAnchor="middle" fill="#9ca3b8" fontSize="9">임상시험 진행 중</text>
          <line x1="255" y1="780" x2="405" y2="780" stroke="#e5e7ef" strokeWidth="0.5" />
          <text x="330" y="798" textAnchor="middle" fill="#db2777" fontSize="9" fontWeight="500">비상장 | 초기 단계</text>

          {/* BORING CO. */}
          <rect x="775" y="698" width="190" height="120" rx="16" fill="white" stroke="#d97706" strokeWidth="1.5" filter="url(#mu-card)" />
          <rect x="775" y="698" width="190" height="4" rx="2" fill="#d97706" />
          <text x="870" y="728" textAnchor="middle" fill="#d97706" fontFamily="Outfit,sans-serif" fontSize="11" fontWeight="900">BORING CO.</text>
          <text x="870" y="748" textAnchor="middle" fill="#5b6178" fontSize="10">터널 · 지하 교통</text>
          <text x="870" y="768" textAnchor="middle" fill="#9ca3b8" fontSize="9">라스베이거스 루프 운영</text>
          <line x1="795" y1="780" x2="945" y2="780" stroke="#e5e7ef" strokeWidth="0.5" />
          <text x="870" y="798" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="500">비상장 | 인프라</text>

          {/* Connection Labels */}
          <text x="390" y="308" textAnchor="middle" fill="rgba(217,32,40,0.8)" fontSize="11" fontWeight="700" transform="rotate(-30 390 308)">FSD·배터리 기술 공유</text>
          <text x="810" y="308" textAnchor="middle" fill="rgba(26,95,180,0.8)" fontSize="11" fontWeight="700" transform="rotate(30 810 308)">우주 데이터센터</text>
          <text x="370" y="508" textAnchor="middle" fill="rgba(124,58,237,0.8)" fontSize="11" fontWeight="700">AI 모델·Grok</text>
          <text x="830" y="508" textAnchor="middle" fill="rgba(8,145,178,0.8)" fontSize="11" fontWeight="700">위성 네트워크</text>
          <text x="1002" y="365" textAnchor="middle" fill="rgba(8,145,178,0.7)" fontSize="10" fontWeight="700" transform="rotate(60 1002 365)">Starlink↔SpaceX 캐시카우</text>

          {/* Legend */}
          <rect x="30" y="30" width="200" height="90" rx="10" fill="white" stroke="#e5e7ef" strokeWidth="1" filter="url(#mu-soft)" />
          <text x="50" y="52" fill="#5b6178" fontSize="9" fontWeight="600">범례</text>
          <line x1="50" y1="68" x2="80" y2="68" stroke="#b8860b" strokeWidth="2" />
          <text x="88" y="72" fill="#9ca3b8" fontSize="8">IPO 예정 (SpaceX)</text>
          <line x1="50" y1="85" x2="80" y2="85" stroke="#9ca3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="88" y="89" fill="#9ca3b8" fontSize="8">기술·자원 시너지</text>
          <circle cx="60" cy="105" r="5" fill="white" stroke="#e5e7ef" strokeWidth="1.5" />
          <text x="88" y="108" fill="#9ca3b8" fontSize="8">비상장 기업</text>
        </svg>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — 기업 간 시너지 흐름
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] mt-8 pt-5 mb-4">
        <div className="inline-block text-[11px] font-bold tracking-widest px-3 py-1 rounded-md bg-[#f3effe] text-[#7c3aed] mb-2">SECTION 02</div>
        <h3 className="text-[18px] font-bold text-[#1A1A2E] mb-1">기업 간 시너지 흐름</h3>
        <p className="text-[13px] text-[#5b6178] max-w-[700px] mb-3">머스크 제국의 진짜 경쟁력은 6개 기업이 따로 노는 게 아니라, 서로의 기술과 데이터를 돌려쓴다는 것입니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tesla ↔ SpaceX */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#d92028,#1a5fb4)' }} />
          <div className="text-[24px] mb-2">🚗🚀</div>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">Tesla ↔ SpaceX: 제조 DNA 공유</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">테슬라의 대량생산 노하우(기가캐스팅, 배터리 기술)를 SpaceX 스타십에 적용. 반대로 SpaceX의 우주급 소재·열관리 기술이 테슬라 EV에 역수입됩니다.</p>
          <span className="text-[11px] px-3 py-1 rounded-md bg-[#fef2f2] text-[#d92028] font-semibold">핵심 시너지</span>
        </div>

        {/* SpaceX + xAI */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#1a5fb4,#7c3aed)' }} />
          <div className="text-[24px] mb-2">🚀🧠</div>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">SpaceX + xAI: 우주 데이터센터</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">2026년 2월 합병 완료. xAI의 Grok 모델 훈련에 우주 데이터센터를 활용하려는 구상. 지구의 전력 병목을 우주 태양광으로 돌파하겠다는 장기 비전입니다.</p>
          <span className="text-[11px] px-3 py-1 rounded-md bg-[#f3effe] text-[#7c3aed] font-semibold">합병 완료</span>
        </div>

        {/* Starlink ↔ xAI */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#0891b2,#7c3aed)' }} />
          <div className="text-[24px] mb-2">🛰️🧠</div>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">Starlink ↔ xAI: 데이터 파이프라인</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">Starlink의 7,000+기 위성 네트워크가 xAI 모델의 실시간 글로벌 데이터 수집 채널이 됩니다. Direct-to-Cell 기능으로 모바일 데이터까지 확보합니다.</p>
          <span className="text-[11px] px-3 py-1 rounded-md bg-[#ecfeff] text-[#0891b2] font-semibold">데이터 시너지</span>
        </div>

        {/* Tesla ↔ Neuralink */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#d92028,#db2777)' }} />
          <div className="text-[24px] mb-2">🚗🧬</div>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">Tesla ↔ Neuralink: BCI → 자율주행</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">Neuralink의 뇌-컴퓨터 인터페이스(BCI) 기술이 장기적으로 테슬라 차량 조작과 연동 가능성. 장애인 모빌리티, 뇌파 기반 차량 제어 등 초장기 미래 비전입니다.</p>
          <span className="text-[11px] px-3 py-1 rounded-md bg-[#fdf2f8] text-[#db2777] font-semibold">초장기 비전</span>
        </div>

        {/* Boring Co. ↔ Tesla */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#d97706,#d92028)' }} />
          <div className="text-[24px] mb-2">🕳️🚗</div>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">Boring Co. ↔ Tesla: 지하 모빌리티</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">라스베이거스 루프에서 테슬라 차량이 셔틀로 운행 중. 로보택시 상용화 시 Boring 터널이 전용 도로 역할. {'"'}위(자율주행) + 아래(터널){'"'} 전략입니다.</p>
          <span className="text-[11px] px-3 py-1 rounded-md bg-[#fffbeb] text-[#d97706] font-semibold">인프라 시너지</span>
        </div>

        {/* SpaceX → Starlink */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#1a5fb4,#0891b2)' }} />
          <div className="text-[24px] mb-2">🚀🛰️</div>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">SpaceX → Starlink: 캐시카우 엔진</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">SpaceX 로켓이 Starlink 위성을 쏘아 올리고, Starlink 구독 매출($10B+)이 SpaceX의 화성 프로젝트 자금줄이 됩니다. 상장 시 밸류의 핵심 근거입니다.</p>
          <span className="text-[11px] px-3 py-1 rounded-md bg-[#eef4ff] text-[#1a5fb4] font-semibold">매출 엔진</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — SpaceX IPO 타이밍 로드맵
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] mt-8 pt-5 mb-4">
        <div className="inline-block text-[11px] font-bold tracking-widest px-3 py-1 rounded-md bg-[#fefce8] text-[#b8860b] mb-2">SECTION 03</div>
        <h3 className="text-[18px] font-bold text-[#1A1A2E] mb-1">SpaceX IPO 타이밍 로드맵</h3>
        <p className="text-[13px] text-[#5b6178] max-w-[700px] mb-3">역사상 최대 IPO가 될 SpaceX 상장, 핵심 이벤트의 타임라인입니다.</p>
      </div>

      <div className="mu-timeline">
        <div className="mu-tl-item"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#1a5fb4]">2025.12</div><div className="text-[14px] font-bold text-[#1A1A2E]">기업가치 $800B 세컨더리 거래</div><div className="text-[12px] text-[#5b6178]">블룸버그·WSJ 상장 추진설 보도. 머스크 {'"'}정확하다{'"'} 답변. CFO {'"'}IPO 준비 중{'"'} 서한.</div></div></div>

        <div className="mu-tl-item"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#1a5fb4]">2026.01.30</div><div className="text-[14px] font-bold text-[#1A1A2E]">SpaceX-xAI 합병 추진 발표</div><div className="text-[12px] text-[#5b6178]">로이터 보도. 우주 데이터센터 구상과 맞물려 국내 관련주 급등.</div></div></div>

        <div className="mu-tl-item"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#1a5fb4]">2026.02</div><div className="text-[14px] font-bold text-[#1A1A2E]">xAI 합병 완료, 밸류 $1.25T</div><div className="text-[12px] text-[#5b6178]">SpaceX + xAI 통합 기업 탄생. AI 프리미엄 반영 시작.</div></div></div>

        <div className="mu-tl-item mu-tl-star"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#b8860b]">2026.04.01</div><div className="text-[14px] font-bold text-[#1A1A2E]">⭐ SEC에 비공개 S-1 제출</div><div className="text-[12px] text-[#5b6178]">Bloomberg·CNBC·Reuters·WSJ 동시 확인. 목표 $1.75T, 조달 $75B. 역사상 최대 IPO 공식 시작.</div></div></div>

        <div className="mu-tl-item"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#1a5fb4]">2026.04 하순</div><div className="text-[14px] font-bold text-[#1A1A2E]">Starship V3 첫 발사 (Flight 12)</div><div className="text-[12px] text-[#5b6178]">IPO 로드쇼 전 성공 시 투자 심리 극대화. 실패 시 밸류 압박.</div></div></div>

        <div className="mu-tl-item"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#1a5fb4]">2026.05 하순</div><div className="text-[14px] font-bold text-[#1A1A2E]">S-1 공개 (Public Prospectus)</div><div className="text-[12px] text-[#5b6178]">SpaceX 재무제표 최초 공개. Starlink 수익성 확인 가능한 핵심 이벤트.</div></div></div>

        <div className="mu-tl-item mu-tl-star"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#b8860b]">2026.06.08 주간</div><div className="text-[14px] font-bold text-[#1A1A2E]">⭐ IPO 로드쇼 시작</div><div className="text-[12px] text-[#5b6178]">경영진+21개 투자은행 글로벌 투자자 설명회. 125명 애널리스트 미팅.</div></div></div>

        <div className="mu-tl-item mu-tl-star"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#b8860b]">2026.06.11</div><div className="text-[14px] font-bold text-[#1A1A2E]">⭐ 리테일 투자자 이벤트 (1,500명)</div><div className="text-[12px] text-[#5b6178]">{'"'}리테일이 어떤 IPO보다 큰 비중{'"'} — CFO. 한국 포함 7개국 개인 참여 가능.</div></div></div>

        <div className="mu-tl-item mu-tl-star"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#b8860b]">2026.06 중순~</div><div className="text-[14px] font-bold text-[#1A1A2E]">⭐ NASDAQ 상장 (D-Day)</div><div className="text-[12px] text-[#5b6178]">리테일 30% 배정 (역대 최고). MS·BoA·Citi·JPM·GS 공동 주관. 상장 첫날 시총 Top 10 예상.</div></div></div>

        <div className="mu-tl-item"><div className="mu-tl-dot" /><div className="mu-tl-inner"><div className="text-[12px] font-bold text-[#1a5fb4]">2026 하반기~</div><div className="text-[14px] font-bold text-[#1A1A2E]">포스트 IPO: 머스크 제국 재편</div><div className="text-[12px] text-[#5b6178]">테슬라 SpaceX 지분 투자 가능성. Starlink 분사 상장설. 우주 DC 본격 투자.</div></div></div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — 종목 유니버스
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] mt-8 pt-5 mb-4">
        <div className="inline-block text-[11px] font-bold tracking-widest px-3 py-1 rounded-md bg-[#ecfeff] text-[#0891b2] mb-2">SECTION 04</div>
        <h3 className="text-[18px] font-bold text-[#1A1A2E] mb-1">종목 유니버스</h3>
        <p className="text-[13px] text-[#5b6178] max-w-[700px] mb-3">머스크 생태계에 직간접적으로 연결된 미국·한국 종목들입니다.</p>
      </div>

      {/* Tesla 생태계 */}
      <div className="mb-4">
        <div className="text-[14px] font-bold mb-2 pl-3 border-l-[3px] border-[#d92028] text-[#d92028]">🚗 Tesla 생태계 — 전기차 · 자율주행 · 로봇</div>
        <div className="flex flex-wrap gap-2">
          <Chip flag="US" ticker="TSLA" name="Tesla 본주" />
          <Chip flag="US" ticker="RIVN" name="Rivian (EV 경쟁)" />
          <Chip flag="KR" ticker="LG에너지솔루션" name="배터리 공급" />
          <Chip flag="KR" ticker="삼성SDI" name="원통형 배터리" />
          <Chip flag="KR" ticker="에코프로비엠" name="양극재 (NCM)" />
          <Chip flag="KR" ticker="나노팀" name="열관리 소재 (테슬라 납품)" />
          <Chip flag="KR" ticker="센트랄모텍" name="EV 모터·구동부품" />
          <Chip flag="KR" ticker="레인보우로보틱스" name="휴머노이드 (옵티머스 경쟁)" />
        </div>
      </div>

      {/* SpaceX · Starlink 생태계 */}
      <div className="mb-4">
        <div className="text-[14px] font-bold mb-2 pl-3 border-l-[3px] border-[#1a5fb4] text-[#1a5fb4]">🚀 SpaceX · Starlink 생태계 — 우주 · 위성 · 발사</div>
        <div className="flex flex-wrap gap-2">
          <Chip flag="US" ticker="RKLB" name="Rocket Lab" />
          <Chip flag="US" ticker="ASTS" name="AST SpaceMobile" />
          <Chip flag="US" ticker="SATS" name="EchoStar (SpaceX 지분)" />
          <Chip flag="US" ticker="BA" name="Boeing (우주 경쟁사)" />
          <Chip flag="US" ticker="LMT" name="Lockheed Martin" />
          <Chip flag="KR" ticker="미래에셋벤처투자" name="SpaceX 지분 보유 (대장주)" />
          <Chip flag="KR" ticker="미래에셋증권" name="SpaceX 투자 수혜" />
          <Chip flag="KR" ticker="켄코아에어로스페이스" name="항공우주 부품" />
          <Chip flag="KR" ticker="한화시스템" name="위성통신·방산" />
          <Chip flag="KR" ticker="나라스페이스테크놀로지" name="인공위성 개발" />
          <Chip flag="KR" ticker="비츠로넥스텍" name="우주 전력·방산" />
        </div>
      </div>

      {/* xAI · AI 인프라 생태계 */}
      <div className="mb-4">
        <div className="text-[14px] font-bold mb-2 pl-3 border-l-[3px] border-[#7c3aed] text-[#7c3aed]">🧠 xAI · AI 인프라 생태계</div>
        <div className="flex flex-wrap gap-2">
          <Chip flag="US" ticker="NVDA" name="NVIDIA (xAI GPU)" />
          <Chip flag="US" ticker="AMD" name="AMD (AI 칩 대안)" />
          <Chip flag="KR" ticker="SK하이닉스" name="HBM 메모리" />
          <Chip flag="KR" ticker="삼성전자" name="HBM·파운드리" />
        </div>
      </div>

      {/* 옵티머스 · 로봇 · BCI 생태계 */}
      <div className="mb-4">
        <div className="text-[14px] font-bold mb-2 pl-3 border-l-[3px] border-[#db2777] text-[#db2777]">🤖 옵티머스 · 로봇 · BCI 생태계</div>
        <div className="flex flex-wrap gap-2">
          <Chip flag="KR" ticker="로보티즈" name="로봇 액추에이터" />
          <Chip flag="KR" ticker="에스피지(SPG)" name="감속기 (로봇 관절)" />
          <Chip flag="KR" ticker="두산로보틱스" name="협동로봇" />
          <Chip flag="US" ticker="ISRG" name="Intuitive Surgical" />
        </div>
      </div>

      {/* 관련 ETF */}
      <div className="mb-4">
        <div className="text-[14px] font-bold mb-2 pl-3 border-l-[3px] border-[#d97706] text-[#d97706]">📦 관련 ETF (한 바구니 투자)</div>
        <div className="flex flex-wrap gap-2">
          <Chip flag="US" ticker="UFO" name="Procure Space ETF" />
          <Chip flag="US" ticker="ARKX" name="ARK Space Exploration" />
          <Chip flag="US" ticker="ROBO" name="Robotics & AI ETF" />
          <Chip flag="KR" ticker="KODEX 로보틱스&AI" name="국내 로봇 ETF" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 — 리스크 시나리오 4선
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] mt-8 pt-5 mb-4">
        <div className="inline-block text-[11px] font-bold tracking-widest px-3 py-1 rounded-md bg-[#fef2f2] text-[#d92028] mb-2">SECTION 05</div>
        <h3 className="text-[18px] font-bold text-[#1A1A2E] mb-1">리스크 시나리오 4선</h3>
        <p className="text-[13px] text-[#5b6178] max-w-[700px] mb-3">{'"'}어떤 일이 터지면 내 종목이 어떻게 되는가{'"'}를 미리 시뮬레이션 해두세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Risk 1: 머스크 리스크 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d92028]" />
          <span className="text-[11px] font-bold px-3 py-1 rounded-md bg-[#fef2f2] text-[#d92028] mb-2 inline-block">위험도 높음</span>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">💀 머스크 리스크 (Key Man Risk)</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">6개 기업 모두 머스크 한 사람에 의존합니다. 건강 문제, 법적 이슈, 정치적 논란 등이 전체 생태계를 흔듭니다.</p>
          <div className="text-[12px] p-3 bg-[#f0f2f8] rounded-lg border-l-[3px] border-[#d92028] text-[#5b6178]">영향: TSLA 급락 → SpaceX IPO 밸류 하향 → 한국 관련주 동반 하락. 특히 미래에셋벤처투자 직격탄.</div>
        </div>

        {/* Risk 2: IPO 밸류 버블 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d92028]" />
          <span className="text-[11px] font-bold px-3 py-1 rounded-md bg-[#fef2f2] text-[#d92028] mb-2 inline-block">위험도 높음</span>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">📉 SpaceX IPO 밸류 버블</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">$1.75T = 2026 매출 대비 약 87배. 역사상 이 규모에 이런 배수는 전례 없음. S-1 마진 기대 이하 시 급압축.</p>
          <div className="text-[12px] p-3 bg-[#f0f2f8] rounded-lg border-l-[3px] border-[#d92028] text-[#5b6178]">영향: 공모가 하향 → 관련 ETF·수혜주 기대감 붕괴. 프리IPO 투자자 평가손 위험.</div>
        </div>

        {/* Risk 3: 규제·반독점 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d97706]" />
          <span className="text-[11px] font-bold px-3 py-1 rounded-md bg-[#fffbeb] text-[#d97706] mb-2 inline-block">위험도 중간</span>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">🏛️ 규제·반독점 리스크</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">6개 기업 교차 보조·기술 이전에 SEC·FTC 문제 제기 가능. SpaceX-xAI 합병 이해충돌 논란.</p>
          <div className="text-[12px] p-3 bg-[#f0f2f8] rounded-lg border-l-[3px] border-[#d97706] text-[#5b6178]">영향: IPO 지연 또는 분리 명령 시 시너지 프리미엄 전체 해소. 밸류 20~30% 하방.</div>
        </div>

        {/* Risk 4: 지정학·관세 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#d97706]" />
          <span className="text-[11px] font-bold px-3 py-1 rounded-md bg-[#fffbeb] text-[#d97706] mb-2 inline-block">위험도 중간</span>
          <div className="text-[15px] font-bold text-[#1A1A2E] mb-1">🌍 지정학·관세 리스크</div>
          <p className="text-[13px] text-[#5b6178] leading-relaxed mb-2">테슬라 중국 매출 비중 높음 + Starlink 일부 국가 제한. 미중 갈등 시 테슬라 타격. 관세로 부품 비용 상승.</p>
          <div className="text-[12px] p-3 bg-[#f0f2f8] rounded-lg border-l-[3px] border-[#d97706] text-[#5b6178]">영향: 테슬라 실적 악화 → {'"'}머스크 프리미엄{'"'} 전체 할인. 한국 2차전지 동반 조정.</div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6 — 기업 간 연쇄반응 법칙 4선
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] mt-8 pt-5 mb-4">
        <div className="inline-block text-[11px] font-bold tracking-widest px-3 py-1 rounded-md bg-[#fefce8] text-[#b8860b] mb-2">SECTION 06</div>
        <h3 className="text-[18px] font-bold text-[#1A1A2E] mb-1">기업 간 연쇄반응 법칙 4선</h3>
        <p className="text-[13px] text-[#5b6178] max-w-[700px] mb-3">머스크 생태계는 하나가 움직이면 전체가 반응합니다. {'"'}A가 오르면 B도 오른다{'"'}의 연쇄 구조를 이해하세요.</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Chain 1 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 flex gap-4 items-start">
          <div className="text-[32px] font-bold text-[#f0f2f8] shrink-0 leading-none" style={{ WebkitTextStroke: '1px #e5e7ef' }}>01</div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-[#1A1A2E] mb-1.5">🔗 SpaceX IPO 성공 → 머스크 프리미엄 전체 확산</div>
            <div className="flex items-center gap-1 flex-wrap mb-2">
              <ChainNode color="#1a5fb4">SpaceX IPO 성공</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode color="#d92028">TSLA 재평가</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode>한국 관련주 상승</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode color="#b8860b">우주 ETF 자금 유입</ChainNode>
            </div>
            <p className="text-[12px] text-[#5b6178]">SpaceX 성공 상장 시 {'"'}머스크 = 실행력{'"'} 프리미엄이 테슬라에 전이. 미래에셋벤처투자(지분 평가이익), 한화시스템(위성), 나노팀(열관리) 등 동반 상승.</p>
          </div>
        </div>

        {/* Chain 2 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 flex gap-4 items-start">
          <div className="text-[32px] font-bold text-[#f0f2f8] shrink-0 leading-none" style={{ WebkitTextStroke: '1px #e5e7ef' }}>02</div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-[#1A1A2E] mb-1.5">🔗 Starlink 매출 급증 → AI 인프라 투자 가속</div>
            <div className="flex items-center gap-1 flex-wrap mb-2">
              <ChainNode color="#0891b2">Starlink $10B+</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode color="#7c3aed">xAI 서버 확장</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode>GPU·HBM 수요↑</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode>SK하이닉스·삼성전자</ChainNode>
            </div>
            <p className="text-[12px] text-[#5b6178]">Starlink 현금 → xAI 데이터센터 → NVIDIA GPU + SK하이닉스 HBM. {'"'}위성 매출이 반도체 주가를 올린다{'"'}는 역설적 연결고리.</p>
          </div>
        </div>

        {/* Chain 3 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 flex gap-4 items-start">
          <div className="text-[32px] font-bold text-[#f0f2f8] shrink-0 leading-none" style={{ WebkitTextStroke: '1px #e5e7ef' }}>03</div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-[#1A1A2E] mb-1.5">🔗 테슬라 옵티머스 양산 → 로봇주 전면 부상</div>
            <div className="flex items-center gap-1 flex-wrap mb-2">
              <ChainNode color="#d92028">옵티머스 양산</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode color="#db2777">부품 수요 폭증</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode>감속기·액추에이터</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode>SPG·로보티즈·두산로보틱스</ChainNode>
            </div>
            <p className="text-[12px] text-[#5b6178]">테슬라 옵티머스 대량생산 선언 시 로봇 밸류체인 전체 움직임. 과거 발표 시 한국 관련주 30~50% 급등 선례.</p>
          </div>
        </div>

        {/* Chain 4 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5 flex gap-4 items-start">
          <div className="text-[32px] font-bold text-[#f0f2f8] shrink-0 leading-none" style={{ WebkitTextStroke: '1px #e5e7ef' }}>04</div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-[#1A1A2E] mb-1.5">🔗 머스크 리스크 발생 → 전체 동반 하락 (역연쇄)</div>
            <div className="flex items-center gap-1 flex-wrap mb-2">
              <ChainNode color="#d92028">머스크 개인 이슈</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode>TSLA 급락</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode>IPO 밸류 하향</ChainNode>
              <span className="text-[12px] text-[#9ca3b8]">→</span>
              <ChainNode>한국 전 섹터 하락</ChainNode>
            </div>
            <p className="text-[12px] text-[#5b6178]">머스크 생태계의 최대 약점. 한 사람에 모든 게 연결되어 부정적 뉴스 하나에 전체가 출렁입니다. 분산투자·헤지 필수.</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7 — "일론 Inc." 합병 시나리오
          ═══════════════════════════════════════════════════════════ */}
      <div className="border-t border-[#E2E5EA] mt-8 pt-5 mb-4">
        <div className="inline-block text-[11px] font-bold tracking-widest px-3 py-1 rounded-md bg-[#fef2f2] text-[#d92028] mb-2">🔥 보너스 SECTION 07</div>
        <h3 className="text-[18px] font-bold text-[#1A1A2E] mb-1">{'"'}일론 Inc.{'"'} — 테슬라 × 스페이스X 합병 시나리오</h3>
        <p className="text-[13px] text-[#5b6178] max-w-[700px] mb-3">월가가 가장 뜨겁게 논의 중인 {'"'}역사상 최대 합병{'"'} — 성사 시 시총 3,200조원 초대형 기업 탄생</p>
      </div>

      {/* 머스크 발언 인용 박스 */}
      <div className="bg-white border border-[rgba(184,134,11,0.3)] rounded-xl overflow-hidden mb-5">
        <div className="h-1 bg-[#b8860b]/50" />
        <div className="px-6 py-5 text-center">
          <div className="text-[15px] font-bold text-[#b8860b] mb-2">💬 머스크: {'"'}내 기업들은 점차 하나로 수렴하고 있다{'"'}</div>
          <div className="text-[13px] text-[#5b6178] mb-1">— WSJ 인용 | 머스크는 X.com(페이팔 전신) 시절부터 모든 것을 {'"'}X{'"'} 하나로 묶겠다는 비전을 품어왔습니다</div>
          <div className="text-[12px] text-[#9ca3b8]">스페이스X, 모델 X, 트위터→X, xAI, 아들 이름까지 X — 알파벳 X에 대한 집착이 곧 {'"'}통합 제국{'"'}의 설계도</div>
        </div>
      </div>

      {/* 합병 구조도 */}
      <div className="mb-5">
        <div className="text-[16px] font-bold text-[#1A1A2E] mb-4 text-center">📐 합병 구조도 — 이미 진행 중인 것과 남은 한 발</div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-3">
          <div className="bg-white border-2 border-[#7c3aed] rounded-xl px-6 py-4 text-center min-w-[200px]">
            <div className="text-[14px] font-bold text-[#7c3aed]">① xAI + 스페이스X</div>
            <div className="text-[12px] text-[#5b6178] mt-0.5">2026.02 합병 완료 ✅ (1,720조원)</div>
          </div>
          <span className="text-[24px] text-[#b8860b] font-bold">→</span>
          <div className="bg-white border-2 border-[#1a5fb4] rounded-xl px-6 py-4 text-center min-w-[240px]">
            <div className="text-[14px] font-bold text-[#1a5fb4]">② 테슬라 → 스페이스X 지분 취득</div>
            <div className="text-[12px] text-[#5b6178] mt-0.5">2026.03 미국 공정위 서류 확인 ✅</div>
          </div>
          <span className="text-[24px] text-[#b8860b] font-bold">→</span>
          <div className="bg-white border-2 border-dashed border-[#d92028] rounded-xl px-6 py-4 text-center min-w-[280px] animate-pulse">
            <div className="text-[14px] font-bold text-[#d92028]">③ 테슬라 + 스페이스X = {'"'}일론 Inc.{'"'}</div>
            <div className="text-[12px] text-[#b8860b] mt-0.5">⏳ 2027년 이후 가능성 — 웨드부시 댄 아이브스</div>
          </div>
        </div>
      </div>

      {/* 장점 vs 단점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {/* 장점 */}
        <div className="bg-white border border-[#22c55e] rounded-xl overflow-hidden">
          <div className="h-1 bg-[#22c55e]/60" />
          <div className="p-5">
            <div className="text-[16px] font-bold text-[#22c55e] mb-3">✅ 합병 시 장점 (왜 기대하나?)</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">1. 시총 3,200조원+ 세계 최대 기업 탄생</div>
                <div className="text-[13px] text-[#5b6178] pl-3">테슬라(1,500조) + 스페이스X(1,720조) → 역사상 최대 합병</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">2. 자율주행 + 스타링크 = 완벽한 궁합</div>
                <div className="text-[13px] text-[#5b6178] pl-3">테슬라 자율주행에 필요한 초저지연 통신을 스타링크 위성이 제공</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">3. 공동 AI 칩 공장 {'"'}테라팹{'"'} 시너지</div>
                <div className="text-[13px] text-[#5b6178] pl-3">텍사스 오스틴에 반도체 공장을 공동 건설 → AI 칩 자급자족</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">4. 옵티머스 로봇 → 우주 데이터센터 건설</div>
                <div className="text-[13px] text-[#5b6178] pl-3">테슬라 로봇이 우주 인프라 건설 인력 대체 → 비용 혁신</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">5. xAI가 모든 것의 {'"'}두뇌{'"'} 역할</div>
                <div className="text-[13px] text-[#5b6178] pl-3">전기차·로켓·위성·로봇 전부를 하나의 AI가 제어하는 통합 생태계</div>
              </div>
            </div>
          </div>
        </div>

        {/* 단점 */}
        <div className="bg-white border border-[#d92028] rounded-xl overflow-hidden">
          <div className="h-1 bg-[#d92028]/60" />
          <div className="p-5">
            <div className="text-[16px] font-bold text-[#d92028] mb-3">⚠️ 합병 시 단점 (왜 걱정하나?)</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">1. {'"'}최저 배수 법칙{'"'} — 테슬라 주주 25% 손실 가능</div>
                <div className="text-[13px] text-[#5b6178] pl-3">합병 기업은 낮은 배수로 거래됨 → 테슬라 프리미엄이 깎일 수 있음</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">2. 반독점 심사 — 미국 공정위·법무부 개입</div>
                <div className="text-[13px] text-[#5b6178] pl-3">스페이스X는 국방부 계약 보유 → 외국인 투자 제한 규정도 변수</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">3. 테슬라 주주 투표 필요 — xAI 때와 다름</div>
                <div className="text-[13px] text-[#5b6178] pl-3">상장사라서 주주 승인 필수. 기존 소송(자원 전용 의혹)이 걸림돌</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">4. 복합기업(재벌) 디스카운트 위험</div>
                <div className="text-[13px] text-[#5b6178] pl-3">과거 실패한 대기업처럼 될 수 있음. {'"'}각각 투자가 더 가치있다{'"'}는 반론</div>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#1A1A2E]">5. 머스크 집중력 분산 우려</div>
                <div className="text-[13px] text-[#5b6178] pl-3">이미 6개 기업 운영 중 → 합병 후 관리 복잡성 기하급수적 증가</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 합병 시나리오 수혜주 */}
      <div className="text-[16px] font-bold text-[#b8860b] mb-3 text-center">🏆 합병 시나리오 수혜주 — {'"'}일론 Inc.{'"'}가 현실이 되면 누가 오를까?</div>

      <div className="flex flex-col gap-3 mb-5">
        {/* 1순위 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5">
          <div className="text-[14px] font-bold text-[#d92028] mb-2.5">🔥 1순위: 합병 직접 수혜</div>
          <div className="flex flex-wrap gap-2">
            <MergerChip color="#d92028" bold>TSLA 테슬라 (본주)</MergerChip>
            <MergerChip color="#1a5fb4" bold>🇰🇷 미래에셋벤처투자 (대장)</MergerChip>
            <MergerChip color="#1a5fb4">🇰🇷 미래에셋증권</MergerChip>
            <MergerChip color="#1a5fb4">🇺🇸 SATS 에코스타 (지분)</MergerChip>
          </div>
        </div>

        {/* 2순위 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5">
          <div className="text-[14px] font-bold text-[#0891b2] mb-2.5">🔥 2순위: AI + 위성 통합 수혜</div>
          <div className="flex flex-wrap gap-2">
            <MergerChip color="#7c3aed">🇰🇷 SK하이닉스 (AI메모리)</MergerChip>
            <MergerChip color="#7c3aed">🇰🇷 삼성전자 (반도체)</MergerChip>
            <MergerChip color="#0891b2">🇰🇷 한화시스템 (위성통신)</MergerChip>
            <MergerChip color="#0891b2">🇺🇸 ASTS 스페이스모바일</MergerChip>
          </div>
        </div>

        {/* 3순위 */}
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5">
          <div className="text-[14px] font-bold text-[#db2777] mb-2.5">🔥 3순위: 로봇 + 배터리 수혜</div>
          <div className="flex flex-wrap gap-2">
            <MergerChip color="#db2777">🇰🇷 로보티즈 (로봇부품)</MergerChip>
            <MergerChip color="#db2777">🇰🇷 에스피지 (감속기)</MergerChip>
            <MergerChip color="#d92028">🇰🇷 나노팀 (열관리)</MergerChip>
            <MergerChip color="#d92028">🇰🇷 LG에너지솔루션 (배터리)</MergerChip>
          </div>
        </div>
      </div>

      {/* 월가 코멘트 */}
      <div className="bg-white border border-[#e5e7ef] rounded-xl px-6 py-5 text-center mb-3">
        <div className="text-[13px] text-[#5b6178] mb-1.5">💬 웨드부시 댄 아이브스: {'"'}테슬라-스페이스X 합병은 머스크 파괴적 기술 제국을 완성하는 성배(Holy Grail)다. 2027년 현실화 가능{'"'}</div>
        <div className="text-[12px] text-[#9ca3b8]">💬 바클레이즈 댄 레비: {'"'}투자자들의 가장 큰 질문은 {'"'}일론 Inc.{'"'}를 만들 계획이 있느냐다. 당장은 낮지만 장기적으로는 가능하다{'"'}</div>
      </div>

      {/* 면책 */}
      <div className="text-center pt-6 pb-2">
        <div className="inline-block bg-[#fef2f2] border border-[rgba(217,32,40,0.15)] text-[#d92028] px-4 py-2 rounded-lg text-[12px] font-medium mb-2">
          ⚠️ 본 자료는 정보 제공 목적이며, 투자 권유가 아닙니다. 투자 판단과 책임은 본인에게 있습니다.
        </div>
        <p className="text-[10px] text-[#9ca3b8]">
          FlowX Universe Map — 2026.04.13 기준 작성 | 데이터: Bloomberg, CNBC, Reuters, 각사 공시
        </p>
      </div>
    </div>
  )
}

/* ─── 서브 컴포넌트 ─── */

function Chip({ flag, ticker, name }: { flag: 'US' | 'KR'; ticker: string; name: string }) {
  const isUS = flag === 'US'
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#e5e7ef] text-[13px] shadow">
      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isUS ? 'bg-[#eef4ff] text-[#1a5fb4]' : 'bg-[#fef2f2] text-[#d92028]'}`}>{flag}</span>
      <span className="font-bold text-[#1A1A2E]">{ticker}</span>
      <span className="text-[#9ca3b8] text-[11px]">{name}</span>
    </div>
  )
}

function ChainNode({ color, children }: { color?: string; children: React.ReactNode }) {
  return (
    <span
      className="px-3 py-1 rounded-lg text-[12px] font-semibold bg-[#f0f2f8] border border-[#e5e7ef]"
      style={color ? { borderColor: color, color } : undefined}
    >
      {children}
    </span>
  )
}

function MergerChip({ color, bold, children }: { color: string; bold?: boolean; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-4 py-2 rounded-lg bg-white border-[1.5px] text-[13px] shadow"
      style={{ borderColor: color, color, fontWeight: bold ? 700 : 600 }}
    >
      {children}
    </span>
  )
}
