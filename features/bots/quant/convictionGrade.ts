// 퀀트봇 — ConvictionGrade 4축 시스템
// Supply(30%) + Fundamental(30%) + Macro(20%) + Sentiment(20%)
// → AAA ~ F 등급

import type { ScoredStock } from './scoringEngine'
import type { RegimeResult } from '@/shared/lib/regime'

export interface ConvictionResult {
  ticker: string
  name: string
  grade: string
  totalScore: number
  axes: {
    supply: number    // 0~100
    fundamental: number
    macro: number
    sentiment: number
  }
}

const GRADES = [
  { min: 90, grade: 'AAA' },
  { min: 80, grade: 'AA' },
  { min: 70, grade: 'A' },
  { min: 60, grade: 'BBB' },
  { min: 50, grade: 'BB' },
  { min: 40, grade: 'B' },
  { min: 30, grade: 'C' },
  { min: 20, grade: 'D' },
  { min: 0,  grade: 'F' },
]

export function calcConvictionGrades(
  stocks: ScoredStock[],
  regime: RegimeResult,
): ConvictionResult[] {
  return stocks.map(stock => {
    // Supply (30%): 수급 점수 정규화 (breakdown.supply: -15~+20 → 0~100)
    const supplyRaw = stock.breakdown.supply
    const supply = Math.max(0, Math.min(100, (supplyRaw + 15) * (100 / 35)))

    // Fundamental (30%): Soft Scoring의 기술적 분석 기반
    // (실제 PER/PBR/ROE는 추가 API 필요 → 릴레이+TA 점수로 대체)
    const fundamental = Math.max(0, Math.min(100, (stock.breakdown.relay + stock.breakdown.technical) * 1.5))

    // Macro (20%): 레짐 점수
    const macro = regime.multiplier * 100

    // Sentiment (20%): 시그널 개수 기반 (더 많은 양성 시그널 → 높은 점수)
    const positiveSignals = stock.signals.filter(s => !s.includes('-')).length
    const sentiment = Math.min(100, positiveSignals * 20)

    // 가중합
    const totalScore = Math.round(
      supply * 0.3 + fundamental * 0.3 + macro * 0.2 + sentiment * 0.2
    )

    const gradeEntry = GRADES.find(g => totalScore >= g.min) ?? GRADES[GRADES.length - 1]

    return {
      ticker: stock.ticker,
      name: stock.name,
      grade: gradeEntry.grade,
      totalScore,
      axes: {
        supply: Math.round(supply),
        fundamental: Math.round(fundamental),
        macro: Math.round(macro),
        sentiment: Math.round(sentiment),
      },
    }
  })
}
