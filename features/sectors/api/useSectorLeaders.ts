'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/shared/lib/fetchJson'
import { isMarketOpen } from '@/shared/lib/marketUtils'

export interface LeaderRow {
  id: number
  sector: string
  leader_ticker: string
  leader_name: string
  leader_exchange: string
  leader_theme: string
  leader_price: number
  leader_change_pct: number
  kr_ticker: string
  kr_name: string
  relation: string
  detail: string
  revenue_dependency: string
  updated_at: string
}

interface LeadersResponse {
  rows: LeaderRow[]
  meta?: { total: number; updatedAt: string | null }
}

export function useSectorLeaders() {
  return useQuery<LeaderRow[]>({
    queryKey: ['sector-leaders'],
    queryFn: async () => {
      const data = await fetchJson<LeadersResponse>('/api/sector-leaders')
      return data.rows
    },
    staleTime: 300_000,
    refetchInterval: () => (isMarketOpen() ? 300_000 : 1_800_000),
  })
}
