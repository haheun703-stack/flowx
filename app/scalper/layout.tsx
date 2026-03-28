import { ScalperNav } from '@/features/quant-scalper/ui/ScalperNav'

export default function ScalperLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScalperNav />
      {children}
    </>
  )
}
