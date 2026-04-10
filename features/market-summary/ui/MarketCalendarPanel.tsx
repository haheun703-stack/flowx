'use client'

import { useState, useEffect, useMemo } from 'react'

/* ─── Types ─── */
interface CalEvent {
  id: number
  event_date: string
  event_type: string
  market: string
  title: string
  description: string
  importance: string
  ticker: string | null
}

/* ─── Config ─── */
const TYPE_CFG: Record<string, { icon: string; color: string; dot: string; label: string }> = {
  earnings:       { icon: '📊', color: '#2563EB', dot: '#2563EB', label: '실적 발표' },
  options_expiry: { icon: '⚠️', color: '#DC2626', dot: '#DC2626', label: '옵션 만기' },
  central_bank:   { icon: '🏦', color: '#7C3AED', dot: '#7C3AED', label: '중앙은행' },
  economic:       { icon: '📈', color: '#D97706', dot: '#D97706', label: '경제지표' },
  holiday:        { icon: '🔴', color: '#9CA3AF', dot: '#9CA3AF', label: '휴장' },
  ipo:            { icon: '🆕', color: '#16A34A', dot: '#16A34A', label: 'IPO' },
  dividend:       { icon: '💰', color: '#0891B2', dot: '#0891B2', label: '배당' },
  etc:            { icon: '📌', color: '#6B7280', dot: '#6B7280', label: '기타' },
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function cfg(type: string) {
  return TYPE_CFG[type] ?? TYPE_CFG.etc
}

function kstToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

/* ─── Component ─── */
export default function MarketCalendarPanel() {
  const today = kstToday()
  const [yearMonth, setYearMonth] = useState(today.slice(0, 7)) // YYYY-MM
  const [events, setEvents] = useState<CalEvent[]>([])
  const [upcoming, setUpcoming] = useState<CalEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    fetch(`/api/market/calendar?month=${yearMonth}&market=KR`, { signal: ac.signal })
      .then(r => r.json())
      .then(j => {
        setEvents(j.events ?? [])
        setUpcoming(j.upcoming ?? [])
        setLoading(false)
      })
      .catch(e => { if (e.name !== 'AbortError') setLoading(false) })
    return () => ac.abort()
  }, [yearMonth])

  /* 날짜별 이벤트 맵 */
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {}
    for (const ev of events) {
      const d = ev.event_date
      if (!map[d]) map[d] = []
      map[d].push(ev)
    }
    return map
  }, [events])

  /* 선택된 날짜의 이벤트 */
  const selectedEvents = eventsByDate[selectedDate] ?? []

  /* 캘린더 그리드 계산 */
  const [year, month] = yearMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  /* 월 이동 */
  function moveMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1)
    setYearMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  if (loading) {
    return <div className="fx-card animate-pulse h-80" />
  }

  return (
    <div className="fx-card">
      <span className="fx-card-title">시장 이벤트 캘린더</span>

      <div className="flex gap-4 mt-3" style={{ minHeight: 340 }}>
        {/* ── 왼쪽: 캘린더 ── */}
        <div className="flex-1 min-w-0">
          {/* 월 네비 */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => moveMonth(-1)} className="text-[#6B7280] hover:text-[#1A1A2E] font-bold px-2">
              ‹
            </button>
            <span className="text-[16px] font-bold text-[#1A1A2E]">
              {year}년 {month}월
            </span>
            <button onClick={() => moveMonth(1)} className="text-[#6B7280] hover:text-[#1A1A2E] font-bold px-2">
              ›
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center text-[12px] font-bold text-[#9CA3AF] mb-1">
            {WEEKDAYS.map(w => <div key={w}>{w}</div>)}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-[2px]">
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`
              const dayEvents = eventsByDate[dateStr] ?? []
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              const hasHigh = dayEvents.some(e => e.importance === 'high')

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative flex flex-col items-center py-1.5 rounded-lg text-[14px] font-semibold transition-colors
                    ${isSelected ? 'bg-[#00FF88] text-[#1A1A2E]' : isToday ? 'bg-[#F0FDF4] text-[#1A1A2E]' : 'text-[#1A1A2E] hover:bg-[#F5F4F0]'}
                  `}
                >
                  <span>{day}</span>
                  {/* 이벤트 점 */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-[2px] mt-0.5">
                      {dayEvents.slice(0, 3).map((ev, j) => (
                        <span
                          key={j}
                          className="w-[5px] h-[5px] rounded-full"
                          style={{ backgroundColor: hasHigh && j === 0 ? '#DC2626' : cfg(ev.event_type).dot }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* 선택일 디테일 */}
          <div className="mt-3 border-t border-[#E8E6E0] pt-3">
            <p className="text-[13px] font-bold text-[#6B7280] mb-2">
              {selectedDate.slice(5).replace('-', '/')} ({WEEKDAYS[new Date(selectedDate).getDay()]})
            </p>
            {selectedEvents.length === 0 ? (
              <p className="text-[13px] text-[#9CA3AF]">이벤트 없음</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map(ev => {
                  const c = cfg(ev.event_type)
                  return (
                    <div key={ev.id} className="flex items-start gap-2">
                      <span className="text-[14px]">{c.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-bold ${ev.importance === 'high' ? 'text-[#1A1A2E]' : 'text-[#6B7280]'}`}>
                          {ev.title}
                          {ev.ticker && <span className="text-[11px] text-[#9CA3AF] ml-1">{ev.ticker}</span>}
                        </p>
                        {ev.description && (
                          <p className="text-[12px] text-[#9CA3AF] truncate">{ev.description}</p>
                        )}
                      </div>
                      <span
                        className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto"
                        style={{ backgroundColor: `${c.color}15`, color: c.color }}
                      >
                        {c.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── 오른쪽: 향후 이벤트 리스트 ── */}
        <div className="w-[300px] shrink-0 border-l border-[#E8E6E0] pl-4 overflow-y-auto">
          <p className="text-[14px] font-bold text-[#1A1A2E] mb-3">향후 이벤트</p>
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF]">예정된 이벤트 없음</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(ev => {
                const c = cfg(ev.event_type)
                const d = new Date(ev.event_date)
                const dayLabel = `${String(d.getMonth() + 1)}/${String(d.getDate())} (${WEEKDAYS[d.getDay()]})`
                return (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setSelectedDate(ev.event_date)
                      setYearMonth(ev.event_date.slice(0, 7))
                    }}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-[6px] h-[6px] rounded-full shrink-0"
                        style={{ backgroundColor: c.dot }}
                      />
                      <span className="text-[12px] font-bold text-[#9CA3AF] tabular-nums">{dayLabel}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${c.color}15`, color: c.color }}
                      >
                        {c.label}
                      </span>
                    </div>
                    <p className={`text-[13px] mt-0.5 ml-[14px] group-hover:text-[#1A1A2E] transition-colors ${ev.importance === 'high' ? 'font-bold text-[#1A1A2E]' : 'text-[#6B7280]'}`}>
                      {c.icon} {ev.title}
                    </p>
                    {ev.description && (
                      <p className="text-[11px] text-[#9CA3AF] ml-[14px] truncate">{ev.description}</p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
