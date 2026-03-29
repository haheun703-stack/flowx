'use client'

import Link from 'next/link'
import { useDashboardWhale } from '../api/useDashboard'
import { DashboardCard, CardSkeleton } from './DashboardCard'

const GRADE_STYLES: Record<string, string> = {
  '세력포착': 'text-red-600 bg-red-50',
  '매집의심': 'text-orange-600 bg-orange-50',
  '이상감지': 'text-yellow-600 bg-yellow-50',
}

export function WhaleDetectCard() {
  const { data, isLoading } = useDashboardWhale()

  if (isLoading || !data) return <CardSkeleton />

  const topItems = [...data.items]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8)

  return (
    <DashboardCard title="세력 포착" icon="🐋" updatedAt={data.updated_at}>
      {/* 통계 */}
      <div className="flex gap-3 mb-3 text-[10px]">
        {Object.entries(data.stats).map(([grade, count]) => (
          <span key={grade} className="text-gray-500">
            {grade} <span className="text-[var(--text-primary)] font-semibold">{count}</span>
          </span>
        ))}
      </div>

      {/* 종목 리스트 */}
      <div className="space-y-1">
        {topItems.map(item => (
          <Link
            key={item.ticker}
            href={`/chart/${item.ticker}`}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${GRADE_STYLES[item.grade] ?? 'text-gray-500 bg-gray-100'}`}>
                {item.grade}
              </span>
              <span className="text-xs text-[var(--text-primary)] truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="text-gray-500">{item.close.toLocaleString()}</span>
              <span className={item.price_change >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}>
                {item.price_change >= 0 ? '+' : ''}{item.price_change.toFixed(1)}%
              </span>
              <span className="text-[var(--yellow)] font-mono text-[10px]">
                x{item.volume_surge_ratio.toFixed(1)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </DashboardCard>
  )
}
