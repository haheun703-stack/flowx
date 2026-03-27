import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/shared/lib/fetchJson'
import { CandleData, SupplyData } from '@/entities/stock/types'

interface SupplyResponse {
  data: SupplyData[]
  isSimulated: boolean
}

export function useSupplyXray(ticker: string) {
  const ohlcvQuery = useQuery<CandleData[]>({
    queryKey: ['ohlcv', ticker],
    queryFn: () => fetchJson(`/api/ohlcv?ticker=${ticker}`),
    staleTime: 1000 * 60 * 5,
  })

  const supplyQuery = useQuery<SupplyResponse>({
    queryKey: ['supply', ticker],
    queryFn: () => fetchJson(`/api/supply?ticker=${ticker}`),
    staleTime: 1000 * 60 * 5,
  })

  return {
    ohlcv: ohlcvQuery.data,
    supply: supplyQuery.data?.data,
    isSimulated: supplyQuery.data?.isSimulated ?? false,
    isLoading: ohlcvQuery.isLoading || supplyQuery.isLoading,
    isError: ohlcvQuery.isError || supplyQuery.isError,
  }
}
