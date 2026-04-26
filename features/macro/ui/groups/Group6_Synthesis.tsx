'use client'

import { MacroChart, MacroCard, KPICard } from '../MacroChart'
import { C, G, ann } from '../chartHelpers'

/* ══════════════════════════════════════════════
   6부: 코리아 디스카운트 & 종합 분석
   ══════════════════════════════════════════════ */

/* ── Korea Discount ── */
function KoreaDiscount() {
  return (
    <MacroCard
      num="🇰🇷 코리아 디스카운트"
      title="한국은 정말 저평가인가? — 4가지 증거"
      desc="PBR·PER·10년수익률·장부가 미달 기업 비율로 본 객관적 팩트"
      full
      style={{ border: '2px solid #d32f2f', boxShadow: '0 4px 20px rgba(211,47,47,0.06)' }}
      source="Korea Exchange, MSCI, Jefferies, FactSet, Siblis Research, Aberdeen, KCMI"
      insight={`<b>💡 코리아 디스카운트란?</b><br>같은 이익을 내도 한국 기업은 미국·일본보다 <b style="color:#ff1744">40~60% 싸게</b> 거래됩니다.<br><br><b>① PBR 0.84 = "회사를 해체해서 파는 게 더 비쌈"</b><br>주가가 순자산가치보다 낮다는 뜻. KOSPI 기업 69%가 이 상태.<br><br><b>② 선행 PER 10.4x = "미래를 반값에 사는 것"</b><br>S&P500 22x, 인도 22x, 일본 16x 대비 한국은 10x.<br><br><b style="color:#00c853">④ 지금 변하고 있는 것!</b><br>2025년 밸류업 프로그램 + 자사주 소각 + KOSPI 60% 상승(세계 1위) + 외국인 $20B 순매수.<br><b style="color:#00c853">일본이 먼저 증명했다 — 니케이 +155%. 한국은 이제 시작.</b>`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPICard value="0.84x" label='KOSPI PBR (2024)<br><b style="color:#d32f2f">1 미만 = 청산가치 이하</b>' color="red" borderColor="#d32f2f" />
        <KPICard value="10.4x" label='KOSPI 선행 PER<br><b style="color:#1565c0">S&P 500의 절반</b>' color="blue" borderColor="#1565c0" />
        <KPICard value="69%" label='장부가 미달 기업 비율<br><b style="color:#d32f2f">KOSPI 10곳 중 7곳</b>' color="red" borderColor="#d32f2f" />
        <KPICard value="+60%" label='KOSPI 2025 상승률<br><b style="color:#00c853">세계 1위 → 재평가 시작</b>' color="green" borderColor="#00c853" />
      </div>

      {/* PBR/PER 비교 */}
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['미국\nS&P500', '인도\nNIFTY', '대만\nTWSE', '일본\nNikkei', '유럽\nSTOXX', '한국\nKOSPI'],
          datasets: [
            { label: 'PBR (주가순자산비율)', data: [4.5, 3.8, 2.5, 1.6, 1.7, 0.84], backgroundColor: ['rgba(21,101,192,0.5)', 'rgba(255,109,0,0.5)', 'rgba(0,131,143,0.5)', 'rgba(124,58,237,0.5)', 'rgba(0,131,143,0.4)', 'rgba(255,23,68,0.7)'], borderColor: ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'rgba(255,23,68,1)'], borderWidth: [0, 0, 0, 0, 0, 3], borderRadius: 5, borderSkipped: false },
            { label: '선행 PER', data: [22, 22, 18, 16, 14, 10.4], backgroundColor: ['rgba(21,101,192,0.25)', 'rgba(255,109,0,0.25)', 'rgba(0,131,143,0.25)', 'rgba(124,58,237,0.25)', 'rgba(0,131,143,0.2)', 'rgba(255,23,68,0.35)'], borderRadius: 5, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              pbr1: { type: 'line', yMin: 1, yMax: 1, borderColor: 'rgba(255,23,68,0.4)', borderWidth: 2, borderDash: [6, 3], label: { display: true, content: 'PBR 1.0 = 청산가치', position: 'start', backgroundColor: 'rgba(255,255,255,.9)', color: '#c62828', font: { size: 10, weight: 'bold' }, padding: 4 } },
              kr: ann(5, 2.5, '한국 0.84x\n해체가 > 주가', C.red + '0.2)'),
            }},
          },
          scales: {
            y: { beginAtZero: true, max: 7, title: { display: true, text: '배수 (x)' }, grid: { color: G } },
            x: { grid: { display: false } },
          },
        },
      }} />

      {/* 10년 수익률 비교 */}
      <div className="mt-5">
        <MacroChart config={{
          type: 'bar',
          data: {
            labels: ['인도\nNIFTY', '미국\nS&P500', '일본\nNikkei', '대만\nTWSE', '브라질\nIBOV', '중국\nCSI', '한국\nKOSPI'],
            datasets: [{
              label: '10년 누적 수익률 (%)',
              data: [255, 179, 156, 118, 167, 36, 35],
              backgroundColor: ['rgba(255,109,0,0.6)', 'rgba(21,101,192,0.6)', 'rgba(124,58,237,0.6)', 'rgba(0,131,143,0.6)', 'rgba(0,131,143,0.5)', 'rgba(255,109,0,0.4)', 'rgba(255,23,68,0.7)'],
              borderColor: ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'rgba(255,23,68,1)'],
              borderWidth: [0, 0, 0, 0, 0, 0, 3], borderRadius: 5, borderSkipped: false,
            }],
          },
          options: {
            responsive: true, aspectRatio: 2.2,
            plugins: {
              legend: { display: false },
              annotation: { annotations: {
                kr: ann(6, 55, '한국 35%\n세계 꼴찌 수준\n= 코리아 디스카운트', C.red + '0.2)'),
                jp: ann(2, 180, '일본 156%\n밸류업 효과', C.neon + '0.12)'),
                now: ann(6, 95, 'But 2025\n+60% 급등\n재평가 시작!', C.neon + '0.25)'),
              }},
            },
            scales: {
              y: { beginAtZero: true, max: 280, title: { display: true, text: '10년 누적 수익률 (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
              x: { grid: { display: false } },
            },
          },
        }} />
      </div>
    </MacroCard>
  )
}

/* ── Ultimate 6-Force Convergence ── */
function UltimateChart() {
  const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2032', '2035']
  const popDecline = [95, 93, 90, 87, 84, 80, 76, 71, 65, 58, 50, 38, 20]
  const aiPower = [5, 8, 12, 18, 28, 38, 48, 58, 70, 80, 88, 95, 98]
  const semiCycle = [45, 55, 30, 60, 70, 82, 85, 88, 90, 88, 85, 80, 75]
  const energyRisk = [70, 65, 25, 50, 60, 55, 35, 40, 50, 55, 65, 72, 80]
  const debtBurden = [55, 45, 40, 42, 40, 38, 36, 35, 33, 32, 30, 28, 25]
  const geoValue = [40, 42, 50, 55, 62, 70, 75, 82, 88, 90, 92, 93, 95]

  return (
    <MacroCard
      num="🇰🇷 궁극의 차트"
      title="대한민국 운명의 교차점: 6대 메가포스 수렴 타임라인"
      desc="인구·AI·반도체·에너지·부채·지정학 — 모든 힘이 2028년 한 점에서 만난다"
      full
      style={{ border: '3px solid #ffd600', background: 'linear-gradient(180deg,#fffde7 0%,#fff 30%)', boxShadow: '0 8px 40px rgba(255,214,0,0.12)' }}
      source="FLOWX Research — 24개 섹션 교차 종합 | 인구(통계청) · AI(McKinsey/WEF) · 반도체(Bloomberg/MSCI) · 에너지(IEA) · 부채(BIS) · 지정학(Morgan Stanley)"
    >
      <MacroChart height={520} config={{
        type: 'line',
        data: {
          labels: years,
          datasets: [
            { label: '👥 인구 건전성', data: popDecline, borderColor: 'rgba(255,23,68,1)', backgroundColor: 'rgba(255,23,68,0.04)', fill: true, tension: 0.35, pointRadius: 4, borderWidth: 3, pointBackgroundColor: 'rgba(255,23,68,1)' },
            { label: '🤖 AI 생산성', data: aiPower, borderColor: 'rgba(0,200,83,1)', backgroundColor: 'rgba(0,200,83,0.04)', fill: true, tension: 0.35, pointRadius: 4, borderWidth: 3, pointBackgroundColor: 'rgba(0,200,83,1)' },
            { label: '💎 반도체 경쟁력', data: semiCycle, borderColor: 'rgba(21,101,192,1)', backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 4, borderWidth: 2.5, pointBackgroundColor: 'rgba(21,101,192,1)' },
            { label: '⚡ 에너지 안정성', data: energyRisk, borderColor: 'rgba(255,109,0,1)', backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 4, borderWidth: 2.5, pointBackgroundColor: 'rgba(255,109,0,1)', borderDash: [6, 3] },
            { label: '💳 가계 건전성', data: debtBurden, borderColor: 'rgba(216,27,96,1)', backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 3, borderWidth: 2, pointBackgroundColor: 'rgba(216,27,96,1)', borderDash: [3, 3] },
            { label: '🌏 지정학적 가치', data: geoValue, borderColor: 'rgba(124,58,237,1)', backgroundColor: 'rgba(124,58,237,0.03)', fill: true, tension: 0.35, pointRadius: 4, borderWidth: 2.5, pointBackgroundColor: 'rgba(124,58,237,1)' },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 11 } } },
            annotation: { annotations: {
              conv: { type: 'box', xMin: 6.5, xMax: 8.5, backgroundColor: 'rgba(255,214,0,0.08)', borderColor: 'rgba(255,214,0,0.3)', borderWidth: 2, borderDash: [4, 2], label: { display: true, content: '⚡ 2028 수렴점', position: 'start', color: '#f57f17', font: { size: 13, weight: 'bold' }, padding: 6 } },
              gold: { type: 'box', xMin: 4.5, xMax: 6.5, backgroundColor: 'rgba(0,200,83,0.04)', borderWidth: 0, label: { display: true, content: '🔥 골든타임', position: 'start', color: '#1b5e20', font: { size: 10, weight: 'bold' } } },
              crossA: ann(8, 78, 'AI가 인구감소를\n추월하는 순간', C.neon + '0.25)'),
              crossB: ann(6, 22, '이란전쟁\n에너지 충격', C.orange + '0.18)'),
              crossC: ann(10, 96, '지정학 가치\n최고점 접근', C.purple + '0.15)'),
              crossD: ann(12, 28, '인구 위기\n심화 구간', C.red + '0.15)'),
              mid: { type: 'line', yMin: 50, yMax: 50, borderColor: 'rgba(0,0,0,0.08)', borderWidth: 1, borderDash: [8, 4], label: { display: true, content: '균형선 50', position: 'end', backgroundColor: 'rgba(255,255,255,.7)', color: '#aaa', font: { size: 9 }, padding: 2 } },
            }},
          },
          scales: {
            y: { min: 0, max: 100, title: { display: true, text: '지수 (0=위기 ← → 100=최상)', font: { size: 12, weight: 'bold' } }, ticks: { stepSize: 25 }, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { title: { display: true, text: '연도', font: { size: 12, weight: 'bold' } }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />

      {/* 핵심 메시지 */}
      <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(255,214,0,0.06)', border: '2px solid rgba(255,214,0,0.3)' }}>
        <div className="text-lg font-bold text-[#f57f17] mb-2">💎 이 차트가 말하는 것</div>
        <div className="text-sm leading-relaxed text-[#1a1a2e]">
          <b>6개의 선이 모두 2027~2029년에 교차합니다.</b> 이것은 우연이 아닙니다.<br /><br />
          <span style={{ color: '#ff1744' }}>■</span> <b>인구 붕괴 가속</b> — 2028년부터 연 30만+ 생산인구 감소<br />
          <span style={{ color: '#00c853' }}>■</span> <b>AI 생산성 폭발</b> — J커브 바닥을 지나 급상승<br />
          <span style={{ color: '#1565c0' }}>■</span> <b>반도체 슈퍼사이클</b> — 설비투자 $381B→$650B. HBM 수요 구조적 확대<br />
          <span style={{ color: '#ff6d00' }}>■</span> <b>에너지 전환 임계점</b> — 이란전쟁이 원전·SMR 투자를 강제 가속<br />
          <span style={{ color: '#d81b60' }}>■</span> <b>가계부채 한계</b> — GDP ~92%(BIS). 정점 대비 개선 중이나 OECD 상위<br />
          <span style={{ color: '#7c3aed' }}>■</span> <b>지정학적 가치</b> — 미·중 모두에게 필요한 유일한 반도체 국가
        </div>
        <div className="mt-4 p-3 rounded-lg bg-black text-center text-[#ffd600] text-base font-bold tracking-wide">
          &quot;2028년은 대한민국의 <span className="text-[#ff1744]">최대 위기</span>이자 <span className="text-[#00c853]">최대 기회</span>가 동시에 오는 해.
          지금(2025~2027)이 방향을 정하는 <span className="text-white underline">마지막 골든타임</span>이다.&quot;
        </div>
      </div>
    </MacroCard>
  )
}

/* ── Radar ── */
function SynthesisRadar() {
  return (
    <MacroCard
      num="★ 최종 종합 분석"
      title="24개 섹션 교차 분석: 숨겨진 교집합"
      desc="모든 섹션을 연결하면 보이는 것 — 다른 사람들이 놓치고 있는 진짜 신호"
      full
      style={{ border: '2px solid rgba(57,255,20,0.4)', boxShadow: '0 4px 20px rgba(57,255,20,0.08)' }}
    >
      <MacroChart config={{
        type: 'radar',
        data: {
          labels: ['이익성장\n건전성', '반도체\n경쟁력', 'AI 전환\n속도', '인플레\n안정성', '밸류에이션\n매력', '인구구조\n건전성', '에너지\n자립도', '가계부채\n건전성'],
          datasets: [
            { label: '한국 현재 (2026)', data: [75, 95, 80, 65, 85, 20, 15, 35], backgroundColor: 'rgba(57,255,20,0.12)', borderColor: 'rgba(0,200,83,0.8)', borderWidth: 2.5, pointRadius: 5, pointBackgroundColor: '#00c853' },
            { label: '미국 현재 (2026)', data: [85, 70, 90, 40, 30, 65, 90, 70], backgroundColor: 'rgba(21,101,192,0.08)', borderColor: 'rgba(21,101,192,0.7)', borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#1565c0' },
            { label: '한국 위험 임계선', data: [50, 50, 50, 50, 50, 50, 50, 50], backgroundColor: 'transparent', borderColor: 'rgba(255,23,68,0.3)', borderWidth: 1, borderDash: [4, 3], pointRadius: 0 },
          ],
        },
        options: {
          responsive: true, aspectRatio: 1.4,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
          },
          scales: {
            r: { min: 0, max: 100, ticks: { stepSize: 25, backdropColor: 'transparent', color: '#aaa', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.06)' }, pointLabels: { font: { size: 11, weight: 'bold' }, color: '#333' } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── Analysis Cards ── */
function AnalysisCards() {
  return (
    <>
      {/* 좋아지고 있는 점 */}
      <MacroCard full style={{ borderLeft: '4px solid #00c853' }}>
        <div className="font-mono text-[10px] text-[#00c853] tracking-[3px] uppercase mb-1">✅ 좋아지고 있는 점</div>
        <h2 className="text-xl font-bold text-[#00c853] mb-3">시장이 건강해지고 있다는 5가지 신호</h2>
        <div className="text-sm leading-relaxed text-[#1b5e20] p-4 rounded-r-lg" style={{ background: 'rgba(0,200,83,0.06)', borderLeft: '4px solid #00c853' }}>
          <b>① [섹션 4+5] 이익성장의 민주화</b> — S&P 7 독주 끝나고 S&P 493이 67% 담당.<br /><br />
          <b>② [섹션 10+19b] 한국 반도체 = 세계의 심장</b> — 수출 $710B 역대최대. AI 설비투자의 최대 수혜가 한국 HBM.<br /><br />
          <b>③ [섹션 9+16] J커브 변곡점 돌파 임박</b> — AI 생산성이 바닥을 찍고 상승 전환 중.<br /><br />
          <b>④ [섹션 12+17] 금리 인하 사이클 진행 중</b> — Fed 3.75%, BOK 2.5%. 2025년 2%대 안착 후 2026년 이란전쟁으로 인플레 재반등(3.3%) — 추가 인하 제한적.<br /><br />
          <b>⑤ [섹션 18+22] 한국 = 저평가 자산의 재발견</b> — 버핏지표: 미국 205% vs 한국 95%. 외국인 자금 $20B 복귀.
        </div>
      </MacroCard>

      {/* 위험해지고 있는 점 */}
      <MacroCard full style={{ borderLeft: '4px solid #ff1744' }}>
        <div className="font-mono text-[10px] text-[#ff1744] tracking-[3px] uppercase mb-1">🚨 위험해지고 있는 점</div>
        <h2 className="text-xl font-bold text-[#ff1744] mb-3">지금 가장 경계해야 할 5가지 리스크</h2>
        <div className="text-sm leading-relaxed text-[#b71c1c] p-4 rounded-r-lg" style={{ background: 'rgba(255,23,68,0.04)', borderLeft: '4px solid #ff1744' }}>
          <b>① [섹션 11+12+18b] 인플레 재점화 — 이란전쟁 쇼크</b> — 유가 $72→$110(+53%). FOMC 전원 상방 리스크.<br /><br />
          <b>② [섹션 15+21] 인구절벽 × 가계부채</b> — 생산인구 -27% + 가계부채 ~92%(BIS) OECD 상위. 정점 대비 개선 추세지만 여전히 높은 수준.<br /><br />
          <b>③ [섹션 22+7] 미국 시장 과열 지속</b> — 버핏지표 205%. 2025년 S&P 7 +27.5% 2년 연속 강세지만 밸류에이션 부담 누적.<br /><br />
          <b>④ [섹션 20+15+16] 40~50대 대량 실업 시한폭탄</b> — AI 대체 위험도 70%+ 직종에 종사하는 40~50대가 위험.<br /><br />
          <b>⑤ [섹션 17+19+18b] 한국의 에너지 아킬레스건</b> — 원유 100% 수입 + 이란전쟁 + 원화약세.
        </div>
      </MacroCard>

      {/* 유지되는 트렌드 */}
      <MacroCard full style={{ borderLeft: '4px solid #1565c0' }}>
        <div className="font-mono text-[10px] text-[#1565c0] tracking-[3px] uppercase mb-1">🔵 유지되고 있는 점 (구조적 트렌드)</div>
        <h2 className="text-xl font-bold text-[#1565c0] mb-3">변하지 않는 3가지 메가트렌드</h2>
        <div className="text-sm leading-relaxed text-[#0d47a1] p-4 rounded-r-lg" style={{ background: 'rgba(21,101,192,0.04)', borderLeft: '4px solid #1565c0' }}>
          <b>① [섹션 1+2+3] 자본의 대이동: 채권→주식→AI 인프라</b> — Big Tech 설비투자 $381B→$650B(2026E). 10년짜리 트렌드.<br /><br />
          <b>② [섹션 6+10] S&P 7의 경제적 해자는 건재</b> — 순이익률 25.8%(S&P 2배) 유지. 성장은 둔화돼도 수익성은 압도적.<br /><br />
          <b>③ [섹션 14+15] 고령화는 가속만 있고 브레이크 없다</b> — 한국 생산인구 매년 -32만명. 20년간 역전 불가. AI·로봇·이민만이 해법.
        </div>
      </MacroCard>

      {/* JACKPOT */}
      <MacroCard full style={{ border: '3px solid #ffd600', background: 'linear-gradient(135deg,rgba(255,214,0,0.03),rgba(57,255,20,0.03))', boxShadow: '0 6px 30px rgba(255,214,0,0.1)' }}>
        <div className="font-mono text-[13px] text-[#f57f17] tracking-[4px] uppercase mb-1">💎 잭팟 — 숨겨진 신호</div>
        <h2 className="text-2xl font-bold mb-3" style={{ background: 'linear-gradient(90deg,#f57f17,#00c853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          다른 사람들이 보지 못하는 3가지 교집합
        </h2>
        <div className="text-base leading-loose p-4 rounded-r-lg" style={{ background: 'rgba(255,214,0,0.08)', borderLeft: '3px solid #ffd600' }}>
          <b className="text-xl text-[#f57f17]">🏆 JACKPOT #1: &quot;한국 AI 생존 패러독스&quot;</b><br />
          <span className="text-[#555]">[섹션 9+15+16+20+21 교집합]</span><br />
          한국은 <b>인구절벽(2028~)</b>과 <b>AI 생산성 폭발(2028~)</b>이 <u>정확히 같은 시점에 교차</u>하는 세계 유일의 국가. → <b className="text-[#00c853]">한국 AI·로보틱스 기업의 성장이 구조적으로 보장된다.</b><br /><br />

          <b className="text-xl text-[#f57f17]">🏆 JACKPOT #2: &quot;반도체 지정학 레버리지&quot;</b><br />
          <span className="text-[#555]">[섹션 2+3+10+18+18b+19 교집합]</span><br />
          Big Tech 설비투자 $650B(2026E) → 핵심 목적지가 <b>HBM/DRAM = 한국</b>. 미국도, 중국도 한국 반도체 없이는 AI를 못 만든다. → <b className="text-[#00c853]">&quot;양쪽 모두에게 필요한 유일한 나라&quot;라는 전략적 위치.</b><br /><br />

          <b className="text-xl text-[#f57f17]">🏆 JACKPOT #3: &quot;위기의 역설 — 에너지 약점이 만드는 기회&quot;</b><br />
          <span className="text-[#555]">[섹션 12+17+18b+19b+21 교집합]</span><br />
          한국의 가장 큰 약점: 에너지 100% 수입. 이 약점이 역설적으로 <b>세계에서 가장 빠르게 에너지 전환을 추진하게 만드는 동력</b>. → <b className="text-[#00c853]">한국 에너지 전환 관련주(원전·수소·배터리)가 구조적 수혜를 받는 이유.</b>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.08)]">
          <b className="text-[15px] text-[#1a1a2e]">📌 최종 한 줄 요약:</b><br />
          <b className="text-[17px] text-[#f57f17]">&quot;한국은 인구절벽·에너지 약점이라는 위기 때문에, 역설적으로 AI·반도체·에너지 전환에서 세계에서 가장 빠르게 움직일 수밖에 없는 나라다. 위기가 기회를 만드는 구조 — 이것이 한국 투자의 숨겨진 알파(α)다.&quot;</b>
        </div>

        <div className="text-[10px] text-[#aaa] mt-3 font-mono">FLOWX Research — 24개 섹션 교차 분석 종합 | 본 자료는 교육·정보 목적이며 투자 조언이 아닙니다.</div>
      </MacroCard>
    </>
  )
}

export function Group6_Synthesis() {
  return (
    <>
      <KoreaDiscount />
      <UltimateChart />
      <SynthesisRadar />
      <AnalysisCards />
    </>
  )
}
