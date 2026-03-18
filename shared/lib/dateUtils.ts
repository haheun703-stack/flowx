/** 상대 시간 표시: '오늘', '어제', 'N일 전' */
export function getRelativeDate(dateStr: string): { label: string; daysAgo: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'))
  const diff = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return { label: '오늘', daysAgo: 0 }
  if (diff === 1) return { label: '어제', daysAgo: 1 }
  return { label: `${diff}일 전`, daysAgo: diff }
}

/** 7일 이상이면 stale */
export function isStaleDate(dateStr: string): boolean {
  return getRelativeDate(dateStr).daysAgo >= 7
}
