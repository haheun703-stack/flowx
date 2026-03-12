import { SectorData } from '../types'
import { readJsonFile } from '@/shared/lib/dataReader'

interface SectorMomentumFile {
  date: string
  sectors: {
    sector: string
    ret_5: number
    momentum_score: number
    category: string
  }[]
}

/**
 * 섹터 히트맵 데이터 — _SPECS/data/sector_rotation/sector_momentum.json 활용
 * 5일 수익률을 히트맵 기준으로 사용
 */
export function fetchSectorHeatmap(): SectorData[] {
  try {
    const data = readJsonFile<SectorMomentumFile>('sector_rotation/sector_momentum.json')
    return data.sectors
      .filter(s => s.category === 'sector')
      .slice(0, 9)
      .map(s => ({
        name: s.sector,
        changePercent: s.ret_5,
        count: 0,
      }))
  } catch {
    return []
  }
}
