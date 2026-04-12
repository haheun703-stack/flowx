import type { Metadata } from 'next'
import { SectorGrid } from '@/features/sectors/ui/SectorGrid'

export const metadata: Metadata = {
  title: 'FLOWX — 섹터 히트맵',
  description: '한국 주식 시장 섹터별 수급 현황 및 모멘텀 분석',
}

export default function SectorsPage() {
  return <SectorGrid />
}
