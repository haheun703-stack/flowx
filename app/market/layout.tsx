import { Navbar } from '@/shared/ui/Navbar'

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ zoom: 1.25, background: '#131722', minHeight: '100vh' }}>
      <Navbar />
      {children}
    </div>
  )
}
