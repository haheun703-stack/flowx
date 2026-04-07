import { Navbar } from '@/shared/ui/Navbar'
import { MobileGate } from '@/shared/ui/MobileGate'

export default function MacroLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileGate>
      <div className="responsive-zoom" style={{ background: '#f6f5f1', minHeight: '100vh' }}>
        <Navbar />
        {children}
      </div>
    </MobileGate>
  )
}
