import { Navbar } from '@/shared/ui/Navbar'
import { MobileGate } from '@/shared/ui/MobileGate'

export default function QuantLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileGate>
      <div className="responsive-zoom" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <Navbar />
        {children}
      </div>
    </MobileGate>
  )
}
