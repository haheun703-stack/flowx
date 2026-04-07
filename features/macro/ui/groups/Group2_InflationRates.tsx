'use client'

import { MacroChart, MacroCard } from '../MacroChart'
import { C, G, ann, vl } from '../chartHelpers'

/* ══════════════════════════════════════════════
   2부: 물가·금리·환율 — 경제의 체온을 재봅시다
   ══════════════════════════════════════════════ */

/* ── 11 FOMC Inflation Risk ── */
function FomcInflation() {
  const lb = ['Sep18', 'Dec18', 'Mar19', 'Jun19', 'Sep19', 'Dec19', 'Mar20', 'Jun20', 'Sep20', 'Dec20',
    'Mar21', 'Jun21', 'Sep21', 'Dec21', 'Mar22', 'Jun22', 'Sep22', 'Dec22', 'Mar23', 'Jun23',
    'Sep23', 'Dec23', 'Mar24', 'Jun24', 'Sep24', 'Dec24', 'Mar25', 'Jun25', 'Sep25', 'Dec25']
  const up = [3, 5, 5, 5, 6, 5, 2, 1, 1, 1, 2, 5, 9, 9, 13, 13, 16, 16, 16, 14, 11, 7, 7, 9, 3, 15, 17, 17, 18, 14]
  const dn = [3, 3, 6, 6, 9, 5, 13, 13, 10, 4, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 1]

  return (
    <MacroCard
      num="11 — FOMC 인플레 전망"
      title="인플레 전망: FOMC 위원 리스크 평가"
      desc="인플레이션 상방(상승) vs 하방(하락) 위험에 무게를 두는 FOMC 위원 수"
      full
      source="Bloomberg, Apollo Chief Economist, FOMC SEP"
      insight={`<b>💡 핵심:</b> 2020년 코로나 직후엔 FOMC 위원 대부분이 <b style="color:#00c853">"인플레 안 온다"(하방)</b>고 봤지만, 2022~2025년에는 거의 전원이 <b style="color:#ff1744">"인플레 온다"(상방)</b>로 전환. 2026년 들어 상방 위원이 약간 줄었지만 여전히 압도적 — <b>금리 인하가 쉽지 않은 이유.</b>`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: lb,
          datasets: [
            { label: '상방(인플레 올 거다)', data: up, backgroundColor: C.red + '0.7)', borderRadius: 2, borderSkipped: false },
            { label: '하방(인플레 안 올 거다)', data: dn, backgroundColor: C.teal + '0.6)', borderRadius: 2, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.5,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            tooltip: { callbacks: { label: (c: { dataset: { label: string }; parsed: { y: number } }) => c.dataset.label + ': ' + c.parsed.y + '명' } },
            annotation: { annotations: {
              covid: vl(6, '코로나 팬데믹', C.teal + '0.4)'),
              hike: vl(14, '금리인상 시작', C.red + '0.4)'),
              a1: ann(8, 17, '인플레 안 온다\n(하방 독주)', C.teal + '0.15)'),
              a2: ann(18, 19, '인플레 온다\n(상방 압도)', C.red + '0.15)'),
              a3: ann(27, 22, '거의 전원\n상방 리스크', C.red + '0.2)'),
            }},
          },
          scales: {
            y: { beginAtZero: true, max: 24, title: { display: true, text: 'FOMC 위원 수 (명)' }, grid: { color: G } },
            x: { title: { display: true, text: 'FOMC 회의 (분기별)' }, grid: { display: false }, ticks: { maxRotation: 45, font: { size: 9 } } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 12 US vs Korea CPI ── */
function CpiComparison() {
  return (
    <MacroCard
      num="12 — 미국 vs 한국 물가"
      title="미국 vs 한국 소비자물가 상승률 (10년)"
      desc="소비자물가 전년비(%) — 미국 목표 2% / 한은 목표 2%"
      full
      source="BLS, 통계청, Trading Economics, KDI"
      insight={`<b>💡 비교:</b> 2022년 미국 <b style="color:#ff1744">8.0%</b> vs 한국 5.1% — 미국이 더 심각. 2025~2026년 양국 모두 2%대 안착 시도 중. 하지만 <b style="color:#ff1744">트럼프 관세·에너지 변동성</b>이 2차 인플레 리스크. 한국은 원/달러 환율 변수 추가.`}
    >
      <MacroChart config={{
        type: 'line',
        data: {
          labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
          datasets: [
            { label: '미국 CPI (YoY%)', data: [1.3, 2.1, 2.4, 1.8, 1.2, 4.7, 8.0, 4.1, 2.9, 2.6, 2.4], borderColor: C.blue + '1)', backgroundColor: C.blue + '0.06)', fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: C.blue + '1)', borderWidth: 2.5 },
            { label: '한국 CPI (YoY%)', data: [1.0, 1.9, 1.5, 0.4, 0.5, 2.5, 5.1, 3.6, 2.3, 2.3, 2.0], borderColor: C.red + '1)', backgroundColor: C.red + '0.04)', fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: C.red + '1)', borderWidth: 2.5 },
            { label: '중앙은행 목표 (2%)', data: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], borderColor: 'rgba(57,255,20,0.6)', borderWidth: 2, borderDash: [8, 4], pointRadius: 0, fill: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.3,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              covid: vl(4, '코로나', 'rgba(0,0,0,0.15)'),
              supply: vl(5, '공급망 위기', C.red + '0.3)'),
              peak: vl(6, '인플레 피크', C.red + '0.4)'),
              a1: ann(6.5, 9, '美 8.0%\n40년최고', C.red + '0.15)'),
              a2: ann(5.5, 6, '韓 5.1%', C.red + '0.1)'),
              a3: ann(3, 3.5, '韓 0.5%\n디플레우려', C.teal + '0.12)'),
              a4: ann(9.5, 3.5, '2%대 안착 시도', C.neon + '0.2)'),
            }},
          },
          scales: {
            y: { min: 0, max: 10, title: { display: true, text: '소비자물가 상승률 CPI (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 17 Interest Rate & FX ── */
function InterestRateFx() {
  return (
    <MacroCard
      num="17 — 금리 & 환율"
      title="미국 금리 vs 한국 금리 vs 달러/원 환율"
      desc="미국 기준금리 · 한은 기준금리 · 달러/원 (우축)"
      full
      source="Fed, 한국은행, Bloomberg"
      insight={`<b>💡 핵심:</b> 한미 금리차(현재 1.25%p)가 벌어지면 → 자본유출 → 원화약세. 2022년 미국 금리 급등 시 환율 1,400원 돌파. <b style="color:#00c853">금리차 축소 = 외국인 한국투자 복귀 신호.</b>`}
    >
      <MacroChart config={{
        type: 'line',
        data: {
          labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
          datasets: [
            { label: '미국 금리 (%)', data: [0.5, 1.0, 2.0, 1.75, 0.25, 0.25, 4.5, 5.5, 4.5, 4.0, 3.75], yAxisID: 'y', borderColor: C.blue + '1)', backgroundColor: C.blue + '0.06)', fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: C.blue + '1)', borderWidth: 3 },
            { label: '한국 금리 (%)', data: [1.25, 1.25, 1.5, 1.75, 0.5, 0.75, 3.25, 3.5, 3.0, 2.75, 2.5], yAxisID: 'y', borderColor: C.red + '1)', backgroundColor: C.red + '0.04)', fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: C.red + '1)', borderWidth: 3 },
            { label: '달러/원 환율 (우축)', data: [1160, 1070, 1100, 1160, 1180, 1190, 1300, 1290, 1380, 1400, 1380], yAxisID: 'y2', borderColor: C.orange + '0.8)', backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: C.orange + '1)', borderWidth: 2, borderDash: [6, 3] },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.3,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              hike: vl(6, '금리인상 충격', C.red + '0.3)'),
              a1: ann(4, 1.2, '제로금리', C.teal + '0.15)'),
              a2: ann(8, 5.8, '금리차 1.25%p', C.red + '0.12)'),
            }},
          },
          scales: {
            y: { min: 0, max: 6.5, title: { display: true, text: '기준금리 (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            y2: { position: 'right', min: 1000, max: 1500, title: { display: true, text: '달러/원' }, grid: { display: false }, ticks: { callback: (v: number) => v.toLocaleString() + '원' } },
            x: { title: { display: true, text: '연도' }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />
    </MacroCard>
  )
}

export function Group2_InflationRates() {
  return (
    <>
      <FomcInflation />
      <CpiComparison />
      <InterestRateFx />
    </>
  )
}
