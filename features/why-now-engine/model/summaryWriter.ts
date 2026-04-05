import { ScoreItem, SignalGrade } from '../types'

export function writeSummary(items: ScoreItem[], grade: SignalGrade): string {
  const hasStrongForeign = items.some(i => i.id === 'foreign_streak' && i.score >= 20)
  const hasInstitution   = items.some(i => i.category === 'institution' && i.score > 0)
  const hasAccum         = items.some(i => i.id === 'accum_pattern' || i.id === 'accum_mid')
  const hasDoubleBuy     = items.some(i => i.id === 'double_buy' || i.id === 'double_buy_mid')
  const hasSellSignal    = items.some(i => i.id === 'foreign_sell' || i.id === 'foreign_sell_mid' || i.id === 'individual_overbuy')
  const hasPanicReversal = items.some(i => i.id === 'panic_sell_reversal')

  // 패턴 조합에 따른 자연어 요약 생성
  if (hasPanicReversal) {
    return '개인이 공황 매도하는 동안 외국인·기관이 받아내고 있음. 역발상 관점에서 강한 매수 흐름 포착.'
  }
  if (hasDoubleBuy && hasAccum) {
    return '외국인·기관이 조용히 담는 동안 개인이 팔고 있는 전형적인 매집 구간. 스마트머니 방향으로 접근.'
  }
  if (hasStrongForeign && hasInstitution) {
    return '외국인·기관 양방향 수급이 집중되고 있음. 단기보다 중기 관점 포지션이 유효.'
  }
  if (hasStrongForeign) {
    return '외국인 지속 매수세가 핵심. 기관 동참 여부를 추가 확인 후 진입 고려.'
  }
  if (hasAccum) {
    return '개인 매도 + 기관 매수 역방향 패턴. 단기 낙폭이 오히려 진입 기회일 수 있음.'
  }
  if (hasSellSignal) {
    return '외국인 또는 개인 과열 신호 감지. 추격 매수보다 눌림목 대기 권장.'
  }
  if (grade === 'NEUTRAL') {
    return '뚜렷한 수급 방향성이 없음. 방향 확인 전까지 관망이 유리.'
  }
  if (grade === 'CAUTION') {
    return '부정적 수급 신호 다수 감지. 신규 진입보다 기존 포지션 점검이 우선.'
  }
  if (grade === 'AVOID') {
    return '외국인·기관 이탈 신호 강함. 포지션 축소 또는 관망이 안전.'
  }

  return '수급 데이터를 종합 분석 중입니다.'
}
