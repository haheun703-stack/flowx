'use client'

import { useAiScorecard } from '../api/useDashboard'
import type { AiScorecardDailyStat, AiScorecardDailyReturn } from '../api/useDashboard'

/* ── 색상 유틸 ── */

function accuracyColor(pct: number) {
  if (pct >= 70) return '#16A34A'
  if (pct >= 50) return '#D97706'
  return '#DC2626'
}

function returnColor(v: number) {
  return v >= 0 ? '#16A34A' : '#DC2626'
}

/* ── 미니 바 차트 (공용) ── */

function MiniBarChart({
  items,
  height = 100,
}: {
  items: { date: string; value: number }[]
  height?: number
}) {
  if (!items || items.length === 0) return <p className="text-[13px] text-[#9CA3AF]">데이터 없음</p>
  const maxAbs = Math.max(...items.map(i => Math.abs(i.value)), 1)

  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {items.map((d, i) => {
        const v = d.value
        const pct = (Math.abs(v) / maxAbs) * 100
        const isPos = v >= 0
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full relative">
            {/* 바 */}
            <div className="w-full flex flex-col items-center" style={{ height: '80%', position: 'relative' }}>
              {/* 0 기준선 */}
              <div className="absolute left-0 right-0 top-1/2 h-px bg-[#E8E6E0]" />
              {isPos ? (
                <div className="absolute left-0 right-0 bottom-1/2 flex justify-center">
                  <div
                    className="w-full max-w-[14px] rounded-t-sm"
                    style={{
                      height: `${Math.max(pct * 0.45, 3)}px`,
                      backgroundColor: '#16A34A',
                      opacity: 0.8,
                    }}
                  />
                </div>
              ) : (
                <div className="absolute left-0 right-0 top-1/2 flex justify-center">
                  <div
                    className="w-full max-w-[14px] rounded-b-sm"
                    style={{
                      height: `${Math.max(pct * 0.45, 3)}px`,
                      backgroundColor: '#DC2626',
                      opacity: 0.8,
                    }}
                  />
                </div>
              )}
            </div>
            {/* 날짜 라벨 (짧게) */}
            <span className="text-[9px] text-[#9CA3AF] mt-1 tabular-nums">
              {d.date.slice(5)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── 메인 ── */

export function AiSignalScorecard() {
  const { data, isLoading } = useAiScorecard()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-2">AI 시그널 성적표</h3>
        <p className="text-[13px] text-[#9CA3AF]">성적표 데이터가 아직 없습니다 (테이블 생성 또는 데이터 대기 중)</p>
      </div>
    )
  }

  const byType = data.by_type ?? {}
  const dailyStats: AiScorecardDailyStat[] = Array.isArray(data.daily_stats) ? data.daily_stats.slice(0, 7) : []
  const paperReturns: AiScorecardDailyReturn[] = Array.isArray(data.paper_daily_returns) ? data.paper_daily_returns.slice(0, 7) : []
  const topPicks = Array.isArray(data.top_picks) ? data.top_picks.slice(0, 3) : []
  const worstPicks = Array.isArray(data.worst_picks) ? data.worst_picks.slice(0, 3) : []

  return (
    <div className="space-y-4">
      {/* 타이틀 */}
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#1A1A2E]">AI 시그널 성적표</h3>
        <span className="text-[12px] text-[#9CA3AF]">{data.date} 기준</span>
      </div>

      {/* ① 핵심 지표 3개 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-[22px] font-black tabular-nums" style={{ color: accuracyColor(data.accuracy_pct) }}>
            {data.accuracy_pct.toFixed(1)}%
          </p>
          <p className="text-[12px] font-bold text-[#6B7280]">AI 적중률</p>
        </div>
        <div className="text-center">
          <p className="text-[22px] font-black tabular-nums" style={{ color: returnColor(data.paper_return_pct) }}>
            {data.paper_return_pct >= 0 ? '+' : ''}{data.paper_return_pct.toFixed(2)}%
          </p>
          <p className="text-[12px] font-bold text-[#6B7280]">페이퍼 수익률</p>
        </div>
        <div className="text-center">
          <p className="text-[22px] font-black tabular-nums" style={{ color: accuracyColor(data.paper_win_rate_pct) }}>
            {data.paper_win_rate_pct.toFixed(1)}%
          </p>
          <p className="text-[12px] font-bold text-[#6B7280]">승률</p>
        </div>
      </div>

      {/* ② 상세 정보 */}
      <div className="text-[13px] text-[#6B7280] flex flex-wrap gap-x-4 gap-y-1">
        <span>전체 예측 <strong className="text-[#1A1A2E]">{data.total_predictions}</strong>건</span>
        <span>검증완료 <strong className="text-[#1A1A2E]">{data.verified}</strong>건</span>
        <span>최근 7일 <strong style={{ color: accuracyColor(data.recent_7d_accuracy_pct) }}>{data.recent_7d_accuracy_pct.toFixed(1)}%</strong></span>
        <span>트레이드 <strong className="text-[#1A1A2E]">{data.paper_total_trades}</strong>건</span>
        <span><strong className="text-[#1A1A2E]">{data.paper_trading_days}</strong>거래일</span>
      </div>

      {/* ③ 유형별 적중률 */}
      {Object.keys(byType).length > 0 && (
        <div className="flex gap-4">
          {Object.entries(byType).map(([type, stat]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#1A1A2E]">{type === 'index' ? '지수' : type === 'stock' ? '종목' : type}</span>
              <span className="text-[13px] tabular-nums" style={{ color: accuracyColor(stat.accuracy_pct) }}>
                {stat.accuracy_pct.toFixed(1)}%
              </span>
              <span className="text-[12px] text-[#9CA3AF]">({stat.hit}/{stat.total})</span>
            </div>
          ))}
        </div>
      )}

      {/* ④ 일별 적중률 + 수익률 차트 (나란히) */}
      {(dailyStats.length > 0 || paperReturns.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {dailyStats.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-[#6B7280] mb-2">일별 적중률</p>
              <MiniBarChart items={[...dailyStats].reverse().map(d => ({ date: d.date, value: d.accuracy_pct }))} height={80} />
            </div>
          )}
          {paperReturns.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-[#6B7280] mb-2">일별 수익률</p>
              <MiniBarChart items={[...paperReturns].reverse().map(d => ({ date: d.date, value: d.avg_return_pct }))} height={80} />
            </div>
          )}
        </div>
      )}

      {/* ⑤ 적중/실패 TOP */}
      {(topPicks.length > 0 || worstPicks.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {topPicks.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-[#16A34A] mb-1">적중 TOP</p>
              {topPicks.map((p, i) => (
                <p key={i} className="text-[13px] text-[#1A1A2E] truncate">
                  <span className="text-[#16A34A] mr-1">&#10003;</span>
                  {p.name} <span className="text-[#9CA3AF]">({(p.prob_up * 100).toFixed(0)}%)</span>
                </p>
              ))}
            </div>
          )}
          {worstPicks.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-[#DC2626] mb-1">실패 TOP</p>
              {worstPicks.map((p, i) => (
                <p key={i} className="text-[13px] text-[#1A1A2E] truncate">
                  <span className="text-[#DC2626] mr-1">&#10007;</span>
                  {p.name} <span className="text-[#9CA3AF]">({(p.prob_up * 100).toFixed(0)}%)</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
