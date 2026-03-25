import { useQuery } from '@tanstack/react-query'
import { CandleData, SupplyData } from '@/entities/stock/types'

export function useSupplyXray(ticker: string) {
  const ohlcvQuery = useQuery<CandleData[]>({
    queryKey: ['ohlcv', ticker],
    queryFn: () => fetch(`/api/ohlcv?ticker=${ticker}`).then(r => r.json()),
    staleTime: 1000 * 60 * 5,
  })

  const supplyQuery = useQuery<SupplyData[]>({
    queryKey: ['supply', ticker],
    queryFn: () => fetch(`/api/supply?ticker=${ticker}`).then(r => r.json()),
    staleTime: 1000 * 60 * 5,
  })

  return {
    ohlcv: ohlcvQuery.data,
    supply: supplyQuery.data,
    isLoading: ohlcvQuery.isLoading || supplyQuery.isLoading,
    isError: ohlcvQuery.isError || supplyQuery.isError,
  }
}
