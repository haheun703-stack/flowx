'use client'

import { useDashboardSector } from '../api/useDashboard'
import { DashboardCard, CardSkeleton } from './DashboardCard'

export function SectorMomentumCard() {
  const { data, isLoading } = useDashboardSector()

  if (isLoading || !data) return <CardSkeleton className="col-span-2" />

  const topSectors = data.sectors.slice(0, 10)

  return (
    <DashboardCard
      title="섹터 모멘텀 TOP 10"
      icon="📈"
      updatedAt={data.date}
      className="col-span-2"
    >
      <div className="space-y-1">
        {/* 헤더 */}
        <div className="flex items-center text-[10px] text-gray-600 px-2 py-1">
          <span className="w-6">#</span>
          <span className="flex-1">섹터</span>
          <span className="w-14 text-right">점수</span>
          <span className="w-14 text-right">5일</span>
          <span className="w-14 text-right">20일</span>
          <span className="w-14 text-right">60일</span>
          <span className="w-10 text-right">RSI</span>
          <span className="w-10 text-right">순위</span>
        </div>

        {topSectors.map(s => (
          <div
            key={s.etf_code}
            className="flex items-center text-xs px-2 py-1.5 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <span className="w-6 text-gray-500 font-mono">{s.rank}</span>
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
              <span className="text-white truncate">{s.sector}</span>
              {s.acceleration && (
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded">가속</span>
              )}
              <span className="text-[9px] text-gray-600">{s.category === 'theme' ? '테마' : '업종'}</span>
            </div>
            <span className="w-14 text-right text-[#00ff88] font-mono font-bold">
              {s.momentum_score.toFixed(0)}
            </span>
            <span className={`w-14 text-right ${s.ret_5 >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {s.ret_5 >= 0 ? '+' : ''}{s.ret_5.toFixed(1)}%
            </span>
            <span className={`w-14 text-right ${s.ret_20 >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {s.ret_20 >= 0 ? '+' : ''}{s.ret_20.toFixed(1)}%
            </span>
            <span className={`w-14 text-right ${s.ret_60 >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {s.ret_60 >= 0 ? '+' : ''}{s.ret_60.toFixed(1)}%
            </span>
            <span className="w-10 text-right text-gray-400">{s.rsi_14.toFixed(0)}</span>
            <span className="w-10 text-right">
              {s.rank_change > 0 && <span className="text-red-400">▲{s.rank_change}</span>}
              {s.rank_change < 0 && <span className="text-blue-400">▼{Math.abs(s.rank_change)}</span>}
              {s.rank_change === 0 && <span className="text-gray-600">-</span>}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
