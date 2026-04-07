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
              split: { type: 'label', xValue: 25, yValue: 125, content: ['↕ 괴리 확대'], backgroundColor: 'rgba(255,255,255,0.9)', font: { size: 10 }, color: '#d32f2f', padding: 4 },
              top: ann(26, 143, '적자 +40%', C.red + '0.15)'),
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
              kr: ann(33, 66.5, '한국 65세\nOECD 하위', C.red + '0.2)'),
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
              a1: ann(3, 3700, '3,342만\n320만↓', C.blue + '0.12)'),
              a2: ann(5, 2900, '2,676만\n-27%', C.blue + '0.15)'),
              a3: ann(5, 1400, '1,739만\n2.2배↑', C.red + '0.12)'),
              a4: ann(7, 2300, '고령>생산\n역전 임박', C.neon + '0.2)'),
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

/* ── 15-B 인구 깔때기 ── */

interface FunnelStage {
  label: string; value: string; pct: number; vis: number; bg: string; drop: string
}

function FunnelColumn({ stages, title, year, opacity }: { stages: FunnelStage[]; title: string; year: string; opacity?: number }) {
  return (
    <div className="w-full" style={{ opacity: opacity ?? 1 }}>
      <div className="text-center mb-3">
        <div className="text-xs font-bold text-[var(--text-dim)] tracking-wider">{title}</div>
        <div className="text-lg font-black text-[var(--text-primary)]">{year}</div>
      </div>
      {stages.map((s, i) => {
        const visPct = s.vis
        const nextVisPct = stages[i + 1]?.vis ?? 12
        const tL = (100 - visPct) / 2
        const tR = (100 + visPct) / 2
        const bL = (100 - nextVisPct) / 2
        const bR = (100 + nextVisPct) / 2
        return (
          <div key={i}>
            {i > 0 && (
              <div className="text-center text-[10px] text-red-500 font-bold py-0.5">{s.drop}</div>
            )}
            <div className="relative" style={{ height: '54px' }}>
              <div
                className="absolute inset-0 flex items-center justify-center text-white"
                style={{
                  clipPath: `polygon(${tL}% 0%, ${tR}% 0%, ${bR}% 100%, ${bL}% 100%)`,
                  backgroundColor: s.bg,
                }}
              >
                <div className="text-center px-3">
                  <div className="text-[9px] opacity-80 font-bold">{s.label}</div>
                  <div className="text-sm font-black leading-tight">{s.value}</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PopulationFunnel() {
  const now: FunnelStage[] = [
    { label: '총 인구', value: '5,100만', pct: 100, vis: 100, bg: '#1565c0', drop: '' },
    { label: '생산가능인구 (15~64세)', value: '3,545만', pct: 69, vis: 72, bg: '#0277bd', drop: '▼ 30.5%' },
    { label: '실제 취업자', value: '2,840만', pct: 56, vis: 58, bg: '#ef6c00', drop: '▼ 19.9%' },
    { label: '청년 노동력 (20~39세)', value: '1,320만', pct: 26, vis: 40, bg: '#c62828', drop: '▼ 53.5%' },
    { label: '연간 출생아', value: '23만', pct: 4.5, vis: 22, bg: '#b71c1c', drop: '▼ 98.3%' },
  ]

  const future: FunnelStage[] = [
    { label: '총 인구', value: '4,500만', pct: 88, vis: 88, bg: '#1565c0', drop: '' },
    { label: '생산가능인구 (15~64세)', value: '2,419만', pct: 54, vis: 56, bg: '#0277bd', drop: '▼ 46.2%' },
    { label: '실제 취업자', value: '1,900만', pct: 42, vis: 45, bg: '#ef6c00', drop: '▼ 21.5%' },
    { label: '청년 노동력 (20~39세)', value: '700만', pct: 16, vis: 30, bg: '#c62828', drop: '▼ 63.2%' },
    { label: '연간 출생아', value: '15만', pct: 3.3, vis: 20, bg: '#b71c1c', drop: '▼ 97.9%' },
  ]

  return (
    <MacroCard
      num="15-B — 인구 깔때기"
      title="한국 인구 구조의 붕괴: 현재 vs 20년 후"
      desc="총 인구에서 연간 출생아까지 — 매 단계에서 인구가 소멸한다"
      full
      source="통계청 장래인구추계 (2022~2072), 고용노동부 | 합계출산율 0.72 (OECD 최저)"
      insight={`<b>💡 20년 후 충격:</b> 생산가능인구 3,545만→<b style="color:#ff1744">2,419만(-32%)</b>. 청년 노동력 1,320만→<b style="color:#ff1744">700만(-47%)</b>. 출생아 23만→<b style="color:#ff1744">15만(-35%)</b>. 깔때기가 더 좁아지면 연금·의료·국방 모두 붕괴. <b style="color:#00c853">AI 자동화 + 이민 정책 없이는 국가 유지 불가.</b>`}
    >
      <div className="py-4 grid grid-cols-1 lg:grid-cols-[140px_1fr_auto_1fr] gap-3 items-start">
        {/* 좌측 범례 */}
        <div className="space-y-2 pt-12">
          {now.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5" style={{ height: i > 0 ? '72px' : '54px' }}>
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.bg }} />
              <div>
                <div className="text-[10px] font-bold text-[var(--text-primary)] leading-tight">{s.label}</div>
                <div className="text-[9px] text-gray-400 font-mono">{s.pct}%</div>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-[9px] text-gray-500">2000년 출생아: <b className="text-red-500">64만</b></div>
            <div className="text-[9px] text-gray-500">2025년 출생아: <b className="text-red-500">23만</b></div>
            <div className="text-[9px] text-red-500 font-bold">25년간 -64%</div>
          </div>
        </div>

        {/* 현재 깔때기 */}
        <FunnelColumn stages={now} title="현재" year="2025" />

        {/* 화살표 */}
        <div className="flex items-center justify-center self-center">
          <div className="text-2xl font-black text-red-400">→</div>
        </div>

        {/* 20년 후 깔때기 */}
        <FunnelColumn stages={future} title="20년 후" year="2045" opacity={0.75} />
      </div>
    </MacroCard>
  )
}

/* ── 15-C 지역별 노동인구 지도 ── */

/* 한반도 윤곽선 SVG path */
const KOREA_OUTLINE = 'M50,5 L90,2 L125,3 L155,6 L178,18 L188,35 L190,55 L187,78 L183,100 L180,118 L178,135 L180,155 L185,172 L192,192 L195,212 L188,232 L178,250 L165,264 L148,274 L130,277 L112,270 L95,260 L78,250 L62,237 L48,222 L35,207 L22,192 L12,177 L6,160 L5,142 L10,124 L18,110 L22,97 L18,80 L12,60 L8,40 L15,22 L30,10 Z'
const JEJU_OUTLINE = 'M28,318 L82,318 L90,332 L82,345 L32,345 L22,332 Z'

function KoreaLaborMap() {
  const regions = [
    { name: '서울', labor: 540, rate: -3.2, cx: 60, cy: 56, metro: true },
    { name: '경기', labor: 800, rate: -0.8, cx: 48, cy: 78, metro: true },
    { name: '인천', labor: 170, rate: -1.5, cx: 22, cy: 62, metro: true },
    { name: '강원', labor: 85, rate: -3.0, cx: 148, cy: 52 },
    { name: '충북', labor: 95, rate: -1.5, cx: 112, cy: 122 },
    { name: '충남', labor: 128, rate: -0.5, cx: 40, cy: 152 },
    { name: '세종', labor: 25, rate: 12.0, cx: 78, cy: 140 },
    { name: '대전', labor: 85, rate: -1.8, cx: 82, cy: 164 },
    { name: '경북', labor: 148, rate: -4.0, cx: 160, cy: 138 },
    { name: '대구', labor: 135, rate: -3.5, cx: 140, cy: 178 },
    { name: '울산', labor: 68, rate: -4.0, cx: 178, cy: 210 },
    { name: '전북', labor: 98, rate: -4.5, cx: 52, cy: 205 },
    { name: '광주', labor: 82, rate: -2.2, cx: 48, cy: 240 },
    { name: '전남', labor: 98, rate: -5.0, cx: 55, cy: 272 },
    { name: '경남', labor: 188, rate: -3.5, cx: 128, cy: 242 },
    { name: '부산', labor: 185, rate: -4.8, cx: 170, cy: 258 },
    { name: '제주', labor: 40, rate: 1.0, cx: 56, cy: 332 },
  ]

  const maxLabor = Math.max(...regions.map(r => r.labor))
  const metroPop = regions.filter(r => r.metro).reduce((s, r) => s + r.labor, 0)
  const totalPop = regions.reduce((s, r) => s + r.labor, 0)
  const metroPct = ((metroPop / totalPop) * 100).toFixed(1)

  function getColor(rate: number): string {
    if (rate > 0) return '#16a34a'
    if (rate > -2) return '#ea580c'
    if (rate > -4) return '#dc2626'
    return '#991b1b'
  }

  return (
    <MacroCard
      num="15-C — 지역별 노동인구"
      title="대한민국 노동인구 지도"
      desc="17개 시도 노동인구(만명) 분포 | 원 크기 = 노동인구, 색상 = 인구 증감률"
      full
      source="통계청, 고용노동부 (2025년 추정) | 노동인구 = 15~64세 취업자"
      insight={`<b>💡 수도권 블랙홀:</b> 전체 노동인구의 <b style="color:#ff1744">${metroPct}%</b>가 수도권(서울+경기+인천)에 집중. 비수도권은 <b style="color:#ff1744">부산 -4.8%, 전남 -5.0%</b> 등 급속 감소 중. 유일한 성장 도시는 <b style="color:#00c853">세종(+12%)</b>. 지방소멸 가속 → 국토 불균형 심화.`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 py-4">
        {/* 좌: SVG 한국 지도 */}
        <svg viewBox="0 0 210 360" className="w-full h-auto max-h-[480px]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
          {/* 한반도 윤곽 */}
          <path d={KOREA_OUTLINE} fill="#f0ede8" stroke="#d4d0c8" strokeWidth="1.5" />
          <path d={JEJU_OUTLINE} fill="#f0ede8" stroke="#d4d0c8" strokeWidth="1.5" />

          {/* DMZ 라인 */}
          <line x1="50" y1="5" x2="178" y2="18" stroke="#999" strokeWidth="0.8" strokeDasharray="3,2" />
          <text x="115" y="14" textAnchor="middle" fill="#999" fontSize="5" fontWeight="bold">DMZ</text>

          {/* 지역 버블 + 라벨 */}
          {regions.map(r => {
            const radius = 6 + (r.labor / maxLabor) * 18
            const color = getColor(r.rate)
            const showLabel = radius > 7
            return (
              <g key={r.name}>
                <circle cx={r.cx} cy={r.cy} r={radius} fill={color} opacity={0.8} stroke="white" strokeWidth="1.5" />
                <text x={r.cx} y={r.cy - (showLabel ? 2 : 0)} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={radius > 12 ? '8' : '6.5'} fontWeight="900">
                  {r.name}
                </text>
                {showLabel && (
                  <text x={r.cx} y={r.cy + 7} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="5" opacity={0.85} fontWeight="bold">
                    {r.labor}만
                  </text>
                )}
              </g>
            )
          })}

          {/* 범례 */}
          <g transform="translate(150,300)">
            <rect x="0" y="0" width="52" height="48" rx="4" fill="white" fillOpacity="0.9" stroke="#ddd" strokeWidth="0.5" />
            {[
              { color: '#16a34a', label: '증가' },
              { color: '#ea580c', label: '소폭감소' },
              { color: '#dc2626', label: '감소' },
              { color: '#991b1b', label: '급감' },
            ].map((l, i) => (
              <g key={i} transform={`translate(6,${6 + i * 10})`}>
                <circle cx="4" cy="4" r="3" fill={l.color} />
                <text x="10" y="4" dominantBaseline="middle" fill="#555" fontSize="5.5">{l.label}</text>
              </g>
            ))}
          </g>
        </svg>

        {/* 우: 요약 통계 */}
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-red-50 p-4 border-b border-red-200">
              <div className="text-[10px] text-red-400 font-bold tracking-wider">수도권 (서울·경기·인천)</div>
              <div className="text-3xl font-black text-red-600">{metroPct}%</div>
              <div className="text-xs text-red-500 font-mono">{metroPop.toLocaleString()}만명</div>
            </div>
            <div className="bg-blue-50 p-4">
              <div className="text-[10px] text-blue-400 font-bold tracking-wider">비수도권 (14개 시도)</div>
              <div className="text-3xl font-black text-blue-600">{(100 - Number(metroPct)).toFixed(1)}%</div>
              <div className="text-xs text-blue-500 font-mono">{(totalPop - metroPop).toLocaleString()}만명</div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-[10px] font-bold text-gray-500 tracking-wider mb-2">인구 감소 위기 TOP 5</div>
            {[...regions].sort((a, b) => a.rate - b.rate).slice(0, 5).map(r => (
              <div key={r.name} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                <span className="font-bold text-[var(--text-primary)]">{r.name}</span>
                <span className="font-mono font-bold text-red-500">{r.rate}%</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-[10px] font-bold text-green-600 tracking-wider mb-1">유일한 성장 도시</div>
            {regions.filter(r => r.rate > 0).map(r => (
              <div key={r.name} className="flex items-center justify-between text-xs py-1">
                <span className="font-bold text-green-700">{r.name}</span>
                <span className="font-mono font-bold text-green-600">+{r.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
              a2: ann(7, 112, '105%\nOECD 1위', C.red + '0.2)'),
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
              a1: ann(7, 218, '美 205%\n역대과열', C.red + '0.15)'),
              a2: ann(7, 82, '韓 95%\n저평가', C.neon + '0.2)'),
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
      <PopulationFunnel />
      <KoreaLaborMap />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HouseholdDebt />
        <BuffettIndicator />
      </div>
    </>
  )
}
