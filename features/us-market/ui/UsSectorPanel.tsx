'use client'

import type { UsMarketDaily } from '../types'
import { SECTOR_ETF_LABELS } from '../types'

function SectorCell({ ticker, change }: { ticker: string; change: number }) {
  const label = SECTOR_ETF_LABELS[ticker] ?? ticker
  const abs = Math.abs(change)

  const bg =
    change >= 2   ? 'rgba(220,38,38,0.18)' :
    change >= 1   ? 'rgba(220,38,38,0.10)' :
    change >= 0.3 ? 'rgba(220,38,38,0.05)' :
    change >= -0.3 ? 'rgba(150,150,150,0.08)' :
    change >= -1  ? 'rgba(37,99,235,0.05)' :
    change >= -2  ? 'rgba(37,99,235,0.10)' :
                    'rgba(37,99,235,0.18)'

  const textColor = abs >= 1 ? 'var(--text-primary)' : 'var(--text-muted)'

  return (
    <div
      className="rounded-lg px-3 py-2.5 text-center transition-all hover:scale-[1.02] cursor-default border border-[var(--border)]"
      style={{ background: bg }}
    >
      <div className="text-[10px] font-mono text-[var(--text-muted)] mb-0.5">{ticker}</div>
      <div className="text-[11px] font-semibold" style={{ color: textColor }}>{label}</div>
      <div
        className="text-[13px] font-mono font-bold mt-0.5"
        style={{ color: change >= 0 ? '#dc2626' : '#2563eb' }}
      >
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </div>
    </div>
  )
}

export function UsSectorPanel({ data }: { data: UsMarketDaily }) {
  const { sector_etf, risk_flags, kr_impact, soxx_change } = data
  const sortedSectors = Object.entries(sector_etf).sort(([, a], [, b]) => b - a)
  const hasRisk = risk_flags && risk_flags.length > 0

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 좌: 섹터 ETF 히트맵 */}
      <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase">
            S&P 500 섹터 ETF
          </span>
          <span className="text-[10px] text-[var(--text-dim)] font-mono">등락률 순</span>
        </div>

        {sortedSectors.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {sortedSectors.map(([ticker, change]) => (
              <SectorCell key={ticker} ticker={ticker} change={change} />
            ))}
          </div>
        ) : (
          <div className="text-[var(--text-dim)] text-sm text-center py-8">섹터 데이터 없음</div>
        )}

        {/* SOXX 특별 강조 */}
        {soxx_change != null && (
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#16a34a] font-bold">SOXX</span>
                <span className="text-[10px] text-[var(--text-dim)] ml-1">→ 삼성·하이닉스 선행지표</span>
              </div>
              <span
                className="text-[14px] font-mono font-bold"
                style={{ color: soxx_change >= 0 ? '#dc2626' : '#2563eb' }}
              >
                {soxx_change >= 0 ? '+' : ''}{soxx_change.toFixed(2)}%
              </span>
            </div>
            <div className="text-[10px] font-mono mt-1 text-[var(--text-dim)]">
              {soxx_change <= -3
                ? '⚠️ 반도체 급락 → 한국 반도체주 갭다운 주의'
                : soxx_change >= 2
                ? '반도체 강세 → 삼성·하이닉스 갭업 예상'
                : '→ 다음날 반도체주 갭 영향 제한적'}
            </div>
          </div>
        )}
      </div>

      {/* 우: 위험 플래그 + 한국 영향 요약 */}
      <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-4 space-y-4 shadow-sm">
        <div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-2">
            한국 영향 요약
          </div>
          {kr_impact ? (
            <div className="text-[12px] text-[var(--text-primary)] font-mono leading-relaxed bg-gray-50 rounded-lg px-3 py-2.5 border border-[var(--border)]">
              {kr_impact.split(' | ').map((part, i) => (
                <div key={i} className="py-0.5">
                  {part.startsWith('⚠️') ? (
                    <span className="text-[#f59e0b]">{part}</span>
                  ) : (
                    <span>{part}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[var(--text-dim)] text-sm">분석 데이터 없음</div>
          )}
        </div>

        <div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono tracking-wider uppercase mb-2">
            위험 플래그
          </div>
          {hasRisk ? (
            <div className="space-y-1.5">
              {risk_flags.map((flag, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[11px] font-mono px-2.5 py-1.5 rounded bg-red-50 text-[#dc2626] border border-red-100"
                >
                  <span>●</span>
                  {flag}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] font-mono px-2.5 py-1.5 rounded bg-green-50 text-[#16a34a] border border-green-100">
              <span>●</span>
              특이 위험 없음
            </div>
          )}
        </div>

        <div className="text-[10px] text-[var(--text-dim)] font-mono pt-2 border-t border-[var(--border)]">
          기준일: {data.date} | 정보봇 자동수집
        </div>
      </div>
    </div>
  )
}
