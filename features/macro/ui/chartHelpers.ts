/* ── 거시경제 차트 공통 유틸 ── */

/** 색상 시스템 (대비색) */
export const C = {
  red: 'rgba(255,23,68,',
  orange: 'rgba(255,109,0,',
  blue: 'rgba(21,101,192,',
  teal: 'rgba(0,131,143,',
  neon: 'rgba(57,255,20,',
  purple: 'rgba(124,58,237,',
  pink: 'rgba(216,27,96,',
  amber: 'rgba(255,160,0,',
} as const

/** 그리드 색상 */
export const G = 'rgba(0,0,0,0.06)'

/** 주석 라벨 (겹침 방지 — yValue 조정 필수) */
export function ann(x: number, y: number, text: string, bg?: string) {
  return {
    type: 'label' as const,
    xValue: x,
    yValue: y,
    content: text.split('\n'),
    backgroundColor: bg || 'rgba(57,255,20,0.18)',
    borderColor: (bg || 'rgba(57,255,20,0.18)').replace(/[\d.]+\)$/, '0.5)'),
    borderWidth: 1,
    borderRadius: 4,
    font: { size: 10, family: 'Noto Sans KR' },
    color: '#1a1a2e',
    padding: { x: 6, y: 3 },
  }
}

/** 수직 이벤트 라인 */
export function vl(x: number, text: string, color?: string) {
  return {
    type: 'line' as const,
    xMin: x,
    xMax: x,
    borderColor: color || 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderDash: [4, 3],
    label: {
      display: !!text,
      content: text,
      position: 'start' as const,
      backgroundColor: 'rgba(255,255,255,0.92)',
      color: '#555',
      font: { size: 9 },
      padding: 3,
    },
  }
}

/** Chart.js 공통 기본 설정 적용 */
export function applyChartDefaults() {
  // Chart 인스턴스에서 직접 적용 (전역)
}
