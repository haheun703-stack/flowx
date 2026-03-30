// 시나리오 대시보드 타입 정의 (퀀트봇 quant_scenario_dashboard 테이블 기반)

export interface ScenarioDashboard {
  market_status: MarketStatus
  active_scenarios: ActiveScenario[]
  commodities: CommodityInfo[]
  scenario_stocks: ScenarioStock[]
  etf_map: ScenarioETF[]
  conflicts: SupplyConflict[]
  deep_analyses?: DeepAnalysis[]
}

export interface DeepAnalysis {
  scenario_id: string
  title: string
  updated: string
  summary: string
  key_numbers: Record<string, number>
  beneficiaries: Beneficiary[]
  oil_scenarios: OilScenario[]
  charts_html: Record<string, string>
}

export interface Beneficiary {
  name: string
  earned_bil: number
  type: string
  stop_condition: string
  tickers_us?: string[]
  tickers_kr?: string[]
}

export interface OilScenario {
  name: string
  wti_q2: number
  wti_q4: number
  probability: number
}

export interface MarketStatus {
  verdict: string
  regime: string
  kospi: number
  kospi_chg: number
  vix: number
  cash_pct: number
  shield_status: string
  updated_at: string
}

export interface ScenarioPhase {
  phase: number
  name: string
  hot_sectors: string[]
  cold_sectors: string[]
  etf: string[]
  is_current: boolean
}

export interface ActiveScenario {
  id: string
  name: string
  current_phase: number
  total_phases: number
  days_active: number
  score: number
  reasons: string[]
  phase_name: string
  hot_sectors: string[]
  cold_sectors: string[]
  hot_tickers: { code: string; name: string }[]
  etf: string[]
  logic: string
  chain: ScenarioPhase[]
  next_phase_name: string
  next_hot: string[]
}

export interface CommodityInfo {
  key: string
  name: string
  price: number
  unit: string
  production_cost: number
  gap_pct: number
  zone: string
}

export interface ScenarioStock {
  ticker: string
  name: string
  grade: string
  total_score: number
  scenario_tag: string
  scenario_narrative: string
  scenario_bonus: number
  scenario_risk_reward: Record<string, unknown>
  rsi: number
  close: number
  entry_price: number
  stop_loss: number
  target_price: number
  foreign_5d: number
  inst_5d: number
}

export interface ScenarioETF {
  scenario_id: string
  scenario_name: string
  phase: number
  phase_name: string
  etfs: string[]
}

export interface SupplyConflict {
  scenario: string
  scenario_score?: number
  sector: string
  total_flow_bil: number
  price_change_5?: number
  warning: string
}
