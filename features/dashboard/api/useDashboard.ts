'use client'

import { useQuery } from '@tanstack/react-query'
import { getRefetchInterval } from '@/shared/lib/marketUtils'
import { fetchJson } from '@/shared/lib/fetchJson'

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
    queryFn: () => fetchJson('/api/dashboard/picks'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
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
    queryFn: () => fetchJson('/api/dashboard/whale'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
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
    queryFn: () => fetchJson('/api/dashboard/market-report'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
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
    queryFn: () => fetchJson('/api/dashboard/sector'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
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
    queryFn: () => fetchJson('/api/dashboard/supply-snapshot'),
    staleTime: 1000 * 30,
    refetchInterval: getRefetchInterval(1000 * 30, 1000 * 60 * 10),
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
    queryFn: () => fetchJson('/api/dashboard/china-money'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
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
    queryFn: () => fetchJson('/api/dashboard/sniper'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
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
    queryFn: () => fetchJson('/api/dashboard/etf'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 10),
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
    queryFn: () => fetchJson('/api/dashboard/morning'),
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
    queryFn: () => fetchJson('/api/market/intraday'),
    staleTime: 1000 * 60,
    refetchInterval: getRefetchInterval(1000 * 60, 1000 * 60 * 10),
  })
}

// --- KOSPI Daily (마감 기준 30일 종가 차트) ---
export function useDashboardDaily() {
  return useQuery<IntradayData>({
    queryKey: ['kospi-daily'],
    queryFn: () => fetchJson('/api/market/daily'),
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 30,
  })
}

// --- KOSPI 투자자별 일별 순매수 (30일) ---
export interface InvestorFlowPoint {
  date: string
  foreign_net: number
  inst_net: number
  indiv_net: number
}

export function useInvestorFlow() {
  return useQuery<InvestorFlowPoint[]>({
    queryKey: ['investor-flow'],
    queryFn: () => fetchJson('/api/market/investor-flow'),
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
    queryFn: () => fetchJson('/api/briefing'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
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
    queryFn: () => fetchJson('/api/heatmap'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
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
    queryFn: () => fetchJson('/api/ai-recommend'),
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
    queryFn: () => fetchJson('/api/etf-signals'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
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
    queryFn: () => fetchJson('/api/china-flow'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
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
    queryFn: () => fetchJson('/api/paper-trades'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
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
    queryFn: () => fetchJson(`/api/short-signals?type=${type}`),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

// ============================================
// Phase C: 시그널 성적표 + 모닝 브리핑 (Supabase)
// ============================================

// --- 시그널 성적표 (Supabase: scoreboard) ---
export interface ScoreboardData {
  bot_type: string
  period: string            // '30D' | '60D' | '90D' | 'ALL'
  win_rate: number
  avg_return: number
  avg_win_pct: number
  avg_lose_pct: number
  total_signals: number
  win_count: number
  loss_count: number
  best_return: number
  worst_return: number
  best_signal: { ticker: string; name: string; return_pct: number } | null
  worst_signal: { ticker: string; name: string; return_pct: number } | null
  open_positions: number
  recent_closed: { ticker_name: string; return_pct: number; close_date: string; signal_type: string }[]
  updated_at: string | null
}

export type ScoreboardPeriod = '30D' | '60D' | '90D' | 'ALL'

export function useScoreboard(botType: 'QUANT' | 'DAYTRADING' = 'QUANT', period: ScoreboardPeriod = '30D') {
  return useQuery<ScoreboardData>({
    queryKey: ['scoreboard', botType, period],
    queryFn: () => fetchJson(`/api/scoreboard?bot_type=${botType}&period=${period}`),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

// --- 시그널 목록 (Supabase: signals) ---
export interface SignalItem {
  id: string
  bot_type: string
  ticker: string
  ticker_name: string
  signal_type: string
  grade: string
  score: number
  multiplier: number
  entry_price: number
  target_price: number
  stop_price: number
  current_price: number
  return_pct: number
  max_return_pct: number
  status: string
  memo: string | null
  signal_date: string
  close_date: string | null
  close_reason: string | null
}

export function useSignals(botType?: string, status?: string) {
  const params = new URLSearchParams()
  if (botType) params.set('bot_type', botType)
  if (status) params.set('status', status)
  return useQuery<{ signals: SignalItem[]; count: number }>({
    queryKey: ['signals', botType, status],
    queryFn: () => fetchJson(`/api/signals?${params}`),
    staleTime: 1000 * 60,
    refetchInterval: getRefetchInterval(1000 * 60, 1000 * 60 * 10),
  })
}

// --- 모닝 브리핑 Phase C (Supabase: morning_briefings) ---
export interface MorningBriefingData {
  date: string
  market_status: string
  us_summary: string
  kr_summary: string
  full_report: string | null   // PAID 전용
  news_picks: { ticker: string; title: string }[]
  sector_focus: string[]
  kospi_close: number
}

export function useMorningBriefing() {
  return useQuery<MorningBriefingData>({
    queryKey: ['morning-briefing'],
    queryFn: () => fetchJson('/api/morning-briefing'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
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
    queryFn: () => fetchJson('/api/market/snapshot'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}

// ── Quant Dashboard V3 (dashboard_state.json 7-Zone) ──
export interface Zone2Item {
  ticker: string
  name: string
  action: string
  grade: string
  score: number
  reason: string
  strategy: string
  // 가격
  close?: number
  price_change?: number
  stop_loss?: number
  target_price?: number
  entry_price?: number
  entry_condition?: string
  // 기술지표
  rsi?: number
  adx?: number
  stoch_k?: number
  stoch_d?: number | null
  bb_position?: number | null
  above_ma20?: boolean
  above_ma60?: boolean
  ma5_gap?: number
  sar_trend?: number  // 1=↑, -1=↓
  // 수급
  foreign_5d?: number
  inst_5d?: number
  // 매집
  accum_phase?: string
  accum_days?: number
  accum_return?: number
  // 안전
  safety_signal?: string
  safety_label?: string
  // 점수 분해
  score_breakdown?: { multi: number; individual: number; tech: number; flow: number; safety: number; overheat: number }
  // AI
  ai_action?: string
  ai_tag?: string
  ai_bonus?: number
  // 과열
  overheat_flags?: string[]
  drawdown?: number
  consensus_upside?: number
  trade_strategy?: string
}

export interface Zone7MarketHeader {
  _market_direction: string
  _market_score: number
  _market_confidence: number
  _regime: string
  _vix: number
  _reasons: string[]
}

export interface Zone7EtfItem {
  category: string
  ticker: string
  name: string
  action: string
  confidence: number
  holding_period?: string
  portfolio_pct?: number
  stop_loss?: string
  target?: string
  entry_timing?: string
  reasons?: string[]
}

export interface Zone5SdPattern {
  ticker: string
  name: string
  grade: string
  pattern: string
  pattern_name?: string
  sd_score: number
}

export interface QuantDashboardState {
  generated_at: string
  zone1: {
    verdict: string
    cash_pct: number
    buy_pct: number
    regime: string
    regime_transition: string
    transition_prob: number
    macro_grade: string
    vix: number
    kospi: number
    kospi_chg: number
    brain_score: number
    shield_status: string
    lens_summary: string
    updated_at: string
  }
  zone2: Zone2Item[]
  zone3: {
    equity: number
    initial_capital: number
    total_return_pct: number
    week_return_pct: number
    month_return_pct: number
    win_rate: number
    pf: number
    mdd: number
    total_trades: number
    wins: number
    losses: number
    positions: { ticker: string; name: string; pnl_pct: number; days: number; strategy: string; grade: string }[]
    recent_trades: { ticker: string; name: string; side: string; pnl_pct: number; date: string }[]
  }
  zone4: {
    name: string
    score: number
    ret_5d: number
    rsi: number
    rank: number
    signal: string
    relay: string | null
    etf_code?: string
    etf_signal?: string
    etf_sizing?: string
  }[]
  zone5: {
    foreign_flow: { ticker: string; name: string; direction: string; score: number; z_score: number }[]
    sd_patterns: Zone5SdPattern[]
    supply_summary: { foreign: number; inst: number; indiv: number }
  }
  zone6: {
    tomorrow_picks: number
    whale_detect: number
    volume_spike: number
    brain: number
    recent_10: number[]
    active_signals: number
  }
  zone7?: (Zone7MarketHeader | Zone7EtfItem)[]
}

export function useQuantDashboard() {
  return useQuery<QuantDashboardState>({
    queryKey: ['quant-dashboard'],
    queryFn: () => fetchJson('/api/quant-dashboard'),
    staleTime: 1000 * 60 * 5,
    refetchInterval: getRefetchInterval(1000 * 60 * 5, 1000 * 60 * 30),
  })
}
