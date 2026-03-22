import { notFound } from 'next/navigation'
import { SectorMapView } from '@/features/sectors/ui/SectorMapView'
import { SECTOR_LIST } from '@/lib/chart-tokens'

export default async function SectorPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params

  if (!SECTOR_LIST.some((s) => s.key === key)) {
    notFound()
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mx-4 mt-4 mb-8" style={{ minHeight: '80vh' }}>
      <SectorMapView initialSector={key} userTier="free" />
    </div>
  )
}
