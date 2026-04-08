'use client'

import type { UsMarketDaily } from '../types'
import { FUTURES_LABELS, FOREX_LABELS, CRYPTO_LABELS } from '../types'

function QuoteCard({
  ticker,
  label,
  close,
  change,
  prefix = '$',
  warnCondition,
}: {
  ticker: string
  label: string
  close: number
  change: number
  prefix?: string
  warnCondition?: boolean
}) {
  const color = change >= 0 ? '#dc2626' : '#2563eb'
  return (
    <div
      className="rounded-lg px-3 py-2.5 border transition-all hover:scale-[1.02] cursor-default"
      style={{
        borderColor: warnCondition ? '#F59E0B' : 'var(--border, #E8E6E0)',
        background: warnCondition ? 'rgba(245,158,11,0.06)' : 'white',
      }}
    >
      <div className="text-[10px] font-mono text-[var(--text-muted)] mb-0.5">{ticker}</div>
      <div className="text-[11px] font-semibold text-[var(--text-primary)]">{label}</div>
      <div className="text-[13px] font-mono font-bold text-[var(--text-primary)] mt-0.5">
        {prefix}{close.toLocaleString('en-US', { maximumFractionDigits: 2 })}
      </div>
      <div className="text-[12px] font-mono font-bold mt-0.5" style={{ color }}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </div>
    </div>
  )
}

export function UsFuturesForexPanel({ data }: { data: UsMarketDaily }) {
  const { futures, forex, crypto } = data
  const hasFutures = futures && Object.keys(futures).length > 0
  const hasForex = forex && Object.keys(forex).length > 0
  const hasCrypto = crypto && Object.keys(crypto).length > 0

  if (!hasFutures && !hasForex && !hasCrypto) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* 선물 */}
      {hasFutures && (
        <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 shadow-sm">
          <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-3">
            선물 (프리마켓)
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(futures).map(([ticker, q]) => (
              <QuoteCard
                key={ticker}
                ticker={ticker}
                label={FUTURES_LABELS[ticker] ?? ticker}
                close={q.close}
                change={q.change}
                prefix=""
              />
            ))}
          </div>
        </div>
      )}

      {/* 환율 */}
      {hasForex && (
        <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 shadow-sm">
          <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-3">
            환율
          </div>
          <div className="space-y-2">
            {Object.entries(forex).map(([ticker, q]) => (
              <QuoteCard
                key={ticker}
                ticker={ticker}
                label={FOREX_LABELS[ticker] ?? ticker}
                close={q.close}
                change={q.change}
                prefix={ticker === 'EURUSD=X' ? '' : ''}
                warnCondition={ticker === 'KRW=X' && q.close >= 1400}
              />
            ))}
          </div>
        </div>
      )}

      {/* 암호화폐 */}
      {hasCrypto && (
        <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 shadow-sm">
          <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-3">
            암호화폐
          </div>
          <div className="space-y-2">
            {Object.entries(crypto).map(([ticker, q]) => (
              <QuoteCard
                key={ticker}
                ticker={ticker}
                label={CRYPTO_LABELS[ticker] ?? ticker}
                close={q.close}
                change={q.change}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
