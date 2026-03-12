'use client'

import Link from 'next/link'
import { useDashboardPicks } from '../api/useDashboard'
import { DashboardCard, CardSkeleton } from './DashboardCard'

const GRADE_COLORS: Record<string, string> = {
  '적극매수': 'bg-red-500/20 text-red-400 border-red-500/30',
  '매수': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '관심매수': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '관찰': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

function formatPrice(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}만`
  return v.toLocaleString()
}

function formatBil(v: number) {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}조`
  if (abs >= 1e8) return `${sign}${(abs / 1e8).toFixed(0)}억`
  return `${sign}${abs.toLocaleString()}`
}

export function TopPicksCard() {
  const { data, isLoading } = useDashboardPicks()

  if (isLoading || !data) return <CardSkeleton className="col-span-2" />

  const topPicks = data.picks
    .filter(p => ['적극매수', '매수', '관심매수'].includes(p.grade))
    .slice(0, 8)

  return (
    <DashboardCard
      title={`AI 추천 — ${data.target_date_label}`}
      icon="🎯"
      updatedAt={data.generated_at}
      className="col-span-2"
    >
      {/* AI 대형주 분석 */}
      {data.ai_largecap?.length > 0 && (
        <div className="mb-3 p-2 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
          <p className="text-[10px] text-emerald-500 mb-1 font-semibold">AI 대형주 분석</p>
          {data.ai_largecap.slice(0, 2).map(item => (
            <div key={item.ticker} className="text-xs text-gray-300 mb-1">
              <span className="text-white font-medium">{item.name}</span>
              <span className="text-emerald-400 ml-1">({Math.round(item.confidence * 100)}%)</span>
              <span className="text-gray-500 ml-1">— {item.reasoning.slice(0, 50)}...</span>
            </div>
          ))}
        </div>
      )}

      {/* 통계 바 */}
      <div className="flex gap-2 mb-3 text-[10px]">
        {Object.entries(data.stats).filter(([, v]) => v > 0).map(([grade, count]) => (
          <span key={grade} className="text-gray-500">
            {grade} <span className="text-white">{count}</span>
          </span>
        ))}
      </div>

      {/* 종목 리스트 */}
      <div className="space-y-1">
        {topPicks.map(pick => (
          <Link
            key={pick.ticker}
            href={`/chart/${pick.ticker}`}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${GRADE_COLORS[pick.grade] ?? 'bg-gray-800 text-gray-400'}`}>
                {pick.grade}
              </span>
              <span className="text-xs text-white font-medium truncate">{pick.name}</span>
              <span className="text-[10px] text-gray-600">{pick.ticker}</span>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              <span className="text-gray-400">{formatPrice(pick.close)}원</span>
              <span className={pick.price_change >= 0 ? 'text-red-400' : 'text-blue-400'}>
                {pick.price_change >= 0 ? '+' : ''}{pick.price_change.toFixed(1)}%
              </span>
              <span className="text-[10px] text-gray-600">
                외{formatBil(pick.foreign_5d)} 기{formatBil(pick.inst_5d)}
              </span>
              <span className="text-[#00ff88] font-mono font-bold">{pick.total_score.toFixed(0)}점</span>
            </div>
          </Link>
        ))}
      </div>
    </DashboardCard>
  )
}
