'use client'

import { useEffect, useState } from 'react'

interface NatItem {
  date: string
  code: string
  name: string
  image_url: string | null
  nat_score: number | null
  nat_grade: string | null
}

function scoreColor(score: number | null) {
  if (score == null) return '#9ca3b8'
  if (score >= 80) return '#16a34a'
  if (score >= 60) return '#2563eb'
  if (score >= 40) return '#d97706'
  return '#dc2626'
}

function scoreBg(score: number | null) {
  if (score == null) return 'bg-gray-100 text-gray-500'
  if (score >= 80) return 'bg-green-50 text-green-700'
  if (score >= 60) return 'bg-blue-50 text-blue-700'
  if (score >= 40) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-700'
}

export function NationalityXrayView() {
  const [items, setItems] = useState<NatItem[]>([])
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | '80+' | '60+' | '<60'>('all')

  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/intelligence/nationality-charts', { signal: ac.signal })
      .then(r => r.json())
      .then(d => {
        setItems(d.items ?? [])
        setDate(d.date ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const filtered = items.filter(it => {
    const s = it.nat_score ?? 0
    if (filter === '80+') return s >= 80
    if (filter === '60+') return s >= 60
    if (filter === '<60') return s < 60
    return true
  })

  const isStale = (() => {
    if (!date) return false
    const d = new Date(date)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diff > 3
  })()

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 pb-8">
      {/* 헤더 */}
      <div className="mb-5">
        <h2 className="text-[20px] font-black text-[#1A1A2E]">국적별 수급 X-ray</h2>
        <p className="text-[13px] text-[#5b6178] mt-1">
          TOP 200 종목의 외국인 국적별 수급 흐름을 픽토그램 차트로 확인합니다
        </p>
        {date && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[12px] text-[#9ca3b8]">{date} 기준</span>
            {isStale && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">
                3일 이상 미갱신
              </span>
            )}
          </div>
        )}
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        {(['all', '80+', '60+', '<60'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
              filter === f
                ? 'bg-[#00FF88] text-[#1A1A2E] border-[#00FF88]'
                : 'bg-white text-[#5b6178] border-[#e5e7ef] hover:border-[#00FF88]'
            }`}
          >
            {f === 'all' ? `전체 (${items.length})` : f === '80+' ? '80점+' : f === '60+' ? '60점+' : '60점 미만'}
          </button>
        ))}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-16 text-[#9ca3b8] text-[14px]">데이터 불러오는 중...</div>
      )}

      {/* 빈 상태 */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-[32px] mb-2">📊</div>
          <div className="text-[14px] text-[#5b6178]">오늘 국적별 수급 데이터가 아직 없습니다</div>
          <div className="text-[12px] text-[#9ca3b8] mt-1">매일 16:45 장 마감 후 자동 갱신됩니다</div>
        </div>
      )}

      {/* 카드 그리드 */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(it => (
            <div key={it.code} className="bg-white border border-[#e5e7ef] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* 차트 이미지 */}
              {it.image_url ? (
                <div className="relative bg-[#fafafa] border-b border-[#e5e7ef]">
                  <img
                    src={it.image_url}
                    alt={`${it.name} 국적별 수급`}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="h-[120px] bg-[#f8f8f8] border-b border-[#e5e7ef] flex items-center justify-center text-[#ccc] text-[12px]">
                  차트 없음
                </div>
              )}

              {/* 정보 */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-[14px] font-bold text-[#1A1A2E]">{it.name}</span>
                    <span className="text-[11px] text-[#9ca3b8] ml-1.5">{it.code}</span>
                  </div>
                  {it.nat_score != null && (
                    <span
                      className={`text-[13px] font-bold px-2.5 py-0.5 rounded-md ${scoreBg(it.nat_score)}`}
                    >
                      {it.nat_score.toFixed(1)}
                    </span>
                  )}
                </div>
                {it.nat_grade && (
                  <div className="text-[12px] font-medium" style={{ color: scoreColor(it.nat_score) }}>
                    {it.nat_grade}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 면책 */}
      <div className="text-center mt-8">
        <p className="text-[10px] text-[#9ca3b8]">
          데이터 제공: 단타봇 · 매일 16:45 KST 갱신 | 투자 판단의 책임은 본인에게 있습니다
        </p>
      </div>
    </div>
  )
}
