/**
 * FlowX 디자인 시스템 — 카드/그리드/컨테이너 공통 상수
 *
 * 카드 3사이즈:
 *   L = 히어로/강조 (p-8, rounded-2xl, min-h-[160px])
 *   M = 기본 패널   (p-6, rounded-xl, min-h-[280px])
 *   S = 그리드 아이템 (p-5, rounded-xl, min-h-[200px])
 *
 * 패널 내부에 header(border-b) 있는 경우:
 *   CARD_INNER 사용 (패딩 없음, 패널이 자체 패딩 관리)
 */

/** 패딩 포함 — 자체 컨텐츠만 있는 카드 */
export const CARD = {
  L: 'bg-gray-900 rounded-2xl p-8 min-h-[160px]',
  M: 'bg-gray-900 rounded-xl p-6 min-h-[280px]',
  S: 'bg-gray-900 rounded-xl p-5 min-h-[200px]',
} as const

/** 패딩 없음 — header border-b가 있는 패널용 */
export const CARD_INNER = {
  L: 'bg-gray-900 rounded-2xl overflow-hidden min-h-[160px]',
  M: 'bg-gray-900 rounded-xl overflow-hidden min-h-[280px]',
  S: 'bg-gray-900 rounded-xl overflow-hidden min-h-[200px]',
} as const

/** 그리드 패턴 */
export const GRID = {
  col2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  col3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
} as const

/** 페이지 컨테이너 */
export const CONTAINER = 'max-w-[1400px] mx-auto px-6' as const

/** 페이지 공통 wrapper */
export const PAGE = 'min-h-screen bg-[#080b10] text-gray-200 pb-8' as const

/** 페이지 헤더 */
export const PAGE_HEADER = 'px-6 py-4 border-b border-gray-800' as const
