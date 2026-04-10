'use client'

import { useEffect, useState } from 'react'

interface HighLowStock {
  name: string
  ticker: string
  close: number
  ref_price: number
  change_pct: number
}

interface HighsLowsData {
  date: string
  new_high_count: number
  new_low_count: number
  total_scanned: number
  ratio: number
  top_highs: HighLowStock[]
  top_lows: HighLowStock[]
}

function ratioLabel(r: number): { text: string; color: string } {
  if (r >= 0.8) return { text: 'Extreme Greed', color: '#16A34A' }
  if (r >= 0.6) return { text: 'Greed', color: '#22C55E' }
  if (r >= 0.4) return { text: 'Neutral', color: '#6B7280' }
  if (r >= 0.2) return { text: 'Fear', color: '#EF4444' }
  return { text: 'Extreme Fear', color: '#DC2626' }
}

export default function HighsLowsPanel() {
  const [data, setData] = useState<HighsLowsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState<'highs' | 'lows'>('highs')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/market/52w-highs-lows', { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="fx-card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-3" />
        <div className="h-8 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!data) return null

  const total = data.new_high_count + data.new_low_count
  const highPct = total > 0 ? (data.new_high_count / total) * 100 : 0
  const rl = ratioLabel(data.ratio)
  const list = showList === 'highs' ? (data.top_highs ?? []).slice(0, 10) : (data.top_lows ?? []).slice(0, 10)

  return (
    <div className="fx-card">
      <div className="flex items-center justify-between mb-3">
        <span className="fx-card-title">52주 신고가 / 신저가</span>
        <span className="text-[13px] text-[#9CA3AF]">{data.date}</span>
      </div>

      {/* 비율 바 */}
      {total > 0 ? (
        <div className="flex h-7 rounded-full overflow-hidden mb-2">
          {data.new_high_count > 0 && (
            <div
              className="bg-[#EF4444] flex items-center justify-center text-[12px] font-bold text-white whitespace-nowrap"
              style={{ width: `${highPct}%`, minWidth: 60 }}
            >
              신고가 {data.new_high_count}
            </div>
          )}
          {data.new_low_count > 0 && (
            <div
              className="bg-[#3B82F6] flex items-center justify-center text-[12px] font-bold text-white whitespace-nowrap"
              style={{ width: `${100 - highPct}%`, minWidth: 60 }}
            >
              신저가 {data.new_low_count}
            </div>
          )}
        </div>
      ) : (
        <div className="h-7 bg-[#F5F4F0] rounded-full flex items-center justify-center text-[12px] text-[#9CA3AF] mb-2">
          데이터 없음
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[14px] font-bold" style={{ color: rl.color }}>
          비율 {data.ratio.toFixed(2)}
        </span>
        <span className="text-[13px] font-bold" style={{ color: rl.color }}>
          ({rl.text})
        </span>
      </div>

      {/* 종목 리스트 토글 */}
      <div className="flex gap-1 mb-2">
        {(['highs', 'lows'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setShowList(t)}
            className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-colors ${
              showList === t
                ? t === 'highs'
                  ? 'bg-[#EF4444]/10 text-[#EF4444]'
                  : 'bg-[#3B82F6]/10 text-[#3B82F6]'
                : 'text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            {t === 'highs' ? `신고가 TOP` : `신저가 TOP`}
          </button>
        ))}
      </div>

      {list.length > 0 ? (
        <div className="space-y-1">
          {list.map((s, i) => (
            <div key={s.ticker ?? i} className="flex items-center gap-2 text-[13px]">
              <span className="text-[#1A1A2E] font-bold truncate flex-1">{s.name}</span>
              <span className="text-[#6B7280] tabular-nums shrink-0">
                {s.close?.toLocaleString('ko-KR')}원
              </span>
              <span
                className={`font-bold tabular-nums shrink-0 w-[52px] text-right ${
                  s.change_pct >= 0 ? 'text-[#EF4444]' : 'text-[#3B82F6]'
                }`}
              >
                {s.change_pct >= 0 ? '+' : ''}{s.change_pct.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-[#9CA3AF]">데이터 없음</p>
      )}
    </div>
  )
}
