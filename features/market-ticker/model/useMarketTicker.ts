import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/shared/lib/fetchJson'
import { WorldIndex, KoreanTicker } from '../types'
import { getRefetchInterval } from '@/shared/lib/marketUtils'

export function useMarketTicker() {
  const worldQuery = useQuery<WorldIndex[]>({
    queryKey: ['world-indices'],
    queryFn: () => fetchJson('/api/world-indices'),
    staleTime: 120_000,
    refetchInterval: 120_000,
  })

  const koreanQuery = useQuery<KoreanTicker[]>({
    queryKey: ['korean-tickers'],
    queryFn: () => fetchJson('/api/korean-tickers'),
    staleTime: 300_000,
    refetchInterval: getRefetchInterval(300_000, 600_000),
  })

  return {
    worldIndices: worldQuery.data ?? [],
    koreanTickers: koreanQuery.data ?? [],
    isLoading: worldQuery.isLoading || koreanQuery.isLoading,
  }
}
