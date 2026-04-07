'use client'

import { MacroChart, MacroCard, KPICard } from '../MacroChart'
import { C, G, ann, vl } from '../chartHelpers'

/* ══════════════════════════════════════════════
   1부: 글로벌 시장 — 지금 세계 경제는 어디로?
   ══════════════════════════════════════════════ */

/* ── Overview KPI ── */
export function OverviewKPI() {
  return (
    <MacroCard
      num="Overview"
      title="핵심 거시 지표 한눈에 보기"
      full
      insight={`<b>💡 핵심:</b> Mag-7은 S&P 500의 1/3을 차지하지만, 이익 기여도는 줄고 있습니다. '집중 → 분산' 로테이션이 시작되었다는 신호입니다.`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <KPICard value="32.5%" label="Mag-7 S&P 500 비중" color="blue" />
        <KPICard value="$427B" label="Big Tech CapEx (2025)" color="green" />
        <KPICard value="25.8%" label="Mag-7 순이익률 (역대최고)" color="green" />
        <KPICard value="33%↓" label="이익기여도 (52%→33%)" color="red" />
        <KPICard value="875%" label="Mag-7 10년 누적수익률" color="green" />
      </div>
    </MacroCard>
  )
}

/* ── 01 Portfolio Shift (도넛 2개) ── */
export function PortfolioShift() {
  const pieConfig = (data: number[], alpha: string[]) => ({
    type: 'doughnut' as const,
    data: {
      labels: ['주식', '채권'],
      datasets: [{ data, backgroundColor: [C.blue + alpha[0], C.orange + alpha[1]], borderWidth: 2, borderColor: '#fff' }],
    },
    options: { cutout: '58%', plugins: { legend: { display: false } } },
  })

  return (
    <MacroCard
      num="01 — Portfolio Shift"
      title="금융 투자 포트폴리오 변화"
      desc="전통 60/40 → 80/20 구조 전환"
      source="Bloomberg, Apollo Chief Economist"
      insight={`<b>💡 왜?</b> 저금리에 채권 수익 하락 → 주식 비중 확대. 2022년 주식·채권 동반 하락(-16%) 이후 60/40 모델 신뢰 붕괴.`}
    >
      <div className="flex gap-4 items-center justify-center flex-wrap">
        <div className="text-center flex-1 min-w-[170px] max-w-[240px]">
          <MacroChart config={pieConfig([60, 40], ['0.8)', '0.7)'])} height={200} />
          <div className="font-mono text-lg font-bold mt-1">2019</div>
        </div>
        <div className="text-3xl text-[#7c3aed] shrink-0">▶</div>
        <div className="text-center flex-1 min-w-[170px] max-w-[240px]">
          <MacroChart config={pieConfig([80, 20], ['0.85)', '0.5)'])} height={200} />
          <div className="font-mono text-lg font-bold mt-1">2025</div>
        </div>
      </div>
    </MacroCard>
  )
}

/* ── 02 CapEx Surge ── */
export function CapexSurge() {
  return (
    <MacroCard
      num="02 — CapEx Surge"
      title="빅테크 CapEx 연도별 추이"
      desc="AI 인프라 투자 폭발 — $107B → $562B"
      source="Bloomberg, RBC Wealth Management, CNBC"
      insight={`<b>💡 전환점:</b> 2023년 ChatGPT 이후 AI 경쟁 본격화. 2024년부터 전년비 +52% 급증. 2026E $562B은 마샬플랜의 4~8배 규모.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['2020', '2021', '2022', '2023', '2024', '2025E', '2026E'],
          datasets: [{
            label: 'CapEx ($B)',
            data: [107, 143, 172, 168, 256, 427, 562],
            backgroundColor: ['#90caf9', '#90caf9', '#90caf9', '#90caf9', C.blue + '0.8)', C.neon + '0.45)', C.neon + '0.3)'],
            borderColor: ['transparent', 'transparent', 'transparent', 'transparent', C.blue + '1)', '#1b5e20', '#2e7d32'],
            borderWidth: [0, 0, 0, 0, 2, 2, 2],
            borderRadius: 5,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true, aspectRatio: 1.7,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c: { parsed: { y: number } }) => '$' + c.parsed.y + 'B' } },
            annotation: { annotations: {
              l1: vl(3, 'ChatGPT 등장→', C.red + '0.4)'),
              a1: ann(4, 310, 'AI 경쟁 본격화\n+52% YoY'),
              a2: ann(5.5, 520, '$427B\n역대최대', C.neon + '0.25)'),
            }},
          },
          scales: {
            y: { beginAtZero: true, max: 650, title: { display: true, text: '자본적 지출 ($B)', color: '#888' }, ticks: { callback: (v: number) => '$' + v + 'B' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 03 Company CapEx ── */
export function CompanyCapex() {
  return (
    <MacroCard
      num="03 — Company CapEx"
      title="2025 기업별 CapEx 가이던스"
      desc="아마존 $125B 선두 — AI 데이터센터 경쟁"
      source="CNBC, 각사 어닝콜 가이던스"
      insight={`<b>💡 포인트:</b> 상위 4사 합산 $352B. 테슬라는 $5B — AI CapEx에선 뒤처지는 구도.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['Amazon', 'Microsoft', 'Alphabet', 'Meta', 'Tesla'],
          datasets: [{
            data: [125, 80, 75, 72, 5],
            backgroundColor: [C.orange + '0.75)', C.blue + '0.75)', C.teal + '0.7)', C.purple + '0.7)', C.red + '0.4)'],
            borderRadius: 5, borderSkipped: false,
          }],
        },
        options: {
          indexAxis: 'y', responsive: true, aspectRatio: 1.5,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c: { parsed: { x: number } }) => '$' + c.parsed.x + 'B' } },
            annotation: { annotations: {
              a1: ann(100, 0, 'AWS 선두', C.orange + '0.2)'),
              a2: ann(30, 4, 'AI 규모 미미', C.red + '0.15)'),
            }},
          },
          scales: {
            x: { beginAtZero: true, max: 150, title: { display: true, text: '2025E CapEx ($B)' }, ticks: { callback: (v: number) => '$' + v + 'B' }, grid: { color: G } },
            y: { grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 04 Earnings Growth ── */
export function EarningsGrowth() {
  return (
    <MacroCard
      num="04 — Earnings Growth"
      title="Mag-7 vs S&P 493 이익성장률"
      desc="성장 격차 축소 → 로테이션 신호"
      source="LSEG I/B/E/S, FactSet"
      insight={`<b>💡 핵심:</b> Mag-7 성장률 36.8%→17.1% 반감, S&P 493은 6.9%→9.2% 가속. <b style="color:#00c853">성장의 바통이 넘어가고 있다!</b>`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['2024', '2025E'],
          datasets: [
            { label: 'Mag-7', data: [36.8, 17.1], backgroundColor: C.orange + '0.75)', borderRadius: 5, borderSkipped: false },
            { label: 'S&P 493', data: [6.9, 9.2], backgroundColor: C.blue + '0.65)', borderRadius: 5, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 1.7,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              a1: ann(0, 42, '36.8%', C.orange + '0.2)'),
              a2: ann(1, 23, '17.1% 반감↓', C.red + '0.15)'),
              a3: ann(1, 4, '9.2% 가속↑', C.neon + '0.2)'),
            }},
          },
          scales: {
            y: { beginAtZero: true, max: 48, title: { display: true, text: '이익성장률 YoY (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 05 Contribution ── */
export function Contribution() {
  return (
    <MacroCard
      num="05 — Contribution"
      title="S&P 500 이익성장 기여도"
      desc="Mag-7 독주 종료 → S&P 493 역할 확대"
      source="LSEG I/B/E/S"
      insight={`<b>💡 의미:</b> 2023년엔 Mag-7 없으면 S&P 이익이 <b style="color:#ff1744">마이너스(-1.3%)</b>. 2025년엔 나머지 기업이 67% 담당. 시장 체질 건강해지는 중.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['2023', '2024', '2025E'],
          datasets: [
            { label: 'Mag-7', data: [100, 52, 33], backgroundColor: C.orange + '0.7)', borderRadius: 5, borderSkipped: false },
            { label: 'S&P 493', data: [0, 48, 67], backgroundColor: C.teal + '0.6)', borderRadius: 5, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 1.7,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              a1: ann(0, 85, 'Mag-7 독주\n493=0%', C.red + '0.15)'),
              a2: ann(2, 80, '67%로 역전!', C.neon + '0.2)'),
            }},
          },
          scales: {
            y: { stacked: true, max: 100, title: { display: true, text: '기여도 (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            x: { stacked: true, title: { display: true, text: '연도' }, grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 06 Margin ── */
export function Profitability() {
  return (
    <MacroCard
      num="06 — Profitability"
      title="Mag-7 순이익률 vs S&P 500"
      desc="2배의 구조적 수익성 프리미엄"
      source="LSEG I/B/E/S, Bloomberg"
      insight={`<b>💡 해석:</b> 25.8%는 S&P 평균(13.4%)의 거의 2배. <b style="color:#00c853">AI 시대에도 마진 유지 = 경제적 해자(moat) 건재.</b>`}
    >
      <MacroChart config={{
        type: 'line',
        data: {
          labels: ["Q3'23", "Q4'23", "Q1'24", "Q2'24", "Q3'24", "Q4'24", "'25E"],
          datasets: [
            { label: 'Mag-7 순이익률', data: [22.5, 23, 23.8, 24.2, 24.8, 25.8, 25.3], borderColor: C.orange + '1)', backgroundColor: C.orange + '0.08)', fill: true, tension: 0.35, pointRadius: 5, pointBackgroundColor: C.orange + '1)', borderWidth: 2.5 },
            { label: 'S&P 500 순이익률', data: [11.8, 12, 12.5, 12.8, 13, 13.4, 13], borderColor: C.blue + '1)', backgroundColor: C.blue + '0.05)', fill: true, tension: 0.35, pointRadius: 5, pointBackgroundColor: C.blue + '1)', borderWidth: 2.5 },
          ],
        },
        options: {
          responsive: true, aspectRatio: 1.7,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              gap: { type: 'label', xValue: 3, yValue: 18, content: ['← 마진 갭 12.4%p →'], backgroundColor: 'rgba(255,255,255,0.9)', font: { size: 10 }, color: '#888', padding: 4 },
              peak: ann(5, 29, '역대최고 25.8%', C.neon + '0.2)'),
            }},
          },
          scales: {
            y: { min: 8, max: 32, title: { display: true, text: '순이익률 (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            x: { title: { display: true, text: '분기' }, grid: { color: 'rgba(0,0,0,0.03)' } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 07 Annual Returns ── */
export function AnnualReturns() {
  return (
    <MacroCard
      num="07 — Annual Returns"
      title="Mag-7 vs S&P 500 연간 수익률 (2016~2025)"
      desc="10년 중 8년 아웃퍼폼 — 누적 875% vs 235%"
      source="Bloomberg, Motley Fool"
      full
      insight={`<b>💡 주목:</b> 2020 코로나→+65.8%. 2022 금리인상→-41.3%. 2023 ChatGPT→+107% 역대급. <b style="color:#ff1744">2025년은 Mag-7이 처음으로 S&P에 뒤처진 해.</b>`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
          datasets: [
            {
              label: 'Mag-7', data: [8.8, 50, 3, 55, 65.8, 30, -41.3, 107, 67, -7.7],
              backgroundColor: [C.orange + '0.6)', C.orange + '0.6)', C.red + '0.4)', C.orange + '0.6)', C.orange + '0.7)', C.orange + '0.6)', C.red + '0.7)', C.neon + '0.4)', C.orange + '0.65)', C.red + '0.5)'],
              borderRadius: 3, borderSkipped: false,
            },
            { label: 'S&P 500', data: [9.5, 19.4, -6.2, 28.9, 16.3, 26.9, -19.4, 24.2, 23.3, -0.7], backgroundColor: C.blue + '0.45)', borderRadius: 3, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.3,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              covid: vl(4, '코로나', C.red + '0.3)'),
              rate: vl(6, '금리인상', C.red + '0.4)'),
              gpt: vl(7, 'ChatGPT', 'rgba(57,255,20,0.4)'),
              a1: ann(3.5, 80, '+65.8%\n재택수혜', C.neon + '0.2)'),
              a2: ann(6.5, -35, '-41.3%\n폭락', C.red + '0.15)'),
              a3: ann(7.5, 120, '+107%\n역대급', C.neon + '0.25)'),
              a4: ann(9, -20, '-7.7%', C.red + '0.15)'),
            }},
          },
          scales: {
            y: { min: -55, max: 130, title: { display: true, text: '연간 수익률 (%)' }, ticks: { callback: (v: number) => v + '%' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 13 Data Table ── */
export function DataTable() {
  const rows = [
    { label: 'S&P 500 비중', mag7: '32.5%', sp493: '67.5%', note: '2026.03 기준', hl: false, mg: '', sp: '', nc: '' },
    { label: 'Q4 2024 이익성장률', mag7: '+31.7%', sp493: '+13.0%', note: '전체 +16.9%', hl: true, mg: 'g', sp: 'g', nc: '' },
    { label: '2025E 이익성장률', mag7: '+17.1%', sp493: '+9.2%', note: '격차 축소!', hl: false, mg: 'g', sp: 'g', nc: 'r' },
    { label: '순이익률 (Q4 2024)', mag7: '25.8%', sp493: '—', note: 'S&P: 13.4%', hl: true, mg: 'g', sp: '', nc: '' },
    { label: 'Forward P/E', mag7: '28.3x', sp493: '19.7x', note: '프리미엄 44%', hl: false, mg: '', sp: '', nc: '' },
    { label: 'Forward P/S', mag7: '7.2x', sp493: '—', note: 'S&P: 2.7x', hl: false, mg: '', sp: '', nc: '' },
    { label: '이익기여도 (2024→2025E)', mag7: '52% → 33%', sp493: '48% → 67%', note: '로테이션!', hl: true, mg: 'r', sp: 'g', nc: 'g' },
    { label: '10년 누적수익률', mag7: '875.5%', sp493: '—', note: 'S&P: 234.9%', hl: false, mg: 'g', sp: '', nc: '' },
  ]
  const cc = (c: string) => c === 'g' ? 'text-[#00c853] font-semibold' : c === 'r' ? 'text-[#ff1744] font-semibold' : ''

  return (
    <MacroCard
      num="13 — Data Table"
      title="Mag-7 핵심 데이터 종합"
      full
      source="Bloomberg, LSEG I/B/E/S, FactSet, Motley Fool 종합"
      insight={`<b>💡 정리:</b> Mag-7은 높은 수익성(25.8%) 유지하지만 밸류에이션 프리미엄(P/E 28x vs 20x) 높고 기여도 하락 중 — <b style="color:#00c853">나머지 493개 기업에 주목할 타이밍.</b>`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="text-left p-2 border-b-2 border-[#e0ddd8] text-[#888] text-[10px] uppercase tracking-wider">지표</th>
              <th className="text-left p-2 border-b-2 border-[#e0ddd8] text-[#888] text-[10px] uppercase tracking-wider">Mag-7</th>
              <th className="text-left p-2 border-b-2 border-[#e0ddd8] text-[#888] text-[10px] uppercase tracking-wider">S&P 493</th>
              <th className="text-right p-2 border-b-2 border-[#e0ddd8] text-[#888] text-[10px] uppercase tracking-wider">비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.hl ? 'bg-[rgba(57,255,20,0.12)]' : ''}>
                <td className="p-2 border-b border-[#f0ede8]">{r.label}</td>
                <td className={`p-2 border-b border-[#f0ede8] font-mono text-right ${cc(r.mg)}`}>{r.mag7}</td>
                <td className={`p-2 border-b border-[#f0ede8] font-mono text-right ${cc(r.sp)}`}>{r.sp493}</td>
                <td className={`p-2 border-b border-[#f0ede8] font-mono text-right ${cc(r.nc)}`}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MacroCard>
  )
}

export function Group1_MarketStructure() {
  return (
    <>
      <OverviewKPI />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioShift />
        <CapexSurge />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompanyCapex />
        <EarningsGrowth />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Contribution />
        <Profitability />
      </div>
      <AnnualReturns />
      <DataTable />
    </>
  )
}
