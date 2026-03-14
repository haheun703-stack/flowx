// 한투 API access_token 발급 + 서버 메모리 캐싱
// 토큰은 24시간 유효 → 불필요한 재발급 방지

interface TokenCache {
  token: string
  expiresAt: number // timestamp
}

let tokenCache: TokenCache | null = null

export async function getKISToken(): Promise<string> {
  // 주말엔 API 호출 차단 (비용 절감)
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const day = kst.getUTCDay()
  if (day === 0 || day === 6) {
    throw new Error('KIS API 주말 비활성')
  }

  const now = Date.now()

  // 캐시된 토큰이 유효하면 재사용 (만료 1분 전 갱신)
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token
  }

  const res = await fetch('https://openapi.koreainvestment.com:9443/oauth2/tokenP', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: process.env.KIS_APP_KEY,
      appsecret: process.env.KIS_APP_SECRET,
    }),
  })

  if (!res.ok) throw new Error(`KIS 토큰 발급 실패: ${res.status}`)

  const json = await res.json()

  tokenCache = {
    token: json.access_token,
    expiresAt: now + (json.expires_in * 1000), // 초 → ms
  }

  return tokenCache.token
}
