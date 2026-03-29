import { Navbar } from '@/shared/ui/Navbar'
import { MobileGate } from '@/shared/ui/MobileGate'
import { InformationTabs } from './InformationTabs'

export default function InformationLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileGate>
      <div style={{ zoom: 1.25, background: 'var(--bg-base)', minHeight: '100vh' }}>
        <Navbar />
        <InformationTabs>{children}</InformationTabs>
      </div>
    </MobileGate>
  )
}
