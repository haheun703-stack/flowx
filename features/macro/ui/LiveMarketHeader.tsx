'use client'

import { useEffect, useState } from 'react'

/* ── 타입 (macro_dashboard flat 컬럼) ── */
interface MacroRow {
  date: string
  updated_at: string
  /* 지수 */
  sp500: number | null; sp500_chg: number | null
  kospi: number | null; kospi_chg: number | null
  kosdaq: number | null; kosdaq_chg: number | null
  vix: number | null; vix_chg: number | null
  /* 원자재 */
  gold: number | null; gold_chg: number | null
  /* 에너지 (JSONB) */
  data: { energy?: { wti?: number; brent?: number } } | null
  /* 환율 */
  usd_krw: number | null; usd_krw_chg: number | null
  dxy: number | null; dxy_chg: number | null
  /* 금리 */
  fed_funds: number | null
  us_10y: number | null; us_2y: number | null
  /* 크립토 */
  btc: number | null; btc_chg: number | null
  /* 추세 */
  vix_trend: string | null
  gold_trend: string | null
  usd_krw_trend: string | null
}

/* ── 설정 ── */
interface Indicator {
  key: string
  label: string
  getValue: (r: MacroRow) => number | null
  getChg: (r: MacroRow) => number | null
  format: (v: number) => string
  /** true면 양수가 나쁜 것 (VIX 등) */
  invertColor?: boolean
  unit?: string
}

const fmt0 = (v: number) => v.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
const fmt1 = (v: number) => v.toLocaleString('ko-KR', { maximumFractionDigits: 1 })
const fmt2 = (v: number) => v.toLocaleString('ko-KR', { maximumFractionDigits: 2 })

const INDICATORS: Indicator[] = [
  { key: 'sp500', label: 'S&P 500', getValue: r => r.sp500, getChg: r => r.sp500_chg, format: fmt0 },
  { key: 'kospi', label: 'KOSPI', getValue: r => r.kospi, getChg: r => r.kospi_chg, format: fmt0 },
  { key: 'kosdaq', label: 'KOSDAQ', getValue: r => r.kosdaq, getChg: r => r.kosdaq_chg, format: fmt0 },
  { key: 'vix', label: 'VIX', getValue: r => r.vix, getChg: r => r.vix_chg, format: fmt1, invertColor: true },
  { key: 'gold', label: 'Gold', getValue: r => r.gold, getChg: r => r.gold_chg, format: fmt0, unit: '$' },
  { key: 'wti', label: 'WTI', getValue: r => r.data?.energy?.wti ?? null, getChg: () => null, format: fmt1, unit: '$' },
  { key: 'usd_krw', label: 'USD/KRW', getValue: r => r.usd_krw, getChg: r => r.usd_krw_chg, format: fmt0, unit: '원', invertColor: true },
  { key: 'dxy', label: 'DXY', getValue: r => r.dxy, getChg: r => r.dxy_chg, format: fmt1 },
  { key: 'btc', label: 'BTC', getValue: r => r.btc, getChg: r => r.btc_chg, format: fmt0, unit: '$' },
  { key: 'fed', label: 'Fed 금리', getValue: r => r.fed_funds, getChg: () => null, format: fmt2, unit: '%' },
  { key: 'us10y', label: 'US 10Y', getValue: r => r.us_10y, getChg: () => null, format: fmt2, unit: '%' },
]

/* ── 컴포넌트 ── */
export default function LiveMarketHeader() {
  const [row, setRow] = useState<MacroRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/macro/dashboard', { signal: ac.signal })
      .then(r => r.json())
      .then(j => { if (j.data) setRow(j.data) })
      .catch(e => { if (e.name !== 'AbortError') console.error('[LiveMarketHeader]', e) })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 mt-6">
        <div className="animate-pulse h-20 bg-white/60 rounded-xl" />
      </div>
    )
  }

  if (!row) return null

  const updatedAt = row.updated_at
    ? new Date(row.updated_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 mt-6">
      <div className="bg-white rounded-xl border border-[#E2E5EA] shadow-sm overflow-hidden">
        {/* 타이틀 바 */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#F5F4F0] border-b border-[#E2E5EA]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
            <span className="text-[12px] font-bold text-[#1A1A2E] tracking-[-0.2px]">실시간 마켓 요약</span>
          </div>
          <span className="text-[10px] text-[#9CA3AF] font-mono">{row.date} · {updatedAt} 갱신</span>
        </div>

        {/* 지표 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 divide-x divide-[#F0EFE9]">
          {INDICATORS.map(ind => {
            const val = ind.getValue(row)
            if (val === null) return null

            const chg = ind.getChg(row)
            const isUp = chg !== null ? chg > 0 : false
            const isDown = chg !== null ? chg < 0 : false
            const color = chg === null
              ? '#1A1A2E'
              : ind.invertColor
                ? (isUp ? '#DC2626' : isDown ? '#16A34A' : '#1A1A2E')
                : (isUp ? '#16A34A' : isDown ? '#DC2626' : '#1A1A2E')

            return (
              <div key={ind.key} className="px-3 py-3 text-center hover:bg-[#FAFAF8] transition-colors">
                <div className="text-[10px] text-[#9CA3AF] font-bold tracking-wide mb-1">{ind.label}</div>
                <div className="text-[14px] font-bold tabular-nums text-[#1A1A2E] leading-tight">
                  {ind.unit === '$' && '$'}{ind.format(val)}{ind.unit === '원' ? '원' : ind.unit === '%' ? '%' : ''}
                </div>
                {chg !== null && (
                  <div className="text-[11px] font-bold tabular-nums mt-0.5" style={{ color }}>
                    {chg > 0 ? '+' : ''}{chg.toFixed(2)}%
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
