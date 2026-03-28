import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { StockDetailView } from '@/features/stock-detail/ui/StockDetailView'

export const metadata = {
  title: 'FLOWX — 종목 상세',
  description: '퀀트분석, 왜 지금 이 종목인가, 시그널 이력',
}

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>
}) {
  const { ticker } = await params

  return (
    <div className={PAGE} style={{ zoom: 1.25 }}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">Stock Detail</h1>
          <span className="text-sm font-mono text-[#0ea5e9]">{ticker}</span>
        </div>
      </div>
      <div className={`${CONTAINER} pt-6`}>
        <StockDetailView ticker={ticker} />
      </div>
    </div>
  )
}
