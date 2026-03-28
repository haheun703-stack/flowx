import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { SectorMomentumView } from '@/features/quant-scalper/ui/SectorMomentumView'

export const metadata = {
  title: 'FLOWX — 섹터 모멘텀',
  description: '23개 섹터 HOT/COLD 모멘텀 + 가속도 + 주도주',
}

export default function SectorMomentumPage() {
  return (
    <div className={PAGE} style={{ zoom: 1.25 }}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">Sector Momentum</h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#ff3b5c]/40 text-[#ff3b5c] font-bold">HOT/COLD</span>
          <span className="text-sm text-gray-500">모멘텀 · 가속도 · 로테이션</span>
        </div>
      </div>
      <div className={`${CONTAINER} pt-6`}>
        <SectorMomentumView />
      </div>
    </div>
  )
}
