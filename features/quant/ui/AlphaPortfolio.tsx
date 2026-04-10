'use client'

import { useState } from 'react'
import type { ETFPerformance, ETFPerformanceEntry } from './alpha-types'

interface Props {
  defensePct: number
  offensePct: number
  allocation: Record<string, number>
  etfPerformance?: ETFPerformance
}

function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

/** 자산군별 1등만 추출 (수익률 최고) */
function getTopByAssetClass(
  etfs: ETFPerformanceEntry[],
  returnKey: 'return_1y' | 'return_1m',
): ETFPerformanceEntry[] {
  const grouped: Record<string, ETFPerformanceEntry> = {}
  for (const etf of etfs) {
    const existing = grouped[etf.asset_class]
    if (!existing || (etf[returnKey] ?? -Infinity) > (existing[returnKey] ?? -Infinity)) {
      grouped[etf.asset_class] = etf
    }
  }
  return Object.values(grouped).sort((a, b) => (b[returnKey] ?? 0) - (a[returnKey] ?? 0))
}

export default function AlphaPortfolio({ defensePct, offensePct, allocation, etfPerformance }: Props) {
  const entries = Object.entries(allocation)
  const [etfTab, setEtfTab] = useState<'yearly' | 'monthly'>('yearly')

  const etfList = etfPerformance
    ? getTopByAssetClass(
        etfTab === 'yearly' ? etfPerformance.yearly : etfPerformance.monthly,
        etfTab === 'yearly' ? 'return_1y' : 'return_1m',
      )
    : []

  return (
    <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-5">
      <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-4">자산 배분 제안</h3>

      {/* 방어 / 공격 바 */}
      <div className="flex h-7 rounded-full overflow-hidden mb-4">
        {defensePct > 0 && (
          <div
            className="bg-[#059669] flex items-center justify-center text-[12px] font-bold text-white whitespace-nowrap min-w-[80px]"
            style={{ width: `${defensePct}%` }}
          >
            방어 {defensePct}%
          </div>
        )}
        {offensePct > 0 && (
          <div
            className="bg-[#DC2626] flex items-center justify-center text-[12px] font-bold text-white whitespace-nowrap min-w-[80px]"
            style={{ width: `${offensePct}%` }}
          >
            공격 {offensePct}%
          </div>
        )}
      </div>

      {/* 자산군별 비중 */}
      {entries.length > 0 ? (
        <div className="space-y-2">
          {entries.map(([name, pct]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-[14px] font-bold text-[#1A1A2E] w-[64px] shrink-0">
                {name}
              </span>
              <div className="flex-1 h-4 bg-[#F5F4F0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#7C3AED]"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className="text-[14px] font-bold text-[#1A1A2E] w-[36px] text-right tabular-nums">
                {pct}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-[#9CA3AF]">자산 배분 데이터 없음</p>
      )}

      {/* ETF 수익률 */}
      {etfPerformance && etfPerformance.yearly.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#E8E6E0]">
          {/* 탭 토글 */}
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-[13px] font-bold text-[#6B7280]">자산군 ETF 수익률</h4>
            <div className="flex gap-0.5 bg-[#F5F4F0] rounded-lg p-0.5 ml-auto">
              {(['yearly', 'monthly'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEtfTab(t)}
                  className={`px-3 py-1 rounded-md text-[12px] font-bold transition-colors ${
                    etfTab === t
                      ? 'bg-white shadow-sm text-[#1A1A2E]'
                      : 'text-[#9CA3AF] hover:text-[#6B7280]'
                  }`}
                >
                  {t === 'yearly' ? '연간' : '월간'}
                </button>
              ))}
            </div>
          </div>

          {/* ETF 리스트 */}
          <div className="space-y-1.5">
            {etfList.map((etf) => {
              const ret = etfTab === 'yearly' ? etf.return_1y : etf.return_1m
              const positive = (ret ?? 0) >= 0
              return (
                <div key={etf.code} className="flex items-center gap-2 text-[13px]">
                  <span className="text-[#7C3AED] font-bold w-[48px] shrink-0">
                    {etf.asset_class}
                  </span>
                  <span className="text-[#6B7280] truncate flex-1" title={etf.name}>
                    {etf.name}
                  </span>
                  <span className="text-[#1A1A2E] tabular-nums shrink-0">
                    {fmtPrice(etf.close)}원
                  </span>
                  <span
                    className={`font-bold tabular-nums shrink-0 w-[56px] text-right ${
                      positive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}
                  >
                    {positive ? '+' : ''}{(ret ?? 0).toFixed(1)}%
                  </span>
                </div>
              )
            })}
          </div>

          {/* 기준일 */}
          {etfPerformance.updated_at && (
            <p className="text-[11px] text-[#9CA3AF] mt-2">
              기준: {etfPerformance.updated_at}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
