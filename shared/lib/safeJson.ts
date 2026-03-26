/**
 * Supabase jsonb 필드 → JSX-safe 변환 유틸.
 *
 * jsonb 배열/객체가 React child로 직접 렌더링되면 crash (React error #31).
 * API 라우트에서 반드시 이 유틸로 정리 후 클라이언트에 전달할 것.
 */

/** jsonb 배열 → string[] 보장 (객체면 지정 키 추출, 아니면 String()) */
export function safeStringArray(arr: unknown, key?: string): string[] {
  if (!Array.isArray(arr)) return []
  return arr.map(item => {
    if (typeof item === 'string') return item
    if (typeof item === 'number') return String(item)
    if (item && typeof item === 'object' && key && key in item) {
      return String((item as Record<string, unknown>)[key] ?? '')
    }
    if (item && typeof item === 'object') {
      // 첫 번째 string 값을 추출
      const vals = Object.values(item as Record<string, unknown>)
      const str = vals.find(v => typeof v === 'string')
      return str ? String(str) : JSON.stringify(item)
    }
    return String(item ?? '')
  })
}

/** jsonb 값 → string 보장 (객체면 지정 키 추출) */
export function safeString(val: unknown, key?: string): string {
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  if (val && typeof val === 'object' && key && key in val) {
    return String((val as Record<string, unknown>)[key] ?? '')
  }
  return String(val ?? '')
}
