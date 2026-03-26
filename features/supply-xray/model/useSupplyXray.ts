import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/shared/lib/fetchJson'
import { CandleData, SupplyData } from '@/entities/stock/types'

export function useSupplyXray(ticker: string) {
  const ohlcvQuery = useQuery<CandleData[]>({
    queryKey: ['ohlcv', ticker],
    queryFn: () => fetchJson(`/api/ohlcv?ticker=${ticker}`),
    staleTime: 1000 * 60 * 5,
  })

  const supplyQuery = useQuery<SupplyData[]>({
    queryKey: ['supply', ticker],
    queryFn: () => fetchJson(`/api/supply?ticker=${ticker}`),
    staleTime: 1000 * 60 * 5,
  })

  return {
    ohlcv: ohlcvQuery.data,
    supply: supplyQuery.data,
    isLoading: ohlcvQuery.isLoading || supplyQuery.isLoading,
    isError: ohlcvQuery.isError || supplyQuery.isError,
  }
}
