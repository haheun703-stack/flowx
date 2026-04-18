'use client'

import { useEffect, useState } from 'react'

/* ── 타입 ── */
interface SectorRow {
  sector: string
  rank: number
  score: number
  momentum: number
  flow: number
  ret_5d: number
  ret_20d: number
  breadth: number
}

function scoreBg(score: number): string {
  if (score >= 60) return 'bg-[#ECFDF5]'
  if (score < 40) return 'bg-[#FEF2F2]'
  return ''
}

function flowColor(flow: number): string {
  if (flow > 0) return 'text-[#16A34A]'
  if (flow < 0) return 'text-[#DC2626]'
  return 'text-[#6B7280]'
}

function retColor(ret: number): string {
  if (ret > 0) return 'text-[#DC2626]'
  if (ret < 0) return 'text-[#2563EB]'
  return 'text-[#6B7280]'
}

export default function SectorRotationView() {
  const [rows, setRows] = useState<SectorRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/quant/sector-rotation', { signal: controller.signal })
        if (res.ok) {
          const json = await res.json()
          setRows(Array.isArray(json.data) ? json.data : [])
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 animate-pulse space-y-3">
        <div className="h-8 w-48 bg-[var(--bg-row)] rounded-lg" />
        <div className="h-[400px] bg-[var(--bg-row)] rounded-xl" />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 text-center py-12">
        <p className="text-[#6B7280]">섹터 로테이션 데이터가 아직 없습니다.</p>
        <p className="text-[#9CA3AF] text-sm mt-1">매일 자동 업데이트됩니다.</p>
      </div>
    )
  }

  const hot = rows.slice(0, 3)
  const cold = rows.slice(-3).reverse()

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 space-y-5">
      {/* 헤더 */}
      <div>
        <h2 className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E]">섹터 로테이션</h2>
        <p className="text-[12px] text-[#6B7280]">{rows.length}개 섹터 · 종합점수 + 모멘텀 + 수급 + 수익률</p>
      </div>

      {/* 핫/냉각 하이라이트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 핫 섹터 */}
        <div className="rounded-xl border border-[#E8E6E0] bg-[#ECFDF5] p-4">
          <p className="text-[13px] font-bold text-[#16A34A] mb-2">🔥 핫 섹터 TOP 3</p>
          <div className="space-y-1.5">
            {hot.map(s => (
              <div key={s.sector} className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#1A1A2E]">#{s.rank} {s.sector}</span>
                <div className="flex items-center gap-3 text-[13px] tabular-nums">
                  <span className="font-bold text-[#16A34A]">{s.score.toFixed(0)}점</span>
                  <span className={retColor(s.ret_5d)}>{s.ret_5d >= 0 ? '+' : ''}{s.ret_5d.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 냉각 섹터 */}
        <div className="rounded-xl border border-[#E8E6E0] bg-[#FEF2F2] p-4">
          <p className="text-[13px] font-bold text-[#DC2626] mb-2">🧊 냉각 섹터 BOTTOM 3</p>
          <div className="space-y-1.5">
            {cold.map(s => (
              <div key={s.sector} className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#1A1A2E]">#{s.rank} {s.sector}</span>
                <div className="flex items-center gap-3 text-[13px] tabular-nums">
                  <span className="font-bold text-[#DC2626]">{s.score.toFixed(0)}점</span>
                  <span className={retColor(s.ret_5d)}>{s.ret_5d >= 0 ? '+' : ''}{s.ret_5d.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 전체 테이블 */}
      <div className="rounded-xl border border-[#E8E6E0] bg-white shadow-sm overflow-x-auto table-scroll">
        <table className="w-full text-[13px] min-w-[600px]">
          <thead>
            <tr className="bg-[#F5F4F0] border-b border-[#E8E6E0]">
              <th className="text-center py-2.5 px-2 font-bold text-[#1A1A2E] w-[50px]">순위</th>
              <th className="text-left py-2.5 px-3 font-bold text-[#1A1A2E]">섹터명</th>
              <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">종합점수</th>
              <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">모멘텀</th>
              <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">수급(억)</th>
              <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">5일%</th>
              <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">20일%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(s => (
              <tr
                key={s.sector}
                className={`border-b border-[#E8E6E0]/50 hover:bg-[#F9F8F6] ${scoreBg(s.score)}`}
              >
                <td className="text-center py-2.5 px-2 font-bold text-[#6B7280] tabular-nums">{s.rank}</td>
                <td className="py-2.5 px-3 font-bold text-[#1A1A2E]">{s.sector}</td>
                <td className="text-right py-2.5 px-2 font-bold tabular-nums text-[#1A1A2E]">{s.score.toFixed(1)}</td>
                <td className="text-right py-2.5 px-2 tabular-nums text-[#6B7280]">{s.momentum.toFixed(1)}</td>
                <td className={`text-right py-2.5 px-2 font-bold tabular-nums ${flowColor(s.flow)}`}>
                  {s.flow >= 0 ? '+' : ''}{s.flow.toFixed(0)}
                </td>
                <td className={`text-right py-2.5 px-2 font-bold tabular-nums ${retColor(s.ret_5d)}`}>
                  {s.ret_5d >= 0 ? '+' : ''}{s.ret_5d.toFixed(1)}%
                </td>
                <td className={`text-right py-2.5 px-2 font-bold tabular-nums ${retColor(s.ret_20d)}`}>
                  {s.ret_20d >= 0 ? '+' : ''}{s.ret_20d.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
