import { Navbar } from '@/shared/ui/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ zoom: 1.25 }}>
      <Navbar />
      {children}
    </div>
  )
}
