import { SectorMapView } from '@/features/sectors/ui/SectorMapView'

export default async function SectorPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params

  return (
    <div className="bg-[#131722] rounded-lg border border-[#2a2a3a] overflow-hidden mx-4 mt-4 mb-8" style={{ minHeight: '80vh' }}>
      <SectorMapView initialSector={key} userTier="free" />
    </div>
  )
}
