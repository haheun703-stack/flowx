// 개별 채점 항목
export interface ScoreItem {
  id: string
  icon: '🟢' | '🟡' | '🔴' | '⚪'
  text: string
  score: number          // 양수: 가점 / 음수: 감점
  category: 'foreign' | 'institution' | 'individual' | 'pattern'
}

// 최종 판정 등급
export type SignalGrade =
  | 'STRONG_BUY'    // 80점 이상
  | 'BUY'           // 60~79점
  | 'NEUTRAL'       // 40~59점
  | 'CAUTION'       // 20~39점
  | 'AVOID'         // 20점 미만

// Why Now Engine 최종 출력
export interface WhyNowResult {
  grade: SignalGrade
  totalScore: number        // 0~100
  items: ScoreItem[]        // 채점 항목 목록
  summary: string           // 한 줄 요약 문장
  entryComment: string      // 진입 코멘트 ("단기 반등", "중기 포지션" 등)
}
