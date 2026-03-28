import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { SectorFlowView } from '@/features/quant-scalper/ui/SectorFlowView'

export const metadata = {
  title: 'FLOWX — 섹터 수급 흐름',
  description: '23개 섹터 기관·외국인 수급 흐름 + 합의매수 판단',
}

export default function SectorFlowPage() {
  return (
    <div className={PAGE} style={{ zoom: 1.25 }}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">Sector Flow</h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#00ff88]/40 text-[#00ff88] font-bold">DAILY</span>
          <span className="text-sm text-gray-500">섹터 수급 · 기관/외인 · 합의매수</span>
        </div>
      </div>
      <div className={`${CONTAINER} pt-6`}>
        <SectorFlowView />
      </div>
    </div>
  )
}
