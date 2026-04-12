import type { Metadata } from 'next'
import { Navbar } from '@/shared/ui/Navbar'
import { MobileGate } from '@/shared/ui/MobileGate'

export const metadata: Metadata = {
  title: 'FLOWX — 시장 분석',
  description: '한국·미국 시장 수급 현황, 트리맵, 투자자 동향 분석',
}

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileGate>
      <div className="fx-theme responsive-zoom" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <Navbar />
        {children}
      </div>
    </MobileGate>
  )
}
