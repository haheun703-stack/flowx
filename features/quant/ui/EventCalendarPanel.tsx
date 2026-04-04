'use client'

import { useState, useMemo, useEffect } from 'react'

// ─── Row 4 좌: 이벤트 캘린더 미니 달력 (스펙 §7-5) ───
// 미니 월별 달력 + 날짜 클릭 → 디테일 카드 펼침

interface CalendarEvent {
  date: string          // YYYY-MM-DD
  name: string
  category: 'urgent' | 'important' | 'earnings' | 'dividend'
  description?: string
  historical_pattern?: string
  ai_strategy?: string
}

// ─── 이벤트 색상 ───
const CATEGORY_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  urgent:    { bg: '#DC2626', text: '#FFF', label: '긴급' },
  important: { bg: '#F59E0B', text: '#FFF', label: '중요' },
  earnings:  { bg: '#2563EB', text: '#FFF', label: '실적' },
  dividend:  { bg: '#16A34A', text: '#FFF', label: '배당/IPO' },
}

// ─── 폴백 이벤트 (API 실패 시) ───
const FALLBACK_EVENTS: CalendarEvent[] = [
  { date: '2026-04-07', name: '삼성전자 1Q 잠정실적', category: 'earnings', description: '삼성전자 2026 Q1 잠정실적 발표.' },
  { date: '2026-04-10', name: '금통위 + 미국 CPI', category: 'urgent', description: '한국은행 금융통화위원회 + 미국 CPI 동시 발표.' },
  { date: '2026-04-14', name: '미국 어닝시즌 + PPI', category: 'earnings', description: '미국 주요 기업 어닝시즌 시작 + PPI 발표.' },
]

// ─── 퀀트봇 데이터 → CalendarEvent 매핑 ───
const VALID_CATEGORIES = new Set(['urgent', 'important', 'earnings', 'dividend'])

function mapToCalendarEvent(raw: Record<string, unknown>): CalendarEvent | null {
  const date = String(raw.date ?? '')
  const name = String(raw.name ?? raw.event ?? raw.title ?? '')
  if (!date || !name) return null

  let category = String(raw.category ?? raw.type ?? 'important')
  if (!VALID_CATEGORIES.has(category)) category = 'important'

  return {
    date,
    name,
    category: category as CalendarEvent['category'],
    description: raw.description ? String(raw.description) : undefined,
    historical_pattern: raw.historical_pattern ? String(raw.historical_pattern) : undefined,
    ai_strategy: (raw.ai_strategy ?? raw.strategy) ? String(raw.ai_strategy ?? raw.strategy) : undefined,
  }
}

// ─── 유틸 ───

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  // 월=0, 화=1, ... 일=6
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function diffDays(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── 메인 ───

export default function EventCalendarPanel() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>(FALLBACK_EVENTS)

  // /api/scenarios에서 event_calendar 가져오기
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/scenarios', { signal: controller.signal })
        if (!res.ok) return
        const json = await res.json()
        const raw = json?.event_calendar
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: Record<string, unknown>) => mapToCalendarEvent(r)).filter(Boolean) as CalendarEvent[]
          if (mapped.length > 0) setEvents(mapped)
        }
      } catch {
        // 폴백 유지
      }
    }
    load()
    return () => controller.abort()
  }, [])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const today = getToday()

  // 이벤트 맵: date → events
  const eventMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [events])

  // 달력 그리드 데이터
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfWeek(year, month)

    // 이전 달 채우기
    const prevMonthDays = getDaysInMonth(year, month - 1)
    const days: { day: number; dateKey: string; isCurrentMonth: boolean }[] = []

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i
      const m = month === 0 ? 11 : month - 1
      const y = month === 0 ? year - 1 : year
      days.push({ day: d, dateKey: formatDateKey(y, m, d), isCurrentMonth: false })
    }

    // 현재 달
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, dateKey: formatDateKey(year, month, d), isCurrentMonth: true })
    }

    // 다음 달 채우기 (6주 = 42칸)
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1
      const y = month === 11 ? year + 1 : year
      days.push({ day: d, dateKey: formatDateKey(y, m, d), isCurrentMonth: false })
    }

    return days
  }, [year, month])

  // 선택된 날짜의 이벤트
  const selectedEvents = selectedDate ? (eventMap[selectedDate] ?? []) : []

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1))
    setSelectedDate(null)
  }
  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1))
    setSelectedDate(null)
  }
  function handleDateClick(dateKey: string) {
    if (eventMap[dateKey]) {
      setSelectedDate(selectedDate === dateKey ? null : dateKey)
    }
  }

  // 이벤트 날짜에서 가장 높은 우선순위 카테고리
  function getDateStyle(dateKey: string, isCurrentMonth: boolean) {
    const isToday = dateKey === today
    const evts = eventMap[dateKey]

    if (isToday && !evts) {
      return { bg: '#7C3AED', text: '#FFF', cursor: 'default', fontWeight: 700 }
    }

    if (evts && evts.length > 0) {
      // 우선순위: urgent > important > earnings > dividend
      const priority = ['urgent', 'important', 'earnings', 'dividend']
      const topCat = evts.reduce((best, ev) => {
        const idx = priority.indexOf(ev.category)
        const bestIdx = priority.indexOf(best)
        return idx < bestIdx ? ev.category : best
      }, evts[0].category)

      const cat = CATEGORY_COLOR[topCat]

      // 오늘이면서 이벤트도 있으면 이벤트 색상 우선 (보라 테두리)
      if (isToday) {
        return { bg: cat.bg, text: cat.text, cursor: 'pointer', fontWeight: 700, border: '2px solid #7C3AED' }
      }

      // D-5 이내면 배경 채움, 그 이상이면 점만
      const d = diffDays(dateKey)
      if (d <= 5 && d >= 0) {
        return { bg: cat.bg, text: cat.text, cursor: 'pointer', fontWeight: 600 }
      }
      // 먼 이벤트: 점만 (dot)
      return { bg: 'transparent', text: isCurrentMonth ? '#1A1A2E' : '#D1D5DB', cursor: 'pointer', fontWeight: 400, dotColor: cat.bg }
    }

    // 일반 날
    return {
      bg: 'transparent',
      text: isCurrentMonth ? '#1A1A2E' : '#D1D5DB',
      cursor: 'default',
      fontWeight: 400,
    }
  }

  const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm h-full flex flex-col">
      {/* 헤더: 월 네비게이션 */}
      <div className="px-4 py-3 border-b border-[var(--border)]/50 flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-[#1A1A2E]">이벤트 캘린더</h3>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="text-[#6B7280] hover:text-[#1A1A2E] text-sm font-bold cursor-pointer">◀</button>
          <span className="text-[15px] font-bold text-[#1A1A2E]">{year}년 {month + 1}월</span>
          <button onClick={nextMonth} className="text-[#6B7280] hover:text-[#1A1A2E] text-sm font-bold cursor-pointer">▶</button>
        </div>
      </div>

      <div className="p-3 flex-1">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-[2px] text-center mb-1">
          {WEEKDAYS.map((w, i) => (
            <span
              key={w}
              className="text-[11px] font-bold py-1"
              style={{ color: i >= 5 ? '#3B82F6' : '#6B7280' }}
            >
              {w}
            </span>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-[2px] text-center">
          {calendarDays.map(({ day, dateKey, isCurrentMonth }, idx) => {
            const style = getDateStyle(dateKey, isCurrentMonth)
            const isSelected = selectedDate === dateKey
            return (
              <div
                key={idx}
                className="relative py-1 rounded"
                style={{
                  backgroundColor: style.bg,
                  color: style.text,
                  fontWeight: style.fontWeight,
                  fontSize: '10px',
                  cursor: style.cursor,
                  border: (style as { border?: string }).border ?? (isSelected ? '2px solid #7C3AED' : '2px solid transparent'),
                  lineHeight: '18px',
                }}
                onClick={() => handleDateClick(dateKey)}
              >
                {day}
                {/* 이벤트 라벨 (D-5 이내 배경 채움일 때) */}
                {eventMap[dateKey] && style.bg !== 'transparent' && (
                  <div className="text-[9px] leading-none truncate px-0.5" style={{ color: style.text }}>
                    {eventMap[dateKey][0].name.length > 4 ? eventMap[dateKey][0].name.slice(0, 4) : eventMap[dateKey][0].name}
                  </div>
                )}
                {/* 먼 이벤트 점 */}
                {(style as { dotColor?: string }).dotColor && (
                  <div
                    className="absolute bottom-[1px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full"
                    style={{ backgroundColor: (style as { dotColor?: string }).dotColor }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* 범례 */}
        <div className="flex justify-center gap-3 mt-2">
          {Object.entries(CATEGORY_COLOR).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: val.bg }} />
              <span className="text-[8px] text-[#6B7280]">{val.label}</span>
            </span>
          ))}
        </div>

        {/* 선택된 날짜의 디테일 카드 */}
        {selectedEvents.length > 0 && (
          <div className="mt-3 space-y-2">
            {selectedEvents.map((ev) => {
              const cat = CATEGORY_COLOR[ev.category]
              const d = diffDays(ev.date)
              return (
                <div
                  key={ev.name}
                  className="rounded-r-lg p-2.5"
                  style={{
                    borderLeft: `3px solid ${cat.bg}`,
                    backgroundColor: '#FAFAF8',
                    transition: 'max-height 0.3s ease, opacity 0.3s ease',
                  }}
                >
                  {/* 이벤트명 + D-N */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-bold text-[#1A1A2E]">{ev.name}</span>
                    <span
                      className="text-[14px] font-bold"
                      style={{ color: d <= 3 ? '#DC2626' : d <= 7 ? '#D97706' : '#6B7280' }}
                    >
                      {d === 0 ? 'D-DAY' : d > 0 ? `D-${d}` : `D+${Math.abs(d)}`}
                    </span>
                  </div>
                  {/* 설명 */}
                  {ev.description && (
                    <p className="text-[12px] text-[#374151] mb-1 leading-relaxed">{ev.description}</p>
                  )}
                  {/* 역사적 패턴 */}
                  {ev.historical_pattern && (
                    <p className="text-[12px] text-[#6B7280] mb-1">{ev.historical_pattern}</p>
                  )}
                  {/* AI 전략 */}
                  {ev.ai_strategy && (
                    <p className="text-[12px] font-medium text-[#4C1D95] leading-relaxed">{ev.ai_strategy}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
