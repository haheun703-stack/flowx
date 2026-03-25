import type { Metadata } from 'next'
import { ChartContainer } from '@/features/supply-xray/ui/ChartContainer'
import { NationalityFlowCard } from '@/features/supply-xray/ui/NationalityFlowCard'
import { TICKER_NAME_MAP } from '@/shared/constants/tickers'

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params
  const name = TICKER_NAME_MAP[ticker] || ticker
  return {
    title: `${name}(${ticker}) 수급 X-Ray — FLOWX`,
    description: `${name} 외국인·기관·개인 순매수 분석. 스마트머니 추적 차트.`,
  }
}

export default async function ChartPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params
  return (
    <main>
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-white">
          수급 X-Ray
          <span className="ml-2 text-sm text-blue-400 font-normal">외인 · 기관 · 개인 순매수 분석</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          마우스를 차트 위로 이동하면 해당 날짜의 수급이 실시간으로 표시됩니다.
        </p>
      </div>
      <div className="px-2">
        <ChartContainer ticker={ticker} companyName={TICKER_NAME_MAP[ticker] || ticker} />
        <NationalityFlowCard ticker={ticker} />
      </div>
    </main>
  )
}
