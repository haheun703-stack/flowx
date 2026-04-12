import type { Metadata } from 'next'
import { Navbar } from '@/shared/ui/Navbar'
import { MobileGate } from '@/shared/ui/MobileGate'
import { InformationTabs } from './InformationTabs'

export const metadata: Metadata = {
  title: 'FLOWX — 인텔리전스',
  description: '공시(DART/EDGAR), 수급 분석, 스코어링 등 투자 인텔리전스',
}

export default function InformationLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileGate>
      <div className="responsive-zoom" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <Navbar />
        <InformationTabs>{children}</InformationTabs>
      </div>
    </MobileGate>
  )
}
