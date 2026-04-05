'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/shared/lib/fetchJson'

// ─── Types ───

export interface MacroItem {
  id: string
  date: string
  category: 'commodity' | 'grain' | 'forex' | 'rate' | 'sentiment' | 'index' | 'crypto'
  symbol: string
  name_ko: string
  value: number
  change_pct: number
  unit: string | null
  alert_threshold: number | null
  alert_direction: 'above' | 'below' | null
  alert_active: boolean
  label?: string
  signals?: string[]
}

export interface CostFloorItem {
  id: string
  symbol: string
  name_ko: string
  unit: string | null
  floor_price: number
  floor_name: string | null
  ceiling_price: number
  ceiling_name: string | null
  current_price: number | null
  position_pct: number | null
  note: string | null
  updated_at: string
}

interface MacroDailyResponse {
  date: string | null
  items: MacroItem[]
  categories: Record<string, MacroItem[]>
}

interface CostFloorResponse {
  items: CostFloorItem[]
}

// ─── Hooks ───

export function useMacroDaily() {
  return useQuery<MacroDailyResponse>({
    queryKey: ['macro-daily'],
    queryFn: () => fetchJson('/api/macro/daily'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
  })
}

export function useCostFloor() {
  return useQuery<CostFloorResponse>({
    queryKey: ['macro-cost-floor'],
    queryFn: () => fetchJson('/api/macro/cost-floor'),
    staleTime: 1000 * 60 * 30,
  })
}
