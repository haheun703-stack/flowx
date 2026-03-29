'use client'

import type { ScenarioStock } from '../types'

function formatKRW(n: number) {
  if (n >= 1_000_000) return `${(n / 10_000).toFixed(0)}만`
  return n.toLocaleString()
}

function flowLabel(val: number) {
  if (val === 0) return { text: '-', color: 'text-[var(--text-muted)]' }
  const bil = val / 1_000_000_000
  return { text: `${bil >= 0 ? '+' : ''}${bil.toFixed(0)}억`, color: bil >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]' }
}

export default function ScenarioStockCard({ stocks }: { stocks: ScenarioStock[] }) {
  if (!stocks.length) {
    return <p className="text-[var(--text-muted)] text-sm">시나리오 연동 종목이 없습니다.</p>
  }

  return (
    <div className="space-y-3">
      {stocks.map((st) => (
        <div key={st.ticker} className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-primary)] font-bold">{st.name}</span>
              <span className="text-[var(--text-muted)] text-xs">{st.ticker}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-[var(--down)] border border-blue-200">{st.scenario_tag}</span>
            </div>
            <span className={`text-sm font-bold ${st.total_score >= 60 ? 'text-[var(--green)]' : st.total_score >= 40 ? 'text-[var(--yellow)]' : 'text-[var(--text-dim)]'}`}>{st.total_score.toFixed(1)}점</span>
          </div>

          {st.scenario_narrative && <p className="text-xs text-[var(--text-dim)] mb-3 leading-relaxed">{st.scenario_narrative}</p>}

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <div className="bg-gray-50 rounded p-2"><span className="text-[var(--text-muted)] block">현재가</span><span className="text-[var(--text-primary)] font-mono">{formatKRW(st.close)}</span></div>
            <div className="bg-gray-50 rounded p-2"><span className="text-[var(--text-muted)] block">진입가</span><span className="text-[var(--text-primary)] font-mono">{formatKRW(st.entry_price)}</span></div>
            <div className="bg-gray-50 rounded p-2"><span className="text-[var(--text-muted)] block">목표가</span><span className="text-[var(--green)] font-mono">{formatKRW(st.target_price)}</span></div>
            <div className="bg-gray-50 rounded p-2"><span className="text-[var(--text-muted)] block">손절가</span><span className="text-[var(--up)] font-mono">{formatKRW(st.stop_loss)}</span></div>
            <div className="bg-gray-50 rounded p-2"><span className="text-[var(--text-muted)] block">RSI</span><span className={`font-mono ${st.rsi >= 70 ? 'text-[var(--up)]' : st.rsi <= 30 ? 'text-[var(--green)]' : 'text-[var(--text-primary)]'}`}>{st.rsi.toFixed(1)}</span></div>
            <div className="bg-gray-50 rounded p-2"><span className="text-[var(--text-muted)] block">수급 5일</span><span className={`font-mono ${flowLabel(st.foreign_5d).color}`}>외{flowLabel(st.foreign_5d).text}</span></div>
          </div>
        </div>
      ))}
    </div>
  )
}
