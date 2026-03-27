'use client'

import { useQuery } from '@tanstack/react-query'
import { StockItem } from '../types'

export function useStockList(enabled: boolean) {
  return useQuery<StockItem[]>({
    queryKey: ['stock-list'],
    queryFn: async () => {
      const res = await fetch('/api/stock-list')
      if (!res.ok) throw new Error('Failed to fetch stock list')
      const json: unknown = await res.json()
      if (!Array.isArray(json)) throw new Error('Invalid stock list response')
      return json as StockItem[]
    },
    staleTime: 1000 * 60 * 60 * 24, // 24시간
    gcTime: 1000 * 60 * 60 * 24,
    enabled,
  })
}
