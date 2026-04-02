'use client'

// ─── Row 5 좌: 이벤트 캘린더 (스펙 §8, 플레이스홀더) ───

const STATIC_EVENTS = [
  { name: 'FOMC 회의', date: '2026-04-15', dDay: 13, impact: 'high' as const },
  { name: 'CPI 발표', date: '2026-04-10', dDay: 8, impact: 'high' as const },
  { name: '실업률 발표', date: '2026-04-04', dDay: 2, impact: 'medium' as const },
  { name: 'PCE 물가', date: '2026-04-25', dDay: 23, impact: 'medium' as const },
  { name: '한국은행 금리', date: '2026-04-17', dDay: 15, impact: 'high' as const },
]

function dDayColor(d: number): { bg: string; text: string } {
  if (d <= 3) return { bg: '#FEF2F2', text: '#DC2626' }
  if (d <= 7) return { bg: '#FFFBEB', text: '#D97706' }
  return { bg: '#F3F4F6', text: '#6B7280' }
}

function impactDot(impact: 'high' | 'medium' | 'low'): string {
  if (impact === 'high') return '#DC2626'
  if (impact === 'medium') return '#D97706'
  return '#9CA3AF'
}

export default function EventCalendarPanel() {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm h-full">
      <div className="px-4 py-3 border-b border-[var(--border)]/50">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)]">이벤트 캘린더</h3>
      </div>

      <div className="p-4 space-y-2">
        {STATIC_EVENTS.map((ev) => {
          const dc = dDayColor(ev.dDay)
          return (
            <div key={ev.name} className="flex items-center gap-3">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 w-[48px] text-center"
                style={{ backgroundColor: dc.bg, color: dc.text }}
              >
                D-{ev.dDay}
              </span>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: impactDot(ev.impact) }}
              />
              <span className="text-xs font-medium text-[var(--text-primary)] flex-1 truncate">
                {ev.name}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] shrink-0">{ev.date}</span>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-2 border-t border-[var(--border)]/50">
        <p className="text-[9px] text-[var(--text-muted)] text-center">
          이벤트 데이터는 매주 자동 업데이트됩니다
        </p>
      </div>
    </div>
  )
}
