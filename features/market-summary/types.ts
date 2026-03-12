export interface IntradayPoint {
  time: string    // "09:00"
  value: number   // KOSPI 지수값
}

export interface IndexCard {
  name: string
  code: string
  price: number
  change: number
  changePercent: number
  currency: string
}

export interface SectorData {
  name: string
  changePercent: number
  count: number
}

export interface SupplyStock {
  code: string
  name: string
  price: number
  changePercent: number
  foreignNet: number
  instNet: number
}

export interface WatchItem {
  code: string
  name: string
  price: number
  changePercent: number
}
