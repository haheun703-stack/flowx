'use client'

import { useEffect, useState, useCallback } from 'react'

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

function gradeLabel(grade: string | null) {
  if (!grade) return '미분류'
  return grade
}

/* ── 요약 탭: 점수 분포 + 등급별 TOP 종목 ── */
function SummaryPanel({ items }: { items: NatItem[] }) {
  // 등급별 그룹핑
  const groups: Record<string, NatItem[]> = {}
  for (const it of items) {
    const g = it.nat_grade ?? '미분류'
    if (!groups[g]) groups[g] = []
    groups[g].push(it)
  }

  // 점수 분포
  const total = items.length
  const tier80 = items.filter(it => (it.nat_score ?? 0) >= 80).length
  const tier60 = items.filter(it => { const s = it.nat_score ?? 0; return s >= 60 && s < 80 }).length
  const tier40 = items.filter(it => { const s = it.nat_score ?? 0; return s >= 40 && s < 60 }).length
  const tierLow = items.filter(it => (it.nat_score ?? 0) < 40).length

  // TOP 10 종목 (점수 순)
  const top10 = [...items].sort((a, b) => (b.nat_score ?? 0) - (a.nat_score ?? 0)).slice(0, 10)
  // WORST 10
  const worst10 = [...items].sort((a, b) => (a.nat_score ?? 0) - (b.nat_score ?? 0)).slice(0, 10)

  const tiers = [
    { label: '80점+', count: tier80, color: '#16a34a', bg: 'bg-green-50' },
    { label: '60~79', count: tier60, color: '#2563eb', bg: 'bg-blue-50' },
    { label: '40~59', count: tier40, color: '#d97706', bg: 'bg-amber-50' },
    { label: '40 미만', count: tierLow, color: '#dc2626', bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-6">
      {/* 점수 분포 바 */}
      <div className="bg-white border border-[#e5e7ef] rounded-xl p-5">
        <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-3">수급 점수 분포</h3>
        <div className="flex rounded-lg overflow-hidden h-8 mb-3">
          {tiers.map(t => {
            const pct = total > 0 ? (t.count / total) * 100 : 0
            if (pct === 0) return null
            return (
              <div
                key={t.label}
                style={{ width: `${pct}%`, background: t.color }}
                className="flex items-center justify-center text-white text-[11px] font-bold min-w-[30px]"
              >
                {t.count}
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-4">
          {tiers.map(t => (
            <div key={t.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: t.color }} />
              <span className="text-[12px] text-[#5b6178]">{t.label}</span>
              <span className="text-[12px] font-bold" style={{ color: t.color }}>{t.count}종목</span>
              <span className="text-[11px] text-[#9ca3b8]">({total > 0 ? ((t.count / total) * 100).toFixed(0) : 0}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 등급별 분포 */}
      <div className="bg-white border border-[#e5e7ef] rounded-xl p-5">
        <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-3">등급별 분포</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(groups)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([grade, grpItems]) => (
              <div key={grade} className="border border-[#e5e7ef] rounded-lg p-3">
                <div className="text-[13px] font-bold text-[#1A1A2E] mb-1">{grade}</div>
                <div className="text-[20px] font-black text-[#1A1A2E]">{grpItems.length}<span className="text-[12px] text-[#9ca3b8] ml-1">종목</span></div>
                <div className="text-[11px] text-[#5b6178] mt-1">
                  평균 {(grpItems.reduce((s, i) => s + (i.nat_score ?? 0), 0) / (grpItems.length || 1)).toFixed(1)}점
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* TOP 10 / WORST 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5">
          <h3 className="text-[15px] font-bold text-green-700 mb-3">TOP 10 — 외국인 수급 최상위</h3>
          <div className="space-y-1.5">
            {top10.map((it, i) => (
              <div key={it.code} className="flex items-center gap-2 py-1.5 border-b border-[#f0f0f0] last:border-0">
                <span className="w-6 text-[12px] font-bold text-[#9ca3b8]">{i + 1}</span>
                <span className="text-[13px] font-bold text-[#1A1A2E] flex-1">{it.name}</span>
                <span className="text-[11px] text-[#9ca3b8]">{it.code}</span>
                <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${scoreBg(it.nat_score)}`}>
                  {it.nat_score?.toFixed(1) ?? '-'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#e5e7ef] rounded-xl p-5">
          <h3 className="text-[15px] font-bold text-red-600 mb-3">WORST 10 — 외국인 이탈 경고</h3>
          <div className="space-y-1.5">
            {worst10.map((it, i) => (
              <div key={it.code} className="flex items-center gap-2 py-1.5 border-b border-[#f0f0f0] last:border-0">
                <span className="w-6 text-[12px] font-bold text-[#9ca3b8]">{i + 1}</span>
                <span className="text-[13px] font-bold text-[#1A1A2E] flex-1">{it.name}</span>
                <span className="text-[11px] text-[#9ca3b8]">{it.code}</span>
                <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${scoreBg(it.nat_score)}`}>
                  {it.nat_score?.toFixed(1) ?? '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 카드 클릭 모달 ── */
function ChartModal({ item, onClose }: { item: NatItem; onClose: () => void }) {
  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // 배경 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-[900px] w-[95vw] max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-[#e5e7ef]">
          <div className="flex items-center gap-3">
            <span className="text-[18px] font-bold text-[#1A1A2E]">{item.name}</span>
            <span className="text-[13px] text-[#9ca3b8]">{item.code}</span>
            {item.nat_score != null && (
              <span className={`text-[14px] font-bold px-3 py-1 rounded-lg ${scoreBg(item.nat_score)}`}>
                {item.nat_score.toFixed(1)}점
              </span>
            )}
            {item.nat_grade && (
              <span className="text-[13px] font-medium" style={{ color: scoreColor(item.nat_score) }}>
                {gradeLabel(item.nat_grade)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#5b6178] text-[18px] transition-colors"
          >
            &times;
          </button>
        </div>

        {/* 차트 이미지 */}
        {item.image_url ? (
          <div className="p-4">
            <img
              src={item.image_url}
              alt={`${item.name} 국적별 수급`}
              className="w-full h-auto rounded-lg"
            />
          </div>
        ) : (
          <div className="p-4">
            <div className="h-[200px] bg-[#f8f8f8] rounded-lg flex items-center justify-center text-[#ccc] text-[14px]">
              차트 데이터 없음
            </div>
          </div>
        )}

        {/* 하단 정보 */}
        <div className="px-5 pb-5 text-[11px] text-[#9ca3b8]">
          {item.date} 기준 · 클릭하여 닫기 또는 ESC
        </div>
      </div>
    </div>
  )
}

export function NationalityXrayView() {
  const [items, setItems] = useState<NatItem[]>([])
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'summary' | 'all' | '80+' | '60+' | '<60'>('summary')
  const [modalItem, setModalItem] = useState<NatItem | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/intelligence/nationality-charts', { signal: ac.signal })
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json() })
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
    if (tab === '80+') return s >= 80
    if (tab === '60+') return s >= 60
    if (tab === '<60') return s < 60
    return true
  })

  const isStale = (() => {
    if (!date) return false
    const d = new Date(date)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diff > 3
  })()

  const handleCloseModal = useCallback(() => setModalItem(null), [])

  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'summary', label: '요약' },
    { key: 'all', label: `전체 (${items.length})` },
    { key: '80+', label: '80점+' },
    { key: '60+', label: '60점+' },
    { key: '<60', label: '60점 미만' },
  ]

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

      {/* 탭 필터 */}
      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
              tab === t.key
                ? 'bg-[#00FF88] text-[#1A1A2E] border-[#00FF88]'
                : 'bg-white text-[#5b6178] border-[#e5e7ef] hover:border-[#00FF88]'
            }`}
          >
            {t.label}
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

      {/* 요약 탭 */}
      {!loading && tab === 'summary' && items.length > 0 && (
        <SummaryPanel items={items} />
      )}

      {/* 카드 그리드 (요약 탭이 아닐 때) */}
      {!loading && tab !== 'summary' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(it => (
            <div
              key={it.code}
              className="bg-white border border-[#e5e7ef] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setModalItem(it)}
            >
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

      {/* 모달 */}
      {modalItem && <ChartModal item={modalItem} onClose={handleCloseModal} />}

      {/* 면책 */}
      <div className="text-center mt-8">
        <p className="text-[10px] text-[#9ca3b8]">
          데이터 제공: 단타봇 · 매일 16:45 KST 갱신 | 투자 판단의 책임은 본인에게 있습니다
        </p>
      </div>
    </div>
  )
}
