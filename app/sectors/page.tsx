import { SectorGrid } from '@/features/sectors/ui/SectorGrid'
import { Navbar } from '@/shared/ui/Navbar'

export default function SectorsPage() {
  return (
    <div className="min-h-screen bg-[#080b10]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-4 pb-8">
        <SectorGrid />
      </main>
    </div>
  )
}
