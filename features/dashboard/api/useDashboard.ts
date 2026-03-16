'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRefetchInterval } from '@/shared/lib/marketUtils'

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
  lastDate?: string
}

export function useDashboardIntraday() {
  return useQuery<IntradayData>({
    queryKey: ['kospi-intraday'],
    queryFn: () => axios.get('/api/market/intraday').then(r => r.data),
    staleTime: 1000 * 60,
    refetchInterval: useRefetchInterval(1000 * 60, 1000 * 60 * 10),
  })
}

// --- KOSPI Daily (마감 기준 30일 종가 차트) ---
export function useDashboardDaily() {
  return useQuery<IntradayData>({
    queryKey: ['kospi-daily'],
    queryFn: () => axios.get('/api/market/daily').then(r => r.data),
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 30,
  })
}

// ============================================
// Supabase-backed APIs (Phase A)
// ============================================

// --- 모닝 브리핑 (Supabase: market_briefing) ---
export interface BriefingData {
  date: string
  direction: string
  market_phase: string
  kospi_close: number
  us_summary: string
  kr_summary: string
  news_picks: { code: string; name: string; reason: string }[]
}

export function useBriefing() {
  return useQuery<BriefingData>({
    queryKey: ['briefing'],
    queryFn: () => axios.get('/api/briefing').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

// --- 섹터 히트맵 (Supabase: sector_heatmap) ---
export interface HeatmapItem {
  date: string
  sector: string
  score: number
  change_5d: number
  change_20d: number
  change_60d: number
  rsi: number
  foreign_flow: number
  inst_flow: number
  top_stocks: string[]
}

export function useHeatmap() {
  return useQuery<HeatmapItem[]>({
    queryKey: ['heatmap'],
    queryFn: () => axios.get('/api/heatmap').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

// --- AI 추천 무료 (Claude + Web Search) ---
export interface AiRecommendPick {
  name: string
  code: string
  reason: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

export interface AiRecommendData {
  date: string
  market_summary: string
  picks: AiRecommendPick[]
}

export function useAiRecommend() {
  return useQuery<AiRecommendData>({
    queryKey: ['ai-recommend'],
    queryFn: () => axios.get('/api/ai-recommend').then(r => r.data),
    staleTime: 1000 * 60 * 60, // 1시간 캐시
    refetchInterval: 1000 * 60 * 60,
  })
}

// ============================================
// Supabase-backed APIs (Phase B)
// ============================================

// --- ETF 시그널 (Supabase: etf_signals) ---
export interface EtfSignalItem {
  date: string
  sector: string
  etf_code: string
  etf_name: string
  close: number
  ret_1: number
  ret_5: number
  ret_20: number
  rsi: number
  score: number
  grade: string
  sector_rotation_rank: number
  reasons: string[]
}

export function useEtfSignals() {
  return useQuery<EtfSignalItem[]>({
    queryKey: ['etf-signals'],
    queryFn: () => axios.get('/api/etf-signals').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

// --- 중국자금 흐름 (Supabase: china_flow) ---
export interface ChinaFlowItem {
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

export function useChinaFlow() {
  return useQuery<ChinaFlowItem[]>({
    queryKey: ['china-flow'],
    queryFn: () => axios.get('/api/china-flow').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

// --- 페이퍼 트레이딩 수익률 (Supabase: paper_trades) ---
export interface PaperTrade {
  trade_date: string
  ticker: string
  name: string
  side: string
  entry_price: number
  exit_price: number
  pnl_pct: number
  cumulative_pf: number
  cumulative_mdd: number
  win_rate: number
}

export interface PaperTradesData {
  trades: PaperTrade[]
  cumulative: {
    pf: number
    mdd: number
    win_rate: number
    total_trades: number
  }
}

export function usePaperTrades() {
  return useQuery<PaperTradesData>({
    queryKey: ['paper-trades'],
    queryFn: () => axios.get('/api/paper-trades').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

// --- 단기 시그널 (Supabase: short_signals) ---
export interface ShortSignalItem {
  date: string
  code: string
  name: string
  grade: string
  total_score: number
  signal_type: string
  volume_ratio: number
  entry_price: number
  stop_loss: number
  target_price: number
  holding_days: number
  momentum_regime: string
  inst_support: boolean
  foreign_detail: Record<string, number>
}

export function useShortSignals(type: 'all' | 'force' | 'watch' = 'all') {
  return useQuery<ShortSignalItem[]>({
    queryKey: ['short-signals', type],
    queryFn: () => axios.get(`/api/short-signals?type=${type}`).then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

// --- 시장 스냅샷 (KIS API cron → Supabase/캐시) ---
export interface MarketSnapshotStock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
}

export interface MarketSnapshot {
  kospi_price: number
  kospi_change: number
  kosdaq_price: number
  kosdaq_change: number
  stocks: MarketSnapshotStock[]
  foreign_inst: {
    foreign_net: number
    inst_net: number
    individual_net: number
  }
  sectors: { name: string; changePercent: number }[]
  updated_at: string
}

export function useMarketSnapshot() {
  return useQuery<MarketSnapshot>({
    queryKey: ['market-snapshot'],
    queryFn: () => axios.get('/api/market/snapshot').then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchInterval: useRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}
