'use client'

import type { CommodityInfo } from '../types'

const ZONE_STYLE: Record<string, { color: string; label: string }> = {
  buy: { color: 'text-[var(--green)]', label: '매수구간' },
  watch: { color: 'text-[var(--yellow)]', label: '관찰' },
  hold: { color: 'text-orange-600', label: '보유' },
  overheated: { color: 'text-[var(--up)]', label: '과열' },
}

export default function CommodityTable({ commodities }: { commodities: CommodityInfo[] }) {
  if (!commodities.length) {
    return <p className="text-[var(--text-muted)] text-sm">원자재 데이터가 없습니다.</p>
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
              <th className="text-left py-2 px-2">원자재</th>
              <th className="text-right py-2 px-2">현재가</th>
              <th className="text-right py-2 px-2">원가</th>
              <th className="text-right py-2 px-2">갭%</th>
              <th className="text-center py-2 px-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {commodities.map((c) => {
              const zs = ZONE_STYLE[c.zone] ?? { color: 'text-[var(--text-dim)]', label: c.zone }
              return (
                <tr key={c.key} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                  <td className="py-2 px-2">
                    <span className="text-[var(--text-primary)]">{c.name}</span>
                    <span className="text-[var(--text-muted)] text-xs ml-1">{c.unit}</span>
                  </td>
                  <td className="text-right py-2 px-2 text-[var(--text-primary)] font-mono">{c.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="text-right py-2 px-2 text-[var(--text-muted)] font-mono">{c.production_cost.toLocaleString()}</td>
                  <td className={`text-right py-2 px-2 font-mono font-bold ${zs.color}`}>{c.gap_pct.toFixed(1)}%</td>
                  <td className="text-center py-2 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${zs.color} bg-gray-50 border border-[var(--border)]`}>{zs.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-[var(--text-muted)]">
        <span><span className="text-[var(--green)]">{'\u25CF'}</span> 매수구간 (&lt;20%)</span>
        <span><span className="text-[var(--yellow)]">{'\u25CF'}</span> 관찰 (20~40%)</span>
        <span><span className="text-orange-600">{'\u25CF'}</span> 보유 (40~80%)</span>
        <span><span className="text-[var(--up)]">{'\u25CF'}</span> 과열 (80%+)</span>
      </div>
    </div>
  )
}
