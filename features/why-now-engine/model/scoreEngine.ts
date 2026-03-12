import { SupplyData } from '@/entities/stock/types'
import { ScoreItem, SignalGrade, WhyNowResult } from '../types'
import { writeSummary } from './summaryWriter'

export function runWhyNowEngine(data: SupplyData[]): WhyNowResult {
  if (!data || data.length < 5) {
    return {
      grade: 'NEUTRAL',
      totalScore: 50,
      items: [],
      summary: '데이터가 부족합니다.',
      entryComment: '',
    }
  }

  const items: ScoreItem[] = []

  const recent3  = data.slice(-3)
  const recent5  = data.slice(-5)
  const recent10 = data.slice(-10)
  const recent20 = data.slice(-20)

  // ─────────────────────────────────────────
  // 외국인 채점 (최대 +45pt)
  // ─────────────────────────────────────────

  // 외국인 연속 순매수 (일수 × 5pt, 최대 +25pt)
  const foreignStreak = getConsecutiveDays(data, 'foreign', 'buy')
  if (foreignStreak >= 2) {
    const pt = Math.min(foreignStreak * 5, 25)
    items.push({
      id: 'foreign_streak',
      icon: '🟢',
      text: `외국인 ${foreignStreak}일 연속 순매수`,
      score: pt,
      category: 'foreign',
    })
  }

  // 외국인 20일 대규모 누적 순매수
  const foreignNet20 = sumField(recent20, 'foreign')
  if (foreignNet20 > 1000000) {
    items.push({ id: 'foreign_big20', icon: '🟢', text: `외국인 20일 누적 ${fmt(foreignNet20)}주 대규모 순매수`, score: 20, category: 'foreign' })
  } else if (foreignNet20 > 300000) {
    items.push({ id: 'foreign_mid20', icon: '🟡', text: `외국인 20일 누적 ${fmt(foreignNet20)}주 순매수`, score: 10, category: 'foreign' })
  }

  // 외국인 연속 순매도 (페널티)
  const foreignSellStreak = getConsecutiveDays(data, 'foreign', 'sell')
  if (foreignSellStreak >= 5) {
    items.push({ id: 'foreign_sell', icon: '🔴', text: `외국인 ${foreignSellStreak}일 연속 순매도 — 이탈 신호`, score: -20, category: 'foreign' })
  } else if (foreignSellStreak >= 3) {
    items.push({ id: 'foreign_sell_mid', icon: '🔴', text: `외국인 ${foreignSellStreak}일 연속 순매도`, score: -10, category: 'foreign' })
  }

  // ─────────────────────────────────────────
  // 기관 채점 (최대 +30pt)
  // ─────────────────────────────────────────

  // 기관 20일 누적 전환 (마이너스→플러스)
  const institutionNet20 = sumField(recent20, 'institution')
  const institutionNet10 = sumField(recent10, 'institution')
  if (institutionNet20 > 0 && institutionNet10 > 0) {
    items.push({ id: 'institution_turn', icon: '🟢', text: `기관 10·20일 누적 순매수 유지 — 포지션 구축 중`, score: 15, category: 'institution' })
  } else if (institutionNet10 > 0) {
    items.push({ id: 'institution_recent', icon: '🟡', text: `기관 최근 10일 순매수 전환`, score: 8, category: 'institution' })
  }

  // 기관 연속 순매수
  const institutionStreak = getConsecutiveDays(data, 'institution', 'buy')
  if (institutionStreak >= 3) {
    items.push({ id: 'institution_streak', icon: '🟢', text: `기관 ${institutionStreak}일 연속 순매수`, score: 15, category: 'institution' })
  }

  // ─────────────────────────────────────────
  // 패턴 채점 (복합 패턴, 최대 +25pt)
  // ─────────────────────────────────────────

  // 쌍끌이 패턴: 외국인+기관 동시 순매수
  const doubleBuyDays = recent5.filter(d => d.foreign > 0 && d.institution > 0).length
  if (doubleBuyDays >= 4) {
    items.push({ id: 'double_buy', icon: '🟢', text: `외국인·기관 동시 순매수 ${doubleBuyDays}일 — 쌍끌이 패턴`, score: 20, category: 'pattern' })
  } else if (doubleBuyDays >= 2) {
    items.push({ id: 'double_buy_mid', icon: '🟡', text: `외국인·기관 동시 순매수 ${doubleBuyDays}일`, score: 10, category: 'pattern' })
  }

  // 매집 패턴: 개인 매도 + 기관 매수
  const accumDays = recent5.filter(d => d.individual < 0 && d.institution > 0).length
  if (accumDays >= 4) {
    items.push({ id: 'accum_pattern', icon: '🟢', text: `개인 매도·기관 매수 역방향 ${accumDays}일 — 스마트머니 매집`, score: 20, category: 'pattern' })
  } else if (accumDays >= 3) {
    items.push({ id: 'accum_mid', icon: '🟡', text: `개인 매도·기관 매수 역방향 ${accumDays}일`, score: 10, category: 'pattern' })
  }

  // 개인 과매수 경고: 개인만 사고 기관·외국인 다 팔 때
  const individualOverbuyDays = recent5.filter(d => d.individual > 0 && d.foreign < 0 && d.institution < 0).length
  if (individualOverbuyDays >= 3) {
    items.push({ id: 'individual_overbuy', icon: '🔴', text: `개인만 순매수·외인·기관 매도 ${individualOverbuyDays}일 — 과열 주의`, score: -15, category: 'individual' })
  }

  // 개인 패닉셀: 개인이 팔고 외국인·기관이 살 때 (역발상 강세 신호)
  const panicSellDays = recent3.filter(d => d.individual < 0 && d.foreign > 0 && d.institution > 0).length
  if (panicSellDays >= 2) {
    items.push({ id: 'panic_sell_reversal', icon: '🟢', text: `개인 패닉셀 + 외인·기관 동반 매수 ${panicSellDays}일 — 역발상 강세`, score: 25, category: 'pattern' })
  }

  // ─────────────────────────────────────────
  // 점수 합산 (0~100 클램핑)
  // ─────────────────────────────────────────
  const rawScore = items.reduce((sum, item) => sum + item.score, 50) // 기준점 50
  const totalScore = Math.max(0, Math.min(100, rawScore))
  const grade = getGrade(totalScore)

  return {
    grade,
    totalScore,
    items: items.sort((a, b) => b.score - a.score), // 높은 점수 먼저
    summary: writeSummary(items, grade),
    entryComment: getEntryComment(grade, items),
  }
}

// ─────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────

function getConsecutiveDays(
  data: SupplyData[],
  field: keyof Pick<SupplyData, 'foreign' | 'institution' | 'individual'>,
  direction: 'buy' | 'sell'
): number {
  let count = 0
  for (let i = data.length - 1; i >= 0; i--) {
    const val = data[i][field]
    if (direction === 'buy' ? val > 0 : val < 0) count++
    else break
  }
  return count
}

function sumField(
  data: SupplyData[],
  field: keyof Pick<SupplyData, 'foreign' | 'institution' | 'individual'>
): number {
  return data.reduce((s, d) => s + d[field], 0)
}

function fmt(val: number): string {
  const abs = Math.abs(val)
  if (abs >= 10000) return `${(abs / 10000).toFixed(0)}만`
  return abs.toLocaleString()
}

function getGrade(score: number): SignalGrade {
  if (score >= 80) return 'STRONG_BUY'
  if (score >= 60) return 'BUY'
  if (score >= 40) return 'NEUTRAL'
  if (score >= 20) return 'CAUTION'
  return 'AVOID'
}

function getEntryComment(grade: SignalGrade, items: ScoreItem[]): string {
  const hasLongPattern = items.some(i => ['double_buy', 'accum_pattern', 'foreign_big20'].includes(i.id))

  if (grade === 'STRONG_BUY') return hasLongPattern ? '중기 포지션 접근 권장' : '단기 + 중기 모두 유효'
  if (grade === 'BUY') return '단기 반등 포지션 적합'
  if (grade === 'NEUTRAL') return '관망 또는 소량 분할 접근'
  if (grade === 'CAUTION') return '신규 진입 보류 권장'
  return '포지션 축소 or 관망'
}
