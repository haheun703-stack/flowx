export function formatSupplyVolume(value: number): string {
  const abs = Math.abs(value)
  const sign = value >= 0 ? '+' : '-'
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1)}만`
  return `${sign}${abs.toLocaleString()}`
}

export function formatKRXDate(raw: string): string {
  if (raw.includes('-') || raw.includes('/')) return raw.replace(/\//g, '-')
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

/** 시가총액 포맷: 억 → 조 변환 */
export function fmtCap(cap: number): string {
  if (cap >= 10000) return `${(cap / 10000).toFixed(1)}조`
  return `${cap.toLocaleString()}억`
}
