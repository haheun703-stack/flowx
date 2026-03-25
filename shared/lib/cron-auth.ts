// Vercel Cron 인증 공통 유틸
// Bearer $CRON_SECRET 헤더 검증

export function verifyCronAuth(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

/** KST 기준 오늘 날짜 (YYYY-MM-DD) */
export function todayKST(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

/** KST 기준 오늘 날짜 (YYYYMMDD) — DART API 용 */
export function todayKSTCompact(): string {
  return todayKST().replace(/-/g, '')
}
