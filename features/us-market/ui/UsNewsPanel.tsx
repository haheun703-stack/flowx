'use client'

import type { UsMarketDaily } from '../types'

const IMPACT_STYLE = {
  positive: { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', label: '호재' },
  negative: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', label: '악재' },
  neutral:  { bg: '#F9FAFB', border: '#E5E7EB', text: '#6B7280', label: '중립' },
} as const

export function UsNewsPanel({ data }: { data: UsMarketDaily }) {
  const news = data.us_news
  if (!news || news.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 shadow-sm">
      <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-3">
        미국장 뉴스 TOP {news.length}
      </div>
      <div className="space-y-2.5">
        {news.map((item, i) => {
          const style = IMPACT_STYLE[item.impact] ?? IMPACT_STYLE.neutral
          return (
            <div
              key={i}
              className="rounded-lg px-3.5 py-3 border"
              style={{ background: style.bg, borderColor: style.border }}
            >
              <div className="flex items-start gap-2">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                  style={{ background: `${style.text}15`, color: style.text, border: `1px solid ${style.border}` }}
                >
                  {style.label}
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--text-primary)] leading-snug">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5F4F0] text-[var(--text-muted)]">
                      {item.sector}
                    </span>
                  </div>
                  {item.summary && (
                    <div className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                      {item.summary}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
