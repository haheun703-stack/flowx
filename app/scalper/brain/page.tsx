import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { MarketBrainView } from '@/features/quant-scalper/ui/MarketBrainView'

export const metadata = {
  title: 'FLOWX — BRAIN 시장판단',
  description: 'AI 6단계 종합 시장판단 + 투자비중 + 종목 서술',
}

export default function MarketBrainPage() {
  return (
    <div className={PAGE} style={{ zoom: 1.25 }}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">Market Brain</h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#a855f7]/40 text-[#a855f7] font-bold">AI</span>
          <span className="text-sm text-gray-500">매크로 · 섹터 · 수급 · 리스크 · 종목</span>
        </div>
      </div>
      <div className={`${CONTAINER} pt-6`}>
        <MarketBrainView />
      </div>
    </div>
  )
}
