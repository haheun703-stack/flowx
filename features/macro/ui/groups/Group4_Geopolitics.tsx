'use client'

import { MacroChart, MacroCard } from '../MacroChart'
import { C, G, ann, vl } from '../chartHelpers'

/* ══════════════════════════════════════════════
   4부: 전쟁과 돈 — 지정학이 바꾸는 투자 지도
   ══════════════════════════════════════════════ */

/* ── 18 Global Fund Flow ── */
function GlobalFundFlow() {
  return (
    <MacroCard
      num="18 — 글로벌 자금 흐름"
      title="글로벌 자금흐름: 돈은 어디로 가는가"
      desc="미국·유럽·중국·한국 주식시장 연간 순유입 ($B) | 2026E = 이란전쟁 반영 추정"
      full
      source="Bloomberg, EPFR, KRX, Morgan Stanley, Goldman Sachs (2026E는 현재 상황 기반 추정)"
      insight={`<b>💡 2026 전쟁의 돈의 방향:</b><br>• <b style="color:#ff1744">미국:</b> 이란전쟁→유가 $100+→인플레 재점화→소비위축. 자금유입 급감 추정 $80B.<br>• <b style="color:#00c853">중국/러시아:</b> 호르무즈 봉쇄의 역설적 수혜. 자금유출 축소.<br>• <b style="color:#1565c0">한국:</b> 반도체 수출 호조 지속하나, 에너지 비용 급등 리스크. 자금유입 둔화 $10B 추정.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026E'],
          datasets: [
            { label: '미국', data: [180, 250, 120, 280, 350, 200, 80], backgroundColor: [C.blue + '0.65)', C.blue + '0.65)', C.blue + '0.65)', C.blue + '0.65)', C.blue + '0.65)', C.blue + '0.65)', C.blue + '0.3)'], borderRadius: 3, borderSkipped: false, borderColor: ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', C.red + '0.8)'], borderWidth: [0, 0, 0, 0, 0, 0, 2] },
            { label: '유럽', data: [40, 80, 30, 60, 70, 90, 30], backgroundColor: C.teal + '0.55)', borderRadius: 3, borderSkipped: false },
            { label: '한국', data: [-5, 10, -15, -8, 5, 20, 10], backgroundColor: C.red + '0.6)', borderRadius: 3, borderSkipped: false },
            { label: '중국', data: [50, 30, -40, -60, -30, -20, 5], backgroundColor: C.orange + '0.55)', borderRadius: 3, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.2,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            tooltip: { callbacks: { label: (c: { dataset: { label: string }; parsed: { y: number } }) => c.dataset.label + ': $' + c.parsed.y + 'B' } },
            annotation: { annotations: {
              a1: ann(3, 320, '美 AI랠리 집중', C.blue + '0.12)'),
              a2: ann(5, 40, '韓 복귀 $20B', C.neon + '0.2)'),
              a3: ann(3.5, -70, '中 유출 지속', C.orange + '0.12)'),
              war: vl(6, '이란전쟁 충격', C.red + '0.5)'),
              a4: ann(6, 120, '美 자금유입\n급감 $80B', C.red + '0.18)'),
            }},
          },
          scales: {
            y: { title: { display: true, text: '연간 순유입 ($B)' }, ticks: { callback: (v: number) => '$' + v + 'B' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 18-B Geopolitical Shock ── */
function GeopoliticalShock() {
  const labels = ['유가 ($/배럴)', '미국 인플레 (%)', '미국 금리 (%)', '한국 환율 (원/100)', '중국 성장률 (%)', '러시아 성장률 (%)', 'EU 성장률 (%)', '아시아 교역량 증감 (%)', '글로벌 교역량 증감 (%)']
  const preWar = [72, 2.4, 3.75, 13.8, 5.0, 2.0, 1.2, 4.5, 3.2]
  const warNow = [110, 3.5, 3.75, 14.5, 4.8, 2.8, 0.5, 2.0, 1.5]
  const warLong = [130, 4.5, 4.25, 15.5, 4.5, 3.2, -0.3, 0.5, 0.5]

  return (
    <MacroCard
      num="18-B — 지정학 충격"
      title="2026 이란전쟁: 글로벌 시장 충격 시나리오"
      desc="호르무즈 해협 봉쇄 → 유가·인플레·금리·자금흐름 연쇄 반응"
      full
      source="Wikipedia(Economic impact of 2026 Iran war), Morgan Stanley, Goldman Sachs, CNBC, Bloomberg"
      insight={`<b>💡 핵심 분석:</b><br>① <b style="color:#ff1744">최대 피해: 미국 소비자.</b> 유가 $110→가솔린 $4.5/갤런. 인플레 재점화 → Fed 금리인하 중단/역행 가능.<br>② <b style="color:#00c853">반사 수혜: 중국·러시아.</b> 러시아 성장률 2.0→3.2% 상승(에너지 수출 호황).<br>③ <b style="color:#ff1744">EU 직격탄:</b> LNG 가격 급등 → 성장률 1.2%→-0.3% 역성장 전환 가능.<br>⚠️ <b style="color:#ff1744">45일 휴전 협상 중(4/7 데드라인)</b> — 결과에 따라 시나리오 급변 가능.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: '전쟁 전 (2026.02)', data: preWar, backgroundColor: C.blue + '0.55)', borderRadius: 4, borderSkipped: false },
            { label: '현재 (2026.04)', data: warNow, backgroundColor: C.orange + '0.65)', borderRadius: 4, borderSkipped: false },
            { label: '장기전 시나리오', data: warLong, backgroundColor: C.red + '0.6)', borderRadius: 4, borderSkipped: false },
          ],
        },
        options: {
          indexAxis: 'y', responsive: true, aspectRatio: 1.5,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            annotation: { annotations: {
              a1: ann(118, 0, '$72→$110\n+53% 급등', C.red + '0.15)'),
              a3: ann(10, 5, '러시아 수혜\n2.0→3.2%', C.neon + '0.12)'),
              a4: ann(10, 6, 'EU 역성장\n1.2→-0.3%', C.red + '0.12)'),
            }},
          },
          scales: {
            x: { min: 0, max: 140, title: { display: true, text: '수치' }, grid: { color: G } },
            y: { grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 19 Trade Balance ── */
function TradeBalance() {
  return (
    <MacroCard
      num="19 — 무역수지"
      title="주요국 무역수지 비교 (2020~2026E)"
      desc="연간 상품무역수지 ($B) | 2026E = 이란전쟁 영향 반영 추정"
      full
      source="WTO, IMF, 관세청, Trading Economics, BEA"
      insight={`<b>💡 핵심 읽기:</b><br>• <b style="color:#ff1744">미국:</b> 만성 적자 $-900B. 관세 정책에도 적자 축소 실패.<br>• <b style="color:#00c853">중국:</b> 세계 최대 흑자 $820B. 이란전쟁→할인원유→비용절감 수혜.<br>• <b style="color:#00c853">한국:</b> 2022년 에너지 위기→적자(-$47B) → 2024~2025년 반도체 호황으로 흑자 회복. <b style="color:#ff1744">2026E는 유가 급등으로 흑자 축소 $55B 추정.</b>`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026E'],
          datasets: [
            { label: '미국', data: [-626, -845, -945, -774, -918, -900, -850], backgroundColor: C.blue + '0.6)', borderRadius: 2, borderSkipped: false },
            { label: '중국', data: [535, 575, 877, 823, 750, 780, 820], backgroundColor: C.red + '0.55)', borderRadius: 2, borderSkipped: false },
            { label: '한국', data: [45, 30, -47, -10, 52, 78, 55], backgroundColor: C.neon + '0.5)', borderRadius: 2, borderSkipped: false },
            { label: '독일', data: [180, 195, 80, 210, 220, 215, 180], backgroundColor: C.teal + '0.5)', borderRadius: 2, borderSkipped: false },
            { label: '일본', data: [3, -15, -160, -45, -50, -30, -60], backgroundColor: C.purple + '0.5)', borderRadius: 2, borderSkipped: false },
            { label: '러시아', data: [65, 140, 280, 120, 100, 110, 150], backgroundColor: C.orange + '0.55)', borderRadius: 2, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.2,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 10, font: { size: 10 } } },
            tooltip: { callbacks: { label: (c: { dataset: { label: string }; parsed: { y: number } }) => c.dataset.label + ': $' + c.parsed.y + 'B' } },
            annotation: { annotations: {
              zero: { type: 'line', yMin: 0, yMax: 0, borderColor: 'rgba(0,0,0,0.2)', borderWidth: 1 },
              war22: vl(2, '우크라 전쟁', C.red + '0.3)'),
              war26: vl(6, '이란전쟁', C.red + '0.4)'),
              a1: ann(3, -980, '美 적자\n역대 최대', C.blue + '0.12)'),
              a2: ann(2, 920, '中 흑자\n$877B', C.red + '0.12)'),
              a3: ann(6, 200, '러 수혜\n$150B', C.orange + '0.15)'),
            }},
          },
          scales: {
            y: { title: { display: true, text: '무역수지 ($B)' }, ticks: { callback: (v: number) => '$' + v + 'B' }, grid: { color: G } },
            x: { title: { display: true, text: '연도' }, grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 19-B Korea Export ── */
function KoreaExport() {
  const exp = [513, 644, 684, 632, 684, 710, 700]
  const imp = [468, 614, 731, 642, 632, 632, 645]
  const bal = [45, 30, -47, -10, 52, 78, 55]

  return (
    <MacroCard
      num="19-B — 한국 수출"
      title="한국 수출·수입·무역수지 추이"
      desc="연간 수출/수입($B) + 무역수지(라인) | 반도체 의존도 주의"
      full
      source="산업통상자원부, 관세청, 한국무역협회"
      insight={`<b>💡 한국 무역의 핵심:</b><br>• 2025년 수출 <b style="color:#00c853">$710B 역대 최대</b> — 반도체 수출 +43% 급증이 견인.<br>• 2022년 적자(-$47B)는 우크라이나 전쟁→원유·가스 수입비 폭등 때문.<br>• <b style="color:#ff1744">2026E 리스크:</b> 이란전쟁→유가 $110+→수입비 급증. 반도체 호황 지속돼도 흑자 축소 불가피.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026E'],
          datasets: [
            { label: '수출 ($B)', data: exp, backgroundColor: C.blue + '0.6)', borderRadius: 3, borderSkipped: false, order: 2 },
            { label: '수입 ($B)', data: imp, backgroundColor: C.red + '0.45)', borderRadius: 3, borderSkipped: false, order: 3 },
            {
              label: '무역수지 ($B)', data: bal, type: 'line', yAxisID: 'y2',
              borderColor: C.neon + '0.8)', backgroundColor: C.neon + '0.1)', fill: true, tension: 0.3,
              pointRadius: 6, pointBackgroundColor: bal.map(v => v < 0 ? 'rgba(255,23,68,1)' : '#1b5e20'),
              borderWidth: 3, order: 1,
            },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.2,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            tooltip: { callbacks: { label: (c: { dataset: { label: string }; parsed: { y: number } }) => c.dataset.label + ': $' + c.parsed.y + 'B' } },
            annotation: { annotations: {
              a1: ann(2, -55, '에너지 위기\n적자 -$47B', C.red + '0.18)'),
              a2: ann(5, 95, '역대최대\n수출 $710B', C.neon + '0.2)'),
              a3: ann(6, 42, '이란전쟁\n흑자 축소', C.orange + '0.15)'),
              zero: { type: 'line', yMin: 0, yMax: 0, yScaleID: 'y2', borderColor: 'rgba(0,0,0,0.15)', borderWidth: 1, borderDash: [4, 3] },
            }},
          },
          scales: {
            y: { title: { display: true, text: '수출/수입 ($B)' }, ticks: { callback: (v: number) => '$' + v + 'B' }, grid: { color: G } },
            y2: { position: 'right', min: -80, max: 120, title: { display: true, text: '무역수지 ($B)' }, grid: { display: false }, ticks: { callback: (v: number) => '$' + v + 'B' } },
            x: { title: { display: true, text: '연도' }, grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

/* ── 🔒 SECRET — 엔 캐리트레이드 ── */
function YenCarryTrade() {
  const labels = ['22.1', '22.7', '22.10', '23.1', '23.6', '23.12', '24.3', '24.7', '24.8★', '24.12', '25.3', '25.9', '26E']
  const usdJpy = [115, 136, 150, 127, 140, 142, 150, 162, 142, 157, 149, 143, 148]
  const foreignNet = [-1, -5, -6, 3, -1, 2, 3, 2, -12, 5, 8, 5, -3]

  return (
    <MacroCard
      num="🔒 SECRET — 엔 캐리트레이드"
      title="엔 캐리트레이드의 시한폭탄"
      desc="USD/JPY 환율 vs KOSPI 외국인 순매수 (조원) | 2024.8 캐리 언와인드 = 실전 증거"
      full
      source="BOJ, Fed, Bloomberg, KRX, Reuters"
      insight={`<b>🔒 시크릿 인사이트:</b><br>• <b style="color:#ff1744">엔 캐리트레이드</b> = 엔화 저금리 차입 → 고금리 자산(미국·한국 주식) 투자. 일본 금리 인상 시 역류.<br>• <b style="color:#ff1744">2024.8 증거:</b> USD/JPY 162→142 급락. 동시에 외국인 KOSPI <b>-12조원</b> 역대급 매도. 이것이 캐리 언와인드.<br>• <b style="color:#ff1744">2026E 경고:</b> BOJ 추가 금리인상(0.5→0.75%) + 이란전쟁 리스크 = 2차 언와인드 가능. USD/JPY 148 수준에서 재차 급락 시 외국인 이탈 반복.`}
    >
      <MacroChart config={{
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'USD/JPY 환율', data: usdJpy, type: 'line', yAxisID: 'y',
              borderColor: C.orange + '0.9)', backgroundColor: C.orange + '0.1)',
              borderWidth: 3, tension: 0.3, pointRadius: 5,
              pointBackgroundColor: usdJpy.map((v, i) => i === 8 ? 'rgba(255,23,68,1)' : C.orange + '0.8)'),
              pointBorderColor: usdJpy.map((v, i) => i === 8 ? 'rgba(255,23,68,1)' : 'transparent'),
              pointBorderWidth: usdJpy.map((v, i) => i === 8 ? 3 : 0),
              order: 1,
            },
            {
              label: '외국인 순매수 (조원)', data: foreignNet, yAxisID: 'y2',
              backgroundColor: foreignNet.map(v => v >= 0 ? C.neon + '0.5)' : C.red + '0.5)'),
              borderRadius: 3, borderSkipped: false, order: 2,
            },
          ],
        },
        options: {
          responsive: true, aspectRatio: 2.2,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14 } },
            tooltip: {
              callbacks: {
                label: (c: { dataset: { label: string }; parsed: { y: number }; datasetIndex: number }) =>
                  c.datasetIndex === 0
                    ? `USD/JPY: ¥${c.parsed.y}`
                    : `외국인: ${c.parsed.y > 0 ? '+' : ''}${c.parsed.y}조원`,
              },
            },
            annotation: { annotations: {
              crash: vl(8, '캐리 언와인드', C.red + '0.6)'),
              a1: ann(8, 170, '¥162→¥142\n-12.3% 폭락', C.red + '0.18)'),
              a2: ann(8, -14, '외국인 -12조\n역대급 매도', C.red + '0.18)'),
              a3: ann(12, 155, '2차 언와인드\n경고 구간', C.amber + '0.2)'),
              carry: ann(3, 120, '캐리 자금 유입\n엔 약세 = 매수', C.neon + '0.15)'),
            }},
          },
          scales: {
            y: { min: 100, max: 175, title: { display: true, text: 'USD/JPY 환율' }, grid: { color: G }, ticks: { callback: (v: number) => '¥' + v } },
            y2: { position: 'right', min: -15, max: 12, title: { display: true, text: '외국인 순매수 (조원)' }, grid: { display: false }, ticks: { callback: (v: number) => v + '조' } },
            x: { grid: { display: false } },
          },
        },
      }} />
    </MacroCard>
  )
}

export function Group4_Geopolitics() {
  return (
    <>
      <GlobalFundFlow />
      <GeopoliticalShock />
      <TradeBalance />
      <KoreaExport />
      <YenCarryTrade />
    </>
  )
}
