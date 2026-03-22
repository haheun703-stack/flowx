'use client'

import { useQuery } from '@tanstack/react-query'

export interface StockNode {
  id: string
  sector_key: string
  sector_name: string
  tier: number
  sub_category: string
  stock_name: string
  ticker: string
  market: string
  desc?: string
  change_pct: number
  volume_ratio: number
  foreign_net: number
  institution_net: number
  theme_tags: string[]
  updated_at: string
}

export interface SupplyLink {
  id: string
  sector_key: string
  from_stock: string
  to_stock: string
  relation: string
  strength: number
}

export interface SectorResponse {
  key: string
  stocks: StockNode[]
  tiers: Record<number, StockNode[]>
  links: SupplyLink[]
}

export function useSectorData(sectorKey: string) {
  return useQuery<SectorResponse>({
    queryKey: ['sector', sectorKey],
    queryFn: async () => {
      const res = await fetch(`/api/sectors/${sectorKey}`)
      if (!res.ok) {
        const status = res.status
        throw new Error(
          status === 404 ? `섹터를 찾을 수 없습니다: ${sectorKey}`
          : status === 503 ? '데이터베이스 연결 실패'
          : `섹터 데이터 로드 실패 (${status})`
        )
      }
      const data = await res.json()
      if (!data || !Array.isArray(data.stocks)) {
        throw new Error('잘못된 섹터 응답 형식')
      }
      return data as SectorResponse
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!sectorKey,
  })
}
