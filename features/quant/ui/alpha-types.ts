/* ── 알파 스캐너 공통 타입 ── */

export interface AlphaContext {
  regime: string
  regime_kr: string
  shield_status: string
  shield_kr: string
  max_drawdown: number
  max_positions: number
}

export interface SectorHeatItem {
  sector: string
  ret_5d: number
  temperature: 'HOT' | 'WARM' | 'COOL' | 'COLD'
}

export interface AlphaCandidate {
  ticker: string
  name: string
  grade: string
  total_score: number
  sector: string
  market_cap_억: number
  close: number
  per: number
  pbr: number
  div_yield: number
  revenue_억: number | null
  op_margin_pct: number | null
  earnings_verdict: string
  drawdown_pct: number
  high_252: number
  low_252: number
  sector_avg_per: number
  peer_discount_pct: number
  entry_price: number
  stop_loss: number
  target_price: number
  risk_pct: number
  reward_pct: number
  rr_ratio: number
  target_levels: { price: number; label: string }[]
  price_methods: {
    intrinsic?: { fair_value: number; dcf: number; rim: number; upside_pct: number }
    sector_per?: { fair_value: number; sector_avg_per: number; eps: number; upside_pct: number }
    recovery_52w?: { high_252: number; recovery_pct: number }
    fibonacci?: { fib_618: number; fib_382: number; '60d_high': number; '60d_low': number }
    atr?: { atr_20: number; multiplier: number; atr_stop: number }
    supply_boost?: { foreign_20d_억: number; inst_20d_억: number; type: string; overshoot_target: number }
  }
  scores: {
    value: number
    quality: number
    earnings: number
    drawdown: number
    peer_value: number
  }
  company_desc?: string
  drop_reason?: string
}

export interface SmartMoneyItem {
  ticker: string
  name: string
  foreign_5d_억: number
  inst_5d_억: number
  close: number
  change_pct: number
}

export interface ETFPerformanceEntry {
  asset_class: string
  code: string
  name: string
  close: number
  return_1y: number | null
  return_1m: number | null
  data_days: number
}

export interface ETFPerformance {
  updated_at: string
  yearly: ETFPerformanceEntry[]
  monthly: ETFPerformanceEntry[]
}

export interface AlphaScannerData {
  date: string
  generated_at: string
  context: AlphaContext
  axis_labels?: Record<string, string>
  sector_heat: SectorHeatItem[]
  grade_summary: { GOLD: number; SILVER: number; BRONZE: number }
  candidates: AlphaCandidate[]
  smart_money: {
    dual_buy: SmartMoneyItem[]
    inst_top: SmartMoneyItem[]
    fgn_top: SmartMoneyItem[]
  }
  portfolio: {
    defense_pct: number
    offense_pct: number
    allocation: Record<string, number>
  }
  etf_performance?: ETFPerformance
}
