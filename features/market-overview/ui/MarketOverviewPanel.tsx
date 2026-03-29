'use client'

import { useEffect, useState } from 'react'

interface MarketOverviewData {
  date: string
  kospi_close: number
  kospi_change_pct: number
  kosdaq_close: number
  kosdaq_change_pct: number
  sp500_close: number
  sp500_change_pct: number
  nasdaq_close: number
  nasdaq_change_pct: number
  stocks_up: number
  stocks_down: number
  stocks_flat: number
  breadth: number
  foreign_net: number
  inst_net: number
  individual_net: number
  foreign_trend: string
}

function formatBil(n: number) {
  const bil = n / 1_0000
  if (Math.abs(bil) >= 10000) return `${bil >= 0 ? '+' : ''}${(bil / 10000).toFixed(1)}조`
  if (Math.abs(bil) >= 1) return `${bil >= 0 ? '+' : ''}${bil.toFixed(0)}억`
  return `${bil >= 0 ? '+' : ''}${bil.toFixed(1)}억`
}

function pctColor(v: number) {
  return v >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
}

function pctSign(v: number) {
  return v >= 0 ? `+${Number(v).toFixed(2)}%` : `${Number(v).toFixed(2)}%`
}

export function MarketOverviewPanel() {
  const [data, setData] = useState<{ latest: MarketOverviewData | null; history: MarketOverviewData[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/market-overview', { signal: controller.signal })
      .then(r => r.json())
      .then(json => setData(json))
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setData(null)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
        </div>
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  const latest = data?.latest
  if (!latest) {
    return (
      <div className="bg-white rounded-xl p-6 text-center border border-[var(--border)]">
        <p className="text-[var(--text-dim)] text-sm">시장 개요 데이터가 아직 없습니다</p>
        <p className="text-[var(--text-muted)] text-xs mt-1">매일 16:45 업데이트됩니다</p>
      </div>
    )
  }

  const history = data?.history ?? []
  const totalStocks = latest.stocks_up + latest.stocks_down + latest.stocks_flat
  const breadthPct = (latest.breadth * 100)

  const indices = [
    { name: 'KOSPI', value: latest.kospi_close, change: latest.kospi_change_pct, flag: '🇰🇷' },
    { name: 'KOSDAQ', value: latest.kosdaq_close, change: latest.kosdaq_change_pct, flag: '🇰🇷' },
    { name: 'S&P 500', value: latest.sp500_close, change: latest.sp500_change_pct, flag: '🇺🇸' },
    { name: 'NASDAQ', value: latest.nasdaq_close, change: latest.nasdaq_change_pct, flag: '🇺🇸' },
  ]

  const investors = [
    { name: '외국인', value: latest.foreign_net, trend: latest.foreign_trend, color: 'var(--investor-foreign)' },
    { name: '기관', value: latest.inst_net, trend: '', color: 'var(--investor-inst)' },
    { name: '개인', value: latest.individual_net, trend: '', color: 'var(--investor-individual)' },
  ]

  return (
    <div className="space-y-6">
      {/* 날짜 */}
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--text-primary)] text-lg font-bold">시장 개요</h2>
        <span className="text-[var(--text-muted)] text-xs">{latest.date} 기준</span>
      </div>

      {/* 주요 지수 4카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {indices.map(idx => (
          <div key={idx.name} className="bg-white rounded-lg p-4 border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{idx.flag}</span>
              <span className="text-[var(--text-dim)] text-xs">{idx.name}</span>
            </div>
            <p className="text-[var(--text-primary)] text-xl font-bold font-mono">
              {typeof idx.value === 'number' && idx.value > 1000
                ? idx.value.toLocaleString()
                : Number(idx.value).toFixed(2)}
            </p>
            <p className={`text-sm font-mono ${pctColor(idx.change)}`}>
              {pctSign(idx.change)}
            </p>
          </div>
        ))}
      </div>

      {/* 시장 체온 (Breadth) + 투자자 동향 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 시장 체온 */}
        <div className="bg-white rounded-lg p-4 border border-[var(--border)] shadow-sm">
          <h3 className="text-[var(--text-dim)] text-xs mb-3">시장 체온 (전종목 등락 비율)</h3>

          {/* Breadth 게이지 */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--down)]">하락 {latest.stocks_down}</span>
              <span className="text-[var(--text-muted)]">보합 {latest.stocks_flat}</span>
              <span className="text-[var(--up)]">상승 {latest.stocks_up}</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden">
              {totalStocks > 0 && (
                <>
                  <div
                    className="bg-[var(--down)]"
                    style={{ width: `${(latest.stocks_down / totalStocks) * 100}%` }}
                  />
                  <div
                    className="bg-gray-400"
                    style={{ width: `${(latest.stocks_flat / totalStocks) * 100}%` }}
                  />
                  <div
                    className="bg-[var(--up)]"
                    style={{ width: `${(latest.stocks_up / totalStocks) * 100}%` }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Breadth 수치 */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] text-xs">Breadth Index</span>
            <span className={`text-lg font-bold font-mono ${
              breadthPct >= 60 ? 'text-[var(--up)]' :
              breadthPct >= 40 ? 'text-[var(--text-primary)]' :
              'text-[var(--down)]'
            }`}>
              {breadthPct.toFixed(1)}%
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-[10px] mt-1">
            50% = 중립 | {'>'}60% 강세 | {'<'}40% 약세
          </p>
        </div>

        {/* 투자자 동향 */}
        <div className="bg-white rounded-lg p-4 border border-[var(--border)] shadow-sm">
          <h3 className="text-[var(--text-dim)] text-xs mb-3">투자자 순매수 동향</h3>
          <div className="space-y-3">
            {investors.map(inv => {
              const isPositive = inv.value >= 0
              return (
                <div key={inv.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: inv.color }} />
                    <span className="text-[var(--text-primary)] text-sm font-medium w-12">{inv.name}</span>
                    {inv.trend && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        inv.trend.includes('연속매수') ? 'bg-[var(--up-bg)] text-[var(--up)] border-[var(--up)]/30' :
                        inv.trend.includes('연속매도') ? 'bg-[var(--down-bg)] text-[var(--down)] border-[var(--down)]/30' :
                        'bg-gray-100 text-[var(--text-muted)]'
                      }`}>
                        {inv.trend}
                      </span>
                    )}
                  </div>
                  <span className={`text-lg font-bold font-mono ${isPositive ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                    {formatBil(inv.value)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 최근 5일 추이 */}
      {history.length > 1 && (
        <div className="bg-white rounded-lg p-4 border border-[var(--border)] shadow-sm">
          <h3 className="text-[var(--text-dim)] text-xs mb-3">최근 {history.length}일 추이</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[var(--text-muted)] text-[10px] border-b border-[var(--border)]">
                  <th className="text-left py-2 px-2">날짜</th>
                  <th className="text-right py-2 px-2">KOSPI</th>
                  <th className="text-right py-2 px-2">KOSDAQ</th>
                  <th className="text-right py-2 px-2">S&P500</th>
                  <th className="text-right py-2 px-2">NASDAQ</th>
                  <th className="text-right py-2 px-2">Breadth</th>
                  <th className="text-right py-2 px-2">외인</th>
                  <th className="text-right py-2 px-2">기관</th>
                </tr>
              </thead>
              <tbody>
                {history.map(row => (
                  <tr key={row.date} className="border-b border-[var(--border)]/50 hover:bg-gray-50">
                    <td className="py-2 px-2 text-[var(--text-primary)]">{row.date.slice(5)}</td>
                    <td className={`text-right py-2 px-2 font-mono ${pctColor(row.kospi_change_pct)}`}>
                      {pctSign(row.kospi_change_pct)}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono ${pctColor(row.kosdaq_change_pct)}`}>
                      {pctSign(row.kosdaq_change_pct)}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono ${pctColor(row.sp500_change_pct)}`}>
                      {pctSign(row.sp500_change_pct)}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono ${pctColor(row.nasdaq_change_pct)}`}>
                      {pctSign(row.nasdaq_change_pct)}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono ${
                      row.breadth * 100 >= 60 ? 'text-[var(--up)]' :
                      row.breadth * 100 >= 40 ? 'text-[var(--text-primary)]' :
                      'text-[var(--down)]'
                    }`}>
                      {(row.breadth * 100).toFixed(1)}%
                    </td>
                    <td className={`text-right py-2 px-2 font-mono ${row.foreign_net >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      {formatBil(row.foreign_net)}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono ${row.inst_net >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}>
                      {formatBil(row.inst_net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
