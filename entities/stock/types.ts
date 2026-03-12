export interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SupplyData {
  date: string
  foreign: number
  institution: number
  individual: number
}

export interface SupplySignal {
  icon: string
  text: string
  strength: 'strong' | 'medium' | 'weak'
}

export interface StockInfo {
  code: string
  name: string
}
