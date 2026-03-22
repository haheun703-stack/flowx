import { SectorMapView } from '@/features/sectors/ui/SectorMapView'
import { Navbar } from '@/shared/ui/Navbar'

export default function SectorsPage() {
  return (
    <div className="min-h-screen bg-[#080b10]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-4 pb-8">
        <div className="bg-[#131722] rounded-lg border border-[#2a2a3a] overflow-hidden" style={{ minHeight: '70vh' }}>
          <SectorMapView initialSector="semiconductor" userTier="free" />
        </div>
      </main>
    </div>
  )
}
