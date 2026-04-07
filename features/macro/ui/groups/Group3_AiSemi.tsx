'use client'

import { MacroChart, MacroCard } from '../MacroChart'
import { C, G, ann, vl } from '../chartHelpers'

/* ══════════════════════════════════════════════
   3부: AI & 반도체 — 세계를 바꾸는 두 가지 힘
   ══════════════════════════════════════════════ */

/* ── 09 J-Curve ── */
function JCurve() {
  const lb = ['도입 전', '', '', '초기 도입', '', '', 'J커브 바닥', '', '', '통합 이후', '', '', '성숙기']
  const labor = [100, 100, 100, 99, 97, 96, 96, 100, 110, 122, 130, 135, 135]
  const tfp = [100, 100, 100, 100, 100, 99, 99, 100, 103, 108, 113, 118, 120]

  return (
    <MacroCard
      num="09 — J-Curve"
      title="생산성 J커브: AI 투자 수익의 지연"
      desc="노동생산성 vs 총요소생산성(TFP) — 기준점=100"
      full
      source="Bloomberg, Apollo Chief Economist"
      insight={`<b>💡 J커브:</b> AI 도입 초기 → 학습비용으로 생산성 <b style="color:#ff1744">하락(96)</b>. 통합 후 → <b style="color:#00c853">135까지 폭발 성장</b>. 지금은 '바닥→상승' 변곡점입니다.`}
    >
      <MacroChart config={{
        type: 'line',
        data: {
          labels: lb,
          datasets: [
            { label: '노동생산성 (시간당 생산량)', data: labor, borderColor: C.blue + '1)', backgroundColor: C.blue + '0.08)', fill: true, tension: 0.4, pointRadius: [5, 0, 0, 4, 0, 0, 6, 0, 0, 0, 0, 5, 5], pointBackgroundColor: C.blue + '1)', borderWidth: 3 },
            { label: '총요소생산성 (TFP)', data: tfp, borderColor: C.pink + '1)', backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: [4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4, 4], pointBackgroundColor: C.pink + '1)', borderWidth: 2.5, borderDash: [8, 4] },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.2,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              p1: { type: 'box', xMin: 0, xMax: 2.5, backgroundColor: 'rgba(21,101,192,0.04)', borderWidth: 0, label: { display: true, content: 'Phase 1', position: 'start', color: '#888', font: { size: 9 } } },
              p2: { type: 'box', xMin: 2.5, xMax: 6.5, backgroundColor: 'rgba(255,23,68,0.04)', borderWidth: 0, label: { display: true, content: 'Phase 2: 하락', position: 'start', color: '#c62828', font: { size: 9 } } },
              p3: { type: 'box', xMin: 6.5, xMax: 12, backgroundColor: 'rgba(57,255,20,0.04)', borderWidth: 0, label: { display: true, content: 'Phase 3: 폭발성장', position: 'start', color: '#1b5e20', font: { size: 9 } } },
              dip: ann(5, 90, 'J커브 바닥 96', C.red + '0.15)'),
              peak: ann(10.5, 142, '성숙기 135', C.neon + '0.25)'),
              base: { type: 'line', yMin: 100, yMax: 100, borderColor: 'rgba(0,0,0,0.12)', borderWidth: 1, borderDash: [6, 3], label: { display: true, content: '기준 100', position: 'end', backgroundColor: 'rgba(255,255,255,.8)', color: '#888', font: { size: 9 }, padding: 2 } },
              now: { type: 'line', xMin: 6, xMax: 6, borderColor: 'rgba(57,255,20,0.5)', borderWidth: 2, borderDash: [4, 2], label: { display: true, content: '◀ 현재 (2026 H1)', position: 'end', backgroundColor: 'rgba(57,255,20,0.15)', color: '#1b5e20', font: { size: 10, weight: 'bold' }, padding: 4 } },
            }},
          },
          scales: {
            y: { min: 88, max: 148, title: { display: true, text: '생산성 지수 (기준=100)' }, grid: { color: G } },
            x: { title: { display: true, text: '시간 →' }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 16 AI Adoption Timeline ── */
function AiTimeline() {
  const lb = ['2020', '2022', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2032', '2035']
  const popGap = [0, -5, -10, -12, -15, -20, -28, -35, -45, -65, -100]
  const aiProd = [0, 2, 5, 10, 18, 30, 50, 70, 95, 140, 200]
  const reskill = [0, 0, 5, 20, 40, 60, 50, 40, 30, 20, 10]

  return (
    <MacroCard
      num="16 — AI Adoption & Reskilling Timeline"
      title="AI 가속 도입 시점 & 재교육 타이밍"
      desc="인구절벽 · AI 생산성 · 재교육 수요의 교차점 분석"
      full
      source="통계청, 고용노동부, McKinsey, WEF Future of Jobs 2025 종합 분석"
      insight={`<b>💡 결론:</b><br>① <b style="color:#ff1744">2025~2027년 = AI 재교육 골든타임.</b> 생산인구 감소가 본격화되기 전에 기존 노동력의 AI 역량을 높여야 합니다.<br>② <b style="color:#00c853">2028년~ = AI 가속 도입 필수 시점.</b> 경활인구가 연 30만+ 감소하기 시작하면, AI·로봇 없이는 GDP 유지 불가.<br>③ <b>2030년 이후 = AI가 노동력 공백을 메우는 시대.</b>`}
    >
      <MacroChart config={{
        type: 'line',
        data: {
          labels: lb,
          datasets: [
            { label: '생산인구 감소 누적 (만명)', data: popGap, yAxisID: 'y', borderColor: C.red + '1)', backgroundColor: C.red + '0.06)', fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: C.red + '1)', borderWidth: 3 },
            { label: 'AI 생산성 보충 (인력환산 만명)', data: aiProd, yAxisID: 'y', borderColor: C.neon + '0.8)', backgroundColor: C.neon + '0.06)', fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: '#1b5e20', borderWidth: 3 },
            { label: '재교육 긴급도 (0~100)', data: reskill, yAxisID: 'y2', borderColor: C.orange + '1)', backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 5, pointBackgroundColor: C.orange + '1)', borderWidth: 2.5, borderDash: [6, 3] },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.2,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              gold: { type: 'box', xMin: 2.5, xMax: 5, backgroundColor: 'rgba(255,160,0,0.06)', borderWidth: 0, label: { display: true, content: '🔥 재교육 골든타임', position: 'start', color: '#e65100', font: { size: 10, weight: 'bold' } } },
              accel: { type: 'box', xMin: 5, xMax: 8, backgroundColor: 'rgba(57,255,20,0.04)', borderWidth: 0, label: { display: true, content: '⚡ AI 가속 필수 구간', position: 'start', color: '#1b5e20', font: { size: 10, weight: 'bold' } } },
              survive: { type: 'box', xMin: 8, xMax: 10, backgroundColor: 'rgba(255,23,68,0.04)', borderWidth: 0, label: { display: true, content: '🚨 AI=생존', position: 'start', color: '#c62828', font: { size: 10, weight: 'bold' } } },
              cross: vl(6, 'AI가 감소분 메우기 시작', 'rgba(57,255,20,0.5)'),
              a1: ann(4, 68, '재교육 피크\n지금 시작!', C.orange + '0.2)'),
              a2: ann(8, 155, 'AI 보충이\n인구감소 상쇄', C.neon + '0.2)'),
            }},
          },
          scales: {
            y: { min: -120, max: 220, title: { display: true, text: '인구 감소 / AI 보충 (만명)' }, grid: { color: G }, ticks: { callback: (v: number) => v > 0 ? '+' + v + '만' : v + '만' } },
            y2: { position: 'right', min: 0, max: 100, title: { display: true, text: '재교육 긴급도' }, grid: { display: false } },
            x: { title: { display: true, text: '연도' }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 20 AI Displacement Risk ── */
function AiRisk() {
  const sectors = ['제조단순직', '물류·운송', '데이터입력', '콜센터', '회계·경리', '법률보조', '금융분석', '소매·판매', '건설', '의료진단', '교육', '창작·디자인', '전략기획', 'R&D']
  const risk = [92, 85, 88, 82, 70, 65, 60, 55, 45, 35, 25, 20, 15, 10]
  const bgC = risk.map(r => r >= 70 ? C.red + '0.7)' : r >= 40 ? C.orange + '0.5)' : C.neon + '0.35)')

  return (
    <MacroCard
      num="20 — AI Displacement Risk"
      title="섹터별 AI 대체 위험도"
      desc="WEF·McKinsey 기반 — 자동화 가능성 vs 고용 규모"
      full
      source="WEF Future of Jobs 2025, McKinsey Global Institute"
      insight={`<b>💡 위험 순서:</b> <b style="color:#ff1744">제조 단순직·물류·데이터입력·콜센터</b>가 가장 위험. <b style="color:#00c853">의료·교육·창작·전략기획</b>은 AI 보완 영역. 재교육 방향 = 단순반복 → 판단·소통·창의 영역으로 이동.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: sectors,
          datasets: [{ label: 'AI 대체 위험도 (%)', data: risk, backgroundColor: bgC, borderRadius: 4, borderSkipped: false }],
        },
        options: {
          indexAxis: 'y', responsive: true, aspectRatio: 1.8,
          plugins: {
            legend: { display: false },
            annotation: { annotations: {
              danger: { type: 'line', xMin: 70, xMax: 70, borderColor: C.red + '0.5)', borderWidth: 2, borderDash: [4, 3], label: { display: true, content: '고위험 70%', position: 'start', backgroundColor: 'rgba(255,255,255,.9)', color: '#c62828', font: { size: 9 }, padding: 3 } },
              safe: { type: 'line', xMin: 40, xMax: 40, borderColor: C.neon + '0.4)', borderWidth: 1, borderDash: [4, 3], label: { display: true, content: '안전 40%', position: 'start', backgroundColor: 'rgba(255,255,255,.9)', color: '#1b5e20', font: { size: 9 }, padding: 3 } },
            }},
          },
          scales: {
            x: { min: 0, max: 100, title: { display: true, text: 'AI 대체 위험도 (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            y: { grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 10 US vs Korea Semi ── */
function SemiReturns() {
  return (
    <MacroCard
      num="10 — US vs Korea Semi"
      title="미국 vs 한국 반도체 연간수익률"
      desc="SOX(미국) vs MSCI Korea Semi"
      source="MSCI, Nasdaq, Bloomberg"
      insight={`<b>💡 핵심:</b> 2025년 韓 반도체 <b style="color:#00c853">+69%</b> vs 美 +13.8%. AI CapEx→HBM/DRAM→SK하이닉스·삼성 수혜. <b style="color:#ff1744">2022년은 둘 다 폭락</b> — 사이클 동조.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            { label: 'SOX (미국)', data: [38.1, 38.2, -7.6, 60, 51.6, 41.2, -35.8, 65.3, 19.1, 13.8], backgroundColor: C.blue + '0.6)', borderRadius: 3, borderSkipped: false },
            { label: 'MSCI Korea Semi (한국)', data: [43.1, 88.2, -22.8, 52.7, 34.4, 1.4, -45.6, 85.1, 8.2, 69], backgroundColor: C.red + '0.55)', borderRadius: 3, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 1.5,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              crash: vl(6, '반도체 겨울', C.red + '0.3)'),
              hbm: vl(9, 'HBM 폭발', 'rgba(57,255,20,0.4)'),
              a1: ann(1, 96, '韓 +88%', C.red + '0.12)'),
              a2: ann(6, -52, '동반 폭락', C.red + '0.15)'),
              a3: ann(9, 80, '韓 +69%\nHBM', C.neon + '0.2)'),
            }},
          },
          scales: {
            y: { min: -55, max: 105, title: { display: true, text: '연간 수익률 (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 10-B Scatter ── */
function SemiScatter() {
  const sx = [38.1, 38.2, -7.6, 60, 51.6, 41.2, -35.8, 65.3, 19.1, 13.8]
  const kr = [43.1, 88.2, -22.8, 52.7, 34.4, 1.4, -45.6, 85.1, 8.2, 69]
  const yr = ["'16", "'17", "'18", "'19", "'20", "'21", "'22", "'23", "'24", "'25"]
  const pts = sx.map((x, i) => ({ x, y: kr[i] }))
  const bg = sx.map((_, i) => i === 9 ? C.neon + '0.8)' : i === 6 ? C.red + '0.7)' : C.blue + '0.6)')
  const bd = sx.map((_, i) => i === 9 ? '#1b5e20' : i === 6 ? C.red + '1)' : C.blue + '1)')

  return (
    <MacroCard
      num="10-B — Correlation"
      title="미·한 반도체 상관관계 산점도"
      desc="X축=SOX 수익률 / Y축=한국반도체 수익률"
      source="MSCI, LSEG, Bloomberg"
      insight={`<b>💡 읽는법:</b> 45° 대각선=동조. <b style="color:#00c853">2025년(형광녹)</b> 미국 부진+한국 폭등 = AI HBM 수혜 집중. <b style="color:#ff1744">2022년(적색)</b> 동반 폭락.`}
    >
      <MacroChart config={{
        type: 'scatter',
        data: {
          datasets: [{
            data: pts, backgroundColor: bg, borderColor: bd, pointRadius: 9, pointHoverRadius: 13, borderWidth: 2,
          }],
        },
        options: {
          responsive: true, aspectRatio: 1.3,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c: { dataIndex: number }) => { const i = c.dataIndex; return yr[i] + ' SOX:' + sx[i] + '% KR:' + kr[i] + '%' } } },
            annotation: { annotations: {
              diag: { type: 'line', xMin: -50, yMin: -50, xMax: 90, yMax: 90, borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderDash: [6, 3], label: { display: true, content: '동조선(45°)', position: 'end', backgroundColor: 'rgba(255,255,255,.8)', color: '#aaa', font: { size: 9 }, padding: 2 } },
              y25: ann(25, 60, '2025 韓 독주', C.neon + '0.25)'),
              y22: ann(-25, -52, '2022 동반폭락', C.red + '0.15)'),
              y17: ann(50, 94, '2017 韓 더블', C.blue + '0.12)'),
            }},
          },
          scales: {
            x: { min: -50, max: 80, title: { display: true, text: 'SOX (미국) 수익률 %', color: '#888', font: { size: 11 } }, grid: { color: G }, ticks: { callback: (v: number) => v + '%' } },
            y: { min: -55, max: 100, title: { display: true, text: 'MSCI Korea Semi 수익률 %', color: '#888', font: { size: 11 } }, grid: { color: G }, ticks: { callback: (v: number) => v + '%' } },
          },
        },
      }} />
    </MacroCard>
  )
}

export function Group3_AiSemi() {
  return (
    <>
      <JCurve />
      <AiTimeline />
      <AiRisk />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemiReturns />
        <SemiScatter />
      </div>
    </>
  )
}
