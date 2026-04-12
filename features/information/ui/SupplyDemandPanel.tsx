'use client'

import { useInformationSupplyDemand, useInformationSupplyDemandHistory, type SupplyDemandData } from '../api/useInformation'
import { getRelativeDate } from '@/shared/lib/dateUtils'
import { GRADE_LEGACY_BUY, GRADE_CAUTION } from '@/shared/constants/grades'
import {
  XAxis, YAxis, CartesianGrid,
  ReferenceLine, ResponsiveContainer,
  LineChart, Line, Tooltip, Legend,
} from 'recharts'

function formatKrNumber(v: number): string {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  if (abs >= 1_0000_0000) return `${sign}${(abs / 1_0000_0000).toFixed(1)}조`
  if (abs >= 1_0000) return `${sign}${Math.round(abs / 1_0000).toLocaleString()}억`
  return `${sign}${abs.toLocaleString()}`
}

// ════════════════════════════════════════════════════════
// 좌측: 일별 수급흐름 (당일 수평 바차트 + 섹터별)
// ════════════════════════════════════════════════════════

function DailySupplyFlow({ data }: { data: SupplyDemandData }) {
  const items = [
    { label: '외국인', value: data.foreign_net, streak: data.foreign_streak, posColor: '#EF4444', negColor: '#3B82F6' },
    { label: '기관', value: data.inst_net, streak: data.inst_streak, posColor: '#8B5CF6', negColor: '#6366F1' },
    { label: '개인', value: data.individual_net, streak: 0, posColor: '#10B981', negColor: '#059669' },
  ]
  const maxAbs = Math.max(...items.map(i => Math.abs(i.value)), 1)

  // sector_flows top 5
  const sectorFlows = (data.sector_flows ?? [])
    .sort((a, b) => Math.abs(b.foreign_net ?? b.net ?? 0) - Math.abs(a.foreign_net ?? a.net ?? 0))
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="text-sm text-[var(--text-dim)] font-bold">📊 일별 수급흐름</div>

      {/* 수평 바 3행 */}
      <div className="space-y-3">
        {items.map(item => {
          const pct = (Math.abs(item.value) / maxAbs) * 100
          const isPositive = item.value >= 0
          const color = isPositive ? item.posColor : item.negColor
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[var(--text-primary)]">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.streak !== 0 && (
                    <span className={`text-[10px] font-bold ${item.streak > 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      {item.streak > 0 ? GRADE_LEGACY_BUY : GRADE_CAUTION} {Math.abs(item.streak)}일째
                    </span>
                  )}
                  <span className="text-sm font-black tabular-nums" style={{ color }}>
                    {formatKrNumber(item.value)}
                  </span>
                </div>
              </div>
              <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isPositive ? '' : 'ml-auto'}`}
                  style={{
                    width: `${Math.max(pct, 3)}%`,
                    backgroundColor: color,
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* 섹터별 외국인 순매수 TOP 5 */}
      {sectorFlows.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--text-dim)] font-bold mb-2">섹터별 외국인 순매수</div>
          <div className="space-y-1">
            {sectorFlows.map(sf => {
              const net = sf.foreign_net ?? sf.net ?? 0
              const isBuy = net >= 0
              return (
                <div key={sf.sector} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-primary)]">{sf.sector}</span>
                  <span className={`font-bold tabular-nums ${isBuy ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {isBuy ? '▲' : '▼'} {formatKrNumber(net)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 트렌드 텍스트 */}
      {(data.foreign_trend || data.inst_trend) && (
        <div className="mt-2 space-y-1">
          {data.foreign_trend && (
            <div className="text-[11px] text-[var(--text-dim)]">외국인: {data.foreign_trend}</div>
          )}
          {data.inst_trend && (
            <div className="text-[11px] text-[var(--text-dim)]">기관: {data.inst_trend}</div>
          )}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// 우측: 수급 누적흐름 (20일 라인차트)
// ════════════════════════════════════════════════════════

interface CumulativePoint {
  date: string
  label: string
  foreign: number
  institution: number
  individual: number
}

function calcCumulative(rows: SupplyDemandData[]): CumulativePoint[] {
  // rows는 최신→오래된 순 → 오름차순으로 뒤집기
  const sorted = [...rows].reverse()
  let foreignCum = 0, instCum = 0, indivCum = 0
  return sorted.map(r => {
    // 백만원 → 억원 (÷100)
    foreignCum += Math.round((r.foreign_net ?? 0) / 100)
    instCum += Math.round((r.inst_net ?? 0) / 100)
    indivCum += Math.round((r.individual_net ?? 0) / 100)
    const d = r.date
    const mm = d.slice(5, 7)
    const dd = d.slice(8, 10)
    return {
      date: r.date,
      label: `${mm}/${dd}`,
      foreign: foreignCum,
      institution: instCum,
      individual: indivCum,
    }
  })
}

function yAxisFormatter(v: number): string {
  const abs = Math.abs(v)
  const sign = v > 0 ? '+' : v < 0 ? '-' : ''
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1)}조`
  return `${sign}${abs.toLocaleString()}억`
}

function CumulativeSupplyFlow({ history }: { history: SupplyDemandData[] }) {
  const cumData = calcCumulative(history)

  if (cumData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm">
        누적 데이터 없음
      </div>
    )
  }

  return (
    <div>
      <div className="text-sm text-[var(--text-dim)] font-bold mb-3">📈 수급 누적흐름 ({cumData.length}일)</div>
      <div className="relative">
        <span className="absolute left-[70px] top-[8px] text-[11px] font-bold text-[#16a34a] opacity-50 z-10">순매수 ↑</span>
        <span className="absolute left-[70px] bottom-[60px] text-[11px] font-bold text-[#dc2626] opacity-50 z-10">순매도 ↓</span>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={cumData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickFormatter={yAxisFormatter}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="4 3" strokeWidth={1.5} />
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value) || 0
              const abs = Math.abs(v)
              const action = v >= 0 ? '순매수' : '순매도'
              return [
                `${action} ${abs.toLocaleString()}억`,
                name === 'foreign' ? '외국인' : name === 'institution' ? '기관' : '개인'
              ]
            }}
            labelFormatter={(label) => String(label)}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e5ea' }}
          />
          <Legend
            formatter={(value: string) =>
              value === 'foreign' ? '외국인' : value === 'institution' ? '기관' : '개인'
            }
            wrapperStyle={{ fontSize: 11 }}
          />
          <Line type="monotone" dataKey="foreign" stroke="#EF4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="institution" stroke="#8B5CF6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="individual" stroke="#10B981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// 메인 패널
// ════════════════════════════════════════════════════════

export function SupplyDemandPanel() {
  const { data, isLoading } = useInformationSupplyDemand()
  const { data: historyData, isLoading: historyLoading } = useInformationSupplyDemandHistory()
  const dateStr = data?.date ?? ''
  const rel = dateStr ? getRelativeDate(dateStr) : null
  const isStale = rel ? rel.daysAgo >= 7 : false
  const history = historyData?.items ?? []

  return (
    <div className={`flex flex-col h-full ${isStale ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌡️</span>
          <span className="text-base font-bold text-[var(--text-primary)] tracking-wider">수급 흐름</span>
        </div>
        <div className="flex items-center gap-2">
          {rel && <span className={`text-xs font-bold ${rel.daysAgo === 0 ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>{rel.label}</span>}
          <span className="text-xs text-[var(--text-muted)]">{dateStr}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading || historyLoading ? (
          <div className="space-y-3">
            <div className="h-[180px] bg-gray-200 animate-pulse rounded" />
            <div className="h-[200px] bg-gray-200 animate-pulse rounded" />
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">데이터 없음</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 좌: 일별 수급흐름 */}
            <DailySupplyFlow data={data} />

            {/* 우: 누적 흐름 라인차트 */}
            <CumulativeSupplyFlow history={history.length > 0 ? history : [data]} />
          </div>
        )}

        {/* AI 요약 */}
        {data?.summary && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-[var(--border)]">
            <div className="text-xs text-[var(--text-dim)] font-bold mb-1">AI 한 줄 요약</div>
            <div className="text-sm text-[var(--text-primary)] leading-relaxed">{data.summary}</div>
          </div>
        )}

        {/* 팁 */}
        <div className="fx-card-tip">
          💡 외국인이 계속 팔고 있으면 시장에 하방 압력이 있어요. 기관이 사기 시작하면 반전 신호일 수 있어요.
        </div>
      </div>
    </div>
  )
}
