import { MarketSummaryView } from '@/features/market-summary/ui/MarketSummaryView'

export const metadata = {
  title: 'FLOWX — 시장 요약',
  description: 'KOSPI 인트라데이, 섹터 히트맵, 수급 순위',
}

export default function MarketPage() {
  return <MarketSummaryView />
}
