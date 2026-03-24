// 인메모리 Rate Limiter (Vercel Serverless 환경)
// 각 함수 인스턴스 내에서만 유효 — 완벽하지는 않지만 기본 방어

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// 오래된 엔트리 정리 (메모리 누수 방지)
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return // 1분에 한 번만
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}

/**
 * Rate limit 체크.
 * @returns null이면 통과, { retryAfter } 반환 시 차단
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { retryAfter: number } | null {
  cleanup()

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  entry.count++

  if (entry.count > limit) {
    return { retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  return null
}

/**
 * IP 추출 (Vercel 환경)
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
