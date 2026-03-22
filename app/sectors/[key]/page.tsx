import { SectorMapView } from '@/features/sectors/ui/SectorMapView'

export default async function SectorPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mx-4 mt-4 mb-8" style={{ minHeight: '80vh' }}>
      <SectorMapView initialSector={key} userTier="free" />
    </div>
  )
}
