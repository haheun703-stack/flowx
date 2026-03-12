'use client'

import { useDashboardMarket } from '../api/useDashboard'
import { DashboardCard, CardSkeleton } from './DashboardCard'

const STANCE_COLORS: Record<string, string> = {
  '강세': 'text-red-400',
  '약세': 'text-blue-400',
  '관망': 'text-yellow-400',
}

const REGIME_COLORS: Record<string, string> = {
  'BULL': 'text-red-400',
  'BEAR': 'text-blue-400',
  'CAUTION': 'text-yellow-400',
}

export function MarketStatusCard() {
  const { data, isLoading } = useDashboardMarket()

  if (isLoading || !data) return <CardSkeleton />

  const stanceColor = STANCE_COLORS[data.market_stance] ?? 'text-gray-400'
  const regimeColor = REGIME_COLORS[data.kospi_regime] ?? 'text-gray-400'

  return (
    <DashboardCard title="장세 판단" icon="📊" updatedAt={data.generated_at}>
      <div className="space-y-3">
        {/* 시장 판단 */}
        <div className="text-center py-2">
          <span className={`text-3xl font-bold ${stanceColor}`}>
            {data.market_stance}
          </span>
        </div>

        {/* 지표 그리드 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-900/50 rounded-lg p-2">
            <span className="text-gray-500">KOSPI</span>
            <p className={`font-semibold ${regimeColor}`}>{data.kospi_regime}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <span className="text-gray-500">US</span>
            <p className={`font-semibold ${REGIME_COLORS[data.us_grade] ?? 'text-gray-400'}`}>
              {data.us_grade}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <span className="text-gray-500">매수 슬롯</span>
            <p className="font-semibold text-white">{data.kospi_slots}개</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <span className="text-gray-500">릴레이</span>
            <p className="font-semibold text-white">
              {data.relay_fired}/{data.relay_signals}
            </p>
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}
