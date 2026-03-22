'use client'

import { useQuery } from '@tanstack/react-query'

export interface StockNode {
  id: string
  sector_key: string
  sector_name: string
  tier: number
  sub_category?: string
  stock_name: string
  ticker: string
  market: string
  desc?: string
  change_pct: number
  volume_ratio: number
  foreign_net: number
  institution_net: number
  theme_tags?: string[]
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
      if (!res.ok) throw new Error('Failed to fetch sector data')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!sectorKey,
  })
}
