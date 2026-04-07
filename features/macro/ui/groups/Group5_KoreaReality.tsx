'use client'

import { MacroChart, MacroCard } from '../MacroChart'
import { C, G, ann, vl } from '../chartHelpers'

/* ══════════════════════════════════════════════
   5부: 한국의 현실 — 위기 속 기회를 찾다
   ══════════════════════════════════════════════ */

/* ── 08 Russell 2000 ── */
function Russell2000() {
  const lb = ['4/2', '', '', '', '5월', '', '', '', '6월', '', '', '', '7월', '', '', '', '8월', '', '', '', '9월', '', '', '', '10월', '', '', '']
  const loss = [100, 98, 95, 93, 90, 93, 96, 100, 103, 105, 107, 108, 110, 112, 108, 110, 113, 115, 117, 115, 113, 115, 118, 120, 125, 130, 135, 140]
  const prof = [100, 97, 93, 91, 90, 92, 95, 98, 100, 102, 104, 105, 107, 109, 108, 110, 112, 114, 116, 115, 114, 115, 116, 117, 118, 119, 120, 120]

  return (
    <MacroCard
      num="08 — 러셀 2000"
      title="러셀 2000 적자 vs 흑자 기업 주가 상승률"
      desc="2025.04.02 = 100 기준 | 영업이익 추정치 기준 분류"
      full
      source="Bloomberg, Apollo Chief Economist"
      insight={`<b>💡 놀라운 현상:</b> 적자 기업이 흑자보다 더 올랐다! <b style="color:#00c853">이유: 금리 인하 기대 → 적자 성장주에 유동성 유입.</b> 실적보다 '기대'에 베팅하는 시장. 이런 괴리는 오래 못 갑니다.`}
    >
      <MacroChart config={{
        type: 'line',
        data: {
          labels: lb,
          datasets: [
            { label: '적자 기업', data: loss, borderColor: C.red + '1)', backgroundColor: C.red + '0.06)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2.5 },
            { label: '흑자 기업', data: prof, borderColor: C.blue + '1)', backgroundColor: C.blue + '0.04)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2.5 },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.2,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'line', padding: 14 } },
            annotation: { annotations: {
              bot: vl(4, '바닥 형성'),
              split: { type: 'label', xValue: 20, yValue: 145, content: ['↕ 괴리 확대'], backgroundColor: 'rgba(255,255,255,0.9)', font: { size: 10 }, color: '#d32f2f', padding: 4 },
              top: ann(24, 147, '적자 +40%', C.red + '0.15)'),
              btm: ann(24, 112, '흑자 +20%', C.blue + '0.12)'),
              base: { type: 'line', yMin: 100, yMax: 100, borderColor: 'rgba(0,0,0,0.12)', borderWidth: 1, borderDash: [6, 3], label: { display: true, content: '기준 100', position: 'start', backgroundColor: 'rgba(255,255,255,.8)', color: '#888', font: { size: 9 }, padding: 2 } },
            }},
          },
          scales: {
            y: { min: 85, max: 155, title: { display: true, text: '인덱스 (기준=100)' }, grid: { color: G } },
            x: { title: { display: true, text: '2025년' }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 14 OECD Retirement ── */
function OecdRetirement() {
  const countries = ['덴마크', '에스토니아', '네덜란드', '스웨덴', '이탈리아', '슬로바키아', '영국', '포르투갈', '핀란드', '호주', '아이슬란드', '이스라엘', '노르웨이', '미국', '독일', '벨기에', '체코', '아일랜드', '그리스', '오스트리아', '캐나다', '칠레', '코스타리카', '헝가리', '일본', '멕시코', '폴란드', '스페인', '뉴질랜드', '스위스', '라트비아', '리투아니아', '프랑스', '한국', '튀르키예', '콜롬비아', '룩셈부르크', '슬로베니아']
  const future = [73, 71, 70, 70, 70, 69, 68, 68, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 66, 66, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 62, 62, 62, 57]
  const current = [67, 66, 66, 66, 66, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 64, 62, 65, 65, 65, 65, 65, 65, 65, 65, 65, 64, 65, 65, 65, 65, 64, 63, 62, 62, 62, 61]
  const bgC = countries.map(c => c === '한국' ? C.red + '0.85)' : C.blue + '0.5)')
  const bdC = countries.map(c => c === '한국' ? C.red + '1)' : 'transparent')

  return (
    <MacroCard
      num="14 — OECD 은퇴 연령"
      title="OECD 국가별 평균 은퇴 연령"
      desc="파란 바=미래 법정 은퇴연령 / ◆=현재 실제 은퇴연령 | 한국은 OECD 최하위권"
      full
      source="OECD, Bloomberg, Apollo Chief Economist"
      insight={`<b>💡 한국의 현실:</b> 한국의 법정 은퇴연령(65세)은 OECD 평균(66.7세)보다 낮고, 실제 퇴직은 더 빠릅니다. 그런데 <b style="color:#ff1744">생산가능인구는 2025년부터 급감 중</b> — 은퇴연령 상향 논의가 불가피합니다.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: countries,
          datasets: [
            { label: '미래 법정 은퇴연령', data: future, backgroundColor: bgC, borderColor: bdC, borderWidth: countries.map(c => c === '한국' ? 3 : 0), borderRadius: 2, borderSkipped: false },
            { label: '현재 실제 은퇴연령', data: current, type: 'scatter', pointStyle: 'diamond', pointRadius: 5, pointBackgroundColor: '#000', pointBorderColor: '#000', showLine: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.5,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 14 } },
            annotation: { annotations: {
              avg: { type: 'line', yMin: 66.7, yMax: 66.7, borderColor: C.teal + '0.6)', borderWidth: 2, borderDash: [6, 3], label: { display: true, content: 'OECD 미래 평균 66.7세', position: 'start', backgroundColor: 'rgba(255,255,255,.9)', color: '#00838f', font: { size: 10 }, padding: 3 } },
              kr: ann(33, 73, '한국 65세\nOECD 하위', C.red + '0.2)'),
            }},
          },
          scales: {
            y: { min: 55, max: 76, title: { display: true, text: '은퇴 연령 (세)' }, grid: { color: G } },
            x: { grid: { display: false }, ticks: { maxRotation: 60, font: { size: 8 } } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 15 Korea Demographics ── */
function KoreaDemographics() {
  return (
    <MacroCard
      num="15 — 한국 인구 위기"
      title="한국 인구구조 위기: 생산인구 급감 vs 고령인구 폭증"
      desc="15~64세 생산연령인구 · 65세 이상 고령인구 · 0~14세 유소년인구 (만명)"
      full
      source="통계청 장래인구추계(2022~2072), 고용노동부"
      insight={`<b>💡 충격 데이터:</b> 생산연령인구는 2020년 3,674만 → 2030년 3,342만 → <b style="color:#ff1744">2040년 2,676만(-27%)</b>. 고령인구는 2020년 807만 → <b style="color:#ff1744">2040년 1,739만(2.2배)</b>. <b style="color:#00c853">AI·자동화 없이는 경제 유지 불가능한 구조.</b>`}
    >
      <MacroChart config={{
        type: 'line',
        data: {
          labels: ['2020', '2022', '2025', '2030', '2035', '2040', '2050', '2060', '2072'],
          datasets: [
            { label: '생산연령인구 (15~64세)', data: [3674, 3674, 3545, 3342, 2998, 2676, 2419, 2066, 1658], borderColor: C.blue + '1)', backgroundColor: C.blue + '0.08)', fill: true, tension: 0.3, pointRadius: 6, pointBackgroundColor: C.blue + '1)', borderWidth: 3 },
            { label: '고령인구 (65세+)', data: [807, 898, 1051, 1288, 1524, 1739, 1901, 1868, 1727], borderColor: C.red + '1)', backgroundColor: C.red + '0.06)', fill: true, tension: 0.3, pointRadius: 6, pointBackgroundColor: C.red + '1)', borderWidth: 3 },
            { label: '유소년 (0~14세)', data: [631, 595, 530, 460, 410, 388, 318, 268, 238], borderColor: C.teal + '1)', backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: C.teal + '1)', borderWidth: 2, borderDash: [6, 3] },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.2,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            tooltip: { callbacks: { label: (c: { dataset: { label: string }; parsed: { y: number } }) => c.dataset.label + ': ' + c.parsed.y + '만명' } },
            annotation: { annotations: {
              cross: { type: 'line', xMin: 4.5, xMax: 4.5, borderColor: C.red + '0.5)', borderWidth: 2, borderDash: [4, 2], label: { display: true, content: '◀ 데드크로스 구간', position: 'end', backgroundColor: C.red + '0.12)', color: '#c62828', font: { size: 10, weight: 'bold' }, padding: 4 } },
              a1: ann(3, 3500, '3,342만\n320만↓', C.blue + '0.12)'),
              a2: ann(5, 2500, '2,676만\n-27%', C.red + '0.15)'),
              a3: ann(5, 1900, '1,739만\n2.2배↑', C.red + '0.12)'),
              a4: ann(7, 2000, '고령>생산\n역전 임박', C.neon + '0.2)'),
            }},
          },
          scales: {
            y: { min: 0, max: 4200, title: { display: true, text: '인구 (만명)' }, ticks: { callback: (v: number) => v.toLocaleString() + '만' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 21 Household Debt ── */
function HouseholdDebt() {
  return (
    <MacroCard
      num="21 — 가계부채"
      title="한국 가계부채/GDP 비율"
      desc="OECD 최상위 — 투자여력·소비에 직결"
      source="BIS, 한국은행, OECD"
      insight={`<b>💡 심각성:</b> 한국 가계부채/GDP 105%는 OECD 1위권. <b style="color:#ff1744">금리 1%p 상승 = 가계 이자부담 약 17조원 증가.</b> 인구절벽+고부채 = 소비 위축 → 내수 침체 악순환.`}
    >
      <MacroChart config={{
        type: 'line',
        data: {
          labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            { label: '한국 가계부채/GDP (%)', data: [87, 91, 93, 95, 103, 106, 105, 102, 104, 105], borderColor: C.red + '1)', backgroundColor: C.red + '0.08)', fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: C.red + '1)', borderWidth: 3 },
            { label: '미국 (%)', data: [79, 78, 76, 75, 79, 78, 75, 73, 72, 71], borderColor: C.blue + '1)', backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: C.blue + '1)', borderWidth: 2 },
            { label: 'OECD 평균 (%)', data: [63, 64, 64, 65, 68, 67, 66, 65, 64, 64], borderColor: C.teal + '0.6)', backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 3, pointBackgroundColor: C.teal + '1)', borderWidth: 1.5, borderDash: [6, 3] },
          ],
        },
        options: {
          responsive: true, aspectRatio: 1.6,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              a1: ann(4, 110, '코로나\n대출폭증', C.red + '0.15)'),
              a2: ann(9, 112, '105%\nOECD 1위', C.red + '0.2)'),
              danger: { type: 'line', yMin: 100, yMax: 100, borderColor: C.red + '0.3)', borderWidth: 1, borderDash: [6, 3], label: { display: true, content: '위험선 100%', position: 'end', backgroundColor: 'rgba(255,255,255,.8)', color: '#c62828', font: { size: 9 }, padding: 2 } },
            }},
          },
          scales: {
            y: { min: 50, max: 120, title: { display: true, text: '가계부채/GDP (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 22 Buffett Indicator ── */
function BuffettIndicator() {
  return (
    <MacroCard
      num="22 — 버핏 지표"
      title="버핏 지표 (시총/GDP)"
      desc="시장 과열/저평가 판단 — 미국 vs 한국"
      source="World Bank, Bloomberg, FRED"
      insight={`<b>💡 해석:</b> 100% 이상=과열 신호. 미국은 <b style="color:#ff1744">200% 초과(역대급 과열)</b>. 한국은 90%대로 상대적 저평가. <b style="color:#00c853">버핏이 일본에 투자한 이유 = 저평가 시장 선호.</b> 한국도 같은 논리.`}
    >
      <MacroChart config={{
        type: 'line',
        data: {
          labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            { label: '미국 시총/GDP (%)', data: [125, 140, 135, 155, 185, 210, 160, 185, 200, 205], borderColor: C.blue + '1)', backgroundColor: C.blue + '0.06)', fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: C.blue + '1)', borderWidth: 3 },
            { label: '한국 시총/GDP (%)', data: [88, 105, 80, 82, 105, 115, 78, 85, 80, 95], borderColor: C.red + '1)', backgroundColor: C.red + '0.04)', fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: C.red + '1)', borderWidth: 3 },
          ],
        },
        options: {
          responsive: true, aspectRatio: 1.6,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              overheat: { type: 'line', yMin: 100, yMax: 100, borderColor: C.orange + '0.5)', borderWidth: 2, borderDash: [6, 3], label: { display: true, content: '과열 경고선 100%', position: 'end', backgroundColor: 'rgba(255,255,255,.8)', color: '#e65100', font: { size: 9 }, padding: 2 } },
              a1: ann(9, 218, '美 205%\n역대과열', C.red + '0.15)'),
              a2: ann(9, 82, '韓 95%\n저평가', C.neon + '0.2)'),
            }},
          },
          scales: {
            y: { min: 60, max: 230, title: { display: true, text: '시가총액 / GDP (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />
    </MacroCard>
  )
}

export function Group5_KoreaReality() {
  return (
    <>
      <Russell2000 />
      <OecdRetirement />
      <KoreaDemographics />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HouseholdDebt />
        <BuffettIndicator />
      </div>
    </>
  )
}
