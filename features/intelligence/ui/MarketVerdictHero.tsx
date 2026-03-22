'use client'

import { useIntelligenceSupplyDemand } from '../api/useIntelligence'

type Verdict = 'BUY' | 'SELL' | 'HOLD'

function deriveVerdict(
  foreignNet: number,
  instNet: number,
  foreignStreak: number,
  instStreak: number,
): { verdict: Verdict; label: string; reason: string } {
  const fBuy = foreignNet > 0
  const iBuy = instNet > 0

  if (fBuy && iBuy) {
    const parts: string[] = []
    parts.push(foreignStreak > 1 ? `외국인 ${foreignStreak}일 연속 순매수` : '외국인 순매수')
    parts.push(instStreak > 1 ? `기관 ${instStreak}일 연속 동반` : '기관 동반 매수')
    return { verdict: 'BUY', label: '매수 우위', reason: parts.join(', ') }
  }

  if (!fBuy && !iBuy) {
    const parts: string[] = []
    parts.push(foreignStreak < -1 ? `외국인 ${Math.abs(foreignStreak)}일 연속 순매도` : '외국인 순매도')
    parts.push(instStreak < -1 ? `기관 ${Math.abs(instStreak)}일 연속 동반` : '기관 동반 매도')
    return { verdict: 'SELL', label: '매도 우위', reason: parts.join(', ') }
  }

  return { verdict: 'HOLD', label: '관망', reason: '외국인·기관 방향 혼조, 추세 확인 필요' }
}

const VERDICT_STYLE: Record<Verdict, { bg: string; border: string; textColor: string; icon: string }> = {
  BUY: {
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(6,78,59,0.30) 100%)',
    border: '2px solid rgba(16,185,129,0.6)',
    textColor: '#34d399',
    icon: '▲',
  },
  SELL: {
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.45) 0%, rgba(127,29,29,0.30) 100%)',
    border: '2px solid rgba(239,68,68,0.6)',
    textColor: '#f87171',
    icon: '▼',
  },
  HOLD: {
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.40) 0%, rgba(120,53,15,0.25) 100%)',
    border: '2px solid rgba(245,158,11,0.5)',
    textColor: '#fbbf24',
    icon: '■',
  },
}

export function MarketVerdictHero() {
  const { data, isLoading } = useIntelligenceSupplyDemand()

  if (isLoading) {
    return (
      <div className="h-[120px] bg-[#0d1117] rounded-lg animate-pulse border border-[#2a2a3a]" />
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[120px] bg-[#0d1117] rounded-lg border border-[#2a2a3a]">
        <span className="text-[#334155] text-sm">수급 데이터 없음 — 판정 불가</span>
      </div>
    )
  }

  const { verdict, label, reason } = deriveVerdict(
    data.foreign_net, data.inst_net, data.foreign_streak, data.inst_streak,
  )
  const style = VERDICT_STYLE[verdict]

  return (
    <div
      className="rounded-2xl p-8 relative overflow-hidden min-h-[160px]"
      style={{ background: style.bg, border: style.border }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-bold tracking-widest uppercase text-gray-400">오늘의 시장 판정</span>
          <span className="text-xs px-2.5 py-1 rounded border font-bold"
            style={{ color: style.textColor, borderColor: style.textColor + '60' }}>
            {data.date}
          </span>
        </div>
        <div className="flex items-baseline gap-4">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black leading-none tracking-tight" style={{ color: style.textColor }}>
            {label}
          </div>
        </div>
        <div className="text-base sm:text-lg text-gray-300 mt-2 font-medium">
          {reason}
        </div>
      </div>
    </div>
  )
}
