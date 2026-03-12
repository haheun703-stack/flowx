import { Navbar } from '@/shared/ui/Navbar'

export default function ChartLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
