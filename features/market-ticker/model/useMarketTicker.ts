import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/shared/lib/fetchJson'
import { WorldIndex, KoreanTicker } from '../types'
import { isMarketOpen } from '@/shared/lib/marketUtils'

export function useMarketTicker() {
  // 장 중이면 5분, 장 외면 10분 갱신
  const koreanRefetchInterval = isMarketOpen()
    ? 1000 * 60 * 5   // 장 중: 5분
    : 1000 * 60 * 10  // 장 외: 10분 (불필요한 API 호출 절약)

  const worldQuery = useQuery<WorldIndex[]>({
    queryKey: ['world-indices'],
    queryFn: () => fetchJson('/api/world-indices'),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  })

  const koreanQuery = useQuery<KoreanTicker[]>({
    queryKey: ['korean-tickers'],
    queryFn: () => fetchJson('/api/korean-tickers'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: koreanRefetchInterval,
  })

  return {
    worldIndices: worldQuery.data ?? [],
    koreanTickers: koreanQuery.data ?? [],
    isLoading: worldQuery.isLoading || koreanQuery.isLoading,
    isMarketOpen: isMarketOpen(),
  }
}
