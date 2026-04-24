'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BlogItem {
  date: string
  ticker: string
  name: string
  sector: string
  current_price: number
  fair_price_avg: number
  gap_pct: number
  verdict: string
}

const VERDICT_STYLE: Record<string, { bg: string; text: string }> = {
  '저평가': { bg: '#DCFCE7', text: '#16A34A' },
  '적정':   { bg: '#F3F4F6', text: '#6B7280' },
  '고평가': { bg: '#FEE2E2', text: '#DC2626' },
}

const fmtP = (v: number) => v?.toLocaleString('ko-KR') ?? '-'
const fmtDate = (d: string) => {
  const m = d.match(/(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${+m[2]}/${+m[3]}` : d
}

export default function BlogListView() {
  const [items, setItems] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/blog/stock-analysis', { signal: ac.signal })
      .then((r) => r.ok ? r.json() : null)
      .then((j) => { if (j?.items) setItems(j.items) })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  // 날짜별 그룹핑
  const grouped = items.reduce<Record<string, BlogItem[]>>((acc, item) => {
    ;(acc[item.date] ??= []).push(item)
    return acc
  }, {})
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded-xl w-48" />
        {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 pb-12 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-[22px] font-black text-[#1A1A2E]">종목 분석 블로그</h1>
        <p className="text-[13px] text-[#6B7280] mt-1">매일 장후 핫 테마 관련주를 쉽게 풀어드립니다</p>
      </div>

      <div className="h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #00FF88, #4ADE80 30%, #00FF88 60%, #4ADE80)' }} />

      {items.length === 0 ? (
        <p className="text-[14px] text-[#9CA3AF] py-12 text-center">아직 게시된 분석이 없습니다</p>
      ) : (
        dates.map((date) => (
          <div key={date}>
            <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-3">{date}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[date].map((item) => {
                const vs = VERDICT_STYLE[item.verdict] ?? VERDICT_STYLE['적정']
                const gapColor = (item.gap_pct ?? 0) > 0 ? '#DC2626' : (item.gap_pct ?? 0) < 0 ? '#16A34A' : '#6B7280'
                return (
                  <Link
                    key={`${item.date}-${item.ticker}`}
                    href={`/blog/${item.ticker}?date=${item.date}`}
                    className="block bg-white rounded-xl border border-[#E8E6E0] shadow-sm hover:shadow-md transition-shadow p-5"
                  >
                    {/* 상단: 종목명 + 판정 배지 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[16px] font-bold text-[#1A1A2E]">{item.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: vs.bg, color: vs.text }}>
                        {item.verdict}
                      </span>
                    </div>

                    {/* 섹터 */}
                    <p className="text-[11px] text-[#9CA3AF] mb-3">{item.sector}</p>

                    {/* 가격 정보 */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[10px] text-[#9CA3AF]">현재가</p>
                        <p className="text-[14px] font-bold text-[#1A1A2E] tabular-nums">{fmtP(item.current_price)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#9CA3AF]">적정가</p>
                        <p className="text-[14px] font-bold text-[#1A1A2E] tabular-nums">{fmtP(item.fair_price_avg)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#9CA3AF]">괴리율</p>
                        <p className="text-[14px] font-bold tabular-nums" style={{ color: gapColor }}>
                          {(item.gap_pct ?? 0) > 0 ? '+' : ''}{(item.gap_pct ?? 0).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* 날짜 */}
                    <p className="text-[10px] text-[#9CA3AF] mt-3 text-right">{fmtDate(item.date)}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
