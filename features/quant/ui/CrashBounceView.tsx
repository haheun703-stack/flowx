'use client'

import { useEffect, useState } from 'react'

/* ── 타입 ── */

interface CrashBounceItem {
  date: string
  ticker: string
  name: string
  close: number
  change_pct: number
  gap_20ma: number
  bb_position: number
  volume_ratio: number
  foreign_net: number
  inst_net: number
  foreign_days: number
  inst_days: number
  signal_type: string
  grade: string
  score: number
  reasons: string
}

/* ── 시그널/등급 설정 ── */

const SIGNAL_CONFIG: Record<string, { color: string; badge?: string }> = {
  '복합급락 반등': { color: '#FF0000', badge: 'BEST' },
  '볼린저급락 반등': { color: '#FF6600' },
  '거래량폭발 반등': { color: '#FF9900' },
  '관심': { color: '#999999' },
}

const GRADE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  '적극매수': { icon: '★', color: '#FF0000', bg: '#FFF0F0' },
  '매수': { icon: '◎', color: '#FF6600', bg: '#FFF5E6' },
  '관심': { icon: '○', color: '#999999', bg: '#F5F5F5' },
}

const GRADE_TABS = ['전체', '적극매수', '매수', '관심'] as const

/* ── 이유 파싱 ── */

function parseReasons(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/* ── 메인 뷰 ── */

export default function CrashBounceView() {
  const [items, setItems] = useState<CrashBounceItem[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [gradeFilter, setGradeFilter] = useState<string>('전체')
  const [backtestOpen, setBacktestOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/crash-bounce', { signal: controller.signal })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        setItems(json.items ?? [])
        setDate(json.date ?? null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setItems([])
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 text-center py-16">
        <p className="text-[28px] mb-3">🔍</p>
        <p className="text-[17px] font-bold text-[#1A1A2E]">오늘은 급락반등 시그널이 없습니다</p>
        <p className="text-[14px] text-[#6B7280] mt-1">
          주가가 크게 빠지면서 큰손이 매수하는 종목이 나타나면 여기에 표시됩니다
        </p>
        <p className="text-[13px] text-[#9CA3AF] mt-2">
          시장이 안정적일 때는 시그널이 없는 것이 정상입니다
        </p>
      </div>
    )
  }

  const filtered = gradeFilter === '전체'
    ? items
    : items.filter(i => i.grade === gradeFilter)

  const cardItems = filtered.filter(i => i.grade === '적극매수' || i.grade === '매수')
  const watchItems = filtered.filter(i => i.grade === '관심')

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-5">

      {/* ① 상단 배너 — 백테스트 신뢰도 */}
      <div className="rounded-xl p-5 border border-[#E8E6E0] bg-white">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[17px] font-bold text-[#1A1A2E]">급락반등 포착기</h2>
              <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F0] text-[#FF0000] border border-[#FECACA]">
                백테스트 검증
              </span>
            </div>
            <p className="text-[14px] text-[#6B7280] mb-3">
              극도로 빠진 종목 중 큰손이 매수하기 시작한 종목
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-[17px] font-black text-[#DC2626] tabular-nums">+3.38%</p>
                <p className="text-[12px] text-[#6B7280]">평균 수익 (5일)</p>
              </div>
              <div className="text-center">
                <p className="text-[17px] font-black text-[#16A34A] tabular-nums">60.2%</p>
                <p className="text-[12px] text-[#6B7280]">승률</p>
              </div>
              <div className="text-center">
                <p className="text-[17px] font-black text-[#0EA5E9] tabular-nums">2.64</p>
                <p className="text-[12px] text-[#6B7280]">손익비</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-[13px] text-[#9CA3AF] max-w-[320px] leading-relaxed">
            7년간 1,034건의 실제 데이터로 검증한 시그널입니다. 주가가 평균보다 15% 이상 급락한 상태에서,
            볼린저밴드 바닥을 이탈하고, 기관이나 외국인이 매수하기 시작하면 → 5일 안에 반등할 확률이 60%입니다.
          </div>
        </div>
        {date && (
          <p className="text-[13px] text-[#9CA3AF] mt-3">{date} 기준 · {items.length}종목 포착</p>
        )}
      </div>

      {/* ② 등급별 필터 탭 */}
      <div className="flex items-center gap-1 bg-[#F5F4F0] rounded-xl p-1 border border-[#E8E6E0] w-fit">
        {GRADE_TABS.map(g => {
          const count = g === '전체' ? items.length : items.filter(i => i.grade === g).length
          return (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-bold transition-colors ${
                gradeFilter === g
                  ? 'bg-white text-[#1A1A2E] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
            >
              {g !== '전체' && GRADE_CONFIG[g] && (
                <span className="mr-1">{GRADE_CONFIG[g].icon}</span>
              )}
              {g}
              <span className="ml-1 text-[12px] text-[#9CA3AF]">{count}</span>
            </button>
          )
        })}
      </div>

      {/* ③ 카드 리스트 — 적극매수/매수 */}
      {cardItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cardItems.map(item => {
            const gc = GRADE_CONFIG[item.grade] ?? GRADE_CONFIG['관심']
            const sc = SIGNAL_CONFIG[item.signal_type] ?? SIGNAL_CONFIG['관심']
            const reasons = parseReasons(item.reasons)
            return (
              <div
                key={`${item.date}-${item.ticker}`}
                className="rounded-xl border p-4 bg-white"
                style={{ borderColor: gc.color + '40' }}
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[13px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: gc.bg, color: gc.color }}
                    >
                      {gc.icon} {item.grade}
                    </span>
                    <span className="text-[15px] font-bold text-[#1A1A2E]">{item.name}</span>
                    <span className="text-[13px] text-[#9CA3AF]">{item.ticker}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[12px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: sc.color }}
                    >
                      {item.signal_type}
                    </span>
                    {sc.badge && (
                      <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-[#FF0000] text-white">
                        {sc.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* 가격 */}
                <p className="text-[15px] font-bold text-[#1A1A2E] tabular-nums mb-3">
                  {(item.close ?? 0).toLocaleString()}원
                  <span className="ml-2" style={{ color: item.change_pct >= 0 ? '#DC2626' : '#2563EB' }}>
                    {item.change_pct >= 0 ? '+' : ''}{(item.change_pct ?? 0).toFixed(1)}%
                  </span>
                </p>

                {/* 지표 */}
                <div className="grid grid-cols-5 gap-2 text-center mb-3">
                  <div>
                    <p className="text-[14px] font-bold text-[#DC2626] tabular-nums">{(item.gap_20ma ?? 0).toFixed(1)}%</p>
                    <p className="text-[12px] text-[#9CA3AF]">이격도</p>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1A2E] tabular-nums">{((item.bb_position ?? 0) * 100).toFixed(0)}%</p>
                    <p className="text-[12px] text-[#9CA3AF]">볼린저</p>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1A2E] tabular-nums">{(item.volume_ratio ?? 0).toFixed(1)}배</p>
                    <p className="text-[12px] text-[#9CA3AF]">거래량</p>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold tabular-nums" style={{ color: (item.foreign_net ?? 0) >= 0 ? '#DC2626' : '#2563EB' }}>
                      {(item.foreign_net ?? 0) >= 0 ? '+' : ''}{(item.foreign_net ?? 0).toFixed(0)}억
                    </p>
                    <p className="text-[12px] text-[#9CA3AF]">외인</p>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold tabular-nums" style={{ color: (item.inst_net ?? 0) >= 0 ? '#DC2626' : '#2563EB' }}>
                      {(item.inst_net ?? 0) >= 0 ? '+' : ''}{(item.inst_net ?? 0).toFixed(0)}억
                    </p>
                    <p className="text-[12px] text-[#9CA3AF]">기관</p>
                  </div>
                </div>

                {/* 포착 이유 */}
                {reasons.length > 0 && (
                  <div className="bg-[#F9F8F6] rounded-lg p-3">
                    <p className="text-[13px] font-bold text-[#1A1A2E] mb-1">포착 이유</p>
                    {reasons.map((r, idx) => (
                      <p key={idx} className="text-[13px] text-[#1A1A2E] leading-relaxed">
                        → {r}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ④ 관심 등급 — 간결한 테이블 */}
      {watchItems.length > 0 && (
        <div>
          <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-2">○ 관심 — {watchItems.length}종목</h3>
          <div className="rounded-xl overflow-hidden border border-[#E8E6E0]">
            <table className="w-full text-[14px]">
              <thead>
                <tr style={{ backgroundColor: '#F5F4F0' }}>
                  <th className="text-left py-2 px-3 text-[13px] font-bold text-[#1A1A2E]">종목명</th>
                  <th className="text-right py-2 px-2 text-[13px] font-bold text-[#1A1A2E]">현재가</th>
                  <th className="text-right py-2 px-2 text-[13px] font-bold text-[#1A1A2E]">이격도</th>
                  <th className="text-right py-2 px-2 text-[13px] font-bold text-[#1A1A2E]">거래량</th>
                  <th className="text-right py-2 px-2 text-[13px] font-bold text-[#1A1A2E]">외인</th>
                  <th className="text-right py-2 px-2 text-[13px] font-bold text-[#1A1A2E]">기관</th>
                </tr>
              </thead>
              <tbody>
                {watchItems.map(item => (
                  <tr key={`${item.date}-${item.ticker}`} className="border-t border-[#E8E6E0]/50 hover:bg-[#F9F8F6]">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#1A1A2E]">{item.name}</span>
                      <span className="text-[13px] text-[#9CA3AF] ml-1">{item.ticker}</span>
                    </td>
                    <td className="text-right py-2.5 px-2 text-[#1A1A2E] tabular-nums">{(item.close ?? 0).toLocaleString()}</td>
                    <td className="text-right py-2.5 px-2 font-bold text-[#DC2626] tabular-nums">{(item.gap_20ma ?? 0).toFixed(1)}%</td>
                    <td className="text-right py-2.5 px-2 text-[#1A1A2E] tabular-nums">{(item.volume_ratio ?? 0).toFixed(1)}배</td>
                    <td className="text-right py-2.5 px-2 tabular-nums" style={{ color: (item.foreign_net ?? 0) >= 0 ? '#DC2626' : '#2563EB' }}>
                      {(item.foreign_net ?? 0) >= 0 ? '+' : ''}{(item.foreign_net ?? 0).toFixed(0)}억
                    </td>
                    <td className="text-right py-2.5 px-2 tabular-nums" style={{ color: (item.inst_net ?? 0) >= 0 ? '#DC2626' : '#2563EB' }}>
                      {(item.inst_net ?? 0) >= 0 ? '+' : ''}{(item.inst_net ?? 0).toFixed(0)}억
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ⑤ 백테스트 상세 (접이식) */}
      <div className="rounded-xl border border-[#E8E6E0] overflow-hidden">
        <button
          onClick={() => setBacktestOpen(!backtestOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#F9F8F6] hover:bg-[#F5F4F0] transition-colors"
        >
          <span className="text-[14px] font-bold text-[#1A1A2E]">백테스트 상세 보기</span>
          <span className="text-[13px] text-[#6B7280]">{backtestOpen ? '▲ 접기' : '▼ 펼치기'}</span>
        </button>
        {backtestOpen && (
          <div className="p-4 space-y-4">
            {/* 백테스트 테이블 */}
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[#E8E6E0]">
                  <th className="text-left py-2 text-[13px] font-bold text-[#1A1A2E]">시그널</th>
                  <th className="text-center py-2 text-[13px] font-bold text-[#1A1A2E]">기간</th>
                  <th className="text-center py-2 text-[13px] font-bold text-[#1A1A2E]">표본수</th>
                  <th className="text-center py-2 text-[13px] font-bold text-[#1A1A2E]">5일 평균수익</th>
                  <th className="text-center py-2 text-[13px] font-bold text-[#1A1A2E]">승률</th>
                  <th className="text-center py-2 text-[13px] font-bold text-[#1A1A2E]">손익비</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E8E6E0]/50">
                  <td className="py-2 font-bold" style={{ color: '#FF6600' }}>볼린저급락 반등</td>
                  <td className="text-center py-2 text-[#6B7280]">2019~2026</td>
                  <td className="text-center py-2 tabular-nums">1,034건</td>
                  <td className="text-center py-2 font-bold text-[#DC2626] tabular-nums">+3.38%</td>
                  <td className="text-center py-2 font-bold text-[#16A34A] tabular-nums">60.2%</td>
                  <td className="text-center py-2 font-bold text-[#0EA5E9] tabular-nums">2.64</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold" style={{ color: '#FF9900' }}>거래량폭발 반등</td>
                  <td className="text-center py-2 text-[#6B7280]">2019~2026</td>
                  <td className="text-center py-2 tabular-nums">75건</td>
                  <td className="text-center py-2 font-bold text-[#DC2626] tabular-nums">+3.31%</td>
                  <td className="text-center py-2 font-bold text-[#16A34A] tabular-nums">62.5%</td>
                  <td className="text-center py-2 font-bold text-[#0EA5E9] tabular-nums">2.61</td>
                </tr>
              </tbody>
            </table>

            {/* 용어 설명 */}
            <div>
              <p className="text-[14px] font-bold text-[#1A1A2E] mb-2">용어 설명</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                <div><strong className="text-[#1A1A2E]">이격도</strong> <span className="text-[#6B7280]">— 현재 주가가 20일 이동평균선에서 얼마나 떨어져 있는지. -15%면 평균보다 15% 싸다는 뜻.</span></div>
                <div><strong className="text-[#1A1A2E]">볼린저밴드</strong> <span className="text-[#6B7280]">— 주가의 통계적 상하한선. 하단 이탈은 &apos;통계적으로 비정상적인 낙폭&apos;을 의미.</span></div>
                <div><strong className="text-[#1A1A2E]">거래량 배수</strong> <span className="text-[#6B7280]">— 최근 20일 평균 거래량 대비 오늘 거래량의 배수. 3배면 평소의 3배 거래.</span></div>
                <div><strong className="text-[#1A1A2E]">쌍끌이</strong> <span className="text-[#6B7280]">— 기관과 외국인이 같은 날 동시에 순매수한 상태. 강한 매수 흐름 포착.</span></div>
                <div><strong className="text-[#1A1A2E]">승률</strong> <span className="text-[#6B7280]">— 이 조건으로 매수 후 5일 안에 수익이 난 비율.</span></div>
                <div><strong className="text-[#1A1A2E]">손익비</strong> <span className="text-[#6B7280]">— 이익 총합 ÷ 손실 총합. 2.64면 잃는 것보다 2.64배 더 벌었다는 뜻.</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 면책 조항 */}
      <p className="text-[12px] text-[#9CA3AF] text-center pb-4">
        이 정보는 투자 권유가 아닙니다. 백테스트 결과는 과거 데이터 기반이며, 미래 수익을 보장하지 않습니다.
      </p>
    </div>
  )
}
