import type { Metadata } from 'next'
import { Navbar } from '@/shared/ui/Navbar'
import { MobileGate } from '@/shared/ui/MobileGate'

export const metadata: Metadata = {
  title: 'FLOWX — 매크로 대시보드',
  description: '원자재·환율·금리·센티먼트·크립토 매크로 레이더',
}

export default function MacroLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileGate>
      <div className="responsive-zoom" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
        <Navbar />
        {children}
      </div>
    </MobileGate>
  )
}
