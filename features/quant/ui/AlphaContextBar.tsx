'use client'

import type { AlphaContext } from './alpha-types'

const REGIME_CFG: Record<string, { color: string }> = {
  '위기':   { color: '#DC2626' },
  '하락장': { color: '#EA580C' },
  '주의':   { color: '#CA8A04' },
  '상승장': { color: '#16A34A' },
}

const SHIELD_CFG: Record<string, { color: string; icon: string }> = {
  '경고': { color: '#DC2626', icon: '🔴' },
  '주의': { color: '#CA8A04', icon: '🟡' },
  '안전': { color: '#16A34A', icon: '🟢' },
}

export default function AlphaContextBar({ ctx }: { ctx: AlphaContext }) {
  const r = REGIME_CFG[ctx.regime_kr] ?? REGIME_CFG['주의']
  const s = SHIELD_CFG[ctx.shield_kr] ?? SHIELD_CFG['주의']

  return (
    <div
      className="flex items-center justify-between px-6 py-3 rounded-xl flex-wrap gap-3"
      style={{ backgroundColor: '#1A1A2E' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[#A5B4C3]">시장 국면</span>
        <span
          className="text-[14px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ color: r.color, backgroundColor: `${r.color}20` }}
        >
          {ctx.regime_kr}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[#A5B4C3]">방어막</span>
        <span className="text-[13px]">{s.icon}</span>
        <span className="text-[14px] font-bold text-white">{ctx.shield_kr}</span>
        <span className="text-[12px] text-[#A5B4C3]">
          (최대 낙폭 {ctx.max_drawdown.toFixed(1)}%)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[#A5B4C3]">보유 한도</span>
        <span className="text-[14px] font-bold text-white">{ctx.max_positions}종목</span>
      </div>
    </div>
  )
}
