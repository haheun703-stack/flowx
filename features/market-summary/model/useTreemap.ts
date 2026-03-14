'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { isMarketOpen } from '@/features/market-ticker/api/fetchKoreanTickers'

export interface TreemapStock {
  ticker: string
  name: string
  marketCap: number
  changePercent: number
}

export interface TreemapSector {
  name: string
  marketCap: number
  stocks: TreemapStock[]
}

interface TreemapResponse {
  sectors: TreemapSector[]
}

export function useTreemap() {
  const marketOpen = isMarketOpen()

  return useQuery<TreemapSector[]>({
    queryKey: ['market-treemap'],
    queryFn: async () => {
      const { data } = await axios.get<TreemapResponse>('/api/market/treemap')
      return data.sectors
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: marketOpen ? 1000 * 60 * 5 : 1000 * 60 * 30,
  })
}
