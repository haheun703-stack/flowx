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
  return v >= 0 ? 'text-red-400' : 'text-blue-400'
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
        <div className="h-8 bg-gray-800 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-800 rounded-lg" />)}
        </div>
        <div className="h-32 bg-gray-800 rounded-lg" />
      </div>
    )
  }

  const latest = data?.latest
  if (!latest) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center">
        <p className="text-gray-400 text-sm">시장 개요 데이터가 아직 없습니다</p>
        <p className="text-gray-600 text-xs mt-1">매일 16:45 업데이트됩니다</p>
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
    { name: '외국인', value: latest.foreign_net, trend: latest.foreign_trend },
    { name: '기관', value: latest.inst_net, trend: '' },
    { name: '개인', value: latest.individual_net, trend: '' },
  ]

  return (
    <div className="space-y-6">
      {/* 날짜 */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-bold">시장 개요</h2>
        <span className="text-gray-500 text-xs">{latest.date} 기준</span>
      </div>

      {/* 주요 지수 4카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {indices.map(idx => (
          <div key={idx.name} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{idx.flag}</span>
              <span className="text-gray-400 text-xs">{idx.name}</span>
            </div>
            <p className="text-white text-xl font-bold font-mono">
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
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-gray-400 text-xs mb-3">시장 체온 (전종목 등락 비율)</h3>

          {/* Breadth 게이지 */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-blue-400">하락 {latest.stocks_down}</span>
              <span className="text-gray-500">보합 {latest.stocks_flat}</span>
              <span className="text-red-400">상승 {latest.stocks_up}</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden">
              {totalStocks > 0 && (
                <>
                  <div
                    className="bg-blue-600"
                    style={{ width: `${(latest.stocks_down / totalStocks) * 100}%` }}
                  />
                  <div
                    className="bg-gray-600"
                    style={{ width: `${(latest.stocks_flat / totalStocks) * 100}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${(latest.stocks_up / totalStocks) * 100}%` }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Breadth 수치 */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">Breadth Index</span>
            <span className={`text-lg font-bold font-mono ${
              breadthPct >= 60 ? 'text-red-400' :
              breadthPct >= 40 ? 'text-gray-300' :
              'text-blue-400'
            }`}>
              {breadthPct.toFixed(1)}%
            </span>
          </div>
          <p className="text-gray-600 text-[10px] mt-1">
            50% = 중립 | {'>'}60% 강세 | {'<'}40% 약세
          </p>
        </div>

        {/* 투자자 동향 */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-gray-400 text-xs mb-3">투자자 순매수 동향</h3>
          <div className="space-y-3">
            {investors.map(inv => {
              const isPositive = inv.value >= 0
              return (
                <div key={inv.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-sm font-medium w-12">{inv.name}</span>
                    {inv.trend && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        inv.trend.includes('연속매수') ? 'bg-red-900/30 text-red-400 border border-red-800/30' :
                        inv.trend.includes('연속매도') ? 'bg-blue-900/30 text-blue-400 border border-blue-800/30' :
                        'bg-gray-800 text-gray-500'
                      }`}>
                        {inv.trend}
                      </span>
                    )}
                  </div>
                  <span className={`text-lg font-bold font-mono ${isPositive ? 'text-red-400' : 'text-blue-400'}`}>
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
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-gray-400 text-xs mb-3">최근 {history.length}일 추이</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 text-[10px] border-b border-gray-800">
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
                  <tr key={row.date} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-2 text-gray-300">{row.date.slice(5)}</td>
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
                      row.breadth * 100 >= 60 ? 'text-red-400' :
                      row.breadth * 100 >= 40 ? 'text-gray-300' :
                      'text-blue-400'
                    }`}>
                      {(row.breadth * 100).toFixed(1)}%
                    </td>
                    <td className={`text-right py-2 px-2 font-mono ${row.foreign_net >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                      {formatBil(row.foreign_net)}
                    </td>
                    <td className={`text-right py-2 px-2 font-mono ${row.inst_net >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
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
