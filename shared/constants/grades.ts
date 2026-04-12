/**
 * 등급/액션 상수 SSoT (Single Source of Truth)
 *
 * 배경: 2026-04-05 "매수/매도 → 포착/경계" 전역 표현 변경(commit 3b7ae02) 당시
 * JarvisControlTower.tsx가 유니코드 이스케이프(`\uC801\uADF9\uB9E4\uC218`)로 등급을
 * 저장하고 있어 grep에 잡히지 않아 누락 → "오늘의 추천" 탭이 0건으로 표시되는 버그 발생.
 *
 * 재발 방지를 위해 모든 등급/액션 리터럴은 반드시 이 파일에서 import.
 * 외부 파일에서 등급 문자열 리터럴 사용 시 scripts/guard-grades.mjs가 차단.
 */

/* ── 신 등급 (4/5 이후 표준) ── */
export const GRADE_STRONG_PICK = '강력 포착' as const
export const GRADE_PICK = '포착' as const
export const GRADE_WATCH = '관심' as const
export const GRADE_OBSERVE = '관찰' as const
export const GRADE_CAUTION = '경계' as const

/* ── 구 등급 (하위호환) ── */
export const GRADE_LEGACY_FORCE_BUY = '적극매수' as const
export const GRADE_LEGACY_BUY = '매수' as const
export const GRADE_LEGACY_WATCH_BUY = '관심매수' as const
export const GRADE_LEGACY_RESERVE = '보류' as const

/* ── 타입 ── */
export type GradeNew =
  | typeof GRADE_STRONG_PICK
  | typeof GRADE_PICK
  | typeof GRADE_WATCH
  | typeof GRADE_OBSERVE

export type GradeLegacy =
  | typeof GRADE_LEGACY_FORCE_BUY
  | typeof GRADE_LEGACY_BUY
  | typeof GRADE_LEGACY_WATCH_BUY
  | typeof GRADE_LEGACY_RESERVE

export type Grade = GradeNew | GradeLegacy

/* ── 포착 가능 등급 (필터링용, 신+구) ── */
export const BUYABLE_GRADES: readonly Grade[] = [
  GRADE_STRONG_PICK,
  GRADE_PICK,
  GRADE_WATCH,
  GRADE_OBSERVE,
  GRADE_LEGACY_FORCE_BUY,
  GRADE_LEGACY_BUY,
  GRADE_LEGACY_WATCH_BUY,
] as const

/* ── 배지 색상 (Tailwind class) ──
 * 타입은 Record<string, string>로 완화 — 런타임에 임의 grade 키로 접근하는
 * 호출부(JarvisControlTower 등)와의 호환을 위함. 런타임 완전성은 `BUYABLE_GRADES`
 * 기준으로 컴포넌트 테스트에서 보장.
 */
export const GRADE_BADGE_CLASS: Record<string, string> = {
  [GRADE_STRONG_PICK]: 'bg-red-600 text-white',
  [GRADE_PICK]: 'bg-green-600 text-white',
  [GRADE_WATCH]: 'bg-blue-600 text-white',
  [GRADE_OBSERVE]: 'bg-yellow-600 text-white',
  [GRADE_LEGACY_FORCE_BUY]: 'bg-red-600 text-white',
  [GRADE_LEGACY_BUY]: 'bg-green-600 text-white',
  [GRADE_LEGACY_WATCH_BUY]: 'bg-blue-600 text-white',
  [GRADE_LEGACY_RESERVE]: 'bg-gray-300 text-[var(--text-dim)]',
}

/* ── 액션 스타일 (배지 배경 + 글자 색) ── */
export const ACTION_STYLE_CLASS: Record<string, string> = {
  // 신 표현
  [GRADE_STRONG_PICK]: 'bg-red-50 text-[var(--up)] border-red-200',
  [GRADE_PICK]: 'bg-red-50 text-[var(--up)] border-red-200',
  [GRADE_WATCH]: 'bg-amber-50 text-amber-700 border-amber-200',
  [GRADE_OBSERVE]: 'bg-gray-100 text-gray-600 border-gray-200',
  // 하위호환
  [GRADE_LEGACY_BUY]: 'bg-red-50 text-[var(--up)] border-red-200',
  [GRADE_LEGACY_FORCE_BUY]: 'bg-red-50 text-[var(--up)] border-red-200',
  [GRADE_LEGACY_WATCH_BUY]: 'bg-amber-50 text-amber-700 border-amber-200',
  [GRADE_LEGACY_RESERVE]: 'bg-gray-100 text-gray-600 border-gray-200',
  // 영문 enum (봇 API 호환)
  STRONG_PICK: 'bg-red-50 text-[var(--up)] border-red-200',
  PICK: 'bg-red-50 text-[var(--up)] border-red-200',
  BUY: 'bg-red-50 text-[var(--up)] border-red-200',
}

/**
 * 등급 별칭 맵 (신 등급 → 해당하는 모든 등급 리스트)
 * 필터링 시 신 등급 선택 → 구 등급 데이터도 함께 매칭하기 위함.
 * 예: '강력 포착' 선택 → ['강력 포착', '적극매수'] 모두 매칭
 */
export const GRADE_ALIAS: Record<GradeNew, Grade[]> = {
  [GRADE_STRONG_PICK]: [GRADE_STRONG_PICK, GRADE_LEGACY_FORCE_BUY],
  [GRADE_PICK]: [GRADE_PICK, GRADE_LEGACY_BUY],
  [GRADE_WATCH]: [GRADE_WATCH, GRADE_LEGACY_WATCH_BUY],
  [GRADE_OBSERVE]: [GRADE_OBSERVE],
}
