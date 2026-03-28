import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { EtfPicksView } from '@/features/quant-scalper/ui/EtfPicksView'

export const metadata = {
  title: 'FLOWX — ETF 추천',
  description: '오늘의 ETF 추천 (방향성/원자재/섹터) + 진입/손절/목표가',
}

export default function EtfPicksPage() {
  return (
    <div className={PAGE} style={{ zoom: 1.25 }}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">ETF Picks</h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#f59e0b]/40 text-[#f59e0b] font-bold">REC</span>
          <span className="text-sm text-gray-500">추천 · 진입가 · 손절 · 목표</span>
        </div>
      </div>
      <div className={`${CONTAINER} pt-6`}>
        <EtfPicksView />
      </div>
    </div>
  )
}
