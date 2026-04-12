import type { Metadata } from 'next'
import { SectorLeadersView } from '@/features/sectors/ui/SectorLeadersView'

export const metadata: Metadata = {
  title: 'FLOWX — 섹터 리더스',
  description: '섹터별 대표 종목 및 시장 리더 분석',
}

export default function SectorLeadersPage() {
  return <SectorLeadersView />
}
