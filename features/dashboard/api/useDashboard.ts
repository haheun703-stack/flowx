'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { isMarketOpen } from '@/features/market-ticker/api/fetchKoreanTickers'

function useRefetchInterval(fastMs: number, slowMs: number) {
  return isMarketOpen() ? fastMs : slowMs
}

// --- Tomorrow Picks ---
export interface PickItem {
  ticker: string
  name: string
  grade: string
  total_score: number
  close: number
  price_change: number
  entry_price: number
  stop_loss: number
  target_price: number
  reasons: string[]
  foreign_5d: number
  inst_5d: number
  rsi: number
  score_breakdown: {
    multi: number
    individual: number
    tech: number
    flow: number
    safety: number
    overheat: number
  }
}

export interface AiLargecap {
  ticker: string
  name: string
  confidence: number
  reasoning: string
  urgency: string
  expected_impact_pct: number
}

export interface PicksData {
  generated_at: string
  target_date: string
  target_date_label: string
  stats: Record<string, number>
  top5: string[]
  ai_largecap: AiLargecap[]
  picks: PickItem[]
}

export function useDashboardPicks() {
  return useQuery<PicksData>({
    queryKey: ['dashboard-picks'],
    queryFn: () => axios.get('/api/dashboard/picks').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
  })
}

// --- Whale Detect ---
export interface WhaleItem {
  ticker: string
  name: string
  close: number
  price_change: number
  volume: number
  volume_surge_ratio: number
  grade: string
  strength: number
  pattern_count: number
  patterns: { pattern: string; strength: number; desc: string }[]
}

export interface WhaleData {
  updated_at: string
  total_scanned: number
  total_detected: number
  stats: Record<string, number>
  items: WhaleItem[]
}

export function useDashboardWhale() {
  return useQuery<WhaleData>({
    queryKey: ['dashboard-whale'],
    queryFn: () => axios.get('/api/dashboard/whale').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
  })
}

// --- Market Report ---
export interface MarketReport {
  date: string
  generated_at: string
  market_stance: string
  us_grade: string
  us_score: number
  kospi_regime: string
  kospi_slots: number
  quantum_count: number
  relay_fired: number
  relay_signals: number
  positions_total: number
  buys: number
  sells: number
}

export function useDashboardMarket() {
  return useQuery<MarketReport>({
    queryKey: ['dashboard-market'],
    queryFn: () => axios.get('/api/dashboard/market-report').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
  })
}

// --- Sector Momentum ---
export interface SectorItem {
  rank: number
  sector: string
  etf_code: string
  category: string
  momentum_score: number
  ret_5: number
  ret_20: number
  ret_60: number
  rank_prev: number
  rank_change: number
  acceleration: boolean
  rsi_14: number
}

export interface SectorData {
  date: string
  sectors: SectorItem[]
}

export function useDashboardSector() {
  return useQuery<SectorData>({
    queryKey: ['dashboard-sector'],
    queryFn: () => axios.get('/api/dashboard/sector').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
  })
}

// --- Supply Snapshot ---
export interface SupplySnapshot {
  snapshot_num: number
  label: string
  time: string
  timestamp: string
  stocks: Record<string, unknown>
}

export function useDashboardSupply() {
  return useQuery<SupplySnapshot>({
    queryKey: ['dashboard-supply-snapshot'],
    queryFn: () => axios.get('/api/dashboard/supply-snapshot').then(r => r.data),
    staleTime: 1000 * 30,
    refetchInterval: useRefetchInterval(1000 * 30, 1000 * 60 * 10),
  })
}

// --- China Money ---
export interface ChinaMoneySignal {
  date: string
  ticker: string
  name: string
  signal: string
  score: number
  reasons: string[]
  foreign_net_5d: number
  foreign_zscore: number
  ewy_decouple: boolean
  consecutive_days: number
  pct_change_5d: number
}

export interface ChinaMoneyData {
  date: string
  generated_at: string
  total_stocks: number
  summary: Record<string, number>
  signals: ChinaMoneySignal[]
}

export function useDashboardChinaMoney() {
  return useQuery<ChinaMoneyData>({
    queryKey: ['dashboard-china-money'],
    queryFn: () => axios.get('/api/dashboard/china-money').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
  })
}

// --- Sniper Watch ---
export interface SniperItem {
  code: string
  name: string
  group: string
  grade: string
  sector: string
  thesis: string
  analysis: {
    price: number
    change_pct: number
    ma_status: string
    rsi: number
    verdict: string
  }
  scan_date: string
}

export function useDashboardSniper() {
  return useQuery<SniperItem[]>({
    queryKey: ['dashboard-sniper'],
    queryFn: () => axios.get('/api/dashboard/sniper').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
  })
}

// --- ETF Signal ---
export interface EtfItem {
  sector: string
  etf_code: string
  etf_name: string
  category: string
  close: number
  ret_1: number
  ret_5: number
  ret_20: number
  rsi: number
  score: number
  grade: string
  reasons: string[]
}

export interface EtfData {
  updated_at: string
  etf_count: number
  etfs: EtfItem[]
}

export function useDashboardEtf() {
  return useQuery<EtfData>({
    queryKey: ['dashboard-etf'],
    queryFn: () => axios.get('/api/dashboard/etf').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
  })
}

// --- Morning News ---
export interface NewsArticle {
  date: string
  title: string
  source: string
  impact: string
  url: string
}

export interface MorningData {
  crawled_at: string
  article_count: number
  high_impact: number
  articles: NewsArticle[]
}

export function useDashboardMorning() {
  return useQuery<MorningData>({
    queryKey: ['dashboard-morning'],
    queryFn: () => axios.get('/api/dashboard/morning').then(r => r.data),
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
  })
}

// --- KOSPI Intraday ---
export interface IntradayPoint {
  time: number
  value: number
}

export interface IntradayData {
  points: IntradayPoint[]
  currentPrice: number
  change: number
  changePercent: number
  marketOpen: boolean
  mode: string
}

export function useDashboardIntraday() {
  return useQuery<IntradayData>({
    queryKey: ['kospi-intraday'],
    queryFn: () => axios.get('/api/market/intraday').then(r => r.data),
    staleTime: 1000 * 60,
    refetchInterval: useRefetchInterval(1000 * 60, 1000 * 60 * 10),
  })
}
