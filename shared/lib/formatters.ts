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
