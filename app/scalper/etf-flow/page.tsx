import { CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { EtfFlowView } from '@/features/quant-scalper/ui/EtfFlowView'

export const metadata = {
  title: 'FLOWX — ETF 투자자 수급',
  description: 'ETF 기관·외인·개인 수급 + 시장방향 + 안전자산 판단',
}

export default function EtfFlowPage() {
  return (
    <div className={PAGE} style={{ zoom: 1.25 }}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">ETF Fund Flow</h1>
          <span className="text-xs px-2 py-0.5 rounded border border-[#00ff88]/40 text-[#00ff88] font-bold">DAILY</span>
          <span className="text-sm text-gray-500">ETF 수급 · 시장방향 · 안전자산</span>
        </div>
      </div>
      <div className={`${CONTAINER} pt-6`}>
        <EtfFlowView />
      </div>
    </div>
  )
}
