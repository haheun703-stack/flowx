'use client'

import { useQuery } from '@tanstack/react-query'

export interface EconomicIndicator {
  id: string
  name: string
  category: string
  unit: string
  value: number
  prev_value: number | null
  change: number | null
  change_pct: number | null
  date: string
}

interface CategoryGroup {
  meta: { title: string; icon: string }
  items: EconomicIndicator[]
}

interface GlobalEconomyData {
  categories: Record<string, CategoryGroup>
  total: number
  updated_at: string
}

async function fetchGlobalEconomy(signal?: AbortSignal): Promise<GlobalEconomyData> {
  const res = await fetch('/api/global-economy', { signal })
  if (!res.ok) throw new Error('Failed to fetch global economy data')
  return res.json()
}

export function useGlobalEconomy() {
  return useQuery<GlobalEconomyData>({
    queryKey: ['global-economy'],
    queryFn: ({ signal }) => fetchGlobalEconomy(signal),
    staleTime: 30 * 60 * 1000, // 30분
    refetchInterval: 60 * 60 * 1000, // 1시간마다 리페치
  })
}
