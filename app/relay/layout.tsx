import { Navbar } from '@/shared/ui/Navbar'
import { MobileGate } from '@/shared/ui/MobileGate'

export default function RelayLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileGate>
      <div style={{ zoom: 1.25, background: '#131722', minHeight: '100vh' }}>
        <Navbar />
        {children}
      </div>
    </MobileGate>
  )
}
