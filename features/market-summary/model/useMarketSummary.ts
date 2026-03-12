'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { IntradayPoint, IndexCard, SectorData, SupplyStock, WatchItem } from '../types'
import { isMarketOpen } from '@/features/market-ticker/api/fetchKoreanTickers'

export function useMarketSummary() {
  const marketOpen = isMarketOpen()
  const fastInterval = marketOpen ? 1000 * 60 : 1000 * 60 * 10
  const slowInterval = marketOpen ? 1000 * 60 * 5 : 1000 * 60 * 10

  const intradayQuery = useQuery<IntradayPoint[]>({
    queryKey: ['market-intraday'],
    queryFn: () => axios.get('/api/market/intraday').then(r => r.data),
    staleTime: 1000 * 30,
    refetchInterval: fastInterval,
  })

  const indicesQuery = useQuery<IndexCard[]>({
    queryKey: ['market-indices'],
    queryFn: async () => {
      const [kr, world] = await Promise.all([
        axios.get('/api/korean-tickers').then(r => r.data),
        axios.get('/api/world-indices').then(r => r.data),
      ])
      const kospi = kr.find((t: any) => t.code === '0001')
      const kosdaq = kr.find((t: any) => t.code === '1001')
      return [
        { name: 'KOSPI', code: '0001', price: kospi?.price ?? 0, change: 0, changePercent: kospi?.changePercent ?? 0, currency: 'KRW' },
        { name: 'KOSDAQ', code: '1001', price: kosdaq?.price ?? 0, change: 0, changePercent: kosdaq?.changePercent ?? 0, currency: 'KRW' },
        ...world.slice(0, 4).map((w: any) => ({
          name: w.name, code: w.symbol, price: w.price, change: w.change, changePercent: w.changePercent, currency: w.currency,
        })),
      ] as IndexCard[]
    },
    staleTime: 1000 * 60,
    refetchInterval: slowInterval,
  })

  const sectorQuery = useQuery<SectorData[]>({
    queryKey: ['market-sector-heatmap'],
    queryFn: () => axios.get('/api/market/sector-heatmap').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: slowInterval,
  })

  const supplyQuery = useQuery<{ foreign: SupplyStock[]; inst: SupplyStock[] }>({
    queryKey: ['market-supply-rank'],
    queryFn: () => axios.get('/api/market/supply-rank').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: slowInterval,
  })

  // 워치리스트는 한국 티커에서 가져옴
  const watchlistQuery = useQuery<WatchItem[]>({
    queryKey: ['market-watchlist'],
    queryFn: async () => {
      const kr = await axios.get('/api/korean-tickers').then(r => r.data)
      return kr
        .filter((t: any) => !t.isIndex)
        .map((t: any) => ({
          code: t.code, name: t.name, price: t.price, changePercent: t.changePercent,
        }))
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: slowInterval,
  })

  return {
    intraday: intradayQuery.data ?? [],
    indices: indicesQuery.data ?? [],
    sectors: sectorQuery.data ?? [],
    supplyForeign: supplyQuery.data?.foreign ?? [],
    supplyInst: supplyQuery.data?.inst ?? [],
    watchlist: watchlistQuery.data ?? [],
    isLoading: intradayQuery.isLoading || indicesQuery.isLoading,
  }
}
