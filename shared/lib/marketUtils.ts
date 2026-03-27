/**
 * 장 중 여부 판단 (KST 기준 09:00 ~ 15:30)
 * 여러 feature에서 공통 사용
 */
export function isMarketOpen(): boolean {
  const now = new Date()
  // UTC → KST (+9시간)
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const hours = kst.getUTCHours()
  const minutes = kst.getUTCMinutes()
  const day = kst.getUTCDay() // 0=일, 6=토

  if (day === 0 || day === 6) return false // 주말 제외

  const timeInMin = hours * 60 + minutes
  return timeInMin >= 9 * 60 && timeInMin <= 15 * 60 + 30
}

/** 장중/장마감에 따라 React Query refetch 주기 조절 (매 cycle 재평가) */
export function getRefetchInterval(fastMs: number, slowMs: number) {
  return () => isMarketOpen() ? fastMs : slowMs
}
