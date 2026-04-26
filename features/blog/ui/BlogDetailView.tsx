'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Markdown from 'react-markdown'

interface BlogData {
  date: string
  ticker: string
  name: string
  sector: string
  blog_content: string
  current_price: number
  fair_price_avg: number
  gap_pct: number
  verdict: string
  market_data: Record<string, unknown> | null
  fair_value: Record<string, unknown> | null
}

const VERDICT_STYLE: Record<string, { bg: string; text: string }> = {
  '저평가': { bg: '#DCFCE7', text: '#16A34A' },
  '적정':   { bg: '#F3F4F6', text: '#6B7280' },
  '고평가': { bg: '#FEE2E2', text: '#DC2626' },
}

const fmtP = (v: number) => v?.toLocaleString('ko-KR') ?? '-'

export default function BlogDetailView() {
  const params = useParams()
  const searchParams = useSearchParams()
  const ticker = params?.ticker as string
  const date = searchParams.get('date') ?? ''

  const [data, setData] = useState<BlogData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ticker || !date) { setLoading(false); return }
    const ac = new AbortController()
    fetch(`/api/blog/stock-analysis?ticker=${ticker}&date=${date}`, { signal: ac.signal })
      .then((r) => r.ok ? r.json() : null)
      .then((j) => { if (j?.data) setData(j.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [ticker, date])

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-3 md:px-6 pt-6 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl w-64" />
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-[800px] mx-auto px-3 md:px-6 pt-6 text-center py-20">
        <p className="text-[14px] text-[#9CA3AF] mb-4">분석 데이터를 찾을 수 없습니다</p>
        <Link href="/blog" className="text-[13px] font-bold text-[#00FF88] hover:underline">목록으로 돌아가기</Link>
      </div>
    )
  }

  const vs = VERDICT_STYLE[data.verdict] ?? VERDICT_STYLE['적정']
  const gapColor = (data.gap_pct ?? 0) > 0 ? '#DC2626' : (data.gap_pct ?? 0) < 0 ? '#16A34A' : '#6B7280'

  return (
    <div className="max-w-[800px] mx-auto px-3 md:px-6 pt-6 pb-16">
      {/* 뒤로가기 */}
      <Link href="/blog" className="inline-flex items-center gap-1 text-[12px] text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors mb-4">
        &larr; 목록으로
      </Link>

      {/* 헤더 카드 */}
      <div className="bg-white rounded-xl border border-[#E2E5EA] shadow p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[20px] font-bold text-[#1A1A2E]">{data.name}</h1>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded" style={{ backgroundColor: vs.bg, color: vs.text }}>
            {data.verdict}
          </span>
        </div>
        <p className="text-[12px] text-[#9CA3AF] mb-4">{data.sector} &middot; {data.ticker} &middot; {data.date}</p>

        {/* 가격 요약 */}
        <div className="grid grid-cols-3 gap-4 bg-[#F9F8F6] rounded-lg p-4">
          <div className="text-center">
            <p className="text-[10px] text-[#9CA3AF] mb-0.5">현재가</p>
            <p className="text-[18px] font-bold text-[#1A1A2E] tabular-nums">{fmtP(data.current_price)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#9CA3AF] mb-0.5">적정가</p>
            <p className="text-[18px] font-bold text-[#1A1A2E] tabular-nums">{fmtP(data.fair_price_avg)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#9CA3AF] mb-0.5">괴리율</p>
            <p className="text-[18px] font-bold tabular-nums" style={{ color: gapColor }}>
              {(data.gap_pct ?? 0) > 0 ? '+' : ''}{(data.gap_pct ?? 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* 블로그 본문 (마크다운) */}
      <article className="bg-white rounded-xl border border-[#E2E5EA] shadow p-6 md:p-8">
        <div className="prose prose-sm max-w-none
          prose-headings:text-[#1A1A2E] prose-headings:font-bold
          prose-h2:text-[17px] prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-[#F0EDE8] prose-h2:pb-2
          prose-h3:text-[15px] prose-h3:mt-4 prose-h3:mb-2
          prose-p:text-[14px] prose-p:text-[#374151] prose-p:leading-[1.8]
          prose-strong:text-[#1A1A2E]
          prose-li:text-[13px] prose-li:text-[#374151]
          prose-ul:my-2 prose-ol:my-2
          prose-blockquote:border-l-[#00FF88] prose-blockquote:bg-[#F0FFF4] prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg
          prose-table:text-[12px]
          prose-th:bg-[#F5F4F0] prose-th:text-[#1A1A2E] prose-th:font-bold prose-th:px-3 prose-th:py-2
          prose-td:px-3 prose-td:py-2 prose-td:border-[#E2E5EA]
        ">
          <Markdown>{data.blog_content}</Markdown>
        </div>
      </article>

      {/* 종목 상세 페이지 링크 */}
      <div className="mt-6 text-center">
        <Link href={`/stock/${data.ticker}`}
          className="inline-block px-6 py-2.5 rounded-lg text-[13px] font-bold transition-colors"
          style={{ backgroundColor: '#00FF88', color: '#1A1A2E' }}>
          {data.name} 종합 분석 보기
        </Link>
      </div>
    </div>
  )
}
