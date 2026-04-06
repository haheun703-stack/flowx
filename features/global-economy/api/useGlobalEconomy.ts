'use client'

import { useQuery } from '@tanstack/react-query'

export interface SeriesData {
  id: string
  name: string
  unit: string
  color: string
  current: { value: number; date: string; change: number | null } | null
  history: { d: string; v: number }[]
}

export interface SectionData {
  id: string
  title: string
  icon: string
  desc: string
  series: SeriesData[]
}

interface YieldPoint { maturity: string; value: number | null; date?: string | null }

export interface GlobalEconomyData {
  sections: SectionData[]
  yield_curve: {
    current: YieldPoint[]
    year_ago: YieldPoint[]
  }
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
    staleTime: 30 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
  })
}
