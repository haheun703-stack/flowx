'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/shared/lib/fetchJson'
import { getRefetchInterval } from '@/shared/lib/marketUtils'

// ─── Types ───

export interface NewsItem {
  id: string
  date: string
  scope: 'GLOBAL' | 'DOMESTIC'
  rank: number
  title: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  impact_score: number
  kr_impact: string | null
  related_tickers: { code: string; name: string; change_pct: number }[]
  sectors: string[]
  source: string | null
  published_at: string | null
}

export interface DisclosureItem {
  id: string
  date: string
  source: 'DART' | 'EDGAR'
  ticker: string | null
  ticker_name: string | null
  title: string
  category: string | null
  sentiment: 'POSITIVE' | 'CAUTION' | 'NEUTRAL'
  ai_summary: string | null
  tags: string[]
  original_url: string | null
}

export interface ScenarioOption {
  name: string
  probability: number
  kospi_impact: string
  description: string
  affected_sectors: string[]
  action: string
  timeline: string
  stock_impacts: { name: string; ticker: string; direction: string; sector?: string; note?: string }[]
  tier: 'FREE' | 'SIGNAL' | 'VIP'
}

export interface ScenarioItem {
  id: string
  date: string
  session: 'AM' | 'PM'
  question: string
  topic_type: string
  scenarios: ScenarioOption[]
  regime: string | null
  geo_risk_score: number
  active_chains: number
  hit_rate_30d: number
  hit_total_30d: number
  actual_outcome: string | null
  hit: boolean | null
  outcome_tagged: boolean
  tier: 'FREE' | 'SIGNAL' | 'VIP'
  created_at: string
  updated_at: string
}

export interface SupplyDemandData {
  id: string
  date: string
  foreign_net: number
  inst_net: number
  individual_net: number
  foreign_streak: number
  inst_streak: number
  sector_flows: { sector: string; foreign_net: number; streak: number }[]
  summary: string | null
}

// ─── Hooks ───

export function useInformationNews(scope?: 'GLOBAL' | 'DOMESTIC') {
  const params = new URLSearchParams()
  if (scope) params.set('scope', scope)
  // PaywallBlur 해제 상태 — 전체 공개. 복구 시 tier=FREE로 변경
  // params.set('tier', 'FREE')

  return useQuery<{ date: string | null; items: NewsItem[]; count: number }>({
    queryKey: ['information-news', scope],
    queryFn: () => fetchJson(`/api/information/news?${params}`),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

export function useInformationDisclosures(source?: 'DART' | 'EDGAR') {
  const params = new URLSearchParams()
  if (source) params.set('source', source)

  return useQuery<{ date: string | null; items: DisclosureItem[]; count: number }>({
    queryKey: ['information-disclosures', source],
    queryFn: () => fetchJson(`/api/information/disclosures?${params}`),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

export function useInformationScenarios(session?: 'AM' | 'PM') {
  const params = session ? `?session=${session}` : ''
  return useQuery<{ items: ScenarioItem[]; count: number; hit_summary?: { hit_rate_pct: number; total_tagged: number } }>({
    queryKey: ['information-scenarios', session],
    queryFn: () => fetchJson(`/api/information/scenarios${params}`),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

export function useInformationSupplyDemand() {
  return useQuery<SupplyDemandData>({
    queryKey: ['information-supply-demand'],
    queryFn: () => fetchJson('/api/information/supply-demand?tier=FREE'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}
