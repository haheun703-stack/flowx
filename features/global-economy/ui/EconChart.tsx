'use client'

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'

/* ── 시리즈 타입 ── */
export interface ChartSeries {
  id: string
  name: string
  unit: string
  color: string
  history: { d: string; v: number }[]
  current: { value: number; date: string; change: number | null } | null
}

interface EconChartProps {
  series: ChartSeries[]
  height?: number
  refLine?: { y: number; label: string; color: string }
}

/* ── 데이터 머지 (시리즈별 history → recharts용 row 배열) ── */
function mergeData(series: ChartSeries[]) {
  const dateMap = new Map<string, Record<string, number>>()
  for (const s of series) {
    for (const pt of s.history) {
      const row = dateMap.get(pt.d) ?? {}
      row[s.id] = pt.v
      dateMap.set(pt.d, row)
    }
  }
  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }))
}

/* ── 툴팁 포맷 ── */
function fmtTooltipValue(value: number, unit: string): string {
  if (unit === '원') return value.toLocaleString('ko-KR', { maximumFractionDigits: 0 }) + '원'
  if (unit === '조$') return (value / 1_000_000).toFixed(2) + '조$'
  if (unit === '십억$') return (value / 1_000).toFixed(0) + '십억$'
  if (unit === '천명' || unit === '천건' || unit === '천호') return Math.round(value).toLocaleString() + unit
  if (unit === '$/bbl') return '$' + value.toFixed(2)
  return value.toFixed(2) + (unit ? unit : '')
}

/* ── 커스텀 툴팁 ── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E8E6E0] rounded-lg shadow-lg p-3 text-xs">
      <p className="font-bold text-[#1A1A2E] mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold text-[#1A1A2E]">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function EconLineChart({ series, height = 280, refLine }: EconChartProps) {
  const data = mergeData(series)
  if (data.length === 0) return <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">데이터 없음</div>

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          interval={Math.max(0, Math.floor(data.length / 8) - 1)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
          width={50}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        {refLine && (
          <ReferenceLine
            y={refLine.y}
            stroke={refLine.color}
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{ value: refLine.label, position: 'right', fontSize: 10, fill: refLine.color }}
          />
        )}
        {series.map(s => (
          <Line
            key={s.id}
            type="monotone"
            dataKey={s.id}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ── 수익률 곡선 차트 ── */
interface YieldPoint { maturity: string; value: number | null; date?: string | null }
interface YieldCurveProps {
  current: YieldPoint[]
  yearAgo: YieldPoint[]
}

export function YieldCurveChart({ current, yearAgo }: YieldCurveProps) {
  const data = current.map((c, i) => ({
    maturity: c.maturity,
    현재: c.value,
    '1년전': yearAgo[i]?.value ?? null,
  }))

  const currentDate = current.find(c => c.date)?.date ?? ''

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-gray-500">현재 ({currentDate}) vs 1년전</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="maturity" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={40} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="현재" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb' }} />
          <Line type="monotone" dataKey="1년전" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 2, fill: '#9CA3AF' }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
