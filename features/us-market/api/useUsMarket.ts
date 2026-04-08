'use client'

import { useQuery } from '@tanstack/react-query'
import type { UsMarketDaily } from '../types'

async function fetchUsMarket(): Promise<UsMarketDaily> {
  const res = await fetch('/api/us-market/daily')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function useUsMarket() {
  return useQuery({
    queryKey: ['us-market-daily'],
    queryFn: fetchUsMarket,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  })
}
