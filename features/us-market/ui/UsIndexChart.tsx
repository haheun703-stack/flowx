'use client'

import { useEffect, useRef, useState } from 'react'

/* ─── Types ─── */
interface HistoryRow {
  date: string
  sp500_close: number | null
  sp500_change: number | null
  nasdaq_close: number | null
  nasdaq_change: number | null
  dow_close: number | null
  dow_change: number | null
  soxx_close: number | null
  soxx_change: number | null
  vix: number | null
  fear_greed: number | null
  fear_greed_label: string | null
}

/* ─── Constants ─── */
const INDEX_LINES = [
  { key: 'sp500_close', label: 'S&P 500', color: '#3B82F6', width: 2.5 },
  { key: 'nasdaq_close', label: '나스닥', color: '#10B981', width: 2 },
  { key: 'dow_close', label: '다우', color: '#F59E0B', width: 2 },
  { key: 'soxx_close', label: 'SOXX', color: '#EF4444', width: 2 },
] as const

const FG_COLOR = (v: number) => {
  if (v <= 24) return '#DC2626'
  if (v <= 44) return '#F97316'
  if (v <= 55) return '#6B7280'
  if (v <= 74) return '#22C55E'
  return '#16A34A'
}

const FG_LABEL = (v: number) => {
  if (v <= 24) return '극도의 공포'
  if (v <= 44) return '공포'
  if (v <= 55) return '중립'
  if (v <= 74) return '탐욕'
  return '극도의 탐욕'
}

/* ─── SVG Multi-Line Chart ─── */
function MultiLineChart({ data }: { data: HistoryRow[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; idx: number } | null>(null)
  const [dims, setDims] = useState({ w: 800, h: 320 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const rect = entries[0].contentRect
      if (rect.width > 0) setDims({ w: rect.width, h: Math.min(Math.max(rect.width * 0.4, 250), 400) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (data.length < 2) return null

  const base = data[0]
  const pad = { top: 20, right: 16, bottom: 30, left: 50 }
  const cw = dims.w - pad.left - pad.right
  const ch = dims.h - pad.top - pad.bottom

  // Normalize each line to % change from base
  const lines = INDEX_LINES.map(line => {
    const baseVal = (base as unknown as Record<string, number | null>)[line.key]
    if (!baseVal) return { ...line, points: [] as { x: number; y: number; val: number; close: number }[] }
    return {
      ...line,
      points: data.map((d, i) => {
        const close = (d as unknown as Record<string, number | null>)[line.key] as number | null
        const val = close != null ? ((close - baseVal) / baseVal) * 100 : 0
        return { x: pad.left + (i / (data.length - 1)) * cw, y: 0, val, close: close ?? 0 }
      }),
    }
  })

  // Find y range
  const allVals = lines.flatMap(l => l.points.map(p => p.val))
  const minVal = Math.min(...allVals, 0) - 1
  const maxVal = Math.max(...allVals, 0) + 1
  const range = maxVal - minVal || 1

  // Set y positions
  for (const line of lines) {
    for (const p of line.points) {
      p.y = pad.top + ch - ((p.val - minVal) / range) * ch
    }
  }

  // X labels (5-7 evenly spaced)
  const labelCount = Math.min(data.length, 7)
  const labelStep = Math.floor((data.length - 1) / (labelCount - 1))
  const xLabels = Array.from({ length: labelCount }, (_, i) => {
    const idx = Math.min(i * labelStep, data.length - 1)
    return { idx, x: pad.left + (idx / (data.length - 1)) * cw, label: data[idx].date.slice(5) }
  })

  // Y grid lines
  const yStep = range > 10 ? 5 : range > 4 ? 2 : 1
  const yLines: number[] = []
  for (let v = Math.ceil(minVal / yStep) * yStep; v <= maxVal; v += yStep) {
    yLines.push(v)
  }

  function toPath(pts: { x: number; y: number }[]) {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  }

  const handleMouse = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left - pad.left
    const idx = Math.round((mx / cw) * (data.length - 1))
    if (idx >= 0 && idx < data.length) {
      setTooltip({ x: pad.left + (idx / (data.length - 1)) * cw, idx })
    }
  }

  const latest = data[data.length - 1]

  return (
    <div className="fx-card-green">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
        <span className="text-[16px] md:text-[18px] font-bold text-[#1A1A2E]">미국 시장 30일 추이</span>
        <span className="text-[12px] md:text-[13px] font-semibold text-[#B0ADA6]">
          {latest.date} 종가 기준 · 등락률(%) 정규화
        </span>
      </div>

      <div ref={containerRef} className="relative select-none" style={{ minHeight: 250 }}>
        <svg width={dims.w} height={dims.h} className="w-full"
          onMouseMove={handleMouse} onMouseLeave={() => setTooltip(null)}>
          {/* Y grid */}
          {yLines.map(v => {
            const y = pad.top + ch - ((v - minVal) / range) * ch
            return (
              <g key={v}>
                <line x1={pad.left} y1={y} x2={dims.w - pad.right} y2={y}
                  stroke={v === 0 ? '#1A1A2E' : '#E2E5EA'} strokeWidth={v === 0 ? 1 : 0.5}
                  strokeDasharray={v === 0 ? '' : '4 2'} />
                <text x={pad.left - 6} y={y + 3} textAnchor="end" fontSize="11" fontWeight="600"
                  fill={v === 0 ? '#1A1A2E' : '#9CA3AF'}>
                  {v >= 0 ? '+' : ''}{v.toFixed(0)}%
                </text>
              </g>
            )
          })}

          {/* X labels */}
          {xLabels.map(l => (
            <text key={l.idx} x={l.x} y={dims.h - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="#9CA3AF">
              {l.label}
            </text>
          ))}

          {/* Lines */}
          {lines.map(line => line.points.length >= 2 && (
            <path key={line.key} d={toPath(line.points)} fill="none"
              stroke={line.color} strokeWidth={line.width} strokeLinejoin="round" strokeLinecap="round" />
          ))}

          {/* Crosshair */}
          {tooltip && (
            <>
              <line x1={tooltip.x} y1={pad.top} x2={tooltip.x} y2={pad.top + ch}
                stroke="#1A1A2E" strokeWidth={0.5} strokeDasharray="3 2" />
              {lines.map(line => {
                const pt = line.points[tooltip.idx]
                return pt && (
                  <circle key={line.key} cx={pt.x} cy={pt.y} r={4}
                    fill={line.color} stroke="white" strokeWidth={2} />
                )
              })}
            </>
          )}
        </svg>

        {/* Tooltip box */}
        {tooltip && (() => {
          const d = data[tooltip.idx]
          const isRight = tooltip.x > dims.w / 2
          return (
            <div className="absolute top-2 z-10 bg-white/95 border border-[#E2E5EA] rounded-lg px-3 py-2 shadow text-[12px] pointer-events-none"
              style={{ left: isRight ? undefined : tooltip.x + 12, right: isRight ? dims.w - tooltip.x + 12 : undefined }}>
              <div className="font-bold text-[#1A1A2E] mb-1">{d.date}</div>
              {lines.map(line => {
                const pt = line.points[tooltip.idx]
                return pt && (
                  <div key={line.key} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: line.color }} />
                    <span className="text-[#6B7280]">{line.label}</span>
                    <span className="ml-auto tabular-nums font-bold" style={{ color: line.color }}>
                      {pt.val >= 0 ? '+' : ''}{pt.val.toFixed(2)}%
                    </span>
                    <span className="text-[#9CA3AF] tabular-nums">{pt.close.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 md:gap-5 mt-2">
        {lines.map(line => {
          const lastPt = line.points[line.points.length - 1]
          return (
            <div key={line.key} className="flex items-center gap-1.5">
              <span className="w-3 h-[3px] rounded-full" style={{ backgroundColor: line.color }} />
              <span className="text-[12px] font-bold text-[#6B7280]">{line.label}</span>
              {lastPt && (
                <span className="text-[12px] font-bold tabular-nums" style={{ color: line.color }}>
                  {lastPt.val >= 0 ? '+' : ''}{lastPt.val.toFixed(1)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── VIX + Fear&Greed Panel ─── */
function VixFearGreedPanel({ data }: { data: HistoryRow[] }) {
  if (data.length < 2) return null

  const latest = data[data.length - 1]
  const vix = latest.vix
  const fg = latest.fear_greed

  // VIX mini sparkline
  const vixValues = data.map(d => d.vix).filter((v): v is number => v != null)
  const vixMin = Math.min(...vixValues) - 2
  const vixMax = Math.max(...vixValues) + 2
  const vixRange = vixMax - vixMin || 1
  const sparkW = 200, sparkH = 50
  const vixPath = vixValues.map((v, i) => {
    const x = (i / (vixValues.length - 1)) * sparkW
    const y = sparkH - ((v - vixMin) / vixRange) * sparkH
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* VIX */}
      <div className="fx-card px-4 py-4">
        <div className="text-[14px] font-bold text-[#1A1A2E] mb-1">VIX 공포지수 추이</div>
        <div className="flex items-end gap-4">
          <div>
            <div className="text-[32px] font-bold tabular-nums" style={{
              color: vix == null ? '#888' : vix >= 30 ? '#DC2626' : vix >= 20 ? '#F97316' : '#16A34A'
            }}>
              {vix != null ? vix.toFixed(1) : '—'}
            </div>
            <div className="text-[12px] font-bold mt-0.5" style={{
              color: vix == null ? '#888' : vix >= 30 ? '#DC2626' : vix >= 20 ? '#F97316' : '#16A34A'
            }}>
              {vix == null ? '—' : vix >= 30 ? '패닉 구간' : vix >= 25 ? '주의 구간' : vix >= 20 ? '경계' : '안정'}
            </div>
          </div>
          {vixValues.length >= 2 && (
            <svg width={sparkW} height={sparkH} className="flex-1 max-w-[200px]">
              <path d={vixPath} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinejoin="round" />
              {/* 20 line */}
              <line x1={0} y1={sparkH - ((20 - vixMin) / vixRange) * sparkH}
                x2={sparkW} y2={sparkH - ((20 - vixMin) / vixRange) * sparkH}
                stroke="#E2E5EA" strokeWidth="0.5" strokeDasharray="3 2" />
            </svg>
          )}
        </div>
        <div className="h-2 bg-[#F0EDE8] rounded-full overflow-hidden mt-3">
          <div className="h-full rounded-full transition-all" style={{
            width: `${Math.min((vix ?? 0) / 50 * 100, 100)}%`,
            backgroundColor: vix == null ? '#888' : vix >= 30 ? '#DC2626' : vix >= 20 ? '#F97316' : '#16A34A',
          }} />
        </div>
        <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
          <span>안정 (0)</span><span>주의 (20)</span><span>패닉 (40+)</span>
        </div>
      </div>

      {/* Fear & Greed */}
      <div className="fx-card px-4 py-4">
        <div className="text-[14px] font-bold text-[#1A1A2E] mb-1">Fear & Greed Index</div>
        <div className="flex items-center gap-4">
          <div className="text-[40px] font-bold tabular-nums leading-none" style={{ color: fg != null ? FG_COLOR(fg) : '#888' }}>
            {fg ?? '—'}
          </div>
          <div>
            <div className="text-[16px] font-bold" style={{ color: fg != null ? FG_COLOR(fg) : '#888' }}>
              {fg != null ? FG_LABEL(fg) : '—'}
            </div>
            <div className="text-[11px] text-[#9CA3AF] mt-0.5">
              {latest.fear_greed_label ?? ''}
            </div>
          </div>
        </div>
        {/* Gauge bar */}
        <div className="mt-3 relative">
          <div className="h-3 rounded-full overflow-hidden flex">
            <div className="flex-1 bg-[#DC2626]" />
            <div className="flex-1 bg-[#F97316]" />
            <div className="flex-1 bg-[#6B7280]" />
            <div className="flex-1 bg-[#22C55E]" />
            <div className="flex-1 bg-[#16A34A]" />
          </div>
          {fg != null && (
            <div className="absolute top-[-4px] transition-all" style={{ left: `${fg}%` }}>
              <div className="w-[3px] h-5 bg-[#1A1A2E] rounded-full" />
            </div>
          )}
        </div>
        <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
          <span>극도의 공포</span><span>공포</span><span>중립</span><span>탐욕</span><span>극도의 탐욕</span>
        </div>
        <div className="text-[11px] text-[#6B7280] mt-2">
          {fg == null ? '' : fg <= 25 ? '저가매수 기회일 수 있어요' : fg >= 75 ? '과열 — 차익실현 타이밍' : '수급 보고 판단'}
        </div>
      </div>
    </div>
  )
}

/* ─── 6 Summary Cards ─── */
function SummaryCards({ data }: { data: HistoryRow }) {
  const changeColor = (v: number | null) => v == null ? '#888' : v > 0 ? '#D62728' : v < 0 ? '#1565C0' : '#888'
  const changeStr = (v: number | null) => v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
  const f = (v: number | null) => v == null ? '—' : v.toLocaleString('en-US', { maximumFractionDigits: v >= 100 ? 0 : 2 })

  const cards = [
    { name: 'S&P 500', value: f(data.sp500_close), change: data.sp500_change, color: changeColor(data.sp500_change) },
    { name: '나스닥', value: f(data.nasdaq_close), change: data.nasdaq_change, color: changeColor(data.nasdaq_change) },
    { name: '다우', value: f(data.dow_close), change: data.dow_change, color: changeColor(data.dow_change) },
    { name: 'SOXX', value: f(data.soxx_close), change: data.soxx_change, color: changeColor(data.soxx_change) },
    {
      name: 'VIX',
      value: data.vix != null ? data.vix.toFixed(1) : '—',
      change: null,
      color: data.vix == null ? '#888' : data.vix >= 30 ? '#DC2626' : data.vix >= 20 ? '#F97316' : '#16A34A',
      sub: data.vix == null ? '' : data.vix >= 30 ? '패닉 구간' : data.vix >= 20 ? '주의' : '안정',
    },
    {
      name: 'Fear&Greed',
      value: data.fear_greed != null ? String(data.fear_greed) : '—',
      change: null,
      color: data.fear_greed != null ? FG_COLOR(data.fear_greed) : '#888',
      sub: data.fear_greed != null ? FG_LABEL(data.fear_greed) : '',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
      {cards.map(card => (
        <div key={card.name} className="bg-[#F5F4F0] rounded-lg p-3 text-center">
          <div className="text-[12px] font-bold text-[#9CA3AF] mb-1">{card.name}</div>
          <div className="text-[20px] md:text-[24px] font-bold tabular-nums leading-none" style={{ color: card.color }}>
            {card.change != null ? changeStr(card.change) : card.value}
          </div>
          {card.change != null && (
            <div className="text-[13px] font-bold text-[#1A1A2E] mt-0.5 tabular-nums">{card.value}</div>
          )}
          {'sub' in card && card.sub && (
            <div className="text-[11px] font-bold mt-0.5" style={{ color: card.color }}>{card.sub}</div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Export ─── */
export { MultiLineChart as UsMultiLineChart, VixFearGreedPanel, SummaryCards as UsSummaryCards }
export type { HistoryRow }
