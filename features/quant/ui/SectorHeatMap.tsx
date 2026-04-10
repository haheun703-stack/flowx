'use client'

import type { SectorHeatItem } from './alpha-types'

const TEMP_CFG: Record<string, { bg: string; text: string }> = {
  HOT:  { bg: '#DC2626', text: '#FFFFFF' },
  WARM: { bg: '#EA580C', text: '#FFFFFF' },
  COOL: { bg: '#3B82F6', text: '#FFFFFF' },
  COLD: { bg: '#9CA3AF', text: '#FFFFFF' },
}

export default function SectorHeatMap({ items }: { items: SectorHeatItem[] }) {
  if (!items.length) return null

  return (
    <div className="flex gap-3 overflow-x-auto py-3 px-1">
      {items.map((s) => {
        const c = TEMP_CFG[s.temperature] ?? TEMP_CFG.COOL
        return (
          <div
            key={s.sector}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold"
            style={{ backgroundColor: c.bg, color: c.text }}
          >
            <span>{s.sector}</span>
            <span className="tabular-nums">
              {s.ret_5d >= 0 ? '+' : ''}{s.ret_5d.toFixed(1)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
