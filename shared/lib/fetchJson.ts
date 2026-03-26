/**
 * fetch wrapper that throws on non-2xx responses (like axios did).
 * Drop-in replacement: `fetchJson<T>(url)` instead of `fetch(url).then(r => r.json())`
 */
export async function fetchJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`fetchJson ${res.status} ${res.statusText}`)
  return res.json()
}
