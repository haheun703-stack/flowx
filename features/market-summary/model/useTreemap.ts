'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/shared/lib/fetchJson'
import { isMarketOpen } from '@/shared/lib/marketUtils'

export interface TreemapStock {
  ticker: string
  name: string
  marketCap: number
  changePercent: number
  tradingValue: number
}

export interface TreemapSector {
  name: string
  marketCap: number
  stocks: TreemapStock[]
}

interface TreemapResponse {
  sectors: TreemapSector[]
  meta?: { totalStocks: number; lastUpdated: string }
}

export function useTreemap() {
  const marketOpen = isMarketOpen()

  return useQuery<TreemapSector[]>({
    queryKey: ['market-treemap'],
    queryFn: async () => {
      const data = await fetchJson<TreemapResponse>('/api/market/treemap')
      return data.sectors
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: marketOpen ? 1000 * 60 * 5 : 1000 * 60 * 30,
  })
}
